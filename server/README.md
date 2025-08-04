# Cinnamon Shop - Backend

Backend para tienda online de productos de belleza construido con Node.js, Express, TypeScript y Prisma.

## 🚀 Características

- **Arquitectura Modular**: Código organizado con responsabilidades bien separadas
- **Autenticación JWT**: Sistema de autenticación robusto y seguro
- **Base de Datos PostgreSQL**: Con Prisma ORM para type safety
- **Validación de Datos**: Con express-validator y Zod
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan para logs estructurados
- **Testing**: Configuración completa con Jest
- **TypeScript**: Tipado estático completo
- **Almacenamiento**: Integración con Nhost para archivos

## 📋 Prerrequisitos

- Node.js >= 18.0.0
- PostgreSQL
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd CinnamonShop
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="postgresql://username:password@localhost:5432/cinnamon_shop"
   JWT_SECRET=your-super-secret-jwt-key-here
   NHOST_SUBDOMAIN=your-subdomain
   NHOST_REGION=your-region
   NHOST_ACCESS_KEY=your-access-key
   ```

4. **Configurar la base de datos**
   ```bash
   # Generar cliente de Prisma
   npm run db:generate
   
   # Crear migraciones
   npm run db:migrate
   
   # Opcional: Ejecutar seed
   npm run db:seed
   ```

5. **Iniciar el servidor**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm run build
   npm start
   ```

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuraciones
│   ├── database.ts   # Configuración de Prisma
│   └── server.ts     # Variables de entorno
├── controllers/      # Controladores de la API
│   └── authController.ts
├── middleware/       # Middlewares personalizados
│   ├── auth.ts       # Autenticación JWT
│   ├── validation.ts # Validación de datos
│   └── errorHandler.ts
├── routes/           # Rutas de la API
│   └── authRoutes.ts
├── services/         # Lógica de negocio
│   └── authService.ts
├── types/            # Tipos TypeScript
│   └── index.ts
└── index.ts          # Punto de entrada
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en producción
- `npm run db:generate` - Genera el cliente de Prisma
- `npm run db:migrate` - Ejecuta migraciones de la base de datos
- `npm run db:push` - Sincroniza el esquema con la base de datos
- `npm run db:studio` - Abre Prisma Studio
- `npm run db:seed` - Ejecuta datos de prueba
- `npm run lint` - Ejecuta ESLint
- `npm run lint:fix` - Corrige errores de ESLint
- `npm test` - Ejecuta tests
- `npm run test:watch` - Ejecuta tests en modo watch

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)
- `PUT /api/auth/change-password` - Cambiar contraseña (requiere auth)
- `DELETE /api/auth/deactivate` - Desactivar cuenta (requiere auth)

### Health Check
- `GET /health` - Estado del servidor

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación. Para acceder a rutas protegidas, incluye el token en el header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Base de Datos

El proyecto usa PostgreSQL con Prisma ORM. Los modelos principales incluyen:

- **Users**: Usuarios del sistema
- **Categories**: Categorías de productos
- **Products**: Productos de la tienda
- **Orders**: Órdenes de compra
- **Reviews**: Reseñas de productos
- **Addresses**: Direcciones de envío

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura de código
npm test -- --coverage
```

## 🚀 Despliegue

### Railway
1. Conecta tu repositorio a Railway
2. Configura las variables de entorno
3. Railway detectará automáticamente que es un proyecto Node.js

### VPS con Docker
```bash
# Construir imagen
docker build -t cinnamon-shop .

# Ejecutar contenedor
docker run -p 3000:3000 cinnamon-shop
```

## 🔧 Configuración de Nhost

Para el almacenamiento de archivos:

1. Crea una cuenta en [Nhost](https://nhost.io)
2. Crea un nuevo proyecto
3. Obtén las credenciales de Storage
4. Configura las variables de entorno

## 📝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🔮 Roadmap

- [ ] Implementación de productos y categorías
- [ ] Sistema de carrito de compras
- [ ] Procesamiento de pagos
- [ ] Sistema de reseñas
- [ ] Panel de administración
- [ ] Integración con Clerk para OAuth
- [ ] API de notificaciones
- [ ] Sistema de cupones y descuentos 