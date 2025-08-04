import { BaseApiService } from './baseApi'

export interface UploadImageResponse {
  url: string
  path: string
}

class SupabaseService extends BaseApiService {
  async uploadImage(file: File, folder: string = 'products'): Promise<UploadImageResponse> {
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      const response = await this.request<UploadImageResponse>('/upload/image', {
        method: 'POST',
        body: formData
      })

      if (!response.data?.url) {
        throw new Error('No se pudo subir la imagen')
      }

      return response.data
    } catch (error) {
      throw new Error('Error al subir la imagen. Por favor, intenta de nuevo.')
    }
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      await this.request(`/upload/image`, {
        method: 'DELETE',
        body: JSON.stringify({ path: imagePath })
      })
    } catch (error) {
      throw new Error('Error al eliminar la imagen. Por favor, intenta de nuevo.')
    }
  }
}

export const supabaseService = new SupabaseService() 