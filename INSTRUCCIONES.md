# 🛒 Supermercado Delivery App - Instrucciones de Instalación y Uso

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- MongoDB (instalado localmente o acceso a MongoDB Atlas)
- Git

## 🚀 Instalación

### 1. Clonar el proyecto
```bash
git clone <URL-del-repositorio>
cd supermercado-app
```

### 2. Instalar Backend
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno del Backend
Copia el archivo `.env` y ajusta las configuraciones:
```bash
cp .env.example .env
```
Edita `.env` con tus configuraciones:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/supermercado
JWT_SECRET=tu_secreto_aqui
NODE_ENV=development
```

### 4. Inicializar base de datos
```bash
npm run seed
```
Esto creará:
- Un usuario administrador: `admin@supermercado.com` / `admin123`
- 10 productos de ejemplo

### 5. Instalar Frontend
```bash
cd ../frontend
npm install
```

## 🏃‍♂️ Ejecutar la Aplicación

### Opción 1: Ejecutar ambos servidores por separado

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
El backend estará disponible en: http://localhost:3000

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
El frontend estará disponible en: http://localhost:5173

### Opción 2: Ejecutar en modo producción
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📱 Acceso a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Admin Panel**: http://localhost:5173 (inicia sesión con admin@supermercado.com)

## 🔑 Credenciales de Demostración

### Administrador
- **Email**: admin@supermercado.com
- **Contraseña**: admin123

### Cliente de Prueba
- **Email**: cliente@ejemplo.com
- **Contraseña**: cliente123

## 📋 Características Implementadas

### ✅ Funcionalidades Principales
- [x] Catálogo de productos con categorías
- [x] Búsqueda y filtros de productos
- [x] Carrito de compras funcional
- [x] Sistema de registro y login
- [x] Gestión de perfiles de usuario
- [x] Sistema de pedidos completo
- [x] Historial de pedidos
- [x] Panel de administración

### 🛍️ Características del Carrito
- Agregar/eliminar productos
- Modificar cantidades
- Cálculo automático de totales
- Persistencia en sesión

### 📦 Gestión de Pedidos
- Creación de pedidos
- Seguimiento de estado
- Historial completo
- Cancelación de pedidos

### 👥 Sistema de Usuarios
- Registro de clientes
- Perfiles editables
- Direcciones de entrega
- Roles (usuario/admin)

### 🎨 Interfaz de Usuario
- Diseño responsive
- Navegación intuitiva
- Experiencia moderna
- Indicadores de carga

## 🔧 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)
- `GET /api/products/categories/list` - Listar categorías

### Pedidos
- `POST /api/orders` - Crear pedido
- `GET /api/orders/my-orders` - Pedidos del usuario
- `GET /api/orders/:id` - Obtener pedido
- `PUT /api/orders/:id/status` - Actualizar estado (admin)
- `PUT /api/orders/:id/cancel` - Cancelar pedido

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id/role` - Actualizar rol
- `DELETE /api/users/:id` - Eliminar usuario

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a MongoDB**
   - Asegúrate que MongoDB esté corriendo
   - Verifica la cadena de conexión en `.env`

2. **Error de CORS**
   - El frontend debe estar en el puerto 5173
   - Verifica la configuración del proxy en `vite.config.js`

3. **Error de autenticación**
   - Limpia el localStorage del navegador
   - Verifica el JWT_SECRET en `.env`

4. **Productos no cargan**
   - Ejecuta `npm run seed` en el backend
   - Revisa la consola del navegador para errores

### Logs y Debugging
- Backend: Revisa la consola donde ejecutas `npm run dev`
- Frontend: Abre las herramientas de desarrollador del navegador
- MongoDB: Usa MongoDB Compass para verificar los datos

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Sube la carpeta 'dist' a tu plataforma preferida
```

### Backend (Heroku/Railway)
```bash
cd backend
npm install --production
# Configura las variables de entorno en tu plataforma
```

## 📝 Notas Adicionales

- La aplicación usa MongoDB local por defecto
- Para producción, usa MongoDB Atlas
- El JWT_SECRET debe ser una cadena segura en producción
- Los archivos de imágenes usan URLs placeholder por defecto

## 🤝 Contribuciones

1. Fork del proyecto
2. Crear una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
