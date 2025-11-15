# Budget Manager - Guía de Setup

## Prerequisitos

Asegúrate de tener instalados:
- Docker Desktop
- Git
- (Opcional) Node.js 18+ para desarrollo local

## Paso 1: Clonar el repositorio

```bash
git clone https://github.com/usuario/budget-manager.git
cd budget-manager
```

## Paso 2: Configurar variables de entorno

### Backend
```bash
cp backend/.env.example backend/.env
```

Verifica que `backend/.env` contiene:
```
DATABASE_URL="postgresql://postgres:postgres@db:5432/budget_management?schema=public"
PORT=3000
NODE_ENV=development
```

### Frontend
```bash
cp frontend/.env.example frontend/.env.local
```

Verifica que `frontend/.env.local` contiene:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Paso 3: Iniciar con Docker Compose

```bash
# Asegúrate que Docker está corriendo

# Inicia todos los servicios
docker-compose up --build

# O en background
docker-compose up -d --build
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- Backend (puerto 3000)
- Frontend (puerto 3001)

## Paso 4: Acceder a la aplicación

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **Base de datos**: localhost:5432

## Paso 5: Verificar que todo funciona

1. Abre http://localhost:3001 en tu navegador
2. Deberías ver el Dashboard
3. Navega a "Categorías" y crea una categoría de prueba
4. Navega a "Provisiones" y crea una provisión
5. Navega a "Gastos" y crea un gasto

## Solución de Problemas

### Los puertos están ocupados

Si los puertos 3000, 3001 o 5432 ya están en uso:

```bash
# Ver qué está usando los puertos
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# O en docker-compose.yml, cambiar los puertos:
ports:
  - "3000:3000"  # Cambiar a "3002:3000" por ejemplo
```

### Base de datos no conecta

```bash
# Resetear la base de datos
docker-compose down -v
docker-compose up --build
```

### Ver logs

```bash
# Ver logs de todo
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Desarrollo Local (sin Docker)

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

El backend estará en http://localhost:3000

### Frontend

En otra terminal:
```bash
cd frontend
npm install
npm run dev
```

El frontend estará en http://localhost:3001

## Parar los servicios

```bash
# Parar sin eliminar datos
docker-compose stop

# Parar y eliminar contenedores
docker-compose down

# Parar, eliminar contenedores y volúmenes (resetea la BD)
docker-compose down -v
```

## Próximos pasos

- Lee [README.md](README.md) para más detalles del proyecto
- Consulta la documentación de las APIs en el código del backend
- Contribuye! Ver [CONTRIBUTING.md](CONTRIBUTING.md)
