import { Request, Response } from 'express';
import { BannerServices } from '../services/bannerService';
import dayjs from 'dayjs';

const bannerService = new BannerServices();

export class BannerController {

  async uploadCustomBanner(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se ha proporcionado ningún archivo'
        });
      }

      const { buffer, originalname, mimetype } = req.file;
      
      const { isClickable, actionType, from, to } = req.body;

      if (!mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          error: 'El archivo debe ser una imagen válida'
        });
      }

      let parsedActionType = null;
      if (actionType) {
        try {
          parsedActionType = JSON.parse(actionType);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Formato inválido para actionType'
          });
        }
      }

      let fromDate = null;
      let toDate = null;
      
      if (from) {
        fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Formato de fecha inválido para "from"'
          });
        }
      }
      
      if (to) {
        toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Formato de fecha inválido para "to"'
          });
        }
      }

      const result = await bannerService.uploadCustomBanner(
        buffer,
        originalname,
        mimetype,
        isClickable === 'true',
        parsedActionType,
        fromDate!,
        toDate!
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json({
        success: true,
        message: 'Banner subido exitosamente',
        data: {
          bannerId: result.bannerId,
          imageUrl: result.imageUrl
        }
      });

    } catch (error) {
      console.error('Error en uploadCustomBanner:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async getActiveBanners(_: Request, res: Response) {
    try {
      const result = await bannerService.getActiveBanners();
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({
        success: true,
        data: result.banners
      });

    } catch (error) {
      console.error('Error obteniendo banners:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async updateBanner(req: Request, res: Response) {
    try {
      const { bannerId } = req.params;
      const updates = req.body;

      if (updates.actionType && typeof updates.actionType === 'string') {
        try {
          updates.actionType = JSON.parse(updates.actionType);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Formato inválido para actionType'
          });
        }
      }

      if (updates.from) {
        const fromDate = new Date(updates.from);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Formato de fecha inválido para "from"'
          });
        }
        updates.from = fromDate;
      }
      
      if (updates.to) {
        const toDate = new Date(updates.to);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Formato de fecha inválido para "to"'
          });
        }
        updates.to = toDate;
      }

      const result = await bannerService.updateBanner(bannerId, updates);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'Banner actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error actualizando banner:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async deleteBanner(req: Request, res: Response) {
    try {
      const { bannerId } = req.params;
      
      const result = await bannerService.deleteBanner(bannerId);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json({
        success: true,
        message: 'Banner eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando banner:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async selectCustomBanner(req: Request, res: Response) {
    try {
      const {
        banner_urls,
        isClickable,
        actionType,
        from,
        to
      } = req.query;

      if (isClickable === undefined || isClickable === null) {
        return res.status(400).json({
          success: false,
          message: "Debe indicar si el banner es Clickeable o no."
        });
      }

      let parsedActionType = null;
      if (isClickable === "true") {
        if (!actionType || typeof actionType !== "string") {
          return res.status(400).json({
            success: false,
            message: "Debe indicar que acción debe hacer el banner"
          });
        }
        
        try {
          parsedActionType = JSON.parse(actionType);
          if (!parsedActionType || typeof parsedActionType !== 'object') {
            return res.status(400).json({
              success: false,
              message: "Formato inválido para actionType"
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: "Formato JSON inválido para actionType"
          });
        }
      }

      let fromDate = null;
      if (from && typeof from === "string") {
        const is_valid_date = dayjs(from).isValid();
        const is_future = dayjs().isBefore(from);
        if (!is_valid_date || is_future) {
          return res.status(400).json({
            success: false,
            message: "La fecha 'desde' no es válida, por favor ingrese una fecha válida no futura a la actual"
          });
        }
        fromDate = dayjs(from).toDate();
      }

      let toDate = null;
      if (to && typeof to === "string") {
        const is_valid_date = dayjs(to).isValid();
        const is_in_the_past = dayjs().isAfter(to);
        if (!is_valid_date || is_in_the_past) {
          return res.status(400).json({
            success: false,
            message: "La fecha 'hasta' no es válida, por favor ingrese una fecha válida no antes de la actual."
          });
        }
        toDate = dayjs(to).toDate();
      }

      if (!banner_urls || typeof banner_urls !== "string") {
        return res.status(400).json({
          success: false,
          message: "Debe seleccionar al menos un banner generado por IA."
        });
      }

      let parsed_banner_urls;
      try {
        parsed_banner_urls = JSON.parse(banner_urls);
        if (!Array.isArray(parsed_banner_urls) || parsed_banner_urls.length === 0) {
          return res.status(400).json({
            success: false,
            message: "banner_urls debe ser un array no vacío"
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Formato JSON inválido para banner_urls"
        });
      }

      const result = await bannerService.saveSelectedBanner(
        parsed_banner_urls,
        isClickable === "true",
        parsedActionType,
        fromDate || undefined,
        toDate || undefined
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json({
        success: true,
        message: "Banners seleccionados guardados exitosamente",
        data: {
          bannerIds: result.bannerIds
        }
      });

    } catch (error) {
      console.error('Error guardando el banner seleccionado:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
