import { validate, uploadSingleImage } from '@/middleware';
import { Router } from 'express';
import { body } from 'express-validator';
import { AIController } from '@/controllers/aiController';

const router = Router();

const generateCategoryDescriptionValidation = [
    body("categoryName")
        .notEmpty()
        .withMessage("El nombre de la categoría es requerido")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
    body("additionalDetails")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Los detalles adicionales no pueden exceder 500 caracteres"),
];

const generateProductDescriptionValidation = [
    body("productName")
        .notEmpty()
        .withMessage("El nombre del producto es requerido")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
    body("category")
        .notEmpty()
        .withMessage("La categoría es requerida")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("La categoría debe tener entre 2 y 50 caracteres"),
    body("additionalDetails")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Los detalles adicionales no pueden exceder 500 caracteres"),
];

const generateProductFromImageFileValidation = [
    body("categoryName")
        .notEmpty()
        .withMessage("El nombre de la categoría es requerido")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
    body("additionalDetails")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Los detalles adicionales no pueden exceder 500 caracteres"),
];

router.post("/generate-category-description", 
    validate(generateCategoryDescriptionValidation), 
    AIController.generateCategoryDescription
);

router.post("/generate-product-description", 
    validate(generateProductDescriptionValidation), 
    AIController.generateProductDescription
);


router.post("/generate-product-from-image-file", 
    uploadSingleImage("image"),
    validate(generateProductFromImageFileValidation), 
    AIController.generateProductFromImageFile
);

export default router; 