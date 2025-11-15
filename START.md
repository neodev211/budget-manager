# 🚀 Guía de Inicio Rápido

## Sistema Completo de Gestión de Presupuestos

Este sistema incluye **Backend (API REST)** y **Frontend (Next.js)** completamente dockerizados.

---

## Opción 1: Iniciar con Docker (Recomendado)

### 1. Levantar todos los servicios

```bash
docker-compose up --build -d
```

Esto inicia:
- 🗄️ **PostgreSQL** en puerto `5432`
- 🔧 **Backend API** en puerto `3000`
- 🎨 **Frontend** en puerto `3001`

### 2. Crear las tablas de la base de datos (solo primera vez)

```bash
docker exec budget_backend npx prisma migrate dev --name init
```

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/health

---

## Opción 2: Desarrollo Local (Sin Docker)

### Backend

```bash
# Terminal 1 - Base de datos
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=budget_management \
  postgres:16-alpine

# Terminal 2 - Backend
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

Backend disponible en: http://localhost:3000

### Frontend

```bash
# Terminal 3 - Frontend
cd frontend
npm install
npm run dev
```

Frontend disponible en: http://localhost:3001

---

## Verificación

### 1. Backend funcionando
```bash
curl http://localhost:3000/health
```

Debería responder:
```json
{"status":"ok","message":"Budget Management API is running"}
```

### 2. Frontend funcionando
Abre tu navegador en: http://localhost:3001

Deberías ver el Dashboard con la navegación.

---

## Crear Datos de Prueba

### 1. Crear una Categoría

**Por el Frontend:**
1. Ve a **Categorías** (http://localhost:3001/categories)
2. Click en "Nueva Categoría"
3. Llena:
   - Nombre: Sueldo
   - Período: 2025-10
   - Presupuesto: 4370
4. Guardar

**Por API (curl):**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sueldo",
    "period": "2025-10",
    "monthlyBudget": 4370,
    "notes": "Sueldo Octubre 2025"
  }'
```

### 2. Registrar un Gasto

**Por el Frontend:**
1. Ve a **Gastos** (http://localhost:3001/expenses)
2. Click en "Nuevo Gasto"
3. Llena los **3 campos**:
   - Monto: 150
   - Descripción: Compra de supermercado
   - Categoría: Selecciona "Sueldo"
4. Guardar

**Por API (curl):**
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-28T00:00:00.000Z",
    "description": "Compra de supermercado",
    "categoryId": "REEMPLAZA_CON_ID_DE_CATEGORIA",
    "amount": -150
  }'
```

### 3. Ver el Dashboard

Ve a http://localhost:3001 y verás:
- 💰 Presupuesto Mensual
- 💸 Gastado
- 📊 Disponible
- 📈 Proyección Semestral

---

## Comandos Útiles

### Docker

```bash
# Ver logs
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Ver logs solo del frontend
docker-compose logs -f frontend

# Detener todo
docker-compose down

# Detener y eliminar datos
docker-compose down -v

# Reiniciar un servicio
docker-compose restart backend
docker-compose restart frontend
```

### Prisma Studio (Explorar la BD)

```bash
# Con Docker
docker exec -it budget_backend npx prisma studio

# Sin Docker
cd backend
npx prisma studio
```

Abre en: http://localhost:5555

---

## Estructura de URLs

### Frontend
- http://localhost:3001 - Dashboard
- http://localhost:3001/categories - Categorías
- http://localhost:3001/provisions - Provisiones
- http://localhost:3001/expenses - Gastos

### Backend API
- http://localhost:3000/health - Health check
- http://localhost:3000/api/categories - Categorías
- http://localhost:3000/api/provisions - Provisiones
- http://localhost:3000/api/expenses - Gastos
- http://localhost:3000/api/reports/executive-summary - Resumen

---

## Solución de Problemas

### Frontend no se conecta al Backend

1. Verifica que el backend esté corriendo:
```bash
curl http://localhost:3000/health
```

2. Verifica la variable de entorno en `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Reinicia el frontend

### Error "Table does not exist"

Ejecuta las migraciones:
```bash
docker exec budget_backend npx prisma migrate dev --name init
```

### Puerto 3000 o 3001 ya está en uso

Opción 1: Detener el proceso que usa el puerto
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

Opción 2: Cambiar los puertos en `docker-compose.yml`

---

## Próximos Pasos

1. ✅ Explora la aplicación en http://localhost:3001
2. ✅ Crea categorías, provisiones y gastos
3. ✅ Ve el resumen ejecutivo actualizado en tiempo real
4. 📚 Lee la documentación completa en README.md
5. 🎨 Personaliza el frontend según tus necesidades

---

## ¿Necesitas Ayuda?

- 📖 Documentación Backend: [README.md](README.md)
- 📖 Documentación Frontend: [FRONTEND.md](FRONTEND.md)
- 🚀 Guía Rápida: [QUICK_START.md](QUICK_START.md)

---

**¡Listo!** Tu sistema de gestión de presupuestos está funcionando 🎉
