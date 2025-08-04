import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@/config/database';
import { config } from '@/config/server';
import { AuthenticatedRequest, JWTPayload, AppError } from '@/types';

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de acceso requerido', 401);
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Usuario no encontrado o inactivo', 401);
    }

    req.user = user as any;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Token inválido', 401));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Acceso no autorizado', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permisos para realizar esta acción', 403));
    }

    next();
  };
};

export const requireAuth = authenticate;
export const requireAdmin = authorize('ADMIN');
export const requireCustomer = authorize('CUSTOMER'); 