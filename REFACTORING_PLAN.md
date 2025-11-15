# Clean Architecture Refactoring Plan - Budget Manager

## 📋 Visión General

Refactorizar el backend de una arquitectura acoplada a Prisma hacia una **Clean Architecture** con:
- ✅ Domain-Driven Design (DDD)
- ✅ Hexagonal Architecture
- ✅ Dependency Injection
- ✅ Value Objects
- ✅ Use Cases
- ✅ Data Mappers

**Objetivo Principal:** Desacoplar la lógica de negocio de Prisma para permitir cambios de ORM sin afectar la aplicación.

---

## 🎯 Problema Actual

```
Controllers → Repositories → Prisma
     ↑              ↑
     └──────────────┘ Hard dependency!
```

**Impacto:** Cambiar de Prisma a TypeORM requiere reescribir todo.

---

## ✅ Arquitectura Objetivo

```
Presentation Layer (Controllers)
         ↓
   Application Layer (Use Cases)
         ↓
   Domain Layer (Entities, Value Objects)
         ↑
Infrastructure Layer (Prisma, TypeORM, etc.)
```

**Inversión de Control:** Las capas inferiores no conocen las superiores.

---

# 📅 Plan de Migración (5 Fases)

## ⏱️ Tiempo Estimado: 1-2 Semanas (parte-time)

---

## FASE 1: Fundamentos (Días 1-2)

### 1.1 Crear Value Objects

**Archivos a crear:**

```
backend/src/domain/value-objects/
├── Money.ts          # Manejo de dinero con validación
├── Period.ts         # Período "YYYY-MM" con validación
└── index.ts          # Exports
```

**1.1.1 Money.ts**
```typescript
// domain/value-objects/Money.ts
export class Money {
  private readonly _amount: number;

  constructor(amount: number | string) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
      throw new Error('Invalid money amount');
    }

    // 2 decimales máximo
    this._amount = Math.round(num * 100) / 100;
  }

  static zero(): Money {
    return new Money(0);
  }

  static fromDecimal(decimal: Decimal): Money {
    return new Money(decimal.toNumber());
  }

  get value(): number {
    return this._amount;
  }

  isPositive(): boolean {
    return this._amount > 0;
  }

  isNegative(): boolean {
    return this._amount < 0;
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  add(other: Money): Money {
    return new Money(this._amount + other.value);
  }

  subtract(other: Money): Money {
    return new Money(this._amount - other.value);
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor);
  }

  toString(): string {
    return this._amount.toFixed(2);
  }

  toJSON(): number {
    return this._amount;
  }

  equals(other: Money): boolean {
    return this._amount === other.value;
  }
}
```

**1.1.2 Period.ts**
```typescript
// domain/value-objects/Period.ts
export class Period {
  private readonly _period: string; // "YYYY-MM"

  constructor(period: string) {
    if (!Period.isValid(period)) {
      throw new Error(`Invalid period format: ${period}. Use YYYY-MM`);
    }
    this._period = period;
  }

  static isValid(period: string): boolean {
    return /^\d{4}-\d{2}$/.test(period);
  }

  static now(): Period {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return new Period(`${year}-${month}`);
  }

  static fromDate(date: Date): Period {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return new Period(`${year}-${month}`);
  }

  get value(): string {
    return this._period;
  }

  getYear(): number {
    return parseInt(this._period.split('-')[0], 10);
  }

  getMonth(): number {
    return parseInt(this._period.split('-')[1], 10);
  }

  previous(): Period {
    const [year, month] = this._period.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }

    return new Period(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  }

  next(): Period {
    const [year, month] = this._period.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;

    if (newMonth === 13) {
      newMonth = 1;
      newYear += 1;
    }

    return new Period(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  }

  toString(): string {
    return this._period;
  }

  toJSON(): string {
    return this._period;
  }

  equals(other: Period): boolean {
    return this._period === other.value;
  }
}
```

**1.1.3 index.ts**
```typescript
// domain/value-objects/index.ts
export { Money } from './Money';
export { Period } from './Period';
```

### 1.2 Actualizar Domain Entities

**Modificar:** `backend/src/domain/entities/Category.ts`

```typescript
// domain/entities/Category.ts
import { Money } from '../value-objects/Money';
import { Period } from '../value-objects/Period';

export interface Category {
  id: string;
  name: string;
  period: string; // Tipo primitivo por ahora, usaremos Period en lógica
  monthlyBudget: number; // Número puro, sin Decimal
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  name: string;
  period: string;
  monthlyBudget: number;
  notes?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  monthlyBudget?: number;
  notes?: string;
}
```

---

## FASE 2: Data Mappers (Días 3-4)

### 2.1 Crear Mappers

**Archivos a crear:**

```
backend/src/infrastructure/persistence/prisma/mappers/
├── CategoryMapper.ts
├── ExpenseMapper.ts
├── ProvisionMapper.ts
└── index.ts
```

**2.1.1 CategoryMapper.ts**
```typescript
// infrastructure/persistence/prisma/mappers/CategoryMapper.ts
import { Category as PrismaCategory } from '@prisma/client';
import { Category, CreateCategoryDTO } from '../../../../domain/entities/Category';

export class CategoryMapper {
  /**
   * Convierte datos de Prisma al dominio
   * Aísla la conversión de tipos (Decimal → number)
   */
  static toDomain(raw: PrismaCategory): Category {
    return {
      id: raw.id,
      name: raw.name,
      period: raw.period,
      monthlyBudget: raw.monthly_budget.toNumber(), // ✅ Conversión centralizada
      notes: raw.notes || undefined,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }

  /**
   * Convierte dominio a datos de Prisma
   */
  static toPrisma(category: Category | CreateCategoryDTO) {
    return {
      name: category.name,
      period: category.period,
      monthly_budget: category.monthlyBudget,
      notes: category.notes || null,
    };
  }

  /**
   * Convierte array
   */
  static toDomainMany(raw: PrismaCategory[]): Category[] {
    return raw.map(this.toDomain);
  }
}
```

**2.1.2 ExpenseMapper.ts**
```typescript
// infrastructure/persistence/prisma/mappers/ExpenseMapper.ts
import { Expense as PrismaExpense } from '@prisma/client';
import { Expense, CreateExpenseDTO } from '../../../../domain/entities/Expense';

export class ExpenseMapper {
  static toDomain(raw: PrismaExpense): Expense {
    return {
      id: raw.id,
      date: raw.date,
      description: raw.description,
      categoryId: raw.category_id,
      provisionId: raw.provision_id || undefined,
      amount: raw.amount.toNumber(), // ✅ Conversión
      paymentMethod: raw.payment_method as any,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }

  static toPrisma(expense: Expense | CreateExpenseDTO) {
    return {
      date: expense.date,
      description: expense.description,
      category_id: expense.categoryId,
      provision_id: expense.provisionId || null,
      amount: expense.amount,
      payment_method: expense.paymentMethod,
    };
  }

  static toDomainMany(raw: PrismaExpense[]): Expense[] {
    return raw.map(this.toDomain);
  }
}
```

**2.1.3 ProvisionMapper.ts**
```typescript
// infrastructure/persistence/prisma/mappers/ProvisionMapper.ts
import { Provision as PrismaProvision } from '@prisma/client';
import { Provision, CreateProvisionDTO } from '../../../../domain/entities/Provision';

export class ProvisionMapper {
  static toDomain(raw: PrismaProvision): Provision {
    return {
      id: raw.id,
      item: raw.item,
      categoryId: raw.category_id,
      amount: raw.amount.toNumber(), // ✅ Conversión
      dueDate: raw.due_date,
      status: raw.status as any,
      notes: raw.notes || undefined,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }

  static toPrisma(provision: Provision | CreateProvisionDTO) {
    return {
      item: provision.item,
      category_id: provision.categoryId,
      amount: provision.amount,
      due_date: provision.dueDate,
      status: provision.status,
      notes: provision.notes || null,
    };
  }

  static toDomainMany(raw: PrismaProvision[]): Provision[] {
    return raw.map(this.toDomain);
  }
}
```

### 2.2 Usar Mappers en Repositorios Actuales

**Modificar:** `backend/src/infrastructure/repositories/CategoryRepository.ts`

```typescript
// ✅ ANTES:
monthlyBudget: category.monthly_budget.toNumber()

// ✅ DESPUÉS (usando mapper):
const domainCategory = CategoryMapper.toDomain(category);
// → monthlyBudget ya es number puro
```

---

## FASE 3: Application Layer - Use Cases (Días 5-6)

### 3.1 Crear Estructura

```
backend/src/application/
├── use-cases/
│   ├── categories/
│   │   ├── CreateCategoryUseCase.ts
│   │   ├── GetCategoriesByPeriodUseCase.ts
│   │   ├── GetCategoryByIdUseCase.ts
│   │   ├── UpdateCategoryUseCase.ts
│   │   └── DeleteCategoryUseCase.ts
│   │
│   ├── expenses/
│   │   ├── CreateExpenseUseCase.ts
│   │   ├── GetExpensesUseCase.ts
│   │   └── ...
│   │
│   └── index.ts
│
├── dto/
│   ├── CreateCategoryDTO.ts
│   └── ...
│
└── ports/
    ├── IRepositoryPort.ts
    └── ILoggerPort.ts
```

### 3.2 Crear Use Cases

**3.2.1 CreateCategoryUseCase.ts**
```typescript
// application/use-cases/categories/CreateCategoryUseCase.ts
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO } from '../../../domain/entities/Category';
import { Period } from '../../../domain/value-objects/Period';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryDTO): Promise<Category> {
    // ✅ Validaciones de negocio
    Period.isValid(input.period); // Valida período

    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Category name is required');
    }

    if (input.monthlyBudget < 0) {
      throw new Error('Monthly budget must be positive');
    }

    // ✅ Lógica de negocio
    // Verificar que no existe categoría con mismo nombre y período
    const existing = await this.categoryRepository.findByNameAndPeriod(
      input.name,
      input.period
    );

    if (existing) {
      throw new Error(`Category "${input.name}" already exists for period ${input.period}`);
    }

    // ✅ Crear
    return await this.categoryRepository.create(input);
  }
}
```

**3.2.2 GetCategoriesByPeriodUseCase.ts**
```typescript
// application/use-cases/categories/GetCategoriesByPeriodUseCase.ts
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { Period } from '../../../domain/value-objects/Period';

export class GetCategoriesByPeriodUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(period: string): Promise<Category[]> {
    // ✅ Validar período
    if (!Period.isValid(period)) {
      throw new Error(`Invalid period format: ${period}`);
    }

    return await this.categoryRepository.findByPeriod(period);
  }
}
```

**3.2.3 UpdateCategoryUseCase.ts**
```typescript
// application/use-cases/categories/UpdateCategoryUseCase.ts
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category, UpdateCategoryDTO } from '../../../domain/entities/Category';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string, input: UpdateCategoryDTO): Promise<Category> {
    // ✅ Validaciones
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }

    if (input.monthlyBudget !== undefined && input.monthlyBudget < 0) {
      throw new Error('Monthly budget must be positive');
    }

    // ✅ Actualizar
    return await this.categoryRepository.update(id, input);
  }
}
```

**3.2.4 DeleteCategoryUseCase.ts**
```typescript
// application/use-cases/categories/DeleteCategoryUseCase.ts
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }

    await this.categoryRepository.delete(id);
  }
}
```

### 3.3 Crear Index para Exports

```typescript
// application/use-cases/categories/index.ts
export { CreateCategoryUseCase } from './CreateCategoryUseCase';
export { GetCategoriesByPeriodUseCase } from './GetCategoriesByPeriodUseCase';
export { GetCategoryByIdUseCase } from './GetCategoryByIdUseCase';
export { UpdateCategoryUseCase } from './UpdateCategoryUseCase';
export { DeleteCategoryUseCase } from './DeleteCategoryUseCase';
```

---

## FASE 4: Dependency Injection Container (Día 7)

### 4.1 Instalar inversify

```bash
cd backend
npm install inversify reflect-metadata
npm install --save-dev @types/inversify
```

### 4.2 Crear Container

**Archivos:**

```
backend/src/infrastructure/di/
├── container.ts
├── types.ts
└── config.ts
```

**4.2.1 types.ts**
```typescript
// infrastructure/di/types.ts
export const TYPES = {
  // Data Layer
  PrismaClient: Symbol.for('PrismaClient'),

  // Repositories
  CategoryRepository: Symbol.for('CategoryRepository'),
  ExpenseRepository: Symbol.for('ExpenseRepository'),
  ProvisionRepository: Symbol.for('ProvisionRepository'),
  ReportRepository: Symbol.for('ReportRepository'),

  // Use Cases - Category
  CreateCategoryUseCase: Symbol.for('CreateCategoryUseCase'),
  GetCategoriesByPeriodUseCase: Symbol.for('GetCategoriesByPeriodUseCase'),
  GetCategoryByIdUseCase: Symbol.for('GetCategoryByIdUseCase'),
  UpdateCategoryUseCase: Symbol.for('UpdateCategoryUseCase'),
  DeleteCategoryUseCase: Symbol.for('DeleteCategoryUseCase'),

  // Use Cases - Expense
  CreateExpenseUseCase: Symbol.for('CreateExpenseUseCase'),
  GetExpensesUseCase: Symbol.for('GetExpensesUseCase'),

  // Use Cases - Provision
  CreateProvisionUseCase: Symbol.for('CreateProvisionUseCase'),
  GetProvisionsUseCase: Symbol.for('GetProvisionsUseCase'),

  // Controllers
  CategoryController: Symbol.for('CategoryController'),
  ExpenseController: Symbol.for('ExpenseController'),
  ProvisionController: Symbol.for('ProvisionController'),
  ReportController: Symbol.for('ReportController'),
};
```

**4.2.2 container.ts**
```typescript
// infrastructure/di/container.ts
import 'reflect-metadata';
import { Container } from 'inversify';
import { PrismaClient } from '@prisma/client';

// Repositories
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { IProvisionRepository } from '../../domain/repositories/IProvisionRepository';
import { IReportRepository } from '../../domain/repositories/IReportRepository';

import { PrismaCategoryRepository } from '../persistence/prisma/repositories/PrismaCategoryRepository';
import { PrismaExpenseRepository } from '../persistence/prisma/repositories/PrismaExpenseRepository';
import { PrismaProvisionRepository } from '../persistence/prisma/repositories/PrismaProvisionRepository';
import { PrismaReportRepository } from '../persistence/prisma/repositories/PrismaReportRepository';

// Use Cases - Category
import { CreateCategoryUseCase } from '../../application/use-cases/categories/CreateCategoryUseCase';
import { GetCategoriesByPeriodUseCase } from '../../application/use-cases/categories/GetCategoriesByPeriodUseCase';
import { GetCategoryByIdUseCase } from '../../application/use-cases/categories/GetCategoryByIdUseCase';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/DeleteCategoryUseCase';

// Controllers
import { CategoryController } from '../../presentation/controllers/CategoryController';

import { TYPES } from './types';

const container = new Container();

// ============================================================
// SINGLETON: Prisma Client
// ============================================================
container
  .bind<PrismaClient>(TYPES.PrismaClient)
  .toConstantValue(new PrismaClient());

// ============================================================
// REPOSITORIES
// ============================================================
container
  .bind<ICategoryRepository>(TYPES.CategoryRepository)
  .toDynamicValue((context) => {
    const prisma = context.container.get<PrismaClient>(TYPES.PrismaClient);
    return new PrismaCategoryRepository(prisma);
  })
  .inSingletonScope();

container
  .bind<IExpenseRepository>(TYPES.ExpenseRepository)
  .toDynamicValue((context) => {
    const prisma = context.container.get<PrismaClient>(TYPES.PrismaClient);
    return new PrismaExpenseRepository(prisma);
  })
  .inSingletonScope();

container
  .bind<IProvisionRepository>(TYPES.ProvisionRepository)
  .toDynamicValue((context) => {
    const prisma = context.container.get<PrismaClient>(TYPES.PrismaClient);
    return new PrismaProvisionRepository(prisma);
  })
  .inSingletonScope();

container
  .bind<IReportRepository>(TYPES.ReportRepository)
  .toDynamicValue((context) => {
    const prisma = context.container.get<PrismaClient>(TYPES.PrismaClient);
    return new PrismaReportRepository(prisma);
  })
  .inSingletonScope();

// ============================================================
// USE CASES - CATEGORY
// ============================================================
container
  .bind<CreateCategoryUseCase>(TYPES.CreateCategoryUseCase)
  .toDynamicValue((context) => {
    const repo = context.container.get<ICategoryRepository>(TYPES.CategoryRepository);
    return new CreateCategoryUseCase(repo);
  });

container
  .bind<GetCategoriesByPeriodUseCase>(TYPES.GetCategoriesByPeriodUseCase)
  .toDynamicValue((context) => {
    const repo = context.container.get<ICategoryRepository>(TYPES.CategoryRepository);
    return new GetCategoriesByPeriodUseCase(repo);
  });

container
  .bind<GetCategoryByIdUseCase>(TYPES.GetCategoryByIdUseCase)
  .toDynamicValue((context) => {
    const repo = context.container.get<ICategoryRepository>(TYPES.CategoryRepository);
    return new GetCategoryByIdUseCase(repo);
  });

container
  .bind<UpdateCategoryUseCase>(TYPES.UpdateCategoryUseCase)
  .toDynamicValue((context) => {
    const repo = context.container.get<ICategoryRepository>(TYPES.CategoryRepository);
    return new UpdateCategoryUseCase(repo);
  });

container
  .bind<DeleteCategoryUseCase>(TYPES.DeleteCategoryUseCase)
  .toDynamicValue((context) => {
    const repo = context.container.get<ICategoryRepository>(TYPES.CategoryRepository);
    return new DeleteCategoryUseCase(repo);
  });

// ============================================================
// CONTROLLERS
// ============================================================
container
  .bind<CategoryController>(TYPES.CategoryController)
  .toDynamicValue((context) => {
    const createUC = context.container.get<CreateCategoryUseCase>(
      TYPES.CreateCategoryUseCase
    );
    const getByPeriodUC = context.container.get<GetCategoriesByPeriodUseCase>(
      TYPES.GetCategoriesByPeriodUseCase
    );
    const getByIdUC = context.container.get<GetCategoryByIdUseCase>(
      TYPES.GetCategoryByIdUseCase
    );
    const updateUC = context.container.get<UpdateCategoryUseCase>(
      TYPES.UpdateCategoryUseCase
    );
    const deleteUC = context.container.get<DeleteCategoryUseCase>(
      TYPES.DeleteCategoryUseCase
    );
    return new CategoryController(createUC, getByPeriodUC, getByIdUC, updateUC, deleteUC);
  });

export { container };
```

---

## FASE 5: Controllers Refactorizados (Días 8-9)

### 5.1 Refactorizar CategoryController

**Nuevo:**

```typescript
// presentation/controllers/CategoryController.ts
import { Request, Response } from 'express';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/CreateCategoryUseCase';
import { GetCategoriesByPeriodUseCase } from '../../application/use-cases/categories/GetCategoriesByPeriodUseCase';
import { GetCategoryByIdUseCase } from '../../application/use-cases/categories/GetCategoryByIdUseCase';
import { UpdateCategoryUseCase } from '../../application/use-cases/categories/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/DeleteCategoryUseCase';

export class CategoryController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly getCategoriesByPeriodUseCase: GetCategoriesByPeriodUseCase,
    private readonly getCategoryByIdUseCase: GetCategoryByIdUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const category = await this.createCategoryUseCase.execute(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByPeriod(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.query;
      if (!period || typeof period !== 'string') {
        res.status(400).json({ error: 'Period query parameter is required' });
        return;
      }

      const categories = await this.getCategoriesByPeriodUseCase.execute(period);
      res.json(categories);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.getCategoryByIdUseCase.execute(id);
      res.json(category);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.updateCategoryUseCase.execute(id, req.body);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteCategoryUseCase.execute(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
}
```

### 5.2 Actualizar Routes

**Nueva estructura:**

```typescript
// presentation/routes/categoryRoutes.ts
import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { CategoryController } from '../controllers/CategoryController';
import { TYPES } from '../../infrastructure/di/types';

const router = Router();

// ✅ Obtener controller del container (con todas sus dependencias inyectadas)
const controller = container.get<CategoryController>(TYPES.CategoryController);

router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.getByPeriod(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
```

### 5.3 Actualizar index.ts principal

```typescript
// src/index.ts
import 'reflect-metadata'; // ✅ IMPORTANTE: Antes de cualquier otro import
import express from 'express';
import cors from 'cors';
import categoryRoutes from './presentation/routes/categoryRoutes';
import expenseRoutes from './presentation/routes/expenseRoutes';
import provisioning Routes from './presentation/routes/provisionRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ Rutas con inyección de dependencias
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/provisions', provisionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Management API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Budget Management API ready`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
```

---

## FASE 6: Migraciones Complementarias (Días 10-11)

### 6.1 Expense Use Cases

Repetir el mismo patrón de Category para Expense:
- CreateExpenseUseCase
- GetExpensesUseCase
- GetExpenseByIdUseCase
- UpdateExpenseUseCase
- DeleteExpenseUseCase

### 6.2 Provision Use Cases

Repetir para Provision:
- CreateProvisionUseCase
- GetProvisionsUseCase
- GetProvisionByIdUseCase
- UpdateProvisionUseCase
- DeleteProvisionUseCase
- CopyProvisioningUseCase (caso especial)

### 6.3 Report Use Cases

- GenerateExecutiveSummaryUseCase

---

## FASE 7: Testing (Días 12-13)

### 7.1 Crear In-Memory Repositories

```typescript
// infrastructure/persistence/in-memory/InMemoryCategoryRepository.ts
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO } from '../../../domain/entities/Category';

export class InMemoryCategoryRepository implements ICategoryRepository {
  private categories: Map<string, Category> = new Map();

  async create(data: CreateCategoryDTO): Promise<Category> {
    const id = crypto.randomUUID();
    const now = new Date();
    const category: Category = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.categories.set(id, category);
    return category;
  }

  async findAll(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  // ... implementar resto de métodos
}
```

### 7.2 Tests Unitarios

```typescript
// __tests__/application/use-cases/categories/CreateCategoryUseCase.test.ts
import { CreateCategoryUseCase } from '../../../../src/application/use-cases/categories/CreateCategoryUseCase';
import { InMemoryCategoryRepository } from '../../../../src/infrastructure/persistence/in-memory/InMemoryCategoryRepository';

describe('CreateCategoryUseCase', () => {
  it('should create a category', async () => {
    const repo = new InMemoryCategoryRepository();
    const useCase = new CreateCategoryUseCase(repo);

    const result = await useCase.execute({
      name: 'Groceries',
      period: '2025-01',
      monthlyBudget: 500,
    });

    expect(result.name).toBe('Groceries');
    expect(result.monthlyBudget).toBe(500);
  });

  it('should throw if category already exists', async () => {
    const repo = new InMemoryCategoryRepository();
    const useCase = new CreateCategoryUseCase(repo);

    await useCase.execute({
      name: 'Groceries',
      period: '2025-01',
      monthlyBudget: 500,
    });

    expect(() =>
      useCase.execute({
        name: 'Groceries',
        period: '2025-01',
        monthlyBudget: 600,
      })
    ).rejects.toThrow();
  });
});
```

---

## 📊 Checklist de Implementación

### Fase 1: Value Objects
- [ ] Money.ts creado y probado
- [ ] Period.ts creado y probado
- [ ] Domain entities actualizadas

### Fase 2: Data Mappers
- [ ] CategoryMapper.ts creado
- [ ] ExpenseMapper.ts creado
- [ ] ProvisionMapper.ts creado
- [ ] Repositorios usando mappers

### Fase 3: Use Cases (Category)
- [ ] CreateCategoryUseCase
- [ ] GetCategoriesByPeriodUseCase
- [ ] GetCategoryByIdUseCase
- [ ] UpdateCategoryUseCase
- [ ] DeleteCategoryUseCase

### Fase 4: DI Container
- [ ] Inversify instalado
- [ ] types.ts creado
- [ ] container.ts configurado
- [ ] Todos los servicios registrados

### Fase 5: Controllers
- [ ] CategoryController refactorizado
- [ ] Routes actualizadas
- [ ] index.ts con 'reflect-metadata'

### Fase 6: Expense & Provision
- [ ] Use cases de Expense
- [ ] Use cases de Provision
- [ ] Controllers refactorizados
- [ ] Routes actualizadas

### Fase 7: Testing
- [ ] In-Memory repos
- [ ] Tests unitarios
- [ ] Tests de integración

---

## 🎯 Beneficios Inmediatos

✅ **Testabilidad:**
```typescript
// Sin BD real
const repo = new InMemoryCategoryRepository();
const useCase = new CreateCategoryUseCase(repo);
```

✅ **Cambio de ORM (cuando quieras):**
```typescript
// Cambias esto en container.ts
container.bind<ICategoryRepository>(TYPES.CategoryRepository)
  .toDynamicValue(() => new TypeORMCategoryRepository(repo))
```

✅ **Reutilización:**
```typescript
// Mismo use case para CLI, API, batch jobs
const useCase = new CreateCategoryUseCase(repo);
useCase.execute(data);
```

✅ **Separación de Responsabilidades:**
- Domain: Lógica pura
- Application: Casos de uso
- Infrastructure: Detalles técnicos

---

## 📚 Referencias y Patrones

- **Clean Architecture** - Robert C. Martin
- **Domain-Driven Design** - Eric Evans
- **Hexagonal Architecture** - Alistair Cockburn
- **Repository Pattern** - Gang of Four
- **Dependency Injection** - Martin Fowler
- **Value Objects** - DDD

---

## 🚀 Próximos Pasos

1. **Revisar y aprobar el plan**
2. **Comenzar Fase 1** (Value Objects)
3. **Ir iterando por fases**
4. **Hacer commits después de cada fase**
5. **Ejecutar tests continuamente**

---

**¿Comenzamos con Fase 1?**
