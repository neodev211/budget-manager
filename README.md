# Budget Manager

Un sistema completo de gestión de presupuestos construido con tecnologías modernas. Permite a los usuarios crear categorías de presupuesto, registrar gastos, crear provisiones (gastos anticipados) y obtener un resumen ejecutivo de sus finanzas.

## 🎯 Características

### Dashboard
- Resumen ejecutivo de presupuestos activos
- Vista general de gastos vs presupuestos
- Métricas de provisiones abiertas

### Gestión de Categorías
- Crear categorías de presupuesto con montos mensuales
- Ver período (mes/año) y notas
- Ordenamiento por fecha (más recientes a más antiguas)
- Contador de categorías
- Período por defecto: mes y año actual

### Provisiones (Gastos Anticipados)
- Crear provisiones con vencimiento automático (último día del mes siguiente)
- Visualizar saldo disponible
- Auto-cierre cuando se utiliza completamente
- Copiar provisiones entre categorías (individual o masivo)
- Validación de presupuesto al copiar
- Auto-selección de provisiones en copia masiva

### Gastos
- Registro simple con 3 campos obligatorios (monto, descripción, categoría)
- Asociar gastos a provisiones (opcional)
- Validaciones en tiempo real:
  - Saldo disponible de categoría
  - Saldo disponible de provisión
  - Monto debe ser mayor a 0
- Ordenamiento por fecha (más recientes a más antiguos)
- Mensaje de validación dinámico
- Botón inteligente (deshabilitado si hay errores)

## 🏗️ Arquitectura

### Backend
- **Node.js** con Express.js
- **TypeScript** para type safety
- **PostgreSQL** como base de datos
- **Prisma ORM** para acceso a datos
- **Arquitectura DDD** (Domain-Driven Design)

### Frontend
- **Next.js 15** (App Router)
- **React 19** con Hooks
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **Axios** para API calls

## 🚀 Comenzar

### Requisitos Previos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local sin Docker)
- PostgreSQL 16 (para desarrollo local sin Docker)

### Instalación con Docker

1. **Clonar el repositorio**
```bash
git clone https://github.com/usuario/budget-manager.git
cd budget-manager
```

2. **Iniciar los servicios**
```bash
docker-compose up --build
```

3. **Acceder a la aplicación**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- Base de datos: localhost:5432

### Instalación Local (sin Docker)

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tu configuración de PostgreSQL
npx prisma migrate dev
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📦 Variables de Entorno

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/budget_management?schema=public"
PORT=3000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🔧 Comandos Útiles

### Backend
```bash
npm run dev              # Desarrollo
npm run build            # Build
npm start                # Inicio (producción)
npm run prisma:studio    # Explorador de BD
npm run prisma:migrate   # Migraciones
```

### Frontend
```bash
npm run dev     # Desarrollo
npm run build   # Build
npm start       # Inicio (producción)
```

### Docker Compose
```bash
docker-compose up              # Iniciar servicios
docker-compose up -d           # Iniciar en background
docker-compose down            # Detener servicios
docker-compose logs -f         # Ver logs
docker-compose down -v         # Eliminar volúmenes (resetear BD)
```

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue o pull request.

---

**Última actualización:** Noviembre 2024
