import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '@/controllers/authController';
import { validate, authenticate } from '@/middleware';

const router = Router();

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
 
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'),
];

router.post('/register', validate(registerValidation), AuthController.register);
router.post('/login', validate(loginValidation), AuthController.login);

router.get('/profile', authenticate, AuthController.getProfile);
router.put('/change-password', authenticate, validate(changePasswordValidation), AuthController.changePassword);
router.delete('/deactivate', authenticate, AuthController.deactivateAccount);

export default router; 