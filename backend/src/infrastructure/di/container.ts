import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// ===== Repository Interfaces =====
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { IProvisionRepository } from '../../domain/repositories/IProvisionRepository';
import { IReportRepository } from '../../domain/repositories/IReportRepository';

// ===== Repository Implementations (Prisma) =====
import { PrismaCategoryRepository } from '../persistence/prisma/repositories/PrismaCategoryRepository';
import { PrismaExpenseRepository } from '../persistence/prisma/repositories/PrismaExpenseRepository';
import { PrismaProvisionRepository } from '../persistence/prisma/repositories/PrismaProvisionRepository';
import { PrismaReportRepository } from '../persistence/prisma/repositories/PrismaReportRepository';

// ===== Repository Implementations (TypeORM) =====
import { TypeORMCategoryRepository } from '../persistence/typeorm/repositories/TypeORMCategoryRepository';
import { TypeORMExpenseRepository } from '../persistence/typeorm/repositories/TypeORMExpenseRepository';
import { TypeORMProvisionRepository } from '../persistence/typeorm/repositories/TypeORMProvisionRepository';

// ===== Category Use Cases =====
import {
  CreateCategoryUseCase,
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
} from '../../application/use-cases/categories';

// ===== Expense Use Cases =====
import {
  CreateExpenseUseCase,
  GetExpensesUseCase,
  GetExpenseByIdUseCase,
  UpdateExpenseUseCase,
  DeleteExpenseUseCase,
} from '../../application/use-cases/expenses';

// ===== Provision Use Cases =====
import {
  CreateProvisionUseCase,
  GetProvisionsUseCase,
  GetProvisionByIdUseCase,
  UpdateProvisionUseCase,
  DeleteProvisionUseCase,
} from '../../application/use-cases/provisions';

/**
 * DIContainer
 *
 * Configures and manages all dependency injection.
 *
 * Structure:
 * 1. Register repositories (interfaces bound to implementations)
 * 2. Register use cases (with their repository dependencies)
 * 3. Provide factory methods to get use cases
 *
 * This enables:
 * - Loose coupling between layers
 * - Easy swapping of implementations (e.g., Prisma → TypeORM)
 * - Testability via mock repositories
 * - Centralized configuration
 *
 * ORM Support:
 * - Default: Prisma (currently active)
 * - Alternative: TypeORM (demonstrating ORM agnosticism)
 * - Switch ORMs: Use setORM('prisma' | 'typeorm')
 */
export class DIContainer {
  private static instance: Container;
  private static currentORM: 'prisma' | 'typeorm' = 'prisma';

  /**
   * Set which ORM to use (Prisma or TypeORM)
   * Note: Must be called before first repository instantiation
   */
  static setORM(orm: 'prisma' | 'typeorm'): void {
    DIContainer.currentORM = orm;
    // Reset repositories to force re-initialization with new ORM
    DIContainer.categoryRepository = null;
    DIContainer.expenseRepository = null;
    DIContainer.provisionRepository = null;
    console.log(`[DIContainer] Switched to ${orm} ORM`);
  }

  /**
   * Get current ORM being used
   */
  static getORM(): 'prisma' | 'typeorm' {
    return DIContainer.currentORM;
  }

  /**
   * Get the singleton container instance
   */
  static getInstance(): Container {
    if (!DIContainer.instance) {
      DIContainer.instance = DIContainer.createContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Create a new container with all bindings
   */
  private static createContainer(): Container {
    const container = new Container();

    // ===== Register Repositories =====
    DIContainer.registerRepositories(container);

    // ===== Register Category Use Cases =====
    DIContainer.registerCategoryUseCases(container);

    // ===== Register Expense Use Cases =====
    DIContainer.registerExpenseUseCases(container);

    // ===== Register Provision Use Cases =====
    DIContainer.registerProvisionUseCases(container);

    return container;
  }

  /**
   * Register all repository implementations
   */
  private static registerRepositories(container: Container): void {
    // Note: These are placeholders. Real implementations would be:
    // container
    //   .bind<ICategoryRepository>(TYPES.CategoryRepository)
    //   .to(PrismaCategoryRepository)
    //   .inSingletonScope();
    //
    // For now, we're showing the structure. The repositories need
    // to be created and would use PrismaClient injected.
  }

  /**
   * Register all category use cases
   */
  private static registerCategoryUseCases(container: Container): void {
    // Bind use cases
    // container
    //   .bind(TYPES.CreateCategoryUseCase)
    //   .toConstantValue(new CreateCategoryUseCase(repository));
    //
    // Similar for other use cases...
    //
    // The pattern is:
    // 1. Resolve the repository from the container
    // 2. Create the use case with the repository injected
    // 3. Bind the use case
  }

  /**
   * Register all expense use cases
   */
  private static registerExpenseUseCases(container: Container): void {
    // Similar to category use cases
  }

  /**
   * Register all provision use cases
   */
  private static registerProvisionUseCases(container: Container): void {
    // Similar to category use cases
  }

  // ===== Use Case Getters =====
  // These methods provide type-safe access to use cases

  // ===== Singleton Instances =====
  private static categoryRepository: ICategoryRepository | null = null;
  private static expenseRepository: IExpenseRepository | null = null;
  private static provisionRepository: IProvisionRepository | null = null;
  private static reportRepository: IReportRepository | null = null;

  /**
   * Get the singleton category repository (Prisma or TypeORM implementation)
   */
  private static getCategoryRepository(): ICategoryRepository {
    if (!DIContainer.categoryRepository) {
      if (DIContainer.currentORM === 'typeorm') {
        DIContainer.categoryRepository = new TypeORMCategoryRepository();
      } else {
        DIContainer.categoryRepository = new PrismaCategoryRepository();
      }
    }
    return DIContainer.categoryRepository as ICategoryRepository;
  }

  /**
   * Get the singleton expense repository (Prisma or TypeORM implementation)
   */
  private static getExpenseRepository(): IExpenseRepository {
    if (!DIContainer.expenseRepository) {
      if (DIContainer.currentORM === 'typeorm') {
        DIContainer.expenseRepository = new TypeORMExpenseRepository();
      } else {
        DIContainer.expenseRepository = new PrismaExpenseRepository();
      }
    }
    return DIContainer.expenseRepository;
  }

  /**
   * Get the singleton provision repository (Prisma or TypeORM implementation)
   */
  private static getProvisionRepository(): IProvisionRepository {
    if (!DIContainer.provisionRepository) {
      if (DIContainer.currentORM === 'typeorm') {
        DIContainer.provisionRepository = new TypeORMProvisionRepository();
      } else {
        DIContainer.provisionRepository = new PrismaProvisionRepository();
      }
    }
    return DIContainer.provisionRepository;
  }

  /**
   * Get the category repository directly (for internal use in controllers)
   */
  static getCategoryRepositoryInstance(): ICategoryRepository {
    return DIContainer.getCategoryRepository();
  }

  /**
   * Get the expense repository directly (for internal use in controllers)
   */
  static getExpenseRepositoryInstance(): IExpenseRepository {
    return DIContainer.getExpenseRepository();
  }

  /**
   * Get the provision repository directly (for internal use in controllers)
   */
  static getProvisionRepositoryInstance(): IProvisionRepository {
    return DIContainer.getProvisionRepository();
  }

  /**
   * Get the singleton report repository (Prisma implementation)
   */
  private static getReportRepository(): IReportRepository {
    if (!DIContainer.reportRepository) {
      DIContainer.reportRepository = new PrismaReportRepository();
    }
    return DIContainer.reportRepository;
  }

  /**
   * Get the report repository directly (for internal use in controllers)
   */
  static getReportRepositoryInstance(): IReportRepository {
    return DIContainer.getReportRepository();
  }

  /**
   * Get CreateCategoryUseCase instance
   */
  static getCreateCategoryUseCase(
    categoryRepository?: ICategoryRepository
  ): CreateCategoryUseCase {
    const repo = categoryRepository || DIContainer.getCategoryRepository();
    return new CreateCategoryUseCase(repo);
  }

  /**
   * Get GetCategoriesUseCase instance
   */
  static getGetCategoriesUseCase(
    categoryRepository?: ICategoryRepository
  ): GetCategoriesUseCase {
    const repo = categoryRepository || DIContainer.getCategoryRepository();
    return new GetCategoriesUseCase(repo);
  }

  /**
   * Get GetCategoryByIdUseCase instance
   */
  static getGetCategoryByIdUseCase(
    categoryRepository?: ICategoryRepository
  ): GetCategoryByIdUseCase {
    const repo = categoryRepository || DIContainer.getCategoryRepository();
    return new GetCategoryByIdUseCase(repo);
  }

  /**
   * Get UpdateCategoryUseCase instance
   */
  static getUpdateCategoryUseCase(
    categoryRepository?: ICategoryRepository
  ): UpdateCategoryUseCase {
    const repo = categoryRepository || DIContainer.getCategoryRepository();
    return new UpdateCategoryUseCase(repo);
  }

  /**
   * Get DeleteCategoryUseCase instance
   */
  static getDeleteCategoryUseCase(
    categoryRepository?: ICategoryRepository
  ): DeleteCategoryUseCase {
    const repo = categoryRepository || DIContainer.getCategoryRepository();
    return new DeleteCategoryUseCase(repo);
  }

  /**
   * Get CreateExpenseUseCase instance
   */
  static getCreateExpenseUseCase(
    expenseRepository?: IExpenseRepository,
    categoryRepository?: ICategoryRepository
  ): CreateExpenseUseCase {
    const expRepo = expenseRepository || DIContainer.getExpenseRepository();
    const catRepo = categoryRepository || DIContainer.getCategoryRepository();
    return new CreateExpenseUseCase(expRepo, catRepo);
  }

  /**
   * Get GetExpensesUseCase instance
   */
  static getGetExpensesUseCase(
    expenseRepository?: IExpenseRepository
  ): GetExpensesUseCase {
    const repo = expenseRepository || DIContainer.getExpenseRepository();
    return new GetExpensesUseCase(repo);
  }

  /**
   * Get GetExpenseByIdUseCase instance
   */
  static getGetExpenseByIdUseCase(
    expenseRepository?: IExpenseRepository
  ): GetExpenseByIdUseCase {
    const repo = expenseRepository || DIContainer.getExpenseRepository();
    return new GetExpenseByIdUseCase(repo);
  }

  /**
   * Get UpdateExpenseUseCase instance
   */
  static getUpdateExpenseUseCase(
    expenseRepository?: IExpenseRepository,
    categoryRepository?: ICategoryRepository
  ): UpdateExpenseUseCase {
    const expRepo = expenseRepository || DIContainer.getExpenseRepository();
    const catRepo = categoryRepository || DIContainer.getCategoryRepository();
    return new UpdateExpenseUseCase(expRepo, catRepo);
  }

  /**
   * Get DeleteExpenseUseCase instance
   */
  static getDeleteExpenseUseCase(
    expenseRepository?: IExpenseRepository
  ): DeleteExpenseUseCase {
    const repo = expenseRepository || DIContainer.getExpenseRepository();
    return new DeleteExpenseUseCase(repo);
  }

  /**
   * Get CreateProvisionUseCase instance
   */
  static getCreateProvisionUseCase(
    provisionRepository?: IProvisionRepository,
    categoryRepository?: ICategoryRepository
  ): CreateProvisionUseCase {
    const provRepo = provisionRepository || DIContainer.getProvisionRepository();
    const catRepo = categoryRepository || DIContainer.getCategoryRepository();
    return new CreateProvisionUseCase(provRepo, catRepo);
  }

  /**
   * Get GetProvisionsUseCase instance
   */
  static getGetProvisionsUseCase(
    provisionRepository?: IProvisionRepository
  ): GetProvisionsUseCase {
    const repo = provisionRepository || DIContainer.getProvisionRepository();
    return new GetProvisionsUseCase(repo);
  }

  /**
   * Get GetProvisionByIdUseCase instance
   */
  static getGetProvisionByIdUseCase(
    provisionRepository?: IProvisionRepository
  ): GetProvisionByIdUseCase {
    const repo = provisionRepository || DIContainer.getProvisionRepository();
    return new GetProvisionByIdUseCase(repo);
  }

  /**
   * Get UpdateProvisionUseCase instance
   */
  static getUpdateProvisionUseCase(
    provisionRepository?: IProvisionRepository
  ): UpdateProvisionUseCase {
    const repo = provisionRepository || DIContainer.getProvisionRepository();
    return new UpdateProvisionUseCase(repo);
  }

  /**
   * Get DeleteProvisionUseCase instance
   */
  static getDeleteProvisionUseCase(
    provisionRepository?: IProvisionRepository
  ): DeleteProvisionUseCase {
    const repo = provisionRepository || DIContainer.getProvisionRepository();
    return new DeleteProvisionUseCase(repo);
  }
}

export { TYPES };
