# Budget Manager - Comprehensive Architecture Analysis

**Project:** Budget Manager  
**Last Updated:** November 2024  
**Version:** 1.0.7  
**Analysis Depth:** Very Thorough

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Pattern](#architecture-pattern)
5. [Core Components](#core-components)
6. [Data Models & Relationships](#data-models--relationships)
7. [API Structure & Endpoints](#api-structure--endpoints)
8. [Configuration & Environment](#configuration--environment)
9. [Key Design Patterns](#key-design-patterns)
10. [Authentication & Security](#authentication--security)
11. [Frontend Architecture](#frontend-architecture)
12. [Backend Architecture](#backend-architecture)
13. [Data Flow Diagrams](#data-flow-diagrams)
14. [Performance Optimizations](#performance-optimizations)

---

## Executive Summary

**Budget Manager** is a comprehensive budget management system built with a modern, well-architected **Domain-Driven Design (DDD)** approach. The application separates concerns across **four distinct layers**: Presentation, Application, Domain, and Infrastructure.

### Key Architectural Characteristics:
- **Type System:** TypeScript (both frontend and backend)
- **Architecture Pattern:** Clean Architecture with DDD principles
- **Frontend:** Next.js 15 with React 19 and Server Components
- **Backend:** Express.js with Prisma ORM
- **Database:** PostgreSQL (with Supabase support)
- **Authentication:** Supabase Auth (JWT-based)
- **Dependency Injection:** Inversify with custom DIContainer
- **UI Framework:** Tailwind CSS v4
- **Data Access:** Multiple ORM support (Prisma, TypeORM) via abstraction

---

## Technology Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express.js | 5.1.0 | Web framework |
| **Language** | TypeScript | 5.9.3 | Type safety |
| **ORM** | Prisma | 6.19.0 | Database abstraction (primary) |
| **ORM** | TypeORM | 0.3.27 | Database abstraction (alternative) |
| **Auth** | Supabase | 2.81.1 | Authentication & JWT verification |
| **DI Container** | Inversify | 6.0.2 | Dependency injection |
| **HTTP** | Axios (client) | 1.13.2 | HTTP client for tests |
| **Compression** | compression | 1.8.1 | Response compression |
| **CORS** | cors | 2.8.5 | Cross-origin requests |
| **Env Vars** | dotenv | 17.2.3 | Environment configuration |
| **Testing** | Jest | 29.7.0 | Unit testing framework |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.3 | React framework (App Router) |
| **Language** | React | 19.2.0 | UI library |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **HTTP Client** | Axios | 1.13.2 | API communication |
| **Auth** | Supabase SSR | 0.7.0 | Server-side authentication |
| **Auth UI** | @supabase/auth-ui-react | 0.4.7 | Pre-built auth components |
| **State Management** | TanStack React Query | 5.90.10 | Server state management |
| **Date Utils** | date-fns | 4.1.0 | Date formatting & parsing |
| **Icons** | lucide-react | 0.553.0 | Icon library |
| **Utility** | clsx | 2.1.1 | Conditional CSS classes |
| **Utility** | tailwind-merge | 3.4.0 | Merge Tailwind classes |

### Database & Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | PostgreSQL 16 | Primary data store |
| **Cloud DB** | Supabase PostgreSQL | Production cloud database |
| **Containerization** | Docker & Docker Compose | Local development & deployment |
| **Version Control** | Git | Source code management |

---

## Project Structure

### High-Level Directory Organization

```
budget-manager/
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── presentation/             # HTTP Layer (Controllers & Routes)
│   │   ├── application/              # Use Cases & Business Logic
│   │   ├── domain/                   # Core Business Rules & Entities
│   │   └── infrastructure/           # External Integrations
│   ├── prisma/                       # Database Schema & Migrations
│   ├── __tests__/                    # Test Files
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                         # Next.js 15 App
│   ├── app/                          # Next.js App Router
│   │   ├── (routes)/                 # Feature pages
│   │   ├── auth/                     # Authentication routes
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Dashboard
│   ├── components/                   # Reusable React components
│   │   ├── ui/                       # UI primitives (Button, Card, Input)
│   │   └── (feature components)/     # Feature-specific components
│   ├── services/                     # API service layer
│   ├── hooks/                        # Custom React hooks
│   ├── lib/                          # Utilities & helpers
│   ├── types/                        # TypeScript type definitions
│   ├── middleware.ts                 # Auth & route protection middleware
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml                # Development environment setup
├── .env.example                      # Environment variables template
└── Documentation files               # Architecture & setup guides
```

### Backend Source Structure (Deep Dive)

```
backend/src/
├── presentation/                     # 🎯 HTTP Interface Layer
│   ├── controllers/
│   │   ├── CategoryController.ts     # Category HTTP handlers
│   │   ├── ExpenseController.ts      # Expense HTTP handlers
│   │   ├── ProvisionController.ts    # Provision HTTP handlers
│   │   └── ReportController.ts       # Report HTTP handlers
│   └── routes/
│       ├── categoryRoutes.ts         # Category REST endpoints
│       ├── expenseRoutes.ts          # Expense REST endpoints
│       ├── provisionRoutes.ts        # Provision REST endpoints
│       └── reportRoutes.ts           # Report REST endpoints
│
├── application/                      # 🚀 Use Cases & Business Logic
│   ├── use-cases/
│   │   ├── categories/
│   │   │   ├── CreateCategoryUseCase.ts
│   │   │   ├── GetCategoriesUseCase.ts
│   │   │   ├── GetCategoryByIdUseCase.ts
│   │   │   ├── UpdateCategoryUseCase.ts
│   │   │   └── DeleteCategoryUseCase.ts
│   │   ├── expenses/
│   │   │   ├── CreateExpenseUseCase.ts
│   │   │   ├── GetExpensesUseCase.ts
│   │   │   ├── GetExpenseByIdUseCase.ts
│   │   │   ├── UpdateExpenseUseCase.ts
│   │   │   └── DeleteExpenseUseCase.ts
│   │   └── provisions/
│   │       ├── CreateProvisionUseCase.ts
│   │       ├── GetProvisionsUseCase.ts
│   │       ├── GetProvisionByIdUseCase.ts
│   │       ├── UpdateProvisionUseCase.ts
│   │       └── DeleteProvisionUseCase.ts
│   └── services/
│       └── ValidationService.ts      # Centralized validation logic
│
├── domain/                           # 💎 Core Business Rules
│   ├── entities/
│   │   ├── Category.ts               # Category interface & DTOs
│   │   ├── Expense.ts                # Expense interface & DTOs
│   │   ├── Provision.ts              # Provision interface & DTOs
│   │   ├── ExecutiveSummary.ts       # Summary report entity
│   │   ├── CategoryDetailReport.ts   # Detailed report entity
│   │   ├── PaymentMethodReport.ts    # Payment analysis entity
│   │   ├── PeriodComparisonReport.ts # Period comparison entity
│   │   └── ProvisionFulfillmentReport.ts # Provision analysis entity
│   ├── repositories/
│   │   ├── ICategoryRepository.ts    # Category data contract
│   │   ├── IExpenseRepository.ts     # Expense data contract
│   │   ├── IProvisionRepository.ts   # Provision data contract
│   │   └── IReportRepository.ts      # Report data contract
│   └── value-objects/
│       ├── Money.ts                  # Money type with arithmetic
│       ├── Period.ts                 # Period type (YYYY-MM format)
│       └── index.ts                  # Exports
│
└── infrastructure/                   # 🔧 External Integrations
    ├── persistence/
    │   ├── prisma/
    │   │   ├── repositories/
    │   │   │   ├── PrismaCategoryRepository.ts
    │   │   │   ├── PrismaExpenseRepository.ts
    │   │   │   ├── PrismaProvisionRepository.ts
    │   │   │   └── PrismaReportRepository.ts
    │   │   └── mappers/
    │   │       ├── CategoryMapper.ts
    │   │       ├── ExpenseMapper.ts
    │   │       ├── ProvisionMapper.ts
    │   │       └── index.ts
    │   ├── typeorm/
    │   │   └── repositories/         # TypeORM implementations (alternative)
    │   │       ├── TypeORMCategoryRepository.ts
    │   │       ├── TypeORMExpenseRepository.ts
    │   │       └── TypeORMProvisionRepository.ts
    │   └── in-memory/                # Testing implementations
    │       ├── InMemoryCategoryRepository.ts
    │       ├── InMemoryExpenseRepository.ts
    │       └── InMemoryProvisionRepository.ts
    ├── database/
    │   ├── prisma.ts                 # Prisma client singleton
    │   └── typeorm.ts                # TypeORM client (if used)
    ├── config/
    │   └── supabase.ts               # Supabase configuration & auth
    ├── di/
    │   ├── container.ts              # DI container setup
    │   ├── types.ts                  # DI type symbols
    │   └── index.ts                  # DI exports
    └── middleware/
        └── authMiddleware.ts         # JWT token validation
```

### Frontend Structure

```
frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root HTML layout
│   ├── page.tsx                      # Dashboard (/)
│   ├── providers.tsx                 # Context providers wrapper
│   ├── globals.css                   # Global styles
│   ├── categories/
│   │   └── page.tsx                  # Categories management page
│   ├── provisions/
│   │   └── page.tsx                  # Provisions management page
│   ├── expenses/
│   │   └── page.tsx                  # Expenses management page
│   ├── reports/
│   │   └── page.tsx                  # Reports & analytics page
│   ├── login/
│   │   └── page.tsx                  # Authentication page
│   └── auth/
│       ├── callback/
│       │   └── route.ts              # OAuth callback handler
│       └── auth-code-error/
│           └── page.tsx              # Error page
│
├── components/                       # Reusable Components
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Navigation.tsx
│   │   ├── Toast.tsx
│   │   └── ToastManager.tsx
│   ├── AlertBanner.tsx               # Budget alert component
│   ├── FilterBar.tsx                 # Filtering interface
│   └── StatusBadge.tsx               # Status indicator
│
├── services/                         # API Service Layer
│   ├── categoryService.ts            # Category API client
│   ├── expenseService.ts             # Expense API client
│   ├── provisionService.ts           # Provision API client
│   └── reportService.ts              # Report API client
│
├── hooks/                            # Custom React Hooks
│   ├── useCategories.ts              # Category data fetching
│   └── useExecutiveSummary.ts        # Summary data fetching
│
├── lib/                              # Utilities & Configuration
│   ├── api.ts                        # Axios instance with auth
│   ├── utils.ts                      # Helper functions
│   ├── context/
│   │   └── ToastContext.tsx          # Toast notification context
│   ├── hooks/
│   │   └── useToast.ts               # Toast hook
│   ├── auth/                         # Auth utilities
│   └── supabase/
│       └── client.ts                 # Supabase client
│
├── types/                            # TypeScript Type Definitions
│   └── index.ts                      # All shared types
│
├── middleware.ts                     # Auth middleware
├── tailwind.config.ts                # Tailwind CSS configuration
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies
```

---

## Architecture Pattern

### Overall Architecture: Clean Architecture with DDD

The project implements **Clean Architecture** principles with **Domain-Driven Design (DDD)** patterns, organized into four concentric layers:

```
┌─────────────────────────────────────────┐
│     PRESENTATION LAYER (HTTP)           │
│  Controllers ← Routes ← HTTP Requests   │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│     APPLICATION LAYER (Use Cases)       │
│  Use Cases ← Validation ← Services      │
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│     DOMAIN LAYER (Business Rules)       │
│  Entities ← Repositories ← Value Objects│
└────────────────┬────────────────────────┘
                 │
┌─────────────────▼────────────────────────┐
│     INFRASTRUCTURE LAYER (External)     │
│  Database ← ORM ← Auth ← DI Container   │
└─────────────────────────────────────────┘
```

### Key Architectural Principles

**1. Dependency Inversion**
- Domain layer defines contracts (interfaces)
- Infrastructure layer implements those contracts
- Controllers depend on Use Cases, not on repositories

**2. Separation of Concerns**
- **Presentation Layer:** HTTP request/response handling only
- **Application Layer:** Orchestration and business logic
- **Domain Layer:** Pure business rules, independent of technology
- **Infrastructure Layer:** Database, authentication, external services

**3. Abstraction Layers**
```typescript
// Domain defines contract
interface ICategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  // ...
}

// Infrastructure implements it
class PrismaCategoryRepository implements ICategoryRepository {
  async create(data: CreateCategoryDTO): Promise<Category> { ... }
  // ...
}

// Can also implement with TypeORM or In-Memory
class TypeORMCategoryRepository implements ICategoryRepository { ... }
class InMemoryCategoryRepository implements ICategoryRepository { ... }
```

**4. Value Objects for Type Safety**
- `Money`: Handles monetary amounts with validation and arithmetic
- `Period`: Manages YYYY-MM period format with temporal navigation

---

## Core Components

### 1. Controllers (Presentation Layer)

**File:** `backend/src/presentation/controllers/`

Controllers handle HTTP requests and delegate to Use Cases. They:
- Extract data from HTTP requests
- Validate authentication via `AuthRequest`
- Call appropriate Use Cases
- Return HTTP responses

```typescript
// Example: CategoryController
export class CategoryController {
  async create(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    const useCase = DIContainer.getCreateCategoryUseCase();
    
    const categoryData = {
      ...req.body,
      userId: authReq.userId,  // From JWT token
    };
    
    const category = await useCase.execute(categoryData);
    res.status(201).json(category);
  }
}
```

**Available Controllers:**
- `CategoryController` - CRUD for budget categories
- `ExpenseController` - CRUD for expense records
- `ProvisionController` - CRUD for provisions (reserved budgets)
- `ReportController` - Complex reporting and analytics

### 2. Use Cases (Application Layer)

**File:** `backend/src/application/use-cases/`

Use Cases encapsulate business logic and orchestrate domain operations. Each use case follows the Single Responsibility Principle.

**Category Use Cases:**
- `CreateCategoryUseCase` - Validates and creates a budget category
- `GetCategoriesUseCase` - Retrieves user's categories with optional period filtering
- `GetCategoryByIdUseCase` - Fetches specific category
- `UpdateCategoryUseCase` - Updates category details
- `DeleteCategoryUseCase` - Removes a category

**Example Use Case Structure:**
```typescript
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryDTO): Promise<Category> {
    // 1. Validate input
    this.validateInput(input);
    
    // 2. Create value objects for domain validation
    const money = new Money(input.monthlyBudget);
    const period = new Period(input.period);
    
    // 3. Check business rules
    if (!money.isPositive()) {
      throw new Error('Monthly budget must be positive');
    }
    
    // 4. Persist via repository
    return await this.categoryRepository.create({...});
  }
  
  private validateInput(input: CreateCategoryDTO): void { ... }
}
```

Similar use cases exist for Expenses and Provisions.

### 3. Domain Entities

**File:** `backend/src/domain/entities/`

Domain entities represent core business concepts:

```typescript
// Category.ts
export interface Category {
  id: string;
  userId: string;
  name: string;
  period: string;        // YYYY-MM format
  monthlyBudget: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Expense.ts
export interface Expense {
  id: string;
  date: Date;
  description: string;
  categoryId: string;
  provisionId?: string;
  amount: number;        // Always negative (debit)
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

// Provision.ts
export interface Provision {
  id: string;
  item: string;
  categoryId: string;
  amount: number;        // Always negative
  usedAmount?: number;   // Calculated from associated expenses
  dueDate: Date;
  status: ProvisionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Value Objects (Domain Layer)

**File:** `backend/src/domain/value-objects/`

Value Objects are immutable objects that validate and encapsulate domain logic:

#### Money Value Object
```typescript
// Ensures proper monetary arithmetic
const budget = new Money(1000);
const spent = new Money(-250);

// Operations
const available = budget.add(spent);  // 750
const doubled = budget.multiply(2);   // 2000

// Validations
if (budget.isPositive()) { ... }
if (spent.isNegative()) { ... }
if (budget.lessThan(spent)) { ... }

// Type safety
const value: number = budget.value;  // 1000
const str: string = budget.toString(); // "1000.00"
```

#### Period Value Object
```typescript
// Manages YYYY-MM periods
const period = new Period("2025-01");

// Temporal navigation
const nextMonth = period.next();      // 2025-02
const prevMonth = period.previous();   // 2024-12

// Temporal queries
if (period.isCurrent()) { ... }
if (period.isInPast()) { ... }

// Range operations
const months = Period.range(
  new Period("2025-01"),
  new Period("2025-03")
);  // [2025-01, 2025-02, 2025-03]
```

### 5. Repository Pattern

**File:** `backend/src/domain/repositories/` & `backend/src/infrastructure/persistence/`

Repositories define contracts for data access and allow multiple implementations:

```typescript
// Domain interface (contract)
interface ICategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  findByUserIdAndPeriod(userId: string, period: string): Promise<Category[]>;
  update(id: string, data: UpdateCategoryDTO): Promise<Category>;
  delete(id: string): Promise<void>;
}

// Multiple implementations
class PrismaCategoryRepository implements ICategoryRepository { ... }
class TypeORMCategoryRepository implements ICategoryRepository { ... }
class InMemoryCategoryRepository implements ICategoryRepository { ... }
```

### 6. Mappers (Data Transformation)

**File:** `backend/src/infrastructure/persistence/prisma/mappers/`

Mappers convert between database and domain representations:

```typescript
export class CategoryMapper {
  // Prisma → Domain
  static toDomain(prismaCategory: CategoryEntity): Category {
    return {
      id: prismaCategory.id,
      userId: prismaCategory.userId,
      name: prismaCategory.name,
      period: prismaCategory.period,
      monthlyBudget: Money.fromDecimal(prismaCategory.monthlyBudget).value,
      notes: prismaCategory.notes || undefined,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    };
  }
  
  // Domain → Prisma
  static toPersistence(category: Category): Omit<CategoryEntity, 'createdAt' | 'updatedAt'> {
    return {
      id: category.id,
      userId: category.userId,
      name: category.name,
      period: category.period,
      monthlyBudget: category.monthlyBudget as any,
      notes: category.notes || null,
    };
  }
}
```

### 7. Dependency Injection Container

**File:** `backend/src/infrastructure/di/container.ts`

The DIContainer manages all dependencies and allows ORM switching:

```typescript
export class DIContainer {
  private static currentORM: 'prisma' | 'typeorm' = 'prisma';
  
  // Switch ORMs at runtime
  static setORM(orm: 'prisma' | 'typeorm'): void {
    DIContainer.currentORM = orm;
  }
  
  // Get use cases with dependencies injected
  static getCreateCategoryUseCase(
    categoryRepository?: ICategoryRepository
  ): CreateCategoryUseCase {
    const repo = categoryRepository || DIContainer.getCategoryRepository();
    return new CreateCategoryUseCase(repo);
  }
  
  // Get repository (swaps implementation based on currentORM)
  private static getCategoryRepository(): ICategoryRepository {
    if (DIContainer.currentORM === 'typeorm') {
      return new TypeORMCategoryRepository();
    } else {
      return new PrismaCategoryRepository();
    }
  }
}
```

### 8. Validation Service

**File:** `backend/src/application/services/ValidationService.ts`

Centralized validation logic for all use cases:

```typescript
export class ValidationService {
  // Field validations
  static validateNonEmptyString(value: string, fieldName: string): void { ... }
  static validateMaxLength(value: string, maxLength: number, fieldName: string): void { ... }
  
  // Domain validations
  static validatePeriodFormat(period: string, fieldName: string): void { ... }
  static validateMonthlyBudget(amount: number, fieldName: string): void { ... }
  static validateExpenseAmount(amount: number, fieldName: string): void { ... }
  
  // Error collection
  static collectErrors(validations: Array<() => void>): ValidationError[] { ... }
  static throwIfErrors(errors: ValidationError[]): void { ... }
}
```

---

## Data Models & Relationships

### Database Schema (Prisma)

```prisma
// User (from Supabase Auth)
model User {
  id    String  @id @default(uuid())
  email String  @unique
  name  String?
  
  categories Category[]
}

// Budget Category
model Category {
  id             String    @id @default(uuid())
  userId         String    @map("user_id")
  name           String
  period         String    // YYYY-MM
  monthlyBudget  Decimal   @db.Decimal(10, 2)
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  provisions Provision[]
  expenses   Expense[]
  
  @@unique([userId, name, period])
  @@index([userId])
  @@index([period])
}

// Reserved Budget (Provision)
model Provision {
  id         String    @id @default(uuid())
  item       String
  categoryId String    @map("category_id")
  amount     Decimal   @db.Decimal(10, 2)  // Always negative
  dueDate    DateTime  @map("due_date")
  status     ProvisionStatus @default(OPEN)
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  expenses Expense[]
  
  @@index([categoryId])
  @@index([status])
  @@index([categoryId, status])
  @@index([dueDate])
}

// Expense Record
model Expense {
  id            String    @id @default(uuid())
  date          DateTime
  description   String
  categoryId    String    @map("category_id")
  provisionId   String?   @map("provision_id")
  amount        Decimal   @db.Decimal(10, 2)  // Always negative
  paymentMethod PaymentMethod @default(CASH)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  category   Category   @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  provision  Provision? @relation(fields: [provisionId], references: [id], onDelete: SetNull)
  
  @@index([categoryId])
  @@index([provisionId])
  @@index([date])
  @@index([categoryId, date])
}

// Enums
enum ProvisionStatus {
  OPEN
  CLOSED
}

enum PaymentMethod {
  CASH
  TRANSFER
  CARD
  OTHER
}
```

### Entity Relationships

```
User (1) ────── (Many) Categories
              ├── (Many) Provisions
              └── (Many) Expenses

Category (1) ────── (Many) Provisions
          └── (Many) Expenses

Provision (1) ────── (Many) Expenses
```

### Data Flow Example: Creating an Expense

```
1. Frontend (POST /api/expenses)
   └── Sends: { amount, description, categoryId, provisionId? }

2. Backend AuthMiddleware
   └── Validates JWT token, extracts userId

3. ExpenseController.create()
   └── Extracts expense data from request

4. CreateExpenseUseCase.execute()
   └── Validates input via ValidationService
   └── Verifies category exists
   └── Converts positive amount to negative (debit)
   └── Creates Money value object
   └── Calls expenseRepository.create()

5. PrismaExpenseRepository.create()
   └── Creates expense record via Prisma
   └── Returns Prisma expense model

6. ExpenseMapper.toDomain()
   └── Converts Prisma model to domain entity

7. Response
   └── Returns: { id, date, description, categoryId, amount, ... }
```

---

## API Structure & Endpoints

### Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://api.example.com/api`

### Authentication
All API endpoints (except `/health`) require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Public Endpoints

#### Health Check
```
GET /health
Response: { status: "ok", message: "..." }
```

### Category Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/categories` | Create category | ✅ |
| GET | `/api/categories` | List categories (optional: ?period=YYYY-MM) | ✅ |
| GET | `/api/categories/:id` | Get category by ID | ✅ |
| PUT | `/api/categories/:id` | Update category | ✅ |
| DELETE | `/api/categories/:id` | Delete category | ✅ |

### Expense Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/expenses` | Create expense | ✅ |
| GET | `/api/expenses` | List all expenses | ✅ |
| GET | `/api/expenses/:id` | Get expense by ID | ✅ |
| PUT | `/api/expenses/:id` | Update expense | ✅ |
| DELETE | `/api/expenses/:id` | Delete expense | ✅ |

### Provision Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/provisions` | Create provision | ✅ |
| GET | `/api/provisions` | List all provisions | ✅ |
| GET | `/api/provisions/:id` | Get provision by ID | ✅ |
| PUT | `/api/provisions/:id` | Update provision | ✅ |
| DELETE | `/api/provisions/:id` | Delete provision | ✅ |

### Report Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/reports/executive-summary` | Get dashboard summary | ✅ |
| GET | `/api/reports/executive-summary/:categoryId` | Category summary | ✅ |
| GET | `/api/reports/category/:categoryId/detail?period=YYYY-MM` | Detailed category report | ✅ |
| GET | `/api/reports/period-comparison?periods=YYYY-MM,YYYY-MM` | Compare periods | ✅ |
| GET | `/api/reports/payment-methods?period=YYYY-MM` | Payment method breakdown | ✅ |
| GET | `/api/reports/provisions/fulfillment?period=YYYY-MM` | Provision metrics | ✅ |

### Request/Response Examples

**Create Category**
```typescript
// Request
POST /api/categories
Authorization: Bearer <TOKEN>
{
  "name": "Groceries",
  "period": "2025-01",
  "monthlyBudget": 500.00,
  "notes": "Weekly shopping budget"
}

// Response (201 Created)
{
  "id": "uuid-123",
  "userId": "user-456",
  "name": "Groceries",
  "period": "2025-01",
  "monthlyBudget": 500.00,
  "notes": "Weekly shopping budget",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Create Expense**
```typescript
// Request
POST /api/expenses
Authorization: Bearer <TOKEN>
{
  "date": "2025-01-15",
  "description": "Walmart grocery purchase",
  "categoryId": "cat-123",
  "provisionId": "prov-456",
  "amount": 75.50,  // Positive (converted to negative internally)
  "paymentMethod": "CARD"
}

// Response (201 Created)
{
  "id": "exp-789",
  "date": "2025-01-15T00:00:00Z",
  "description": "Walmart grocery purchase",
  "categoryId": "cat-123",
  "provisionId": "prov-456",
  "amount": -75.50,  // Negative (debit)
  "paymentMethod": "CARD",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Get Executive Summary**
```typescript
// Request
GET /api/reports/executive-summary

// Response
[
  {
    "categoryId": "cat-123",
    "categoryName": "Groceries",
    "period": "2025-01",
    "monthlyBudget": 500.00,
    "monthlySpent": -245.75,
    "monthlyOpenProvisions": -150.00,
    "monthlyAvailable": 104.25,
    "semesterBudget": 3000.00,
    "semesterSpent": -1200.00,
    "semesterGrossAvailable": 1800.00,
    "semesterProvision": -450.00,
    "semesterRealAvailable": 1350.00
  },
  ...
]
```

---

## Configuration & Environment

### Environment Variables

**Backend `.env` (required)**
```env
# Application
PORT=3000
NODE_ENV=development

# Database (choose one)
DATABASE_URL="postgresql://postgres:postgres@db:5432/budget_management?schema=public"
DIRECT_URL="postgresql://postgres:postgres@db:5432/budget_management?schema=public"

# Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Optional
LOG_LEVEL=debug
CORS_ORIGINS=http://localhost:3001,https://example.com
```

**Frontend `.env.local` (required)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Configuration Options

**Option 1: Docker PostgreSQL (Development)**
```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/budget_management?schema=public"
```

**Option 2: Supabase (Production)**
```env
DATABASE_URL="postgresql://postgres.xxxx:yyyy@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public&connection_limit=10&pool_timeout=20"
DIRECT_URL="postgresql://postgres.xxxx:yyyy@aws-1-us-east-1.pooler.supabase.com:5432/postgres?schema=public"
```

**Option 3: Local PostgreSQL**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/budget_management?schema=public"
```

### Docker Configuration

**docker-compose.yml Structure**
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL
      - NODE_ENV
    depends_on: []  # No local DB dependency if using Supabase
    
  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL
    depends_on:
      - backend
```

### TypeScript Configuration

**Backend tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**Frontend tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "dom", "dom.iterable"],
    "jsx": "react-jsx",
    "strict": true
  }
}
```

---

## Key Design Patterns

### 1. Repository Pattern
Abstracts data persistence, allowing multiple ORM implementations.

### 2. Use Case / Interactor Pattern
Encapsulates business logic independently of frameworks.

### 3. Dependency Injection
Loose coupling via inversify container and manual factory methods.

### 4. Value Object Pattern
Immutable, self-validating objects for domain concepts (Money, Period).

### 5. Mapper Pattern
Separates database models from domain models.

### 6. Service Layer Pattern
ValidationService centralizes cross-cutting validation logic.

### 7. Factory Pattern
DIContainer acts as a factory for creating use cases with dependencies.

### 8. Middleware Pattern
Express middleware for authentication and request processing.

---

## Authentication & Security

### Authentication Flow

```
1. User logs in via Supabase Auth UI
   ├── Email/password or OAuth
   └── Supabase returns JWT token

2. Token stored in secure HTTP-only cookie (SSR)

3. Frontend includes token in API requests
   └── Request interceptor adds: Authorization: Bearer <TOKEN>

4. Backend AuthMiddleware validates token
   ├── Extracts userId from JWT payload
   ├── Auto-provisions user in database if new
   └── Adds userId to request for controllers

5. Controllers enforce ownership
   ├── Verify resource belongs to authenticated user
   └── Return 403 Forbidden if not owner
```

### Security Features

**Backend (src/infrastructure/middleware/authMiddleware.ts)**
- JWT token validation via Supabase
- User auto-provisioning in database
- CORS validation
- Authorization header checking
- 401/403 error responses

**Frontend (middleware.ts)**
- Route protection via middleware
- Automatic redirect to login for unauthenticated users
- Refresh token handling
- Cookie management (SSR)

**CORS Configuration**
```typescript
const corsOptions = {
  origin: [
    'http://localhost:3001',
    'https://budget-manager.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

---

## Frontend Architecture

### Next.js 15 App Router Structure

**Route Organization**
```
app/
├── page.tsx              # Dashboard (index)
├── layout.tsx            # Root layout
├── providers.tsx         # Context providers
├── globals.css           # Global styles
├── categories/
│   └── page.tsx         # /categories
├── expenses/
│   └── page.tsx         # /expenses
├── provisions/
│   └── page.tsx         # /provisions
├── reports/
│   └── page.tsx         # /reports
├── login/
│   └── page.tsx         # /login
└── auth/
    ├── callback/        # OAuth callback
    └── auth-code-error/ # Error page
```

### Frontend State Management

**Context API**
- `ToastContext`: Notification management

**React Query (TanStack)**
- Server state caching
- Background refetching
- Request deduplication

**Component State**
- useState for local UI state (forms, filters)
- useEffect for data fetching

### Service Layer

Each service wraps API calls with axios:

```typescript
// categoryService.ts
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  
  async create(data: CreateCategoryDTO): Promise<Category> {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },
};
```

### API Client Interceptors

```typescript
// lib/api.ts - Request Interceptor
api.interceptors.request.use(async (config) => {
  const session = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Component Hierarchy

**Layout Structure**
```
RootLayout
├── Navigation (persistent header)
└── Main Content
    ├── Dashboard Page
    ├── Categories Page
    ├── Expenses Page
    ├── Provisions Page
    ├── Reports Page
    └── Login Page
```

**UI Components**
- Button, Card, Input, Select (primitives)
- Navigation (header with links)
- ToastManager (notification system)
- StatusBadge (status indicators)
- FilterBar (filtering interface)
- AlertBanner (budget alerts)

---

## Backend Architecture

### Request Processing Pipeline

```
Express Request
  ↓
CORS Middleware
  ↓
Compression Middleware
  ↓
JSON Body Parser
  ↓
Auth Middleware (routes /api/*)
  ├── Extract Bearer token
  ├── Verify via Supabase
  ├── Extract userId
  └── Auto-provision user
  ↓
Route Handler
  ├── Route Resolver (categoryRoutes, expenseRoutes, etc.)
  └── Controller Method
      ↓
      Dependency Injection Container
        ├── Get repository
        └── Create use case
      ↓
      Use Case.execute()
        ├── Validate input
        ├── Check business rules
        └── Persist via repository
      ↓
      Response
```

### ORM Switching Capability

The architecture allows runtime ORM switching:

```typescript
// Switch to TypeORM
DIContainer.setORM('typeorm');

// All subsequent requests use TypeORM repositories
const createCategoryUC = DIContainer.getCreateCategoryUseCase();
// ↓ Uses TypeORMCategoryRepository

// Switch back to Prisma
DIContainer.setORM('prisma');

// All subsequent requests use Prisma repositories
const createCategoryUC = DIContainer.getCreateCategoryUseCase();
// ↓ Uses PrismaCategoryRepository
```

### Database Query Optimization

**Prisma Configuration**
- Query logging in development
- Slow query warnings (> 200ms)
- Connection pooling with Supabase PgBouncer
- Strategic indexes on frequently queried fields

```typescript
// Infrastructure optimizations
// Database indices on:
- Category: userId, period
- Expense: categoryId, date, categoryId+date
- Provision: categoryId, status, dueDate, categoryId+status
```

---

## Data Flow Diagrams

### Create Expense Flow

```
┌─────────────────────────────────────┐
│ Frontend                            │
│ POST /api/expenses                  │
│ { description, amount, categoryId } │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Backend: Express Request Handler        │
│ ├─ CORS Middleware ✓                   │
│ ├─ Compression Middleware ✓             │
│ └─ JSON Parser ✓                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Auth Middleware                         │
│ ├─ Extract Bearer token ✓              │
│ ├─ Verify via Supabase ✓               │
│ └─ Set userId = "user-456" ✓           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Route Handler (expenseRoutes)           │
│ ├─ Match POST /expenses                │
│ └─ Call controller.create()             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ ExpenseController.create()              │
│ ├─ Get authReq.userId                  │
│ ├─ Get CreateExpenseUseCase from DI    │
│ └─ Call useCase.execute(data)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ CreateExpenseUseCase.execute()          │
│ ├─ Validate input                       │
│ │  ├─ description non-empty ✓          │
│ │  ├─ amount positive ✓                │
│ │  └─ categoryId valid UUID ✓          │
│ ├─ Create Money value object ✓         │
│ ├─ Verify category exists ✓            │
│ ├─ Convert to negative debit ✓         │
│ └─ Call repository.create()             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ PrismaExpenseRepository.create()        │
│ ├─ Call prisma.expense.create() ✓      │
│ └─ Return Prisma model                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ ExpenseMapper.toDomain()                │
│ ├─ Convert Prisma → Domain             │
│ └─ Return domain Expense entity         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Response                                │
│ 201 Created                             │
│ {                                       │
│   "id": "exp-789",                      │
│   "description": "...",                 │
│   "amount": -75.50,                     │
│   ...                                   │
│ }                                       │
└─────────────────────────────────────────┘
```

---

## Performance Optimizations

### Database

**Indices Strategy**
```prisma
// Fast user lookups
@@index([userId])

// Fast period filtering
@@index([period])

// Fast category queries
@@index([categoryId])

// Fast status filtering
@@index([status])

// Combined queries
@@index([categoryId, status])
@@index([categoryId, date])
```

**Query Optimization**
- Connection pooling (Supabase PgBouncer)
- Pagination support (ready for implementation)
- Select specific fields (avoid SELECT *)
- Lazy loading relationships

### HTTP

**Response Compression**
```typescript
// Express compression middleware
app.use(compression({
  level: 6,  // Balance between ratio and speed
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));
```

**CORS Optimization**
- Whitelist only needed origins
- HTTP caching headers (via CDN)
- Conditional requests (ETags)

### Frontend

**Next.js Optimizations**
- App Router (server components by default)
- Code splitting per route
- Image optimization
- CSS minification with Tailwind
- Tree-shaking unused code

**Client State**
- React Query caching
- Request deduplication
- Background refetching
- Suspense boundaries

---

## Summary

### Architectural Strengths

1. **Clean Separation** - Domain logic independent of frameworks
2. **Testability** - Can test use cases without database
3. **ORM Agnostic** - Swap Prisma for TypeORM without changing business logic
4. **Type Safety** - Full TypeScript coverage
5. **Validation** - Centralized, reusable validation
6. **Security** - JWT authentication, user ownership checks
7. **Extensibility** - Easy to add new features following patterns
8. **Documentation** - Well-documented with comments and architectural docs

### Key Metrics

- **Backend Files:** 75+ TypeScript files
- **Frontend Files:** 30+ React components
- **Database Models:** 5 core entities
- **API Endpoints:** 25+ REST endpoints
- **Use Cases:** 15+ business logic operations
- **Repository Implementations:** 3 per entity (Prisma, TypeORM, In-Memory)

### Technology Decisions Rationale

| Technology | Why Chosen | Alternatives Considered |
|-----------|-----------|----------------------|
| TypeScript | Type safety across full stack | JavaScript, Flow |
| Express.js | Minimal, flexible, fast setup | NestJS, Fastify |
| Prisma | Developer experience, type safety | TypeORM, Sequelize |
| Next.js 15 | Full-stack React, SSR, App Router | Remix, SvelteKit |
| Tailwind CSS | Utility-first, JIT compilation | Material-UI, Bootstrap |
| Supabase | PostgreSQL + Auth + real-time | Firebase, Auth0 |
| React Query | Server state management | SWR, Apollo Client |

---

**End of Analysis**

