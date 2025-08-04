import { Router } from 'express'
import { productsController } from '@/controllers/productsController'
import { authenticate } from '@/middleware/auth'
import { upload } from '@/middleware/upload'

const router = Router()

// Middleware de autenticación para todas las rutas
router.use(authenticate)

// Configurar multer para procesar todos los campos del FormData
const productUpload = upload.any()

// Rutas de productos
router.post('/', productUpload, productsController.createProduct)
router.get('/', productsController.getAllProducts)
router.get('/:id', productsController.getProductById)
router.put('/:id', productUpload, productsController.updateProduct)
router.delete('/:id', productsController.deleteProduct)
router.patch('/:id/toggle-status', productsController.toggleProductStatus)
router.get('/category/:categoryId', productsController.getProductsByCategory)
router.get('/category/:categoryId/admin', productsController.getProductsByCategoryAdmin)



export default router 