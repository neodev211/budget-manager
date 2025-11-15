# Frontend - Budget Management System

Frontend desarrollado con **Next.js 15**, **TypeScript**, y **Tailwind CSS**.

## Características

✅ **Framework**: Next.js 15 (App Router)
✅ **Lenguaje**: TypeScript
✅ **Estilos**: Tailwind CSS
✅ **UI Components**: Componentes custom reutilizables
✅ **State Management**: React Hooks (useState, useEffect)
✅ **API Client**: Axios
✅ **Iconos**: Lucide React
✅ **Formateo**: date-fns, Intl API

## Estructura del Proyecto

```
frontend/
├── app/
│   ├── layout.tsx              # Layout principal
│   ├── page.tsx                # Dashboard (Home)
│   ├── categories/             # Página de Categorías
│   ├── provisions/             # Página de Provisiones
│   └── expenses/               # Página de Gastos
├── components/
│   ├── ui/                     # Componentes de UI base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Navigation.tsx
│   └── features/               # Componentes de funcionalidades
├── services/                   # Servicios de API
│   ├── categoryService.ts
│   ├── provisionService.ts
│   ├── expenseService.ts
│   └── reportService.ts
├── types/                      # Tipos TypeScript
│   └── index.ts
└── lib/                        # Utilidades
    ├── api.ts                  # Cliente Axios
    └── utils.ts                # Funciones helper
```

## Páginas Implementadas

### 1. Dashboard (/)
- Resumen Ejecutivo con tarjetas visuales
- Presupuesto mensual vs gastado
- Provisiones abiertas
- Disponible mensual y semestral
- Proyección a 6 meses

### 2. Categorías (/categories)
- Listado de categorías en tarjetas
- Formulario de creación (nombre, período, presupuesto)
- Eliminación de categorías
- Vista responsive con grid

### 3. Gastos (/expenses)
- **Formulario Simple**: Solo 3 campos obligatorios
  1. Monto
  2. Descripción
  3. Categoría
- Tabla con todos los gastos
- Total de gastos en tarjeta destacada
- Eliminación de gastos

### 4. Provisiones (/provisions)
- Listado de provisiones con estado
- Formulario de creación
- Total de provisiones abiertas
- Cerrar/eliminar provisiones

## Principio "Menos es Más"

### Formulario de Gastos Simplificado
```typescript
// Solo 3 campos obligatorios
{
  amount: number;        // 1. Monto
  description: string;   // 2. Descripción
  categoryId: string;    // 3. Categoría
  date?: string;         // Opcional (default: hoy)
}
```

### Características UX
- ✅ Campos mínimos necesarios
- ✅ Valores por defecto inteligentes
- ✅ Validación en formularios
- ✅ Feedback visual claro
- ✅ Confirmaciones antes de eliminar

## Desarrollo Local

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build para Producción

```bash
npm run build
npm start
```

## Docker

### Build
```bash
docker build -t budget-frontend .
```

### Run
```bash
docker run -p 3001:3001 -e NEXT_PUBLIC_API_URL=http://localhost:3000/api budget-frontend
```

### Docker Compose
```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Frontend disponible en: http://localhost:3001

## Componentes Principales

### Button
```tsx
<Button variant="primary" size="md">
  Guardar
</Button>
```

Variantes: `primary`, `secondary`, `danger`, `ghost`
Tamaños: `sm`, `md`, `lg`

### Input
```tsx
<Input
  label="Nombre"
  required
  value={value}
  onChange={handleChange}
  error="Campo requerido"
/>
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido...
  </CardContent>
</Card>
```

## Servicios de API

Todos los servicios están en `services/`:

```typescript
// Ejemplo: categoryService
import { categoryService } from '@/services/categoryService';

// Obtener todas
const categories = await categoryService.getAll();

// Crear
await categoryService.create({ name, period, monthlyBudget });

// Eliminar
await categoryService.delete(id);
```

## Formateo de Datos

```typescript
import { formatCurrency, formatDate } from '@/lib/utils';

formatCurrency(4370);     // "S/ 4,370.00"
formatDate(new Date());   // "14 nov 2025"
```

## Navegación

La navegación principal incluye:
- Dashboard (Resumen Ejecutivo)
- Categorías
- Provisiones
- Gastos

## Tecnologías

- **Next.js 15**: Framework React con App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS
- **Axios**: HTTP client
- **Lucide React**: Iconos modernos
- **date-fns**: Manipulación de fechas

## Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Filtros por fecha y categoría
- [ ] Gráficas y visualizaciones
- [ ] Exportar datos a Excel/PDF
- [ ] Modo oscuro
- [ ] Notificaciones en tiempo real
- [ ] PWA (Progressive Web App)
