import { BaseApiService } from './baseApi'

export interface Category {
  id?: string
  name: string
  description: string
  imageUrl?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  _count?: {
    products: number
  }
}

export interface CreateCategoryData {
  name: string
  description: string
  imageUrl?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  imageUrl?: string
}

export class CategoryApiService extends BaseApiService {
  async getAll(includeInactive: boolean = false): Promise<Category[]> {
    const url = includeInactive ? '/categories?includeInactive=true' : '/categories'
    const response = await this.request<Category[]>(url)
    return response.data || []
  }

  async getById(id: string): Promise<Category> {
    const response = await this.request<Category>(`/categories/${id}`)
    if (!response.data) {
      throw new Error('Categoría no encontrada')
    }
    return response.data
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.data) {
      throw new Error('Error al crear la categoría')
    }
    return response.data
  }

  async createWithImage(formData: FormData): Promise<Category> {
    const response = await this.request<Category>('/categories', {
      method: 'POST',
      body: formData,
    })
    if (!response.data) {
      throw new Error('Error al crear la categoría')
    }
    return response.data
  }

  async updateWithImage(id: string, formData: FormData): Promise<Category> {
    const response = await this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: formData,
    })
    if (!response.data) {
      throw new Error('Error al actualizar la categoría')
    }
    return response.data
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (!response.data) {
      throw new Error('Error al actualizar la categoría')
    }
    return response.data
  }

  async delete(id: string): Promise<{ message: string; action: string }> {
    const response = await this.request<{ message: string; action: string }>(`/categories/${id}`, {
      method: 'DELETE',
    })
    return response.data || { message: '', action: '' }
  }

  async reactivate(id: string): Promise<Category> {
    const response = await this.request<Category>(`/categories/${id}/reactivate`, {
      method: 'PATCH',
    })
    if (!response.data) {
      throw new Error('Error al reactivar la categoría')
    }
    return response.data
  }


}

export const categoryApi = new CategoryApiService() 