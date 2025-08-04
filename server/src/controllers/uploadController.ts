import { Request, Response } from 'express';
import { SupabaseStorageUtils } from '@/services/supabaseService';

class UploadOperations extends SupabaseStorageUtils {
  async uploadImageToSupabase(imageFile: Express.Multer.File, folder: string) {
    const convertedFiles = await this.convertToWebp([{
      buffer: imageFile.buffer,
      originalName: imageFile.originalname
    }]);

    const { buffer, filename } = convertedFiles[0];
    const filePath = `${folder}/${filename}`;

    const { error } = await this.supabase
      .storage
      .from(folder)
      .upload(filename, buffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) {
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    const url = SupabaseStorageUtils.buildPublicUrl(folder, filename);

    return {
      url,
      path: filePath
    };
  }

  async deleteImageFromSupabase(path: string) {
    const pathParts = path.split('/');
    const bucket = pathParts[0];
    const filename = pathParts.slice(1).join('/');

    const { error } = await this.supabase
      .storage
      .from(bucket)
      .remove([filename]);

    if (error) {
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }
  }
}

export class UploadController {
  static async uploadImage(req: Request, res: Response) {
    try {
      const imageFile = req.file;
      const folder = req.body.folder || 'products';

      if (!imageFile) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
      }

      const uploadOps = new UploadOperations();
      const result = await uploadOps.uploadImageToSupabase(imageFile, folder);

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Imagen subida exitosamente'
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  static async deleteImage(req: Request, res: Response) {
    try {
      const { path } = req.body;

      if (!path) {
        return res.status(400).json({
          success: false,
          message: 'La ruta de la imagen es requerida'
        });
      }

      const uploadOps = new UploadOperations();
      await uploadOps.deleteImageFromSupabase(path);

      return res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
} 