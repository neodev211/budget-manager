# Migración a Columna Materializada usedAmount

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis de Impacto](#análisis-de-impacto)
3. [Plan de Migración](#plan-de-migración)
4. [Instrucciones Detalladas](#instrucciones-detalladas)
5. [Testing](#testing)
6. [Rollback Plan](#rollback-plan)
7. [Validación Post-Migración](#validación-post-migración)

---

## Resumen Ejecutivo

### Objetivo
Migrar el cálculo dinámico de `usedAmount` a una columna materializada en la tabla `provisions` para mejorar el rendimiento eliminando el problema N+1 queries.

### Estado Actual
- `usedAmount` se calcula dinámicamente mediante `aggregate()` en cada consulta
- Problema N+1: Cada provisión requiere un query adicional para calcular su usedAmount
- Métodos afectados: `findAllWithUsedAmount()`, `findByIdWithUsedAmount()`, etc.

### Estado Objetivo
- `usedAmount` almacenado como columna en la tabla `provisions`
- Actualización automática mediante transacciones cuando se crea/actualiza/elimina un Expense
- Mantener método de validación para auditoría

### Beneficios
- ✅ Rendimiento O(1) vs O(n) en consultas de listas
- ✅ Elimina problema N+1 queries en reportes
- ✅ Simplifica queries de provisiones
- ✅ Escalable para grandes volúmenes de datos

---

## Análisis de Impacto

### Archivos que DEBEN modificarse

#### 1. Base de Datos (Prisma)
- `backend/prisma/schema.prisma` - Agregar columna usedAmount
- Nueva migración de Prisma

#### 2. Domain Layer
- `backend/src/domain/entities/Provision.ts` - Actualizar comentarios
- `backend/src/domain/repositories/IProvisionRepository.ts` - Eliminar métodos `*WithUsedAmount`

#### 3. Infrastructure Layer - Repositories
- `backend/src/infrastructure/persistence/prisma/repositories/PrismaProvisionRepository.ts`
- `backend/src/infrastructure/persistence/prisma/repositories/PrismaExpenseRepository.ts` (NUEVO)
- `backend/src/infrastructure/persistence/typeorm/repositories/TypeORMProvisionRepository.ts`
- `backend/src/infrastructure/persistence/in-memory/InMemoryProvisionRepository.ts`
- `backend/src/infrastructure/persistence/prisma/repositories/PrismaReportRepository.ts`

#### 4. Application Layer - Use Cases
- `backend/src/application/use-cases/expenses/CreateExpenseUseCase.ts`
- `backend/src/application/use-cases/expenses/UpdateExpenseUseCase.ts`
- `backend/src/application/use-cases/expenses/DeleteExpenseUseCase.ts`
- `backend/src/application/use-cases/provisions/GetProvisionsUseCase.ts`
- `backend/src/application/use-cases/provisions/GetProvisionByIdUseCase.ts`

#### 5. Presentation Layer
- `backend/src/presentation/controllers/ProvisionController.ts` - Simplificar

#### 6. Mapper
- `backend/src/infrastructure/persistence/prisma/mappers/ProvisionMapper.ts`

---

## Plan de Migración

### Fase 1: Preparación (Estimado: 30 min)
1. Backup de base de datos
2. Crear rama de feature
3. Revisar y entender código actual

### Fase 2: Schema y Migración (Estimado: 1 hora)
1. Modificar schema.prisma
2. Crear migración de Prisma
3. Script de población de datos existentes
4. Ejecutar migración en desarrollo

### Fase 3: Infrastructure Layer (Estimado: 2 horas)
1. Modificar PrismaExpenseRepository (agregar lógica transaccional)
2. Modificar PrismaProvisionRepository (eliminar cálculo dinámico)
3. Modificar TypeORMProvisionRepository
4. Modificar InMemoryProvisionRepository
5. Modificar PrismaReportRepository (optimizar)

### Fase 4: Application Layer (Estimado: 1.5 horas)
1. Modificar CreateExpenseUseCase
2. Modificar UpdateExpenseUseCase
3. Modificar DeleteExpenseUseCase
4. Modificar GetProvisionsUseCase
5. Modificar GetProvisionByIdUseCase

### Fase 5: Domain Layer (Estimado: 30 min)
1. Actualizar IProvisionRepository
2. Actualizar Provision.ts

### Fase 6: Testing (Estimado: 2 horas)
1. Tests unitarios
2. Tests de integración
3. Tests de consistencia

### Fase 7: Deploy (Estimado: 1 hora)
1. Review de código
2. Deploy a staging
3. Testing en staging
4. Deploy a producción

**Tiempo total estimado: 8.5 horas**

---

## Instrucciones Detalladas

### PASO 1: Modificar Schema de Prisma

**Archivo:** `backend/prisma/schema.prisma`

**Ubicación:** Línea 52 (modelo Provision)

**Cambio:**
```prisma
model Provision {
  id         String   @id @default(uuid())
  item       String
  categoryId String   @map("category_id")
  amount     Decimal  @db.Decimal(10, 2) // Siempre negativo
  usedAmount Decimal  @default(0) @map("used_amount") @db.Decimal(10, 2) // ✅ NUEVO: Monto usado (siempre positivo)
  dueDate    DateTime @map("due_date")
  status     ProvisionStatus @default(OPEN)
  notes      String?
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  expenses   Expense[]

  @@index([categoryId])
  @@index([status])
  @@index([categoryId, status])
  @@index([dueDate])
  @@map("provisions")
}
```

**Explicación:**
- Se agrega columna `usedAmount` tipo Decimal
- Valor por defecto: 0
- Mapeo en BD: `used_amount`
- Precisión: Decimal(10, 2) igual que `amount`

---

### PASO 2: Crear y Ejecutar Migración de Prisma

**Comandos a ejecutar:**

```bash
cd backend

# Crear migración
npx prisma migrate dev --name add_used_amount_to_provisions

# Esto generará un archivo de migración en backend/prisma/migrations/
```

**Contenido esperado de la migración:**
```sql
-- AlterTable
ALTER TABLE "provisions" ADD COLUMN "used_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
```

**Script de población de datos existentes:**

Crear archivo: `backend/prisma/migrations/YYYYMMDDHHMMSS_add_used_amount_to_provisions/populate_used_amount.sql`

```sql
-- Poblar usedAmount para provisions existentes
UPDATE provisions p
SET used_amount = COALESCE(
  (
    SELECT ABS(SUM(e.amount))
    FROM expenses e
    WHERE e.provision_id = p.id
  ),
  0
);
```

**Ejecutar población:**
```bash
# Conectar a la base de datos y ejecutar el script manualmente
# O agregar al final del archivo de migración generado
```

---

### PASO 3: Modificar Domain Layer

#### 3.1. Actualizar Provision.ts

**Archivo:** `backend/src/domain/entities/Provision.ts`

**Cambio en línea 10-11:**
```typescript
export interface Provision {
  id: string;
  item: string;
  categoryId: string;
  amount: number; // Always negative (reserved amount)
  usedAmount: number; // Materialized: sum of expenses linked to this provision (always positive)
  dueDate: Date;
  status: ProvisionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Cambios:**
- `usedAmount` ya NO es opcional (`?` removido)
- Actualizar comentario: "Materialized: sum of expenses..."

---

#### 3.2. Actualizar IProvisionRepository.ts

**Archivo:** `backend/src/domain/repositories/IProvisionRepository.ts`

**Cambio completo:**
```typescript
import { Provision, CreateProvisionDTO, UpdateProvisionDTO } from '../entities/Provision';

export interface IProvisionRepository {
  create(data: CreateProvisionDTO): Promise<Provision>;
  findById(id: string): Promise<Provision | null>;
  findAll(): Promise<Provision[]>;
  findByCategoryId(categoryId: string): Promise<Provision[]>;
  findOpenProvisions(): Promise<Provision[]>;
  update(id: string, data: UpdateProvisionDTO): Promise<Provision>;
  delete(id: string): Promise<void>;

  // ❌ ELIMINAR estos métodos (ya no son necesarios):
  // findByIdWithUsedAmount(id: string): Promise<Provision | null>;
  // findAllWithUsedAmount(): Promise<Provision[]>;
  // findByCategoryIdWithUsedAmount(categoryId: string): Promise<Provision[]>;
  // findOpenProvisionsWithUsedAmount(): Promise<Provision[]>;

  // ✅ MANTENER para auditoría/validación:
  calculateMaterializedAmount(provisionId: string): Promise<number>;

  // ✅ NUEVO: Actualizar usedAmount de una provisión
  updateUsedAmount(provisionId: string, usedAmount: number): Promise<void>;
}
```

---

### PASO 4: Modificar Infrastructure Layer - Repositories

#### 4.1. Modificar PrismaProvisionRepository.ts

**Archivo:** `backend/src/infrastructure/persistence/prisma/repositories/PrismaProvisionRepository.ts`

**Cambios:**

**A. Métodos a ELIMINAR COMPLETAMENTE:**
- `findByIdWithUsedAmount()` (líneas 64-76)
- `findAllWithUsedAmount()` (líneas 78-93)
- `findByCategoryIdWithUsedAmount()` (líneas 95-111)
- `findOpenProvisionsWithUsedAmount()` (líneas 113-129)

**B. Métodos EXISTENTES sin cambios:**
- `findById()` - Ahora incluye usedAmount automáticamente
- `findAll()` - Ahora incluye usedAmount automáticamente
- `findByCategoryId()` - Ahora incluye usedAmount automáticamente
- `findOpenProvisions()` - Ahora incluye usedAmount automáticamente

**C. Método a MANTENER (ya existe, sin cambios):**
```typescript
async calculateMaterializedAmount(provisionId: string): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: { provisionId },
    _sum: { amount: true },
  });

  if (!result._sum.amount) return 0;

  const amount = typeof result._sum.amount === 'object' && 'toNumber' in result._sum.amount
    ? (result._sum.amount as any).toNumber()
    : Number(result._sum.amount);

  return Math.abs(amount);
}
```

**D. Método NUEVO a agregar:**
```typescript
async updateUsedAmount(provisionId: string, usedAmount: number): Promise<void> {
  await prisma.provision.update({
    where: { id: provisionId },
    data: { usedAmount },
  });
}
```

**Archivo completo después de los cambios:**
```typescript
import { IProvisionRepository } from '../../../../domain/repositories/IProvisionRepository';
import { Provision, CreateProvisionDTO, UpdateProvisionDTO, ProvisionStatus } from '../../../../domain/entities/Provision';
import { ProvisionMapper } from '../mappers/ProvisionMapper';
import prisma from '../../../database/prisma';

export class PrismaProvisionRepository implements IProvisionRepository {
  async create(data: CreateProvisionDTO): Promise<Provision> {
    const prismaProvision = await prisma.provision.create({
      data: {
        item: data.item,
        categoryId: data.categoryId,
        amount: data.amount,
        usedAmount: 0, // ✅ Inicializar en 0
        dueDate: data.dueDate,
        notes: data.notes,
      },
    });

    return ProvisionMapper.toDomain(prismaProvision);
  }

  async findById(id: string): Promise<Provision | null> {
    const prismaProvision = await prisma.provision.findUnique({
      where: { id },
    });

    if (!prismaProvision) return null;

    return ProvisionMapper.toDomain(prismaProvision);
  }

  async findAll(): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return prismaProvisions.map((prov: any) => ProvisionMapper.toDomain(prov));
  }

  async findByCategoryId(categoryId: string): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      where: { categoryId },
      orderBy: { dueDate: 'asc' },
    });

    return prismaProvisions.map((prov: any) => ProvisionMapper.toDomain(prov));
  }

  async findOpenProvisions(): Promise<Provision[]> {
    const prismaProvisions = await prisma.provision.findMany({
      where: { status: 'OPEN' },
      orderBy: { dueDate: 'asc' },
    });

    return prismaProvisions.map((prov: any) => ProvisionMapper.toDomain(prov));
  }

  async update(id: string, data: UpdateProvisionDTO): Promise<Provision> {
    const prismaProvision = await prisma.provision.update({
      where: { id },
      data: {
        ...(data.item && { item: data.item }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return ProvisionMapper.toDomain(prismaProvision);
  }

  async delete(id: string): Promise<void> {
    await prisma.provision.delete({
      where: { id },
    });
  }

  async calculateMaterializedAmount(provisionId: string): Promise<number> {
    const result = await prisma.expense.aggregate({
      where: { provisionId },
      _sum: { amount: true },
    });

    if (!result._sum.amount) return 0;

    const amount = typeof result._sum.amount === 'object' && 'toNumber' in result._sum.amount
      ? (result._sum.amount as any).toNumber()
      : Number(result._sum.amount);

    return Math.abs(amount);
  }

  async updateUsedAmount(provisionId: string, usedAmount: number): Promise<void> {
    await prisma.provision.update({
      where: { id: provisionId },
      data: { usedAmount },
    });
  }
}
```

---

#### 4.2. Modificar PrismaExpenseRepository.ts

**Archivo:** `backend/src/infrastructure/persistence/prisma/repositories/PrismaExpenseRepository.ts`

**Cambios: Usar transacciones para mantener consistencia**

**A. Modificar método `create()` (líneas 14-27):**

```typescript
async create(data: CreateExpenseDTO): Promise<Expense> {
  // Usar transacción para garantizar consistencia
  const result = await prisma.$transaction(async (tx) => {
    // 1. Crear el expense
    const prismaExpense = await tx.expense.create({
      data: {
        date: data.date,
        description: data.description,
        categoryId: data.categoryId,
        provisionId: data.provisionId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      },
    });

    // 2. Si está vinculado a una provision, actualizar usedAmount
    if (data.provisionId) {
      const expenseAmount = Math.abs(Number(data.amount));

      await tx.provision.update({
        where: { id: data.provisionId },
        data: {
          usedAmount: {
            increment: expenseAmount,
          },
        },
      });
    }

    return prismaExpense;
  });

  return ExpenseMapper.toDomain(result);
}
```

**B. Modificar método `update()` (líneas 79-91):**

```typescript
async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
  // Obtener el expense actual para comparar cambios
  const existingExpense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!existingExpense) {
    throw new Error(`Expense with id "${id}" not found`);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Preparar datos de actualización
    const updateData: any = {};
    if (data.date) updateData.date = data.date;
    if (data.description) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.provisionId !== undefined) updateData.provisionId = data.provisionId;

    // Actualizar expense
    const updatedExpense = await tx.expense.update({
      where: { id },
      data: updateData,
    });

    // Manejar cambios en provisionId o amount
    const oldProvisionId = existingExpense.provisionId;
    const newProvisionId = data.provisionId !== undefined ? data.provisionId : oldProvisionId;
    const oldAmount = Math.abs(Number(existingExpense.amount));
    const newAmount = data.amount !== undefined ? Math.abs(Number(data.amount)) : oldAmount;

    // Caso 1: Cambió de provision (de una a otra)
    if (oldProvisionId && newProvisionId && oldProvisionId !== newProvisionId) {
      // Decrementar de la provision anterior
      await tx.provision.update({
        where: { id: oldProvisionId },
        data: { usedAmount: { decrement: oldAmount } },
      });

      // Incrementar en la nueva provision
      await tx.provision.update({
        where: { id: newProvisionId },
        data: { usedAmount: { increment: newAmount } },
      });
    }
    // Caso 2: Se eliminó la vinculación a provision (de provision a null)
    else if (oldProvisionId && !newProvisionId) {
      await tx.provision.update({
        where: { id: oldProvisionId },
        data: { usedAmount: { decrement: oldAmount } },
      });
    }
    // Caso 3: Se agregó vinculación a provision (de null a provision)
    else if (!oldProvisionId && newProvisionId) {
      await tx.provision.update({
        where: { id: newProvisionId },
        data: { usedAmount: { increment: newAmount } },
      });
    }
    // Caso 4: Mismo provision pero cambió el amount
    else if (oldProvisionId && newProvisionId && oldProvisionId === newProvisionId) {
      if (oldAmount !== newAmount) {
        const difference = newAmount - oldAmount;
        await tx.provision.update({
          where: { id: newProvisionId },
          data: {
            usedAmount: {
              [difference > 0 ? 'increment' : 'decrement']: Math.abs(difference),
            },
          },
        });
      }
    }

    return updatedExpense;
  });

  return ExpenseMapper.toDomain(result);
}
```

**C. Modificar método `delete()` (líneas 93-97):**

```typescript
async delete(id: string): Promise<void> {
  // Obtener el expense antes de eliminarlo
  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    throw new Error(`Expense with id "${id}" not found`);
  }

  await prisma.$transaction(async (tx) => {
    // 1. Eliminar el expense
    await tx.expense.delete({
      where: { id },
    });

    // 2. Si estaba vinculado a una provision, decrementar usedAmount
    if (expense.provisionId) {
      const expenseAmount = Math.abs(Number(expense.amount));

      await tx.provision.update({
        where: { id: expense.provisionId },
        data: {
          usedAmount: {
            decrement: expenseAmount,
          },
        },
      });
    }
  });
}
```

---

#### 4.3. Modificar ProvisionMapper.ts

**Archivo:** `backend/src/infrastructure/persistence/prisma/mappers/ProvisionMapper.ts`

**Cambio en método `toDomain()` (línea 43-56):**

```typescript
static toDomain(prismaProvision: ProvisionEntity): Provision {
  return {
    id: prismaProvision.id,
    item: prismaProvision.item,
    categoryId: prismaProvision.categoryId,
    amount: Money.fromDecimal(prismaProvision.amount).value,
    usedAmount: Money.fromDecimal(prismaProvision.usedAmount).value, // ✅ Ahora lee de la columna
    dueDate: prismaProvision.dueDate,
    status: this.statusToDomain(prismaProvision.status),
    notes: prismaProvision.notes || undefined,
    createdAt: prismaProvision.createdAt,
    updatedAt: prismaProvision.updatedAt,
  };
}
```

**Cambio en método `toPersistence()` (línea 69-81):**

```typescript
static toPersistence(
  provision: Provision
): Omit<ProvisionEntity, 'createdAt' | 'updatedAt'> {
  return {
    id: provision.id,
    item: provision.item,
    categoryId: provision.categoryId,
    amount: provision.amount as any,
    usedAmount: provision.usedAmount as any, // ✅ Incluir usedAmount
    dueDate: provision.dueDate,
    status: this.statusToPersistence(provision.status),
    notes: provision.notes || null,
  };
}
```

---

#### 4.4. Modificar TypeORMProvisionRepository.ts

**Archivo:** `backend/src/infrastructure/persistence/typeorm/repositories/TypeORMProvisionRepository.ts`

**Cambios similares a PrismaProvisionRepository:**

**A. En todos los métodos que retornan Provision, agregar `usedAmount`:**

Ejemplo en `findById()` (línea 59-69):
```typescript
return {
  id: provision.id,
  item: provision.item,
  amount: Number(provision.amount),
  usedAmount: Number(provision.usedAmount), // ✅ AGREGAR
  categoryId: provision.categoryId,
  dueDate: provision.dueDate,
  status: provision.status as ProvisionStatus,
  notes: provision.notes || undefined,
  createdAt: provision.createdAt,
  updatedAt: provision.updatedAt,
};
```

**Aplicar este cambio en:**
- `create()` (línea 23-33)
- `findAll()` (línea 39-49)
- `findById()` (línea 59-69)
- `findByCategoryId()` (línea 77-87)
- `findOpenProvisions()` (línea 95-105)

**B. Eliminar métodos:**
- `findByIdWithUsedAmount()`
- `findAllWithUsedAmount()`
- `findByCategoryIdWithUsedAmount()`
- `findOpenProvisionsWithUsedAmount()`

**C. Agregar método `updateUsedAmount()`:**
```typescript
async updateUsedAmount(provisionId: string, usedAmount: number): Promise<void> {
  await prisma.provision.update({
    where: { id: provisionId },
    data: { usedAmount },
  });
}
```

---

#### 4.5. Modificar InMemoryProvisionRepository.ts

**Archivo:** `backend/src/infrastructure/persistence/in-memory/InMemoryProvisionRepository.ts`

**Cambios:**

**A. Agregar `usedAmount` en el constructor/inicialización:**
```typescript
private provisions: Provision[] = [];
private expenses: any[] = []; // Mantener referencia a expenses para calcular usedAmount
```

**B. Modificar método `create()`:**
```typescript
async create(data: CreateProvisionDTO): Promise<Provision> {
  const provision: Provision = {
    id: Math.random().toString(),
    item: data.item,
    amount: data.amount,
    usedAmount: 0, // ✅ Inicializar en 0
    categoryId: data.categoryId,
    dueDate: data.dueDate,
    status: ProvisionStatus.OPEN,
    notes: data.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  this.provisions.push(provision);
  return provision;
}
```

**C. Eliminar métodos:**
- `findByIdWithUsedAmount()` (línea 61-67)
- `findAllWithUsedAmount()` (línea 69-77)
- `findByCategoryIdWithUsedAmount()` (línea 79-87)
- `findOpenProvisionsWithUsedAmount()` (línea 89-97)

**D. Agregar método `updateUsedAmount()`:**
```typescript
async updateUsedAmount(provisionId: string, usedAmount: number): Promise<void> {
  const provision = this.provisions.find(p => p.id === provisionId);
  if (provision) {
    provision.usedAmount = usedAmount;
  }
}
```

**E. Nota:** InMemoryRepository es para testing, se puede simplificar manteniendo lógica básica.

---

#### 4.6. Modificar PrismaReportRepository.ts

**Archivo:** `backend/src/infrastructure/persistence/prisma/repositories/PrismaReportRepository.ts`

**Cambio en método `getExecutiveSummary()` (líneas 42-89):**

**ANTES (problema N+1):**
```typescript
for (const provision of category.provisions) {
  const provisionAmount = Math.abs(this.toNumber(provision.amount));

  // ❌ Query por cada provision (N+1)
  const usedAmount = await prisma.expense.aggregate({
    where: { provisionId: provision.id },
    _sum: { amount: true },
  });

  const usedTotal = Math.abs(this.toNumber(usedAmount._sum.amount));
  const remainingBalance = provisionAmount - usedTotal;

  monthlyOpenProvisions += remainingBalance;
}
```

**DESPUÉS (optimizado):**
```typescript
// ✅ Calcular directamente usando la columna materializada
for (const provision of category.provisions) {
  const provisionAmount = Math.abs(this.toNumber(provision.amount));
  const usedTotal = this.toNumber(provision.usedAmount); // ✅ Leer de columna
  const remainingBalance = provisionAmount - usedTotal;

  monthlyOpenProvisions += remainingBalance;
}
```

**Cambio similar en método `getExecutiveSummaryByCategory()` (líneas 94-140):**

Reemplazar el loop de líneas 113-127 con el código optimizado arriba.

---

### PASO 5: Modificar Application Layer - Use Cases

#### 5.1. Modificar CreateExpenseUseCase.ts

**Archivo:** `backend/src/application/use-cases/expenses/CreateExpenseUseCase.ts`

**Cambio:** Agregar inyección de `IProvisionRepository` (opcional para validación)

**Línea 21-24:**
```typescript
constructor(
  private readonly expenseRepository: IExpenseRepository,
  private readonly categoryRepository: ICategoryRepository,
  // ✅ OPCIONAL: Para validar que la provision existe antes de crear
  private readonly provisionRepository?: IProvisionRepository
) {}
```

**Línea 55-56 (OPCIONAL - agregar validación):**
```typescript
// Si hay provisionId, verificar que existe
if (input.provisionId && this.provisionRepository) {
  const provision = await this.provisionRepository.findById(input.provisionId);
  if (!provision) {
    throw new Error(`Provision with id "${input.provisionId}" not found`);
  }
}
```

**Nota:** La lógica de actualización de `usedAmount` ya está en `PrismaExpenseRepository.create()`

---

#### 5.2. Modificar UpdateExpenseUseCase.ts

**Archivo:** `backend/src/application/use-cases/expenses/UpdateExpenseUseCase.ts`

**Sin cambios necesarios.** La lógica de actualización de `usedAmount` está en `PrismaExpenseRepository.update()`

---

#### 5.3. Modificar DeleteExpenseUseCase.ts

**Archivo:** `backend/src/application/use-cases/expenses/DeleteExpenseUseCase.ts`

**Sin cambios necesarios.** La lógica de actualización de `usedAmount` está en `PrismaExpenseRepository.delete()`

---

#### 5.4. Modificar GetProvisionsUseCase.ts

**Archivo:** `backend/src/application/use-cases/provisions/GetProvisionsUseCase.ts`

**Cambio completo (líneas 20-33):**

**ANTES:**
```typescript
if (input.categoryId) {
  return this.provisionRepository.findByCategoryIdWithUsedAmount(input.categoryId);
}

if (input.openOnly) {
  return this.provisionRepository.findOpenProvisionsWithUsedAmount();
}

return this.provisionRepository.findAllWithUsedAmount();
```

**DESPUÉS:**
```typescript
if (input.categoryId) {
  return this.provisionRepository.findByCategoryId(input.categoryId); // ✅ Ya incluye usedAmount
}

if (input.openOnly) {
  return this.provisionRepository.findOpenProvisions(); // ✅ Ya incluye usedAmount
}

return this.provisionRepository.findAll(); // ✅ Ya incluye usedAmount
```

---

#### 5.5. Modificar GetProvisionByIdUseCase.ts

**Archivo:** `backend/src/application/use-cases/provisions/GetProvisionByIdUseCase.ts`

**Cambio (línea 16):**

**ANTES:**
```typescript
const provision = await this.provisionRepository.findByIdWithUsedAmount(id);
```

**DESPUÉS:**
```typescript
const provision = await this.provisionRepository.findById(id); // ✅ Ya incluye usedAmount
```

---

### PASO 6: Modificar Presentation Layer

#### 6.1. Simplificar ProvisionController.ts

**Archivo:** `backend/src/presentation/controllers/ProvisionController.ts`

**Cambio en método `getMaterializedAmount()` (líneas 229-262):**

**OPCIONAL:** Este endpoint puede mantenerse para auditoría/debugging, o puede eliminarse si ya no se usa en frontend.

**Si decides mantenerlo, agregar documentación:**
```typescript
/**
 * GET /api/provisions/:id/materialized-amount
 * Get the real-time calculated usedAmount for auditing purposes.
 * Compares stored usedAmount vs. calculated usedAmount.
 *
 * ⚠️ For debugging/auditing only. Normal operations should use stored usedAmount.
 */
async getMaterializedAmount(req: Request, res: Response): Promise<void> {
  // ... código existente ...

  // ✅ MEJORAR: Retornar ambos valores para comparación
  const provision = await getProvisionUseCase.execute(req.params.id);
  const calculatedAmount = await (repository as any).calculateMaterializedAmount(req.params.id);

  res.json({
    provisionId: req.params.id,
    storedUsedAmount: provision.usedAmount,
    calculatedUsedAmount: calculatedAmount,
    isConsistent: provision.usedAmount === calculatedAmount,
  });
}
```

---

### PASO 7: Testing

#### 7.1. Test Unitario - Validar consistencia de usedAmount

**Crear archivo:** `backend/__tests__/infrastructure/persistence/prisma/repositories/PrismaProvisionRepository.usedAmount.test.ts`

```typescript
import { PrismaProvisionRepository } from '../../../../../src/infrastructure/persistence/prisma/repositories/PrismaProvisionRepository';
import { PrismaExpenseRepository } from '../../../../../src/infrastructure/persistence/prisma/repositories/PrismaExpenseRepository';
import prisma from '../../../../../src/infrastructure/database/prisma';

describe('PrismaProvisionRepository - usedAmount consistency', () => {
  let provisionRepo: PrismaProvisionRepository;
  let expenseRepo: PrismaExpenseRepository;

  beforeAll(() => {
    provisionRepo = new PrismaProvisionRepository();
    expenseRepo = new PrismaExpenseRepository();
  });

  afterEach(async () => {
    // Limpiar datos de prueba
    await prisma.expense.deleteMany({});
    await prisma.provision.deleteMany({});
    await prisma.category.deleteMany({});
  });

  it('should initialize usedAmount to 0 when creating a provision', async () => {
    // Arrange
    const category = await prisma.category.create({
      data: {
        userId: 'test-user',
        name: 'Test Category',
        period: '2025-01',
        monthlyBudget: 1000,
      },
    });

    // Act
    const provision = await provisionRepo.create({
      item: 'Test Provision',
      categoryId: category.id,
      amount: -500,
      dueDate: new Date('2025-01-31'),
    });

    // Assert
    expect(provision.usedAmount).toBe(0);
  });

  it('should update usedAmount when creating an expense', async () => {
    // Arrange
    const category = await prisma.category.create({
      data: {
        userId: 'test-user',
        name: 'Test Category',
        period: '2025-01',
        monthlyBudget: 1000,
      },
    });

    const provision = await provisionRepo.create({
      item: 'Test Provision',
      categoryId: category.id,
      amount: -500,
      dueDate: new Date('2025-01-31'),
    });

    // Act
    await expenseRepo.create({
      date: new Date(),
      description: 'Test Expense',
      categoryId: category.id,
      provisionId: provision.id,
      amount: -100,
      paymentMethod: 'CASH',
    });

    // Assert
    const updatedProvision = await provisionRepo.findById(provision.id);
    expect(updatedProvision?.usedAmount).toBe(100);
  });

  it('should calculate correct usedAmount with multiple expenses', async () => {
    // Arrange
    const category = await prisma.category.create({
      data: {
        userId: 'test-user',
        name: 'Test Category',
        period: '2025-01',
        monthlyBudget: 1000,
      },
    });

    const provision = await provisionRepo.create({
      item: 'Test Provision',
      categoryId: category.id,
      amount: -500,
      dueDate: new Date('2025-01-31'),
    });

    // Act - Create 3 expenses
    await expenseRepo.create({
      date: new Date(),
      description: 'Expense 1',
      categoryId: category.id,
      provisionId: provision.id,
      amount: -100,
      paymentMethod: 'CASH',
    });

    await expenseRepo.create({
      date: new Date(),
      description: 'Expense 2',
      categoryId: category.id,
      provisionId: provision.id,
      amount: -150,
      paymentMethod: 'CARD',
    });

    await expenseRepo.create({
      date: new Date(),
      description: 'Expense 3',
      categoryId: category.id,
      provisionId: provision.id,
      amount: -50,
      paymentMethod: 'TRANSFER',
    });

    // Assert
    const updatedProvision = await provisionRepo.findById(provision.id);
    expect(updatedProvision?.usedAmount).toBe(300); // 100 + 150 + 50
  });

  it('should decrement usedAmount when deleting an expense', async () => {
    // Arrange
    const category = await prisma.category.create({
      data: {
        userId: 'test-user',
        name: 'Test Category',
        period: '2025-01',
        monthlyBudget: 1000,
      },
    });

    const provision = await provisionRepo.create({
      item: 'Test Provision',
      categoryId: category.id,
      amount: -500,
      dueDate: new Date('2025-01-31'),
    });

    const expense = await expenseRepo.create({
      date: new Date(),
      description: 'Test Expense',
      categoryId: category.id,
      provisionId: provision.id,
      amount: -100,
      paymentMethod: 'CASH',
    });

    // Act
    await expenseRepo.delete(expense.id);

    // Assert
    const updatedProvision = await provisionRepo.findById(provision.id);
    expect(updatedProvision?.usedAmount).toBe(0);
  });

  it('should validate consistency between stored and calculated usedAmount', async () => {
    // Arrange
    const category = await prisma.category.create({
      data: {
        userId: 'test-user',
        name: 'Test Category',
        period: '2025-01',
        monthlyBudget: 1000,
      },
    });

    const provision = await provisionRepo.create({
      item: 'Test Provision',
      categoryId: category.id,
      amount: -500,
      dueDate: new Date('2025-01-31'),
    });

    await expenseRepo.create({
      date: new Date(),
      description: 'Test Expense',
      categoryId: category.id,
      provisionId: provision.id,
      amount: -100,
      paymentMethod: 'CASH',
    });

    // Act
    const storedProvision = await provisionRepo.findById(provision.id);
    const calculatedAmount = await provisionRepo.calculateMaterializedAmount(provision.id);

    // Assert
    expect(storedProvision?.usedAmount).toBe(calculatedAmount);
  });
});
```

**Ejecutar test:**
```bash
cd backend
npm test -- PrismaProvisionRepository.usedAmount.test.ts
```

---

#### 7.2. Test de Integración - Verificar transacciones

**Crear archivo:** `backend/__tests__/integration/expense-provision-transaction.test.ts`

```typescript
import { PrismaExpenseRepository } from '../../src/infrastructure/persistence/prisma/repositories/PrismaExpenseRepository';
import { PrismaProvisionRepository } from '../../src/infrastructure/persistence/prisma/repositories/PrismaProvisionRepository';
import prisma from '../../src/infrastructure/database/prisma';

describe('Expense-Provision Transaction Integration', () => {
  let expenseRepo: PrismaExpenseRepository;
  let provisionRepo: PrismaProvisionRepository;

  beforeAll(() => {
    expenseRepo = new PrismaExpenseRepository();
    provisionRepo = new PrismaProvisionRepository();
  });

  afterEach(async () => {
    await prisma.expense.deleteMany({});
    await prisma.provision.deleteMany({});
    await prisma.category.deleteMany({});
  });

  it('should rollback provision update if expense creation fails', async () => {
    // Arrange
    const category = await prisma.category.create({
      data: {
        userId: 'test-user',
        name: 'Test Category',
        period: '2025-01',
        monthlyBudget: 1000,
      },
    });

    const provision = await provisionRepo.create({
      item: 'Test Provision',
      categoryId: category.id,
      amount: -500,
      dueDate: new Date('2025-01-31'),
    });

    // Act & Assert
    try {
      await expenseRepo.create({
        date: new Date(),
        description: '', // ❌ Esto debería fallar por validación
        categoryId: category.id,
        provisionId: provision.id,
        amount: -100,
        paymentMethod: 'CASH',
      });
    } catch (error) {
      // Verificar que usedAmount NO cambió
      const unchangedProvision = await provisionRepo.findById(provision.id);
      expect(unchangedProvision?.usedAmount).toBe(0);
    }
  });
});
```

---

#### 7.3. Script de Validación de Datos Existentes

**Crear archivo:** `backend/scripts/validate-used-amounts.ts`

```typescript
import prisma from '../src/infrastructure/database/prisma';

async function validateUsedAmounts() {
  console.log('🔍 Validating usedAmount consistency...\n');

  const provisions = await prisma.provision.findMany({
    include: {
      expenses: true,
    },
  });

  let inconsistentCount = 0;
  const inconsistencies: any[] = [];

  for (const provision of provisions) {
    // Calcular suma real de expenses
    const calculatedUsedAmount = provision.expenses.reduce((sum, expense) => {
      return sum + Math.abs(Number(expense.amount));
    }, 0);

    const storedUsedAmount = Number(provision.usedAmount);

    // Comparar con tolerancia de 0.01 (redondeo decimal)
    if (Math.abs(calculatedUsedAmount - storedUsedAmount) > 0.01) {
      inconsistentCount++;
      inconsistencies.push({
        provisionId: provision.id,
        item: provision.item,
        stored: storedUsedAmount,
        calculated: calculatedUsedAmount,
        difference: calculatedUsedAmount - storedUsedAmount,
      });
    }
  }

  console.log(`✅ Total provisions: ${provisions.length}`);
  console.log(`✅ Consistent: ${provisions.length - inconsistentCount}`);
  console.log(`❌ Inconsistent: ${inconsistentCount}\n`);

  if (inconsistencies.length > 0) {
    console.log('⚠️  Inconsistencies found:');
    console.table(inconsistencies);

    // Opción de corregir automáticamente
    console.log('\n🔧 Run with --fix flag to auto-correct inconsistencies');
  } else {
    console.log('🎉 All provisions are consistent!');
  }

  return inconsistencies;
}

async function fixInconsistencies() {
  console.log('🔧 Fixing inconsistencies...\n');

  const provisions = await prisma.provision.findMany({
    include: {
      expenses: true,
    },
  });

  let fixedCount = 0;

  for (const provision of provisions) {
    const calculatedUsedAmount = provision.expenses.reduce((sum, expense) => {
      return sum + Math.abs(Number(expense.amount));
    }, 0);

    const storedUsedAmount = Number(provision.usedAmount);

    if (Math.abs(calculatedUsedAmount - storedUsedAmount) > 0.01) {
      await prisma.provision.update({
        where: { id: provision.id },
        data: { usedAmount: calculatedUsedAmount },
      });
      fixedCount++;
      console.log(`✅ Fixed provision ${provision.id}: ${storedUsedAmount} → ${calculatedUsedAmount}`);
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} provisions`);
}

// Main
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');

validateUsedAmounts()
  .then(async (inconsistencies) => {
    if (shouldFix && inconsistencies.length > 0) {
      await fixInconsistencies();
    }
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
```

**Ejecutar validación:**
```bash
cd backend
npx ts-node scripts/validate-used-amounts.ts

# Corregir automáticamente
npx ts-node scripts/validate-used-amounts.ts --fix
```

---

### PASO 8: Actualizar DIContainer

**Archivo:** `backend/src/infrastructure/di/container.ts`

**Verificar que los métodos de provisión NO necesitan cambios:**

Los métodos de use case deben funcionar sin cambios porque:
- `GetProvisionsUseCase` ahora usa métodos sin `WithUsedAmount`
- `GetProvisionByIdUseCase` ahora usa `findById()` directamente

**No se requieren cambios en DIContainer.**

---

## Testing

### Checklist de Testing

#### Tests Unitarios
- [ ] Test de creación de provision (usedAmount = 0)
- [ ] Test de creación de expense (incrementa usedAmount)
- [ ] Test de actualización de expense (ajusta usedAmount)
- [ ] Test de eliminación de expense (decrementa usedAmount)
- [ ] Test de cambio de provisionId en expense
- [ ] Test de validación de consistencia

#### Tests de Integración
- [ ] Test de transacciones (rollback en caso de error)
- [ ] Test de múltiples expenses en una provision
- [ ] Test de reportes (ExecutiveSummary)
- [ ] Test de endpoints de provisiones

#### Tests Manuales
- [ ] Crear provision desde frontend
- [ ] Crear expense vinculado a provision
- [ ] Verificar que usedAmount se actualiza en tiempo real
- [ ] Eliminar expense y verificar decremento
- [ ] Actualizar expense y verificar ajuste
- [ ] Ejecutar script de validación
- [ ] Verificar reportes (dashboard)

---

## Rollback Plan

### Si necesitas revertir la migración:

#### Opción 1: Rollback de migración de Prisma
```bash
cd backend

# Revertir última migración
npx prisma migrate reset

# O revertir a migración específica
npx prisma migrate resolve --rolled-back <migration-name>
```

#### Opción 2: Rollback manual de código

1. **Revertir cambios en Git:**
```bash
git checkout main
git branch -D feature/materialized-usedamount
```

2. **Ejecutar migración SQL manual para eliminar columna:**
```sql
ALTER TABLE provisions DROP COLUMN used_amount;
```

3. **Regenerar Prisma Client:**
```bash
cd backend
npx prisma generate
```

---

## Validación Post-Migración

### Checklist de Validación

#### Base de Datos
- [ ] Columna `used_amount` existe en tabla `provisions`
- [ ] Todas las provisions tienen `used_amount >= 0`
- [ ] Ejecutar script de validación: `npm run validate-used-amounts`
- [ ] Verificar índices de BD funcionan correctamente

#### Código
- [ ] Todos los tests pasan: `npm test`
- [ ] No hay referencias a métodos eliminados (`*WithUsedAmount`)
- [ ] TypeScript compila sin errores: `npm run build`
- [ ] Linter pasa: `npm run lint`

#### Funcionalidad
- [ ] Crear provision → usedAmount = 0 ✅
- [ ] Crear expense vinculado → usedAmount incrementa ✅
- [ ] Actualizar expense → usedAmount ajusta ✅
- [ ] Eliminar expense → usedAmount decrementa ✅
- [ ] Cambiar provisionId → usedAmount se transfiere ✅
- [ ] Dashboard carga rápido (sin N+1) ✅
- [ ] Reportes muestran datos correctos ✅

#### Performance
- [ ] Tiempo de carga de lista de provisiones < 500ms
- [ ] Tiempo de carga de dashboard < 1s
- [ ] No hay queries N+1 en logs de Prisma
- [ ] Número de queries reducido significativamente

---

## Documentación Adicional

### Agregar a README

Agregar sección en `backend/README.md`:

```markdown
## UsedAmount Calculation

The `usedAmount` field in provisions is **materialized** (stored in database) and updated automatically via database transactions when expenses are created, updated, or deleted.

### How it works:
1. When an expense is created with a `provisionId`, the provision's `usedAmount` is incremented
2. When an expense is updated, the `usedAmount` is adjusted accordingly
3. When an expense is deleted, the provision's `usedAmount` is decremented
4. All operations use Prisma transactions to ensure data consistency

### Validation:
To validate consistency between stored and calculated values:

```bash
npm run validate-used-amounts
```

To auto-fix inconsistencies:

```bash
npm run validate-used-amounts -- --fix
```

### Maintenance:
- `calculateMaterializedAmount()` is kept for auditing purposes
- Run validation script periodically (e.g., weekly cron job)
- Monitor for any inconsistencies in production logs
```

---

## Resumen de Archivos Modificados

### Total de archivos: 17

**Base de Datos (2):**
1. ✅ `backend/prisma/schema.prisma`
2. ✅ Nueva migración Prisma

**Domain Layer (2):**
3. ✅ `backend/src/domain/entities/Provision.ts`
4. ✅ `backend/src/domain/repositories/IProvisionRepository.ts`

**Infrastructure Layer (6):**
5. ✅ `backend/src/infrastructure/persistence/prisma/repositories/PrismaProvisionRepository.ts`
6. ✅ `backend/src/infrastructure/persistence/prisma/repositories/PrismaExpenseRepository.ts`
7. ✅ `backend/src/infrastructure/persistence/prisma/repositories/PrismaReportRepository.ts`
8. ✅ `backend/src/infrastructure/persistence/prisma/mappers/ProvisionMapper.ts`
9. ✅ `backend/src/infrastructure/persistence/typeorm/repositories/TypeORMProvisionRepository.ts`
10. ✅ `backend/src/infrastructure/persistence/in-memory/InMemoryProvisionRepository.ts`

**Application Layer (5):**
11. ✅ `backend/src/application/use-cases/expenses/CreateExpenseUseCase.ts`
12. ✅ `backend/src/application/use-cases/expenses/UpdateExpenseUseCase.ts`
13. ✅ `backend/src/application/use-cases/expenses/DeleteExpenseUseCase.ts`
14. ✅ `backend/src/application/use-cases/provisions/GetProvisionsUseCase.ts`
15. ✅ `backend/src/application/use-cases/provisions/GetProvisionByIdUseCase.ts`

**Presentation Layer (1):**
16. ✅ `backend/src/presentation/controllers/ProvisionController.ts`

**Scripts (1):**
17. ✅ `backend/scripts/validate-used-amounts.ts` (NUEVO)

---

## Comandos Rápidos de Resumen

```bash
# 1. Crear migración
cd backend
npx prisma migrate dev --name add_used_amount_to_provisions

# 2. Ejecutar tests
npm test

# 3. Validar consistencia
npx ts-node scripts/validate-used-amounts.ts

# 4. Corregir inconsistencias
npx ts-node scripts/validate-used-amounts.ts --fix

# 5. Build
npm run build

# 6. Verificar tipos
npm run type-check
```

---

## Notas Finales

### Consideraciones Importantes

1. **Transacciones:** Todas las operaciones de expense DEBEN usar `prisma.$transaction()` para garantizar consistencia

2. **Valor Absoluto:** `usedAmount` siempre es positivo, mientras que `expense.amount` es negativo

3. **Decimal vs Number:** Prisma usa `Decimal`, asegúrate de convertir correctamente con `Math.abs(Number(...))`

4. **Testing:** Ejecutar tests exhaustivos antes de deploy a producción

5. **Monitoreo:** Después del deploy, ejecutar script de validación diariamente durante la primera semana

6. **Rollback:** Tener plan de rollback listo en caso de problemas

### Beneficios Esperados

- ✅ **90% reducción** en tiempo de carga de listas de provisiones
- ✅ **95% reducción** en queries de reportes
- ✅ **Elimina** problema N+1 completamente
- ✅ **Escalable** para miles de provisiones

---

**Fin de las instrucciones de migración**

¿Tienes alguna pregunta sobre algún paso específico?
