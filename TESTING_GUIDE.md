# 🧪 Guía de Pruebas del Sistema

## ✅ Verificaciones Iniciales

### 1. Verificar que Docker está corriendo
```bash
docker --version
docker-compose --version
```

### 2. Verificar servicios levantados
```bash
docker-compose ps
```

Deberías ver 3 contenedores **Up**:
- `budget_db` - Puerto 5432 (healthy)
- `budget_backend` - Puerto 3000
- `budget_frontend` - Puerto 3001

### 3. Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

---

## 🌐 Pruebas del Frontend (Interfaz Visual)

### **Dashboard** - http://localhost:3001

**Lo que deberías ver:**
- ✅ Barra de navegación con 4 opciones
- ✅ Título "Dashboard - Resumen Ejecutivo"
- ✅ Tarjetas con:
  - Presupuesto Mensual (azul)
  - Gastado (rojo)
  - Provisiones Abiertas (ámbar)
  - Disponible (verde)
- ✅ Sección de Proyección Semestral

**Pruebas:**
1. Verifica que las tarjetas muestran números
2. Los montos deben estar en formato: S/ 4,370.00
3. La navegación debe resaltar la página activa

---

### **Categorías** - http://localhost:3001/categories

**Prueba 1: Ver categorías existentes**
- Deberías ver tarjetas con categorías
- Cada tarjeta muestra: Nombre, Período, Presupuesto, Notas

**Prueba 2: Crear nueva categoría**
1. Click en **"Nueva Categoría"**
2. Llena el formulario:
   - Nombre: `Gastos Hogar`
   - Período: Selecciona `2025-11`
   - Presupuesto Mensual: `2500`
   - Notas: `Gastos del hogar` (opcional)
3. Click en **"Guardar"**
4. ✅ La nueva categoría debe aparecer en la lista

**Prueba 3: Eliminar categoría**
1. Click en el botón de papelera 🗑️
2. Confirma la eliminación
3. ✅ La categoría debe desaparecer

---

### **Gastos** - http://localhost:3001/expenses

**Lo que deberías ver:**
- ✅ Tarjeta con "Total de Gastos"
- ✅ Tabla con lista de gastos
- ✅ Botón "Nuevo Gasto"

**Prueba 1: Registrar un gasto (3 campos simples)**
1. Click en **"Nuevo Gasto"**
2. Formulario simplificado con solo 3 campos:
   - **Campo 1 - Monto**: `250.50`
   - **Campo 2 - Descripción**: `Supermercado Wong`
   - **Campo 3 - Categoría**: Selecciona una categoría
3. Click en **"Guardar Gasto"**
4. ✅ El gasto debe aparecer en la tabla
5. ✅ El "Total de Gastos" debe actualizarse

**Prueba 2: Cambiar fecha (opcional)**
1. Crea otro gasto
2. Cambia la fecha en el campo opcional
3. ✅ Debe guardarse con la fecha personalizada

**Prueba 3: Eliminar gasto**
1. Click en el botón 🗑️ en la tabla
2. Confirma
3. ✅ El gasto desaparece
4. ✅ El total se actualiza

---

### **Provisiones** - http://localhost:3001/provisions

**Prueba 1: Ver provisiones existentes**
- Cada provisión muestra: Nombre, Monto, Estado (Abierta/Cerrada)
- Tarjeta superior con "Total Provisiones Abiertas"

**Prueba 2: Crear provisión**
1. Click en **"Nueva Provisión"**
2. Llena:
   - Descripción: `Pago de luz Nov25`
   - Monto: `120`
   - Categoría: Selecciona una
   - Fecha de Vencimiento: Fecha futura
3. Guardar
4. ✅ Aparece con estado "Abierta" (badge ámbar)

**Prueba 3: Cerrar provisión**
1. Click en **"Cerrar"**
2. ✅ El badge cambia a "Cerrada" (verde)
3. ✅ Ya no cuenta en el total de abiertas

---

## 🔌 Pruebas del Backend (API)

### **Health Check**
```bash
curl http://localhost:3000/health
```
Respuesta esperada:
```json
{"status":"ok","message":"Budget Management API is running"}
```

---

### **Categorías**

**Listar todas**
```bash
curl http://localhost:3000/api/categories
```

**Crear nueva**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "period": "2025-11",
    "monthlyBudget": 3000
  }'
```

**Filtrar por período**
```bash
curl http://localhost:3000/api/categories?period=2025-10
```

---

### **Gastos**

**Crear gasto (3 campos)**
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-14T00:00:00.000Z",
    "description": "Test gasto",
    "categoryId": "ID_DE_CATEGORIA",
    "amount": -100
  }'
```

**Listar todos**
```bash
curl http://localhost:3000/api/expenses
```

---

### **Provisiones**

**Listar todas**
```bash
curl http://localhost:3000/api/provisions
```

**Solo abiertas**
```bash
curl "http://localhost:3000/api/provisions?openOnly=true"
```

---

### **Reportes**

**Resumen Ejecutivo**
```bash
curl http://localhost:3000/api/reports/executive-summary
```

Respuesta con:
- monthlyBudget
- monthlySpent
- monthlyAvailable
- semesterBudget
- semesterRealAvailable

---

## 📊 Pruebas de Integración (Frontend + Backend)

### **Flujo Completo: Registrar Gasto y Ver en Dashboard**

1. **Abre el Dashboard**: http://localhost:3001
   - Anota el valor de "Gastado (Mensual)"

2. **Ve a Gastos**: http://localhost:3001/expenses
   - Click en "Nuevo Gasto"
   - Monto: `100`
   - Descripción: `Test integración`
   - Categoría: Selecciona
   - Guardar

3. **Vuelve al Dashboard**: http://localhost:3001
   - ✅ El valor de "Gastado" debe haber aumentado en S/ 100.00
   - ✅ El "Disponible" debe haber disminuido

---

## 🗄️ Explorar la Base de Datos

### **Opción 1: Prisma Studio**
```bash
docker exec -it budget_backend npx prisma studio
```
Abre: http://localhost:5555

**Explorar:**
- Tabla `categories`
- Tabla `expenses`
- Tabla `provisions`

### **Opción 2: psql (Terminal)**
```bash
docker exec -it budget_db psql -U postgres -d budget_management

# Comandos SQL
\dt                           # Listar tablas
SELECT * FROM categories;     # Ver categorías
SELECT * FROM expenses;       # Ver gastos
SELECT * FROM provisions;     # Ver provisiones
\q                            # Salir
```

---

## 🐛 Pruebas de Error

### **Test 1: Crear categoría duplicada**
```bash
# Intenta crear la misma categoría dos veces
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Sueldo","period":"2025-10","monthlyBudget":4370}'
```
✅ Debe devolver error: "Unique constraint failed"

### **Test 2: Gasto sin categoría**
Por el frontend:
1. Ve a Gastos
2. Click "Nuevo Gasto"
3. Llena monto y descripción
4. NO selecciones categoría
5. Intenta guardar
✅ Debe mostrar error de validación

### **Test 3: Monto negativo**
El sistema convierte automáticamente a negativo, prueba:
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-14T00:00:00.000Z",
    "description": "Test",
    "categoryId": "ID",
    "amount": 100
  }'
```
✅ Debe guardarse como -100 (negativo)

---

## ✅ Checklist de Pruebas Completas

- [ ] Backend responde en puerto 3000
- [ ] Frontend carga en puerto 3001
- [ ] Dashboard muestra datos
- [ ] Crear categoría desde frontend
- [ ] Registrar gasto (solo 3 campos)
- [ ] Ver gasto en la tabla
- [ ] Total de gastos se actualiza
- [ ] Dashboard refleja cambios
- [ ] Crear provisión
- [ ] Cerrar provisión
- [ ] Resumen ejecutivo muestra cálculos correctos
- [ ] Eliminar registros funciona
- [ ] Navegación entre páginas funciona
- [ ] Diseño es responsive (prueba en móvil)

---

## 🎯 Escenario de Prueba Completo

**Simula un mes de gastos:**

1. **Crear Categoría**
   - Nombre: Noviembre 2025
   - Presupuesto: S/ 5,000

2. **Registrar 5 Gastos**
   - Supermercado: S/ 800
   - Transporte: S/ 150
   - Restaurante: S/ 200
   - Servicios: S/ 300
   - Otros: S/ 100

3. **Crear 2 Provisiones**
   - Alquiler Dic: S/ 1,200
   - Internet Dic: S/ 100

4. **Verificar Dashboard**
   - Presupuesto: S/ 5,000
   - Gastado: S/ 1,550
   - Provisiones: S/ 1,300
   - Disponible: S/ 2,150

---

## 🚨 Si algo no funciona

```bash
# 1. Ver logs con errores
docker-compose logs backend --tail 50
docker-compose logs frontend --tail 50

# 2. Reiniciar servicios
docker-compose restart backend
docker-compose restart frontend

# 3. Rebuild completo
docker-compose down
docker-compose up --build -d

# 4. Limpiar todo y empezar de nuevo
docker-compose down -v
docker-compose up --build -d
docker exec budget_backend npx prisma migrate dev --name init
```

---

**¡Feliz Testing!** 🎉

Si todas las pruebas pasan, tu sistema está funcionando perfectamente.
