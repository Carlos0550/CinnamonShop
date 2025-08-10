# CinnamonShop Frontend

Frontend moderno y responsive para la tienda online CinnamonShop, construido con Astro y React.

## 🚀 Características

- **Banners promocionales** con carrusel automático y navegación
- **Grid de categorías** con diseño atractivo y hover effects
- **Sistema de filtros** avanzado para productos (categoría, marca, precio, búsqueda)
- **Grid de productos** con paginación y estados de carga
- **Diseño responsive** optimizado para móviles y tablets
- **SEO friendly** con meta tags, Open Graph, Twitter Cards y structured data
- **Accesibilidad** mejorada con focus-visible y prefers-reduced-motion

## 🛠️ Tecnologías

- **Astro** - Framework base
- **React** - Componentes interactivos
- **TypeScript** - Tipado estático
- **CSS Modules** - Estilos modulares y responsive
- **Vite** - Build tool y dev server

## 📦 Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` y configurar:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

4. **Construir para producción:**
   ```bash
   npm run build
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── HeroBanner.tsx  # Carrusel de banners
│   ├── CategoryGrid.tsx # Grid de categorías
│   ├── ProductFilters.tsx # Filtros de productos
│   ├── ProductGrid.tsx # Grid de productos
│   ├── HomePage.tsx    # Página principal
│   └── App.tsx         # Componente raíz
├── services/           # Servicios de API
│   └── api.ts         # Cliente de API
├── types/              # Tipos TypeScript
│   └── index.ts       # Interfaces y tipos
├── pages/              # Páginas Astro
│   └── index.astro    # Página principal
└── main.tsx           # Punto de entrada React
```

## 🔌 API Integration

El proyecto se conecta con el backend a través del servicio `ApiService` que incluye:

- **Banners**: `GET /api/banners`
- **Categorías**: `GET /api/categories`
- **Productos**: `GET /api/products` con filtros y paginación
- **Búsqueda**: `GET /api/products/search`

## 📱 Responsive Design

- **Desktop**: Layout de 2 columnas con sidebar de filtros
- **Tablet**: Layout adaptativo con filtros colapsables
- **Mobile**: Layout de 1 columna con filtros en menú móvil

## 🎨 Estilos

- **CSS Modules** para estilos modulares
- **Gradientes modernos** y sombras sutiles
- **Animaciones CSS** con transiciones suaves
- **Sistema de colores** consistente
- **Tipografía** optimizada para legibilidad

## 🔍 SEO Features

- **Meta tags** completos (title, description, keywords)
- **Open Graph** para redes sociales
- **Twitter Cards** para Twitter
- **Structured Data** (Schema.org)
- **Sitemap XML** automático
- **Robots.txt** configurado
- **Canonical URLs**

## ♿ Accesibilidad

- **Focus visible** para navegación por teclado
- **ARIA labels** en elementos interactivos
- **Alt text** en imágenes
- **Semantic HTML** con elementos semánticos
- **Reduced motion** support

## 🚀 Performance

- **Lazy loading** de imágenes
- **Code splitting** automático
- **Optimización de fuentes** con preconnect
- **CSS crítico** inline
- **Bundle optimization** con Vite

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de producción
- `npm run astro` - Comandos de Astro

## 🌐 Configuración del Dominio

Para cambiar el dominio en producción, actualizar:

1. **index.astro**: Cambiar `canonicalUrl`
2. **sitemap.xml**: Actualizar URLs
3. **robots.txt**: Actualizar URL del sitemap

## 🔧 Personalización

### Colores
Los colores principales están definidos en CSS variables:
```css
--primary-color: #667eea;
--secondary-color: #764ba2;
--text-color: #2c3e50;
--background-color: #f8f9fa;
```

### Tipografía
La fuente principal se puede cambiar en `index.astro`:
```css
font-family: 'Tu-Fuente', sans-serif;
```

## 📱 Testing

Para probar la responsividad:
1. Usar DevTools del navegador
2. Probar en diferentes dispositivos
3. Verificar breakpoints: 480px, 768px, 1024px

## 🚨 Troubleshooting

### Problemas comunes:

1. **API no responde**: Verificar `VITE_API_URL` en `.env`
2. **Estilos no se cargan**: Verificar que CSS Modules esté configurado
3. **Componentes no renderizan**: Verificar que React esté instalado

### Logs de debug:
```bash
npm run dev -- --verbose
```

## 📄 Licencia

Este proyecto es parte de CinnamonShop y está bajo licencia privada.

## 👥 Contribución

Para contribuir al proyecto:
1. Crear una rama feature
2. Implementar cambios
3. Crear pull request
4. Revisar y mergear

---

**Desarrollado con ❤️ para CinnamonShop**
