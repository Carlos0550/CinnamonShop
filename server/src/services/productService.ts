import { PrismaClient, Product, ProductImage } from '@prisma/client'
import { SupabaseStorageUtils } from './supabaseService'

const prisma = new PrismaClient()

export interface CreateProductData {
  name: string
  description: string
  price: number
  stock?: number // Ahora es opcional ya que se calcula automáticamente
  brand: string
  categoryId: string
  isActive?: boolean
  mainImage: Express.Multer.File
  additionalImages: Express.Multer.File[]
  dynamicOptions: { [key: string]: string[] }
  optionStock?: { [optionKey: string]: number }
}

export interface ProductWithDetails extends Product {
  category: {
    id: string
    name: string
  }
  images: ProductImage[]
}

export class ProductService extends SupabaseStorageUtils {
  
  /**
   * Calcula el stock total del producto basado en las opciones de compra
   */
  private calculateTotalStock(optionStock: { [optionKey: string]: number }): number {
    return Object.values(optionStock).reduce((total, stock) => total + stock, 0)
  }
  
  private async generateSKU(brand: string): Promise<string> {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    const brandPrefix = brand.substring(0, 3).toUpperCase()
    const sku = `${brandPrefix}-${timestamp}-${random}`.toUpperCase()
    
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    })
    
    if (existingProduct) {
      return this.generateSKU(brand)
    }
    
    return sku
  }

  private async uploadMainImage(file: Express.Multer.File): Promise<string> {
    const convertedFiles = await this.convertToWebp([{ buffer: file.buffer, originalName: file.originalname }])
    const convertedFile = convertedFiles[0]
    
    const filePath = `primary/${convertedFile.filename}`
    
    const { error } = await this.supabase.storage
      .from('products')
      .upload(filePath, convertedFile.buffer, {
        contentType: 'image/webp',
        upsert: false
      })

    if (error) {
      throw new Error(`Error al subir imagen principal: ${error.message}`)
    }

    return SupabaseStorageUtils.buildPublicUrl('products', filePath)
  }

  private async uploadSecondaryImages(files: Express.Multer.File[]): Promise<string[]> {
    if (files.length === 0) return []
    
    const convertedFiles = await this.convertToWebp(
      files.map(file => ({ buffer: file.buffer, originalName: file.originalname }))
    )
    
    const uploadPromises = convertedFiles.map(async (convertedFile, index) => {
      const filePath = `secondary/${convertedFile.filename}`
      
      const { error } = await this.supabase.storage
        .from('products')
        .upload(filePath, convertedFile.buffer, {
          contentType: 'image/webp',
          upsert: false
        })

      if (error) {
        throw new Error(`Error al subir imagen secundaria ${index + 1}: ${error.message}`)
      }

      return SupabaseStorageUtils.buildPublicUrl('products', filePath)
    })

    return Promise.all(uploadPromises)
  }

  async createProduct(data: CreateProductData): Promise<ProductWithDetails> {
    try {
      const sku = await this.generateSKU(data.brand)
      const mainImageUrl = await this.uploadMainImage(data.mainImage)
      const secondaryImageUrls = await this.uploadSecondaryImages(data.additionalImages)
      
      const product = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
          data: {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock || 0, // Usar 0 como valor por defecto
            sku,
            brand: data.brand,
            categoryId: data.categoryId,
            isActive: data.isActive || true
          }
        })

        await tx.productImage.create({
          data: {
            url: mainImageUrl,
            alt: data.name,
            isPrimary: true,
            productId: newProduct.id
          }
        })

        if (secondaryImageUrls.length > 0) {
          await tx.productImage.createMany({
            data: secondaryImageUrls.map(url => ({
              url,
              alt: data.name,
              isPrimary: false,
              productId: newProduct.id
            }))
          })
        }

        if (Object.keys(data.dynamicOptions).length > 0) {
          await tx.productOption.createMany({
            data: Object.entries(data.dynamicOptions).map(([name, values]) => ({
              name,
              values,
              productId: newProduct.id
            }))
          })

          // Crear registros de stock para las opciones
          if (data.optionStock && Object.keys(data.optionStock).length > 0) {
            const stockData = Object.entries(data.optionStock).map(([optionKey, stock]) => {
              const [optionName, optionValue] = optionKey.split(':')
              return {
                productId: newProduct.id,
                optionName,
                optionValue,
                stock
              }
            })

            await tx.productOptionStock.createMany({
              data: stockData
            })

            // Calcular y actualizar el stock total del producto
            const totalStock = this.calculateTotalStock(data.optionStock)
            await tx.product.update({
              where: { id: newProduct.id },
              data: { stock: totalStock }
            })
          }
        }

        return newProduct
      })

      const productWithDetails = await this.getProductById(product.id)
      if (!productWithDetails) {
        throw new Error('Error al obtener el producto creado')
      }
      return productWithDetails
    } catch (error) {
      throw new Error('Error al crear el producto')
    }
  }

  async getProductById(id: string): Promise<ProductWithDetails | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: true,
        options: true,
        optionStock: true
      }
    })
  }

  async getAllProducts(): Promise<ProductWithDetails[]> {
    return prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          where: { isPrimary: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async updateProduct(id: string, data: Partial<CreateProductData> & {
    mainImage?: Express.Multer.File
    additionalImages?: Express.Multer.File[]
    deletedImageIds?: string[]
  }): Promise<ProductWithDetails> {
    try {
      const updateData: any = {}
      
      if (data.name) updateData.name = data.name
      if (data.description) updateData.description = data.description
      if (data.price) updateData.price = data.price
      if (data.stock !== undefined) updateData.stock = data.stock
      if (data.brand) updateData.brand = data.brand
      if (data.categoryId) updateData.categoryId = data.categoryId
      if (data.isActive !== undefined) updateData.isActive = data.isActive
      const currentProduct = await this.getProductById(id)
      if (!currentProduct) {
        throw new Error('Producto no encontrado')
      }

      const product = await prisma.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
          where: { id },
          data: updateData
        })

        if (data.deletedImageIds && data.deletedImageIds.length > 0) {
          
          const imagesToDelete = currentProduct.images.filter(img => 
            data.deletedImageIds!.includes(img.id)
          )
          

          for (const image of imagesToDelete) {
            await this.deleteImageFromSupabase(image.url)
          }

          await tx.productImage.deleteMany({
            where: {
              id: { in: data.deletedImageIds }
            }
          })
        }

        if (data.mainImage) {
          const currentMainImage = currentProduct.images.find(img => img.isPrimary)
          if (currentMainImage) {
            await this.deleteImageFromSupabase(currentMainImage.url)
            await tx.productImage.delete({
              where: { id: currentMainImage.id }
            })
          }

          const mainImageUrl = await this.uploadMainImage(data.mainImage)
          await tx.productImage.create({
            data: {
              url: mainImageUrl,
              alt: data.name || currentProduct.name,
              isPrimary: true,
              productId: id
            }
          })
        }

        if (data.additionalImages && data.additionalImages.length > 0) {
          const additionalImageUrls = await this.uploadSecondaryImages(data.additionalImages)
          
          await tx.productImage.createMany({
            data: additionalImageUrls.map(url => ({
              url,
              alt: data.name || currentProduct.name,
              isPrimary: false,
              productId: id
            }))
          })
        }

        if (data.dynamicOptions) {
          await tx.productOption.deleteMany({
            where: { productId: id }
          })

          // Eliminar stock de opciones existente
          await tx.productOptionStock.deleteMany({
            where: { productId: id }
          })

          if (Object.keys(data.dynamicOptions).length > 0) {
            await tx.productOption.createMany({
              data: Object.entries(data.dynamicOptions).map(([name, values]) => ({
                name,
                values,
                productId: id
              }))
            })

            // Crear nuevos registros de stock para las opciones
            // Siempre procesar optionStock, incluso si está vacío
            if (data.optionStock) {
              const stockData = Object.entries(data.optionStock).map(([optionKey, stock]) => {
                const [optionName, optionValue] = optionKey.split(':')
                return {
                  productId: id,
                  optionName,
                  optionValue,
                  stock
                }
              })

              if (stockData.length > 0) {
                await tx.productOptionStock.createMany({
                  data: stockData
                })
              }

              // Calcular y actualizar el stock total del producto
              const totalStock = this.calculateTotalStock(data.optionStock)
              await tx.product.update({
                where: { id },
                data: { stock: totalStock }
              })
            } else {
              // Si no hay optionStock, establecer el stock total en 0
              await tx.product.update({
                where: { id },
                data: { stock: 0 }
              })
            }
          } else {
            // Si no hay dynamicOptions, establecer el stock total en 0
            await tx.product.update({
              where: { id },
              data: { stock: 0 }
            })
          }
        }

        return updatedProduct
      })

      const productWithDetails = await this.getProductById(product.id)
      if (!productWithDetails) {
        throw new Error('Error al obtener el producto actualizado')
      }
      return productWithDetails
    } catch (error) {
      throw new Error('Error al actualizar el producto')
    }
  }

  private async deleteImageFromSupabase(imageUrl: string): Promise<void> {
    try {
      // Extraer la ruta del archivo de la URL
      let filePath: string
      
      // La URL tiene el formato: https://supabase-url/storage/v1/object/public/products/primary/filename.webp
      // Necesitamos extraer: primary/filename.webp
      
      if (imageUrl.includes('/storage/v1/object/public/products/')) {
        const urlParts = imageUrl.split('/storage/v1/object/public/products/')
        if (urlParts.length === 2) {
          filePath = urlParts[1]
        } else {
          return
        }
      } else {
        return
      }
      
      // Verificar que la ruta es válida
      if (!filePath || filePath.trim() === '') {
        return
      }
      
      const { error } = await this.supabase.storage
        .from('products')
        .remove([filePath])

      if (error) {
        // Silenciar errores de eliminación de imágenes
      }
    } catch (error) {
      // Silenciar errores de eliminación de imágenes
    }
  }

  // Eliminar producto completamente (incluye imágenes)
  async deleteProduct(id: string): Promise<void> {
    try {
      // Obtener el producto con sus imágenes
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          options: true
        }
      })

      if (!product) {
        throw new Error('Producto no encontrado')
      }

      // Eliminar imágenes de Supabase
      if (product.images.length > 0) {
        const deletePromises = product.images.map(async (image) => {
          try {
            await this.deleteImageFromSupabase(image.url)
          } catch (error) {
            // Silenciar errores de eliminación de imágenes
          }
        })

        await Promise.all(deletePromises)
      }

      // Eliminar opciones del producto
      if (product.options.length > 0) {
        await prisma.productOption.deleteMany({
          where: { productId: id }
        })
      }

      // Eliminar imágenes de la base de datos
      await prisma.productImage.deleteMany({
        where: { productId: id }
      })

      // Eliminar el producto
      await prisma.product.delete({
        where: { id }
      })
    } catch (error) {
      throw new Error('Error al eliminar el producto')
    }
  }

  async toggleProductStatus(id: string): Promise<ProductWithDetails> {
    try {
      const product = await prisma.product.findUnique({
        where: { id }
      })

      if (!product) {
        throw new Error('Producto no encontrado')
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: { isActive: !product.isActive }
      })

      const productWithDetails = await this.getProductById(updatedProduct.id)
      if (!productWithDetails) {
        throw new Error('Error al obtener el producto actualizado')
      }

      return productWithDetails
    } catch (error) {
      throw new Error('Error al cambiar el estado del producto')
    }
  }

  // Obtener productos por categoría (para frontend público - solo activos)
  async getProductsByCategory(categoryId: string): Promise<ProductWithDetails[]> {
    return prisma.product.findMany({
      where: { 
        categoryId,
        isActive: true 
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          where: { isPrimary: true }
        },
        options: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Obtener productos por categoría (para panel de administración - todos los estados)
  async getProductsByCategoryAdmin(categoryId: string): Promise<ProductWithDetails[]> {
    return prisma.product.findMany({
      where: { 
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          where: { isPrimary: true }
        },
        options: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}

export const productService = new ProductService() 