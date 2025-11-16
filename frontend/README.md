# Budget Manager Frontend

Frontend de la aplicación Budget Manager construido con Next.js 16, React 19 y Tailwind CSS.

## 🚀 Inicio Rápido

### Opción 1: Backend Local (Desarrollo Normal)

```bash
cd frontend
npm install
npm run dev
```

El frontend se conectará automáticamente a `http://localhost:3000/api` (backend local).

**URL:** http://localhost:3001

---

### Opción 2: Backend Koyeb (Probar contra Producción)

```bash
cd frontend
npm run dev:remote
```

El frontend se conectará a `https://squealing-kip-home-ai-67b1e978.koyeb.app/api` (backend en Koyeb).

**URL:** http://localhost:3001

---

### Opción 3: Volver a Backend Local

```bash
cd frontend
npm run dev:local
```

---

## 🔧 Configuración

El frontend usa variables de entorno para configurar la URL del backend.

### Archivos de Configuración

- **`.env.local`** - Configuración activa (ignorado por git)
- **`.env.example`** - Template de ejemplo
- **`.env.koyeb`** - Configuración para backend Koyeb (en git)

### Cambiar Backend Manualmente

Si prefieres cambiar manualmente:

```bash
# Para usar backend en Koyeb:
cp .env.koyeb .env.local

# Para usar backend local:
echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > .env.local
```

---

## 📦 Scripts Disponibles

```bash
npm run dev          # Desarrollo con backend configurado en .env.local
npm run dev:remote   # Desarrollo con backend Koyeb
npm run dev:local    # Desarrollo con backend local
npm run build        # Build de producción
npm run start        # Servidor de producción (puerto 3001)
npm run lint         # Linter
```

---

## 🌐 URLs por Defecto

- **Frontend:** http://localhost:3001
- **Backend Local:** http://localhost:3000
- **Backend Koyeb:** https://squealing-kip-home-ai-67b1e978.koyeb.app

---

## 🛠️ Tecnologías

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 4
- **HTTP Client:** Axios
- **Iconos:** Lucide React
- **Utilidades de Fecha:** date-fns

---

## 📂 Estructura

```
frontend/
├── app/                  # Next.js App Router
│   ├── categories/      # Página de categorías
│   ├── expenses/        # Página de gastos
│   ├── provisions/      # Página de provisiones
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Dashboard
├── components/          # Componentes reutilizables
│   └── ui/             # Componentes UI base
├── lib/                # Utilidades y configuración
│   ├── api.ts          # Cliente Axios configurado
│   └── utils.ts        # Funciones auxiliares
├── services/           # Servicios de API
│   ├── categoryService.ts
│   ├── expenseService.ts
│   ├── provisionService.ts
│   └── reportService.ts
└── types/              # Definiciones TypeScript
    └── index.ts        # Tipos del dominio
```

---

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo Local:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev:local
   ```

2. **Probar contra Koyeb:**
   ```bash
   # Solo frontend (backend ya está en Koyeb)
   cd frontend
   npm run dev:remote
   ```

---

## 📝 Notas

- El archivo `.env.local` es ignorado por git
- Siempre revisa `.env.example` para ver las opciones disponibles
- Los scripts `dev:remote` y `dev:local` crean/actualizan `.env.local` automáticamente
