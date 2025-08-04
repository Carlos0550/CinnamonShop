import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export class FileHelper {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_ANON_KEY']!
    )
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'images'): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop()
      const fileName = `${uuidv4()}.${fileExtension}`
      const filePath = `${folder}/${fileName}`

      const { error } = await this.supabase.storage
        .from('cinnamonshop')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600'
        })

      if (error) {
        throw new Error(`Error al subir imagen: ${error.message}`)
      }

      const { data: urlData } = this.supabase.storage
        .from('cinnamonshop')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      throw new Error(`Error al procesar imagen: ${error}`)
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const folder = urlParts[urlParts.length - 2]
      const filePath = `${folder}/${fileName}`

      const { error } = await this.supabase.storage
        .from('cinnamonshop')
        .remove([filePath])

      if (error) {
        console.error('Error al eliminar imagen:', error)
      }
    } catch (error) {
      console.error('Error al procesar eliminación de imagen:', error)
    }
  }

  generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    return `${timestamp}-${randomString}.${extension}`
  }

  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype)
  }

  validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
    return file.size <= maxSize
  }
} 