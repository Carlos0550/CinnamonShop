import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { uploadSingleImage } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.post('/photo', uploadSingleImage('profileImage'), ProfileController.updateProfilePhoto);

router.delete('/photo', ProfileController.deleteProfilePhoto);
router.put("/", ProfileController.updateProfile)

export default router; 