import { BaseApiService } from './baseApi'

export interface AIGenerateDescriptionRequest {
  categoryName: string
  additionalDetails?: string
}

export interface AIGenerateProductFromImageRequest {
  imageUrl: string
  categoryName: string
  additionalDetails?: string
}

export interface AIGenerateProductFromImageFileRequest {
  imageFile: File
  categoryName: string
  additionalDetails?: string
}

export interface AIGenerateProductFromImageResponse {
  title: string
  description: string
  brand?: string
}

class AIService extends BaseApiService {
  async generateCategoryDescription(data: AIGenerateDescriptionRequest): Promise<string> {
    try {
      const response = await this.request<{ description: string }>('/ai/generate-category-description', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!response.data?.description) {
        throw new Error('No se pudo generar la descripción')
      }
      return response.data.description
    } catch (error) {
      throw new Error('Error al generar la descripción con IA. Por favor, intenta de nuevo.')
    }
  }

  async generateProductDescription(productName: string, category: string, additionalDetails?: string): Promise<string> {
    try {
      const response = await this.request<{ description: string }>('/ai/generate-product-description', {
        method: 'POST',
        body: JSON.stringify({
          productName,
          category,
          additionalDetails
        })
      })
      if (!response.data?.description) {
        throw new Error('No se pudo generar la descripción')
      }
      return response.data.description
    } catch (error) {
      throw new Error('Error al generar la descripción con IA. Por favor, intenta de nuevo.')
    }
  }

  async generateProductFromImage(data: AIGenerateProductFromImageRequest): Promise<AIGenerateProductFromImageResponse> {
    try {
      const response = await this.request<AIGenerateProductFromImageResponse>('/ai/generate-product-from-image', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      if (!response.data?.title || !response.data?.description) {
        throw new Error('No se pudo generar el producto desde la imagen')
      }
      return response.data
    } catch (error) {
      throw new Error('Error al generar el producto desde la imagen con IA. Por favor, intenta de nuevo.')
    }
  }

  async generateProductFromImageFile(data: AIGenerateProductFromImageFileRequest): Promise<AIGenerateProductFromImageResponse> {
    try {
      const formData = new FormData()
      formData.append('image', data.imageFile)
      formData.append('categoryName', data.categoryName)
      if (data.additionalDetails) {
        formData.append('additionalDetails', data.additionalDetails)
      }

      const response = await this.request<AIGenerateProductFromImageResponse>('/ai/generate-product-from-image-file', {
        method: 'POST',
        body: formData
      })
      if (!response.data?.title || !response.data?.description) {
        throw new Error('No se pudo generar el producto desde la imagen')
      }
      return response.data
    } catch (error) {
      throw new Error('Error al generar el producto desde la imagen con IA. Por favor, intenta de nuevo.')
    }
  }
}

export const aiService = new AIService() 