import { Response } from 'express'

export class ResponseHandler {
  success(res: Response, data: any, message: string = 'Operación exitosa', statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data
    })
  }

  error(res: Response, error: any, message: string = 'Error interno del servidor', statusCode: number = 500): void {
    console.error('Error:', error)
    
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env['NODE_ENV'] === 'development' ? error.message : 'Error interno del servidor'
    })
  }

  validationError(res: Response, errors: string[], message: string = 'Error de validación'): void {
    res.status(400).json({
      success: false,
      message,
      errors
    })
  }

  notFound(res: Response, message: string = 'Recurso no encontrado'): void {
    res.status(404).json({
      success: false,
      message
    })
  }

  unauthorized(res: Response, message: string = 'No autorizado'): void {
    res.status(401).json({
      success: false,
      message
    })
  }

  forbidden(res: Response, message: string = 'Acceso denegado'): void {
    res.status(403).json({
      success: false,
      message
    })
  }
} 