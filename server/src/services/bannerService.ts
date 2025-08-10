import { SupabaseStorageUtils } from './supabaseService';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const prisma = new PrismaClient();

interface IdeogramGenerateRequest {
  prompt: string;
  rendering_speed?: string;
  style_type?: string;
  aspect_ratio: string;
  num_images: number;
}

interface IdeogramResponse {
  created: string;
  data: Array<{
    is_image_safe: boolean;
    prompt: string;
    resolution: string;
    seed: number;
    style_type: string;
    url: string;
  }>;
}

interface BannerAction {
  type: 'product' | 'category' | 'url' | 'none';
  target?: string; 
  title?: string;
}

export class BannerServices extends SupabaseStorageUtils {
  private readonly IDEogram_API_KEY = process.env['IDEOGRAM_API_KEY'] || "";
  private readonly IDEogram_API_URL = 'https://api.ideogram.ai/v1/ideogram-v3/generate';

  async createBannerWithAI(
    prompt: string,
    aspect_ratio: string = '2x1'
  ): Promise<{ success: boolean; images: string[]; error?: string }> {
    try {
      const hasCredits = await this.checkIntegrationCredits('ideogram');
      if (!hasCredits) {
        return {
          success: false,
          images: [],
          error: 'No hay créditos disponibles para generar imágenes'
        };
      }

      const requestData: IdeogramGenerateRequest = {
        prompt,
        rendering_speed: 'QUALITY',
        style_type: 'AUTO',
        aspect_ratio,
        num_images: 4
      };

      const formData = new FormData();
      formData.append('prompt', JSON.stringify(requestData.prompt));
      formData.append('rendering_speed', JSON.stringify(requestData.rendering_speed));
      formData.append('style_type', JSON.stringify(requestData.style_type));
      formData.append('aspect_ratio', JSON.stringify(requestData.aspect_ratio));
      formData.append('num_images', JSON.stringify(requestData.num_images));

      const response = await fetch(this.IDEogram_API_URL, {
        method: 'POST',
        headers: {
          'Api-Key': this.IDEogram_API_KEY
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error en la API de Ideogram: ${response.status} ${response.statusText}`);
      }

      const ideogramResponse = await response.json() as IdeogramResponse;

      if (!ideogramResponse.data || ideogramResponse.data.length === 0) {
        throw new Error('No se recibieron imágenes de Ideogram');
      }

      const downloadedImages = await this.downloadImages(ideogramResponse.data);
      
      await this.updateIntegrationUsage('ideogram', 'image-generation', {
        imagesGenerated: ideogramResponse.data.length,
        costInUSD: this.calculateImageCost(ideogramResponse.data.length)
      });

      return {
        success: true,
        images: downloadedImages
      };

    } catch (error) {
      console.error('Error generando banner con AI:', error);
      
      await this.logIntegrationError('ideogram', 'image-generation', error as Error);
      
      return {
        success: false,
        images: [],
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }


  private async downloadImages(imageData: IdeogramResponse['data']): Promise<string[]> {
    const downloadedUrls: string[] = [];
    const tempDir = os.tmpdir();

    for (const image of imageData) {
      try {
        const imageResponse = await fetch(image.url);
        
        if (!imageResponse.ok) {
          throw new Error(`Error descargando imagen: ${imageResponse.status}`);
        }

        const imageBuffer = await imageResponse.arrayBuffer();

        const fileName = `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
        const tempPath = path.join(tempDir, fileName);

        fs.writeFileSync(tempPath, Buffer.from(imageBuffer));

        const supabaseUrl = await this.uploadFile(tempPath, 'banners', fileName);
        
        if (supabaseUrl) {
          downloadedUrls.push(supabaseUrl);
          
          fs.unlinkSync(tempPath);
        }

      } catch (error) {
        console.error(`Error descargando imagen ${image.url}:`, error);
      }
    }

    return downloadedUrls;
  }

  private async uploadFile(filePath: string, bucket: string, fileName: string): Promise<string | null> {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      const {  error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (error) {
        console.error('Error subiendo archivo a Supabase:', error);
        return null;
      }

      return SupabaseStorageUtils.buildPublicUrl(bucket, fileName);

    } catch (error) {
      console.error('Error en uploadFile:', error);
      return null;
    }
  }


  async uploadCustomBanner(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string = 'image/png',
    isClickable: boolean = false,
    actionType?: BannerAction,
    from?: Date,
    to?: Date
  ): Promise<{ success: true; bannerId: string; imageUrl: string } | { success: false; error: string }> {
    try {
      if (!contentType.startsWith('image/')) {
        return {
          success: false,
          error: 'El archivo debe ser una imagen válida'
        };
      }

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = path.extname(fileName) || '.png';
      const uniqueFileName = `custom_banner_${timestamp}_${randomId}${fileExtension}`;

      const { error } = await this.supabase.storage
        .from('banners')
        .upload(uniqueFileName, fileBuffer, {
          contentType,
          upsert: false
        });

      if (error) {
        throw new Error(`Error subiendo archivo: ${error.message}`);
      }

      const imageUrl = SupabaseStorageUtils.buildPublicUrl('banners', uniqueFileName);
      const imagePath = uniqueFileName;

      const banner = await prisma.banner.create({
        data: {
          imageUrl,
          imagePath,
          isClickable,
          actionType: actionType ? JSON.parse(JSON.stringify(actionType)) : null,
          from: from || null,
          to: to || null,
          isActive: true
        }
      });

      return {
        success: true,
        bannerId: banner.id, 
        imageUrl
      };

    } catch (error) {
      console.error('Error subiendo banner personalizado:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fileName = path.basename(filePath);
      const bucket = 'banners';

      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) {
        console.error('Error eliminando archivo de Supabase:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error en deleteFile:', error);
      return false;
    }
  }

  async saveSelectedBanner(
    bannerUrls: string[],
    isClickable: boolean = false,
    actionType?: BannerAction,
    from?: Date,
    to?: Date
  ): Promise<{ success: boolean; bannerIds?: string[]; error?: string }> {
    try {
      const bannerIds: string[] = [];
      
      for (const imageUrl of bannerUrls) {
        try {
          const imageResponse = await fetch(imageUrl);
          
          if (!imageResponse.ok) {
            console.error(`Error descargando imagen ${imageUrl}: ${imageResponse.status}`);
            continue;
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const fileBuffer = Buffer.from(imageBuffer);
          
          const contentType = imageResponse.headers.get('content-type') || 'image/png';
          const originalExtension = this.getExtensionFromContentType(contentType);
          
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          const webpFileName = `selected_banner_${timestamp}_${randomId}.webp`;

          let webpBuffer;
          if (originalExtension !== ".webp") {
            try {
              const convertedFiles = await this.convertToWebp([{ 
                buffer: fileBuffer, 
                originalName: `image${originalExtension}` 
              }]);
              webpBuffer = convertedFiles[0].buffer;
            } catch (error) {
              console.error(`Error convirtiendo a WebP:`, error);
              webpBuffer = fileBuffer; 
            }
          } else {
            webpBuffer = fileBuffer; 
          }

          const { error } = await this.supabase.storage
            .from('banners')
            .upload(webpFileName, webpBuffer, {
              contentType: 'image/webp',
              upsert: false
            });

          if (error) {
            console.error(`Error subiendo imagen WebP ${imageUrl}:`, error);
            continue;
          }

          const supabaseImageUrl = SupabaseStorageUtils.buildPublicUrl('banners', webpFileName);
          const imagePath = webpFileName;

          const banner = await prisma.banner.create({
            data: {
              imageUrl: supabaseImageUrl,
              imagePath,
              isClickable,
              actionType: actionType ? JSON.parse(JSON.stringify(actionType)) : null,
              from: from || null,
              to: to || null,
              isActive: true
            }
          });

          bannerIds.push(banner.id);

        } catch (error) {
          console.error(`Error procesando imagen ${imageUrl}:`, error);
          continue;
        }
      }

      if (bannerIds.length === 0) {
        return {
          success: false,
          error: 'No se pudo procesar ninguna imagen'
        };
      }

      return {
        success: true,
        bannerIds
      };

    } catch (error) {
      console.error('Error en saveSelectedBanner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private getExtensionFromContentType(contentType: string): string {
    const mimeToExtension: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff'
    };

    return mimeToExtension[contentType.toLowerCase()] || '.png';
  }

  async getActiveBanners(): Promise<{ success: boolean; banners?: any[]; error?: string }> {
    try {
      const now = new Date();
      
      const banners = await prisma.banner.findMany({
        where: {
          isActive: true,
          OR: [
            { from: null, to: null }, 
            { from: { lte: now }, to: null }, 
            { from: null, to: { gte: now } }, 
            { from: { lte: now }, to: { gte: now } } 
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        banners: banners.map((banner: any) => ({
          ...banner,
          actionType: banner.actionType
        }))
      };

    } catch (error) {
      console.error('Error obteniendo banners:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateBanner(
    bannerId: string,
    updates: Partial<{
      isClickable: boolean;
      actionType: BannerAction;
      from: Date;
      to: Date;
      isActive: boolean;
    }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const processedUpdates: any = { ...updates };
      if (processedUpdates.actionType !== undefined) {
        processedUpdates.actionType = processedUpdates.actionType ? 
          JSON.parse(JSON.stringify(processedUpdates.actionType)) : null;
      }
      
      await prisma.banner.update({
        where: { id: bannerId },
        data: processedUpdates
      });

      return { success: true };

    } catch (error) {
      console.error('Error actualizando banner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async deleteBanner(bannerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const banner = await prisma.banner.findUnique({
        where: { id: bannerId }
      });

      if (!banner) {
        return {
          success: false,
          error: 'Banner no encontrado'
        };
      }

      await this.deleteFile(banner.imagePath);

      await prisma.banner.delete({
        where: { id: bannerId }
      });

      return { success: true };

    } catch (error) {
      console.error('Error eliminando banner:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }


  private async checkIntegrationCredits(integrationName: string): Promise<boolean> {
    try {
      const integration = await prisma.integration.findFirst({
        where: { name: integrationName, isEnabled: true }
      });

      if (!integration) return false;

      return Number(integration.availableCredits) > 0;
    } catch (error) {
      console.error('Error verificando créditos:', error);
      return false;
    }
  }

  private async updateIntegrationUsage(
    integrationName: string,
    requestType: string,
    metrics: { imagesGenerated: number; costInUSD: number }
  ): Promise<void> {
    try {
      await prisma.integration.updateMany({
        where: { name: integrationName },
        data: {
          usedCredits: { increment: metrics.costInUSD },
          availableCredits: { decrement: metrics.costInUSD },
          totalRequests: { increment: 1 },
          successfulRequests: { increment: 1 },
          lastUsed: new Date()
        }
      });

      await prisma.integrationUsageLog.create({
        data: {
          integrationId: (await prisma.integration.findFirst({ where: { name: integrationName } }))?.id || '',
          requestTypeName: requestType,
          creditsUsed: metrics.costInUSD,
          costInUSD: metrics.costInUSD,
          imagesGenerated: metrics.imagesGenerated,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error actualizando uso de integración:', error);
    }
  }


  private calculateImageCost(imageCount: number): number {
    const costPerImage = 0.05; 
    return imageCount * costPerImage;
  }

  private async logIntegrationError(
    integrationName: string,
    requestType: string,
    error: Error
  ): Promise<void> {
    try {
      const integration = await prisma.integration.findFirst({
        where: { name: integrationName }
      });

      if (integration) {
        await prisma.integration.update({
          where: { id: integration.id },
          data: {
            failedRequests: { increment: 1 },
            lastUsed: new Date()
          }
        });

        await prisma.integrationUsageLog.create({
          data: {
            integrationId: integration.id,
            requestTypeName: requestType,
            creditsUsed: 0,
            costInUSD: 0,
            status: 'FAILED',
            errorMessage: error.message
          }
        });
      }
    } catch (logError) {
      console.error('Error loggeando error de integración:', logError);
    }
  }
}
