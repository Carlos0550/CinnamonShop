# CinnamonShop - Docker Setup

Este documento explica cómo configurar y ejecutar el proyecto CinnamonShop usando Docker.

## 📋 Prerrequisitos

- Docker Desktop instalado y ejecutándose
- Docker Compose instalado
- Variables de entorno configuradas

## 🔧 Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos externa
DATABASE_URL=tu_url_de_base_de_datos_externa

# Supabase
SUPABASE_API=tu_url_de_supabase
SUPABASE_SECRET=tu_secret_de_supabase
SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# JWT (para producción)
JWT_SECRET=tu_jwt_secret_super_seguro

# Email (opcional)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_de_aplicacion
```

## 🚀 Comandos de Docker

### Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Producción

Para Railway, simplemente conecta tu repositorio y configura las variables de entorno. Railway detectará automáticamente el docker-compose.yml.

Para desarrollo local con configuración de producción:

```bash
# Cambiar target a production en docker-compose.yml
# Luego ejecutar:
docker-compose up --build
```

### Comandos Útiles

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reconstruir un servicio específico
docker-compose build backend
docker-compose build frontend

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed

# Ver estado de los servicios
docker-compose ps

# Limpiar recursos no utilizados
docker system prune -a
```

## 🌐 Puertos y URLs

### Desarrollo
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Producción (Railway)
- Railway asignará automáticamente las URLs

## 📊 Servicios Incluidos

### 1. Backend (Node.js + TypeScript)
- **Puerto**: 5000
- **Framework**: Express.js
- **ORM**: Prisma
- **Base de datos**: Externa (configurada via DATABASE_URL)

### 2. Frontend (React + Vite)
- **Puerto**: 3000 (dev) / 3000 (prod con Vite preview)
- **Framework**: React 19
- **Build tool**: Vite
- **UI Library**: Ant Design

## 🔄 Migraciones de Base de Datos

Para ejecutar migraciones de Prisma:

```bash
# Ejecutar migraciones
docker-compose exec backend npm run db:migrate

# Generar cliente de Prisma
docker-compose exec backend npm run db:generate

# Ejecutar seed (si existe)
docker-compose exec backend npm run db:seed
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Puerto ya en uso**
   ```bash
   # Verificar qué está usando el puerto
   netstat -ano | findstr :5000
   
   # Cambiar puerto en docker-compose.yml
   ```

2. **Error de permisos en Windows**
   ```bash
   # Ejecutar Docker Desktop como administrador
   # O configurar permisos de carpeta
   ```

3. **Contenedor no inicia**
   ```bash
   # Ver logs detallados
   docker-compose logs backend
   
   # Reconstruir sin cache
   docker-compose build --no-cache backend
   ```

4. **Problemas de base de datos**
   ```bash
   # Reiniciar solo la base de datos
   docker-compose restart postgres
   
   # Eliminar volumen y recrear
   docker-compose down -v
   docker-compose up --build
   ```

### Verificar Estado

```bash
# Estado de todos los contenedores
docker-compose ps

# Uso de recursos
docker stats

# Espacio en disco
docker system df
```

## 🔒 Seguridad

### Variables de Entorno
- Nunca commits variables sensibles
- Usa diferentes secrets para desarrollo y producción
- Rota regularmente las claves JWT

### Contenedores
- Los contenedores de producción ejecutan como usuario no-root
- Se aplican headers de seguridad en Nginx
- Rate limiting configurado en el backend

## 📈 Monitoreo

### Health Checks
- PostgreSQL tiene health check configurado
- Los servicios dependen del health check de la base de datos

### Logs
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Exportar logs
docker-compose logs > logs.txt
```

## 🚀 Despliegue

### Railway (Recomendado)
El proyecto está optimizado para Railway:

1. Conecta tu repositorio a Railway
2. Configura las variables de entorno
3. Railway detectará automáticamente el docker-compose.yml
4. Railway manejará automáticamente el proxy y serving de archivos estáticos

## 📝 Notas Adicionales

- Configuración simplificada para Railway (sin multi-stage builds innecesarios)
- Variables de entorno con valores por defecto para desarrollo y producción
- Optimizado para Railway (sin Nginx necesario)
- Usa servicios externos para base de datos 