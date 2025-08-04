import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { AuthenticatedRequest, ApiResponse } from '@/types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);

      const response: ApiResponse = {
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const response: ApiResponse = {
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: req.user,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Contraseña cambiada exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  static async deactivateAccount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      await AuthService.deactivateAccount(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Cuenta desactivada exitosamente',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
} 