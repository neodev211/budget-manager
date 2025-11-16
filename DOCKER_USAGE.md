# Budget Manager - Guía de Uso con Docker

Esta guía explica cómo usar Docker para desarrollo del frontend apuntando a diferentes backends.

---

## 🚀 Inicio Rápido

### **Opción 1: Frontend con Backend en Koyeb (Recomendado)**

```bash
# Desde la raíz del proyecto
docker-compose up frontend
```

El frontend se conectará a: `https://squealing-kip-home-ai-67b1e978.koyeb.app/api`

**URL del frontend:** http://localhost:3001

---

### **Opción 2: Frontend + Backend Local (Todo en Docker)**

```bash
# Levanta backend y frontend juntos
docker-compose up
```

El frontend se conectará al backend en Docker: `http://backend:3000/api`

**URLs:**
- Frontend: http://localhost:3001
- Backend: http://localhost:3000

---

### **Opción 3: Usando docker-compose.remote.yml (Explícito)**

```bash
# Frontend con backend Koyeb (explícito)
docker-compose -f docker-compose.yml -f docker-compose.remote.yml up frontend
```

---

## 🔧 Configuración

### **Archivos de Configuración:**

1. **`.env`** - Configuración actual (ignorado por git)
2. **`.env.example`** - Template de ejemplo (en git)
3. **`docker-compose.yml`** - Configuración base
4. **`docker-compose.remote.yml`** - Override para backend Koyeb

---

## 📝 Cambiar Entre Backends

### **Método 1: Editar archivo `.env`**

```bash
# Para backend Koyeb:
echo "NEXT_PUBLIC_API_URL=https://squealing-kip-home-ai-67b1e978.koyeb.app/api" > .env

# Para backend local:
echo "NEXT_PUBLIC_API_URL=http://backend:3000/api" > .env

# Luego:
docker-compose up frontend --build
```

### **Método 2: Usar docker-compose.remote.yml**

```bash
# Backend Koyeb:
docker-compose -f docker-compose.yml -f docker-compose.remote.yml up frontend

# Backend local:
docker-compose up frontend
```

---

## 🔄 Comandos Útiles

### **Reconstruir Imagen (después de cambios en .env)**

```bash
docker-compose build frontend
docker-compose up frontend
```

### **Ver logs del frontend**

```bash
docker-compose logs -f frontend
```

### **Detener servicios**

```bash
docker-compose down
```

### **Limpiar todo (imágenes, volúmenes, contenedores)**

```bash
docker-compose down -v --rmi all
```

---

## 🐛 Troubleshooting

### **Error: "Cannot connect to backend"**

**Solución:** Verifica que la URL del backend esté correcta en `.env`

```bash
# Ver configuración actual
cat .env

# Verificar que Koyeb esté funcionando
curl https://squealing-kip-home-ai-67b1e978.koyeb.app/health
```

### **Cambios en .env no se reflejan**

**Solución:** Rebuild de la imagen

```bash
docker-compose down
docker-compose build frontend
docker-compose up frontend
```

### **Puerto 3001 ya en uso**

**Solución:** Detén el servicio que usa el puerto

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

---

## 📊 Comparación: Docker vs Local

| Aspecto | Docker | Local (npm) |
|---------|--------|-------------|
| **Setup inicial** | Solo docker-compose up | npm install (1-2 min) |
| **Hot reload** | Más lento (~2-3 seg) | Rápido (~500ms) |
| **Cambio de backend** | Rebuild imagen | Cambio inmediato |
| **Consistencia** | ✅ Mismo ambiente siempre | ⚠️ Depende de Node local |
| **Cercano a prod** | ✅ Sí | ❌ No |

---

## 💡 Recomendaciones

### **Usa Docker cuando:**
- ✅ Estás probando el flujo completo
- ✅ Quieres ambiente consistente
- ✅ No tienes Node.js instalado local

### **Usa npm local cuando:**
- ✅ Estás desarrollando frontend activamente
- ✅ Necesitas hot reload rápido
- ✅ Cambias frecuentemente entre backends

---

## 🎯 Workflows Comunes

### **Desarrollo Frontend con Backend en Koyeb:**

```bash
# Opción A: Docker
docker-compose up frontend

# Opción B: npm local
cd frontend
npm run dev:remote
```

### **Desarrollo Full-Stack Local:**

```bash
# Opción A: Todo en Docker
docker-compose up

# Opción B: Backend Docker, Frontend local
docker-compose up backend
cd frontend
npm run dev:local
```

---

## 📚 Referencias

- **Backend Koyeb:** https://squealing-kip-home-ai-67b1e978.koyeb.app
- **Docker Compose Docs:** https://docs.docker.com/compose/
- **Next.js con Docker:** https://nextjs.org/docs/deployment#docker-image
