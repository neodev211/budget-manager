# 🚀 Quick Start Guide

## Iniciar el Sistema

```bash
# 1. Levantar los contenedores
docker-compose up --build -d

# 2. Esperar 10 segundos a que la base de datos esté lista

# 3. Crear las tablas (solo la primera vez)
docker exec budget_backend npx prisma migrate dev --name init

# 4. Verificar que funciona
curl http://localhost:3000/health
```

## Ejemplos de Uso

### 1. Crear una Categoría
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sueldo",
    "period": "2025-10",
    "monthlyBudget": 4370.00,
    "notes": "Sueldo Octubre 2025"
  }'
```

**Respuesta:**
```json
{
  "id": "uuid-generado",
  "name": "Sueldo",
  "period": "2025-10",
  "monthlyBudget": 4370,
  "notes": "Sueldo Octubre 2025",
  "createdAt": "2025-11-14T03:44:37.994Z",
  "updatedAt": "2025-11-14T03:44:37.994Z"
}
```

### 2. Ver Todas las Categorías
```bash
curl http://localhost:3000/api/categories
```

### 3. Crear una Provisión
```bash
# Reemplaza CATEGORY_ID con el ID de la categoría creada
curl -X POST http://localhost:3000/api/provisions \
  -H "Content-Type: application/json" \
  -d '{
    "item": "Donación Nov25",
    "categoryId": "CATEGORY_ID",
    "amount": -640,
    "dueDate": "2025-11-28T00:00:00.000Z"
  }'
```

### 4. Registrar un Gasto (Simple - Solo 3 campos obligatorios)
```bash
# Reemplaza CATEGORY_ID con el ID de la categoría
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-28T00:00:00.000Z",
    "description": "Compra de supermercado",
    "categoryId": "CATEGORY_ID",
    "amount": -150
  }'
```

### 5. Ver el Resumen Ejecutivo
```bash
curl http://localhost:3000/api/reports/executive-summary
```

**Respuesta:**
```json
[
  {
    "categoryId": "uuid",
    "categoryName": "Sueldo",
    "period": "2025-10",
    "monthlyBudget": 4370,
    "monthlySpent": -640,
    "monthlyOpenProvisions": -640,
    "monthlyAvailable": 3090,
    "semesterBudget": 26220,
    "semesterSpent": -640,
    "semesterGrossAvailable": 25580,
    "semesterProvision": -640,
    "semesterRealAvailable": 24940
  }
]
```

## Comandos Útiles

### Ver logs del backend
```bash
docker-compose logs -f backend
```

### Ver logs de la base de datos
```bash
docker-compose logs -f db
```

### Detener todo
```bash
docker-compose down
```

### Detener y eliminar datos
```bash
docker-compose down -v
```

### Reiniciar solo el backend
```bash
docker-compose restart backend
```

### Ejecutar Prisma Studio (UI para ver la DB)
```bash
docker exec -it budget_backend npx prisma studio
```
Abre en: http://localhost:5555

## Importar en Postman

1. Abre Postman
2. Click en "Import"
3. Selecciona el archivo `backend/postman_collection.json`
4. Ya puedes probar todos los endpoints

## Estructura de Datos

### Category (Categoría)
```typescript
{
  name: string;          // ej: "Sueldo"
  period: string;        // ej: "2025-10" (YYYY-MM)
  monthlyBudget: number; // ej: 4370.00
  notes?: string;        // opcional
}
```

### Provision (Provisión)
```typescript
{
  item: string;          // ej: "Donación Nov25"
  categoryId: string;    // UUID de la categoría
  amount: number;        // SIEMPRE NEGATIVO: -640
  dueDate: string;       // ISO 8601: "2025-11-28T00:00:00.000Z"
  notes?: string;        // opcional
}
```

### Expense (Gasto)
```typescript
{
  date: string;          // ISO 8601: "2025-10-28T00:00:00.000Z"
  description: string;   // ej: "Compra de supermercado"
  categoryId: string;    // UUID de la categoría
  amount: number;        // SIEMPRE NEGATIVO: -150
  provisionId?: string;  // opcional, vincula a una provisión
  paymentMethod?: string; // opcional: CASH, TRANSFER, CARD, OTHER
}
```

## Notas Importantes

✅ **Montos siempre negativos**: Todos los gastos y provisiones usan montos negativos
✅ **Fechas en ISO 8601**: Siempre usa formato completo con timezone
✅ **UUIDs**: Todos los IDs son UUIDs generados automáticamente
✅ **Cálculos automáticos**: El resumen ejecutivo se calcula en tiempo real

## Solución de Problemas

### Error: "Connection refused"
- Verifica que Docker Desktop esté corriendo
- Espera 10-15 segundos después de `docker-compose up`

### Error: "Table does not exist"
- Ejecuta las migraciones: `docker exec budget_backend npx prisma migrate dev --name init`

### Backend no inicia
- Revisa los logs: `docker-compose logs backend`
- Reconstruye: `docker-compose up --build -d`

## Próximos Pasos

1. ✅ Backend funcionando
2. 🔜 Desarrollar Frontend con React/Next.js
3. 🔜 Implementar autenticación
4. 🔜 Agregar más reportes y gráficas
