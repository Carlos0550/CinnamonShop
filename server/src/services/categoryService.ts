import { SupabaseStorageUtils } from './supabaseService';
import prisma from '@/config/database';

export class CategoryOperations extends SupabaseStorageUtils {
  
  async createCategory(name: string, description: string, imageFile?: { buffer: Buffer; originalName: string }) {
    try {
      let imageUrl: string | undefined;
      let imagePath: string | undefined;

      if (imageFile) {
        const uploadResult = await this.uploadCategoryImage(imageFile);
        imageUrl = uploadResult.url;
        imagePath = uploadResult.path;
      }
      
      const categoryData: any = {
        name,
        description
      };

      if (imageUrl) categoryData.imageUrl = imageUrl;
      if (imagePath) categoryData.imagePath = imagePath;

      const category = await prisma.category.create({
        data: categoryData
      });

      return {
        success: true,
        message: 'Categoría creada exitosamente',
        data: category
      };
    } catch (error) {
      throw new Error(`Error al crear categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }



  async getAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getAllCategoriesIncludingInactive() {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          }
        }
      });
      
      return {
        success: true,
        data: categories
      };
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async getCategoryById(id: string) {
    try {
      const category = await prisma.category.findUnique({
        where: { id, isActive: true }
      });

      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      return {
        success: true,
        data: category
      };
    } catch (error) {
      throw new Error(`Error al obtener categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updateCategoryName(id: string, newName: string) {
    try {
      const category = await prisma.category.update({
        where: { id, isActive: true },
        data: { name: newName }
      });

      return {
        success: true,
        message: 'Nombre de categoría actualizado exitosamente',
        data: category
      };
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updateCategoryImage(id: string, imageFile: { buffer: Buffer; originalName: string }) {
    try {
      const currentCategory = await prisma.category.findUnique({
        where: { id, isActive: true }
      });

      if (!currentCategory) {
        throw new Error('Categoría no encontrada');
      }

      if (currentCategory.imagePath) {
        await this.deleteCategoryImage(currentCategory.imagePath);
      }

      const uploadResult = await this.uploadCategoryImage(imageFile);

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          imageUrl: uploadResult.url,
          imagePath: uploadResult.path
        }
      });

      return {
        success: true,
        message: 'Imagen de categoría actualizada exitosamente',
        data: updatedCategory
      };
    } catch (error) {
      throw new Error(`Error al actualizar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async updateCategory(id: string, name: string, description: string, imageFile?: { buffer: Buffer; originalName: string }) {
    try {
      const updateData: any = { name, description };

      if (imageFile) {
        const currentCategory = await prisma.category.findUnique({
          where: { id, isActive: true }
        });

        if (currentCategory?.imagePath) {
          await this.deleteCategoryImage(currentCategory.imagePath);
        }

        const uploadResult = await this.uploadCategoryImage(imageFile);
        updateData.imageUrl = uploadResult.url;
        updateData.imagePath = uploadResult.path;
      }

      const category = await prisma.category.update({
        where: { id, isActive: true },
        data: updateData
      });

      return {
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: category
      };
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }



  async deleteCategory(id: string) {
    try {
      // Primero verificar si la categoría existe y obtener información de productos asociados
      const category = await prisma.category.findUnique({
        where: { id, isActive: true },
        include: {
          products: {
            where: { isActive: true }
          }
        }
      });

      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      // Si hay productos asociados, hacer soft delete
      if (category.products.length > 0) {
        const updatedCategory = await prisma.category.update({
          where: { id },
          data: { isActive: false }
        });

        return {
          success: true,
          message: `Categoría inhabilitada exitosamente. No se puede eliminar porque tiene ${category.products.length} producto(s) asociado(s).`,
          data: updatedCategory,
          action: 'disabled'
        };
      }

      // Si no hay productos, eliminar permanentemente junto con la imagen
      if (category.imagePath) {
        await this.deleteCategoryImage(category.imagePath);
      }

      await prisma.category.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Categoría eliminada permanentemente',
        action: 'deleted'
      };
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async deleteCategoryPermanently(id: string) {
    try {
      const category = await prisma.category.findUnique({
        where: { id }
      });

      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      if (category.imagePath) {
        await this.deleteCategoryImage(category.imagePath);
      }

      await prisma.category.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Categoría eliminada permanentemente'
      };
    } catch (error) {
      throw new Error(`Error al eliminar categoría permanentemente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async reactivateCategory(id: string) {
    try {
      const category = await prisma.category.findUnique({
        where: { id, isActive: false }
      });

      if (!category) {
        throw new Error('Categoría inhabilitada no encontrada');
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { isActive: true }
      });

      return {
        success: true,
        message: 'Categoría reactivada exitosamente',
        data: updatedCategory
      };
    } catch (error) {
      throw new Error(`Error al reactivar categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }


  async uploadCategoryImage(file: { buffer: Buffer; originalName: string }) {
    
    const [{ buffer: convertedBuffer, filename }] = await this.convertToWebp([file]);
    const filePath = filename; 


    const { error } = await this.supabase
      .storage
      .from("categories")
      .upload(filePath, convertedBuffer, {
        contentType: "image/webp",
        upsert: true
      });

    if (error) {
      console.error(`[CategoryService] Error al subir imagen: ${error.message}`)
      throw new Error(`Error al subir imagen de categoría: ${error.message}`);
    }


    return {
      filename,
      path: filePath,
      url: SupabaseStorageUtils.buildPublicUrl("categories", filePath)
    };
  }

  async deleteCategoryImage(imagePath: string) {
    try {
      const { error } = await this.supabase
        .storage
        .from("categories")
        .remove([imagePath]);

      if (error) {
        console.warn(`Error al eliminar imagen ${imagePath}:`, error.message);
      }
    } catch (error) {
      console.warn(`Error al eliminar imagen ${imagePath}:`, error);
    }
  }
} 