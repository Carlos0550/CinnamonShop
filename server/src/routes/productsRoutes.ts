import { Router } from 'express'
import { productsController } from '@/controllers/productsController'
import { authenticate } from '@/middleware/auth'
import { upload } from '@/middleware/upload'

const router = Router()

// RUTAS PÚBLICAS (sin autenticación)
router.get('/', productsController.getAllProducts)
router.get('/:id', productsController.getProductById)
router.get('/category/:categoryId', productsController.getProductsByCategory)

// RUTAS PRIVADAS (con autenticación)
router.use(authenticate)

// Configurar multer para procesar todos los campos del FormData
const productUpload = upload.any()

router.post('/', productUpload, productsController.createProduct)
router.put('/:id', productUpload, productsController.updateProduct)
router.delete('/:id', productsController.deleteProduct)
router.patch('/:id/toggle-status', productsController.toggleProductStatus)
router.get('/category/:categoryId/admin', productsController.getProductsByCategoryAdmin)



export default router 