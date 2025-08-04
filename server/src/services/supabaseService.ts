import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { config } from "@/config/server"
import sharp from "sharp"
import path from "path"

export class SupabaseStorageUtils {
  protected supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(
      config.supabase.api,
      config.supabase.accessKey
    )
  }

  protected async convertToWebp(files: { buffer: Buffer; originalName: string }[]): Promise<{ buffer: Buffer; filename: string }[]> {
    return await Promise.all(
      files.map(async ({ buffer, originalName }) => {
        // Generar nombre aleatorio combinando múltiples elementos
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = path.extname(originalName).toLowerCase()
        const randomId = Math.random().toString(36).substring(2, 8)
        
        // Crear nombre aleatorio: timestamp_randomstring_randomid.webp
        const filename = `${timestamp}_${randomString}_${randomId}${fileExtension}`

        const resized = await sharp(buffer)
          //.resize({ width: 800, withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer()

        return {
          buffer: resized,
          filename
        }
      })
    )
  }

  static buildPublicUrl(bucket: string, path: string): string {
    return `${config.supabase.api}/storage/v1/object/public/${bucket}/${path}`
  }
}
