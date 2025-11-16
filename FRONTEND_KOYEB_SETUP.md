# 🚀 Frontend Local + Backend Remoto (Koyeb) Setup

## Problema Solucionado

El frontend no se conectaba al backend remoto en Koyeb porque:

1. **Next.js hace BUILD en tiempo de construcción del contenedor Docker**
2. Las variables de entorno (`NEXT_PUBLIC_API_URL`) deben estar disponibles en **build time**, no solo en runtime
3. El Dockerfile anterior no pasaba la URL remota durante el build
4. Resultado: Frontend hardcodeaba `http://localhost:3000/api` en lugar de la URL de Koyeb

## Solución Implementada

Usamos **ARG + ENV** en el Dockerfile para pasar variables al build:

### 1. Dockerfile Actualizado

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Aceptar ARG para API URL en build time
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Convertir ARG a ENV para que Next.js lo use en el build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm install
COPY . .

# Build de Next.js CON variable disponible
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build

EXPOSE 3001
CMD ["npm", "start"]
```

### 2. docker-compose.remote.yml Actualizado

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: "https://squealing-kip-home-ai-67b1e978.koyeb.app/api"
    container_name: budget_frontend
    restart: always
    ports:
      - "3001:3001"
    environment:
      NEXT_PUBLIC_API_URL: "https://squealing-kip-home-ai-67b1e978.koyeb.app/api"
      NODE_ENV: production
```

## Cómo Usar

### Ejecutar Frontend Local con Backend Remoto (Koyeb)

```bash
docker-compose -f docker-compose.yml -f docker-compose.remote.yml up frontend
```

**Lo que sucede:**
1. Docker construye imagen del frontend
2. Pasa `NEXT_PUBLIC_API_URL` a Dockerfile (vía ARG)
3. Next.js build usa la URL remota de Koyeb
4. Frontend se conecta a `https://squealing-kip-home-ai-67b1e978.koyeb.app/api`

### Ejecutar Frontend Local con Backend Local (Desarrollo)

```bash
docker-compose up frontend
```

**Lo que sucede:**
1. Docker construye imagen del frontend
2. Usa default: `http://localhost:3000/api`
3. Frontend se conecta a backend local

## Verificación

### Verificar que la URL es correcta

```bash
# Ver logs del contenedor
docker logs budget_frontend | grep -i "api\|listening"

# Entrar al contenedor y verificar variable
docker exec budget_frontend sh
echo $NEXT_PUBLIC_API_URL

# Salir: exit
```

### Verificar conectividad desde el navegador

1. Abre http://localhost:3001
2. Abre DevTools (F12)
3. Ve a Network tab
4. Intenta crear una categoría o provisión
5. Verifica que las requests van a `https://squealing-kip-home-ai-67b1e978.koyeb.app/api`

### Verificar con curl (desde el contenedor)

```bash
docker exec budget_frontend curl -s https://squealing-kip-home-ai-67b1e978.koyeb.app/api/health
```

Debería retornar:
```json
{"status":"ok","message":"Budget Management API is running"}
```

## Flujo Completo de Build

```
docker-compose -f docker-compose.yml -f docker-compose.remote.yml up frontend
    ↓
Lee docker-compose.yml (servicio frontend base)
    ↓
Lee docker-compose.remote.yml (overrides)
    ↓
Build Dockerfile con ARG: NEXT_PUBLIC_API_URL="https://squealing-kip-home-ai-67b1e978.koyeb.app/api"
    ↓
RUN NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL npm run build
    ↓
Next.js compila con URL remota
    ↓
Contenedor inicia con CMD ["npm", "start"]
    ↓
Frontend en http://localhost:3001 conecta a Koyeb
```

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/Dockerfile` | Agregado ARG + ENV para NEXT_PUBLIC_API_URL |
| `docker-compose.remote.yml` | Agregado build context con args |

## Variables de Entorno Usadas

| Variable | Valor | Ubicación |
|----------|-------|-----------|
| `NEXT_PUBLIC_API_URL` | `https://squealing-kip-home-ai-67b1e978.koyeb.app/api` | docker-compose.remote.yml |
| `NODE_ENV` | `production` | docker-compose.remote.yml |

## Troubleshooting

### Frontend no conecta a Koyeb

**Síntoma:** Error 404 o "API not found"

**Solución:**
```bash
# Verificar variable en contenedor
docker exec budget_frontend sh -c "echo $NEXT_PUBLIC_API_URL"

# Debe mostrar:
# https://squealing-kip-home-ai-67b1e978.koyeb.app/api
```

### Frontend conecta a localhost en lugar de Koyeb

**Síntoma:** Las requests en Network tab van a `http://localhost:3000/api`

**Solución:**
1. Elimina imagen vieja: `docker rmi budget_frontend`
2. Reconstruye: `docker-compose -f docker-compose.yml -f docker-compose.remote.yml up --build frontend`

### CORS errors desde el navegador

**Síntoma:** Error "Access to XMLHttpRequest blocked by CORS"

**Solución:** El backend en Koyeb debe tener CORS habilitado
```bash
# Verificar que el backend responde
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     https://squealing-kip-home-ai-67b1e978.koyeb.app/api/health
```

## Notas Adicionales

### Por qué Next.js necesita variables en build time

Next.js tiene dos tipos de variables:

1. **NEXT_PUBLIC_*** - Disponibles en cliente y servidor
   - Se embeben en el HTML/JS durante el build
   - Deben estar disponibles en `npm run build`
   - Usadas por la aplicación en el navegador

2. **Variables privadas** - Solo en servidor
   - Se leen en runtime
   - No se embeben en el código

Como usamos `NEXT_PUBLIC_API_URL`, debe estar disponible en build time.

### Cómo Next.js usa la variable

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Durante el build, esto se convierte a:
const API_URL = "https://squealing-kip-home-ai-67b1e978.koyeb.app/api";
```

## Commit

Cambios pusheados a GitHub con:
- Dockerfile actualizado
- docker-compose.remote.yml actualizado
- Este documento de setup
