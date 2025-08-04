import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (err.name === 'PrismaClientKnownRequestError') {
    const message = 'Error en la base de datos';
    error = new AppError(message, 400);
  }

  if (err.name === 'PrismaClientValidationError') {
    const message = 'Datos inválidos';
    error = new AppError(message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new AppError(message, 401);
  }

  if (err.name === 'ValidationError') {
    const message = 'Error de validación';
    error = new AppError(message, 400);
  }



  res.status((error as AppError).statusCode || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
  });
}; 