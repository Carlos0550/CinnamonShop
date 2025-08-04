import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (_: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Solo se permiten: ${allowedMimeTypes.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 35 * 1024 * 1024,
    files: 10 
  }
});

export { upload };

export const uploadSingleImage = (fieldName: string = 'image') => {
  return upload.single(fieldName);
};

export const uploadMultipleImages = (fieldName: string = 'images', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

export const uploadFields = (fields: multer.Field[]) => {
  return upload.fields(fields);
};

export const handleUploadError = (error: any, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande. Máximo 35MB por archivo.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Demasiados archivos. Máximo 10 archivos permitidos.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Error al subir archivo.'
        });
    }
  }

  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return next(error);
};

export const validateFiles = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'No se subieron archivos.'
    });
  }
  return next();
};

export const validateSingleFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se subió ningún archivo.'
    });
  }
  return next();
}; 