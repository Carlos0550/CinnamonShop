import { validate, uploadSingleImage } from '@/middleware';
import { Router } from 'express';
import { body } from 'express-validator';
import { UploadController } from '@/controllers/uploadController';

const router = Router();

const uploadImageValidation = [
    body("folder")
        .optional()
        .isString()
        .withMessage("El folder debe ser una cadena de texto"),
];

const deleteImageValidation = [
    body("path")
        .notEmpty()
        .withMessage("La ruta de la imagen es requerida")
        .isString()
        .withMessage("La ruta debe ser una cadena de texto"),
];

router.post("/image", 
    uploadSingleImage('image'),
    validate(uploadImageValidation), 
    UploadController.uploadImage
);

router.delete("/image", 
    validate(deleteImageValidation), 
    UploadController.deleteImage
);

export default router; 