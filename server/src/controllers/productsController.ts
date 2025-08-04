import { Request, Response } from 'express'
import { productService, type CreateProductData } from '@/services/productService'
import { ResponseHandler } from '@/utils/ResponseHandler'

const responseHandler = new ResponseHandler()

export class ProductsController {
  
  async createProduct(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        price,
        stock,
        brand,
        categoryId,
        dynamicOptions,
        optionStock
      } = req.body

      if (!name || !description || !price || !brand || !categoryId) {
        return responseHandler.validationError(res, ['Todos los campos son requeridos'], 'Error de validación')
      }

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return responseHandler.validationError(res, ['La imagen principal es requerida'], 'Error de validación')
      }

      const files = req.files as Express.Multer.File[]
      const mainImage = files.find(file => file.fieldname === 'mainImage')
      if (!mainImage) {
        return responseHandler.validationError(res, ['La imagen principal es requerida'], 'Error de validación')
      }

      const additionalImages = files.filter(file => file.fieldname === 'additionalImages')

      let parsedDynamicOptions = {}
      if (dynamicOptions) {
        try {
          parsedDynamicOptions = typeof dynamicOptions === 'string' 
            ? JSON.parse(dynamicOptions) 
            : dynamicOptions
        } catch (error) {
          return responseHandler.validationError(res, ['Formato inválido para las opciones de compra'], 'Error de validación')
        }
      }

      let parsedOptionStock = {}
      if (optionStock) {
        try {
          parsedOptionStock = typeof optionStock === 'string' 
            ? JSON.parse(optionStock) 
            : optionStock
        } catch (error) {
          return responseHandler.validationError(res, ['Formato inválido para el stock de opciones'], 'Error de validación')
        }
      }

 

      const productData: CreateProductData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: Object.keys(parsedDynamicOptions).length > 0 ? 0 : parseInt(stock) || 0,
        brand: brand.trim(),
        categoryId,
        mainImage,
        additionalImages,
        dynamicOptions: parsedDynamicOptions,
        optionStock: parsedOptionStock
      }

      if (productData.price <= 0) {
        return responseHandler.validationError(res, ['El precio debe ser mayor a 0'], 'Error de validación')
      }

      const product = await productService.createProduct(productData)

      return responseHandler.success(res, product, 'Producto creado exitosamente', 201)
    } catch (error) {
      return responseHandler.error(res, error, 'Error interno del servidor', 500)
    }
  }

  // Obtener todos los productos
  async getAllProducts(_req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts()
      return responseHandler.success(res, products, 'Productos obtenidos exitosamente')
    } catch (error) {
      return responseHandler.error(res, error, 'Error interno del servidor', 500)
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return responseHandler.validationError(res, ['ID del producto es requerido'], 'Error de validación')
      }

      const product = await productService.getProductById(id)

      if (!product) {
        return responseHandler.notFound(res, 'Producto no encontrado')
      }

      return responseHandler.success(res, product, 'Producto obtenido exitosamente')
    } catch (error) {
      return responseHandler.error(res, error, 'Error interno del servidor', 500)
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params
      const {
        name,
        description,
        price,
        stock,
        brand,
        categoryId,
        isActive,
        dynamicOptions,
        optionStock,
        deletedImageIds
      } = req.body

      if (!id) {
        return responseHandler.validationError(res, ['ID del producto es requerido'], 'Error de validación')
      }

      const existingProduct = await productService.getProductById(id)
      if (!existingProduct) {
        return responseHandler.notFound(res, 'Producto no encontrado')
      }

      const updateData: any = {}
      if (name !== undefined) updateData.name = name.trim()
      if (description !== undefined) updateData.description = description.trim()
      if (price !== undefined) updateData.price = parseFloat(price)
      if (stock !== undefined) updateData.stock = parseInt(stock)
      if (brand !== undefined) updateData.brand = brand.trim()
      if (categoryId !== undefined) updateData.categoryId = categoryId
      if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true

      if (updateData.price !== undefined && updateData.price <= 0) {
        return responseHandler.validationError(res, ['El precio debe ser mayor a 0'], 'Error de validación')
      }

      if (updateData.stock !== undefined && updateData.stock < 0) {
        return responseHandler.validationError(res, ['El stock no puede ser negativo'], 'Error de validación')
      }

      if (dynamicOptions) {
        try {
          updateData.dynamicOptions = typeof dynamicOptions === 'string' 
            ? JSON.parse(dynamicOptions) 
            : dynamicOptions

          if (stock !== undefined) updateData.stock = 0
        } catch (error) {
          return responseHandler.validationError(res, ['Formato inválido para las opciones de compra'], 'Error de validación')
        }
      }
      
      if (optionStock) {
        try {
          updateData.optionStock = typeof optionStock === 'string' 
            ? JSON.parse(optionStock) 
            : optionStock
        } catch (error) {
          return responseHandler.validationError(res, ['Formato inválido para el stock de opciones'], 'Error de validación')
        }
      }

      if (deletedImageIds) {
        try {
          updateData.deletedImageIds = typeof deletedImageIds === 'string' 
            ? JSON.parse(deletedImageIds) 
            : deletedImageIds
        } catch (error) {
          return responseHandler.validationError(res, ['Formato inválido para las imágenes eliminadas'], 'Error de validación')
        }
      }

      const files = req.files as Express.Multer.File[]
      if (files && files.length > 0) {
        const mainImageFile = files.find(file => file.fieldname === 'mainImage')
        if (mainImageFile) {
          updateData.mainImage = mainImageFile
        }

        const additionalImageFiles = files.filter(file => file.fieldname === 'additionalImages')
        if (additionalImageFiles.length > 0) {
          updateData.additionalImages = additionalImageFiles
        }
      }

      const updatedProduct = await productService.updateProduct(id, updateData)

      return responseHandler.success(res, updatedProduct, 'Producto actualizado exitosamente')
    } catch (error) {
      return responseHandler.error(res, error, 'Error interno del servidor', 500)
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return responseHandler.validationError(res, ['ID del producto es requerido'], 'Error de validación')
      }

      // Verificar que el producto existe
      const existingProduct = await productService.getProductById(id)
      if (!existingProduct) {
        return responseHandler.notFound(res, 'Producto no encontrado')
      }

      await productService.deleteProduct(id)

      return responseHandler.success(res, null, 'Producto eliminado exitosamente')
    } catch (error) {
      return responseHandler.error(res, error, 'Error interno del servidor', 500)
    }
  }

  // Cambiar estado del producto (activar/desactivar)
  async toggleProductStatus(req: Request, res: Response) {
    try {
      const { id } = req.params

      if (!id) {
        return responseHandler.validationError(res, ['ID del producto es requerido'], 'Error de validación')
      }

      // Verificar que el producto existe
      const existingProduct = await productService.getProductById(id)
      if (!existingProduct) {
        return responseHandler.notFound(res, 'Producto no encontrado')
      }

      const updatedProduct = await productService.toggleProductStatus(id)
      const statusMessage = updatedProduct.isActive ? 'Producto activado exitosamente' : 'Producto desactivado exitosamente'

      return responseHandler.success(res, updatedProduct, statusMessage)
    } catch (error) {
      return responseHandler.error(res, error, 'Error interno del servidor', 500)
    }
  }

  // Obtener productos por categoría (para frontend público)
  async getProductsByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params

      if (!categoryId) {
        return responseHandler.validationError(res, ['ID de la categoría es requerido'], 'Error de validación')
      }

      const products = await productService.getProductsByCategory(categoryId)

      return responseHandler.success(res, products, 'Productos obtenidos exitosamente')
    } catch (error) {
      return responseHandler.error(res, error, 'Error interno del servidor', 500)
    }
  }

  // Obtener productos por categoría (para panel de administración)
  async getProductsByCategoryAdmin(req: Request, res: Response) {
    try {
      const { categoryId } = req.params

      if (!categoryId) {
        return responseHandler.validationError(res, ['ID de la categoría es requerido'], 'Error de validación')
      }

      const products = await productService.getProductsByCategoryAdmin(categoryId)

      return responseHandler.success(res, products, 'Productos obtenidos exitosamente')
    } catch (error) {
      return responseHandler.error(res, error, 'Error interno del servidor', 500)
    }
  }


}

export const productsController = new ProductsController()
