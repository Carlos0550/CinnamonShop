import { Request, Response } from 'express';
import { AIService } from '@/services/aiService';

export class AIController {
  static async generateCategoryDescription(req: Request, res: Response) {
    try {
      const { categoryName, additionalDetails } = req.body;

      if (!categoryName) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la categoría es requerido'
        });
      }

      const aiService = new AIService();
      const description = await aiService.generateCategoryDescription({
        categoryName,
        additionalDetails
      });

      return res.status(200).json({
        success: true,
        data: { description }
      });
    } catch (error) {
      console.error('Error al generar descripción con IA:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  static async generateProductDescription(req: Request, res: Response) {
    try {
      const { productName, category, additionalDetails } = req.body;

      if (!productName || !category) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto y la categoría son requeridos'
        });
      }

      const aiService = new AIService();
      const description = await aiService.generateProductDescription(
        productName,
        category,
        additionalDetails
      );

      return res.status(200).json({
        success: true,
        data: { description }
      });
    } catch (error) {
      console.error('Error al generar descripción de producto con IA:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }


  static async generateProductFromImageFile(req: Request, res: Response) {
    try {
      const imageFile = req.file;
      const { categoryName, additionalDetails } = req.body;

      if (!imageFile) {
        return res.status(400).json({
          success: false,
          message: 'La imagen es requerida'
        });
      }

      if (!categoryName) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de la categoría es requerido'
        });
      }

      const aiService = new AIService();
      const result = await aiService.generateProductFromImageFile({
        imageFile: imageFile.buffer,
        imageName: imageFile.originalname,
        categoryName,
        additionalDetails
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error al generar producto desde archivo con IA:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
} 