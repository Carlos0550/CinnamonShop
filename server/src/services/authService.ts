import bcrypt from 'bcryptjs';
import crypto from "crypto"
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { config } from '@/config/server';
import { emailService } from './emailService';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  JWTPayload,
  AppError 
} from '@/types';

export class AuthService {
  private static generateSecurePassword = (length: number = 12) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?'
    const pswArray = Array.from(crypto.randomFillSync(new Uint32Array(length)))

    const password = pswArray.map(x => charset[x % charset.length]).join("")

    return password
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const { email } = userData;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }
    
    const secure_psw = this.generateSecurePassword();
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(secure_psw, saltRounds);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: "Usuario",
        lastName: "",
        onBoarding: true,
        role: "ADMIN"
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        profileImageUrl: true,
        onBoarding: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    try {
      await emailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        secure_psw
      );
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }


  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        profileImageUrl: true,
        createdAt: true,
        updatedAt: true,
        onBoarding: true,
        password: true, // Necesario para verificar la contraseña
      },
    });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!user.isActive) {
      throw new AppError('Cuenta desactivada', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const token = this.generateToken(user);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }


  private static generateToken(user: { id: string; email: string; role: string }): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '7d',
    });
  }


  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new AppError('Token inválido', 401);
    }
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }


  static async deactivateAccount(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }
} 