import { Response } from 'express';
import { ProfileOperations } from '../services/profileService';
import { AuthenticatedRequest } from '@/types';

const profileService = new ProfileOperations();

export class ProfileController {
    static async updateProfilePhoto(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user!.id;
            const imageFile = req.file;

            if (!imageFile) {
                return res.status(400).json({
                    success: false,
                    error: 'No se proporcionó ninguna imagen'
                });
            }

            const publicUrl = await profileService.updateProfilePhoto(userId, imageFile);

            return res.json({
                success: true,
                data: { profileImageUrl: publicUrl },
                message: 'Foto de perfil actualizada correctamente'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    static async deleteProfilePhoto(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user!.id;

            await profileService.deleteProfilePhoto(userId);

            return res.json({
                success: true,
                message: 'Foto de perfil eliminada correctamente'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }

    static async updateProfile(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user!.id;

            const { firstName, lastName } = req.body;
            if (!firstName || !lastName) {
                return res.status(400).json({
                    success: false,
                    message: "El/los nombres y apellido/s son obligatorios"
                });
            }

            await profileService.updateProfile(userId, firstName, lastName);

            return res.json({
                success: true,
                message: 'Perfil actualizado correctamente'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
}
