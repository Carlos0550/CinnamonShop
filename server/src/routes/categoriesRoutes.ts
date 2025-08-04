import { validate, uploadSingleImage } from '@/middleware';
import { Router } from 'express';
import { body } from 'express-validator';
import { CategoriesController } from '@/controllers/categoriesController';

const router = Router();

const categoryValidations = [
    body("name")
        .notEmpty()
        .withMessage("El nombre de la categoría es requerido")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("El nombre debe tener entre 2 y 50 caracteres"),
    body("description")
        .notEmpty()
        .withMessage("La descripción de la categoría es requerida")
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage("La descripción debe tener entre 10 y 1000 caracteres"),
];

router.post("/", 
    uploadSingleImage('image'), 
    validate(categoryValidations), 
    CategoriesController.create
);

router.get("/", CategoriesController.getAll);

router.get("/:id", CategoriesController.getById);

router.put("/:id", 
    uploadSingleImage('image'), 
    validate(categoryValidations), 
    CategoriesController.update
);

router.delete("/:id", CategoriesController.delete);
router.patch("/:id/reactivate", CategoriesController.reactivate);



export default router;