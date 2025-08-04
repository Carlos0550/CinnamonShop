import { BaseApiService } from './baseApi'

export interface ProductFormData {
  name: string
  description: string
  price: number
  stock: number
  brand: string
  categoryId: string
  dynamicOptions: { [key: string]: string[] }
}



export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  sku: string
  brand: string
  isActive: boolean
  categoryId: string
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
  images: Array<{
    id: string
    url: string
    alt: string | null
    isPrimary: boolean
    productId: string
    createdAt: string
  }>
  options: Array<{
    id: string
    name: string
    values: string[]
    productId: string
    createdAt: string
    updatedAt: string
  }>
  optionStock: Array<{
    id: string
    productId: string
    optionName: string
    optionValue: string
    stock: number
    createdAt: string
    updatedAt: string
  }>
}



export class ProductApiService extends BaseApiService {
  async createProduct(formData: FormData): Promise<Product> {
    const response = await this.request<Product>('/products', {
      method: 'POST',
      body: formData,
    })
    if (!response.data) {
      throw new Error('Error al crear el producto')
    }
    return response.data
  }

  async getAllProducts(): Promise<Product[]> {
    const response = await this.request<Product[]>('/products')
    return response.data || []
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`)
    if (!response.data) {
      throw new Error('Producto no encontrado')
    }
    return response.data
  }

  async updateProduct(id: string, formData: FormData): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: formData,
    })
    if (!response.data) {
      throw new Error('Error al actualizar el producto')
    }
    return response.data
  }

  // Eliminar producto
  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    })
    return response.data || { message: '' }
  }

  // Cambiar estado del producto (activar/desactivar)
  async toggleProductStatus(id: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}/toggle-status`, {
      method: 'PATCH',
    })
    if (!response.data) {
      throw new Error('Error al cambiar el estado del producto')
    }
    return response.data
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await this.request<Product[]>(`/products/category/${categoryId}`)
    return response.data || []
  }

  async getProductsByCategoryAdmin(categoryId: string): Promise<Product[]> {
    const response = await this.request<Product[]>(`/products/category/${categoryId}/admin`)
    return response.data || []
  }

}

export const productApi = new ProductApiService() 