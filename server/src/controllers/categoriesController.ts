import { Request, Response } from 'express';
import { CategoryOperations } from '@/services/categoryService';

export class CategoriesController {
  static async create(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const imageFile = req.file;

      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y la descripción son requeridos'
        });
      }

      const categoryOps = new CategoryOperations();
      const result = await categoryOps.createCategory(name, description, imageFile ? {
        buffer: imageFile.buffer,
        originalName: imageFile.originalname
      } : undefined);

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { includeInactive } = req.query;
      const categoryOps = new CategoryOperations();
      
      let result;
      if (includeInactive === 'true') {
        result = await categoryOps.getAllCategoriesIncludingInactive();
      } else {
        result = await categoryOps.getAllCategories();
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoryOps = new CategoryOperations();
      const result = await categoryOps.getCategoryById(id);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      return res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Categoría no encontrada'
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      const imageFile = req.file;

      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y la descripción son requeridos'
        });
      }

      const categoryOps = new CategoryOperations();
      const result = await categoryOps.updateCategory(id, name, description, imageFile ? {
        buffer: imageFile.buffer,
        originalName: imageFile.originalname
      } : undefined);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoryOps = new CategoryOperations();
      const result = await categoryOps.deleteCategory(id);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }

  static async reactivate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const categoryOps = new CategoryOperations();
      const result = await categoryOps.reactivateCategory(id);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error al reactivar categoría:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }


} 