import { Router } from 'express';
import { BannerController } from '../controllers/bannerController';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';

const router = Router();
const bannerController = new BannerController();

// RUTAS PÚBLICAS (sin autenticación)
router.get('/', bannerController.getActiveBanners.bind(bannerController));

// RUTAS PRIVADAS (con autenticación)
router.use(authenticate);

router.post('/upload', 
  upload.single('banner'), 
  bannerController.uploadCustomBanner.bind(bannerController)
);

router.post("/select", bannerController.selectCustomBanner.bind(bannerController))

router.put('/:bannerId', bannerController.updateBanner.bind(bannerController));

router.delete('/:bannerId', bannerController.deleteBanner.bind(bannerController));

export default router;
