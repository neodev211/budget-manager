import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// ===== Repository Interfaces =====
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { IProvisionRepository } from '../../domain/repositories/IProvisionRepository';

// ===== Repository Implementations (Prisma) =====
// Note: These will be created in Phase 5 when we implement controllers
// They will use PrismaClient and mappers created in Phase 2
// import { PrismaCategoryRepository } from '../persistence/prisma/repositories/PrismaCategoryRepository';
// import { PrismaExpenseRepository } from '../persistence/prisma/repositories/PrismaExpenseRepository';
// import { PrismaProvisionRepository } from '../persistence/prisma/repositories/PrismaProvisionRepository';

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
 */
export class DIContainer {
  private static instance: Container;

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

  /**
   * Get CreateCategoryUseCase instance
   */
  static getCreateCategoryUseCase(
    categoryRepository: ICategoryRepository
  ): CreateCategoryUseCase {
    return new CreateCategoryUseCase(categoryRepository);
  }

  /**
   * Get GetCategoriesUseCase instance
   */
  static getGetCategoriesUseCase(
    categoryRepository: ICategoryRepository
  ): GetCategoriesUseCase {
    return new GetCategoriesUseCase(categoryRepository);
  }

  /**
   * Get GetCategoryByIdUseCase instance
   */
  static getGetCategoryByIdUseCase(
    categoryRepository: ICategoryRepository
  ): GetCategoryByIdUseCase {
    return new GetCategoryByIdUseCase(categoryRepository);
  }

  /**
   * Get UpdateCategoryUseCase instance
   */
  static getUpdateCategoryUseCase(
    categoryRepository: ICategoryRepository
  ): UpdateCategoryUseCase {
    return new UpdateCategoryUseCase(categoryRepository);
  }

  /**
   * Get DeleteCategoryUseCase instance
   */
  static getDeleteCategoryUseCase(
    categoryRepository: ICategoryRepository
  ): DeleteCategoryUseCase {
    return new DeleteCategoryUseCase(categoryRepository);
  }

  /**
   * Get CreateExpenseUseCase instance
   */
  static getCreateExpenseUseCase(
    expenseRepository: IExpenseRepository,
    categoryRepository: ICategoryRepository
  ): CreateExpenseUseCase {
    return new CreateExpenseUseCase(expenseRepository, categoryRepository);
  }

  /**
   * Get GetExpensesUseCase instance
   */
  static getGetExpensesUseCase(
    expenseRepository: IExpenseRepository
  ): GetExpensesUseCase {
    return new GetExpensesUseCase(expenseRepository);
  }

  /**
   * Get GetExpenseByIdUseCase instance
   */
  static getGetExpenseByIdUseCase(
    expenseRepository: IExpenseRepository
  ): GetExpenseByIdUseCase {
    return new GetExpenseByIdUseCase(expenseRepository);
  }

  /**
   * Get UpdateExpenseUseCase instance
   */
  static getUpdateExpenseUseCase(
    expenseRepository: IExpenseRepository,
    categoryRepository: ICategoryRepository
  ): UpdateExpenseUseCase {
    return new UpdateExpenseUseCase(expenseRepository, categoryRepository);
  }

  /**
   * Get DeleteExpenseUseCase instance
   */
  static getDeleteExpenseUseCase(
    expenseRepository: IExpenseRepository
  ): DeleteExpenseUseCase {
    return new DeleteExpenseUseCase(expenseRepository);
  }

  /**
   * Get CreateProvisionUseCase instance
   */
  static getCreateProvisionUseCase(
    provisionRepository: IProvisionRepository,
    categoryRepository: ICategoryRepository
  ): CreateProvisionUseCase {
    return new CreateProvisionUseCase(provisionRepository, categoryRepository);
  }

  /**
   * Get GetProvisionsUseCase instance
   */
  static getGetProvisionsUseCase(
    provisionRepository: IProvisionRepository
  ): GetProvisionsUseCase {
    return new GetProvisionsUseCase(provisionRepository);
  }

  /**
   * Get GetProvisionByIdUseCase instance
   */
  static getGetProvisionByIdUseCase(
    provisionRepository: IProvisionRepository
  ): GetProvisionByIdUseCase {
    return new GetProvisionByIdUseCase(provisionRepository);
  }

  /**
   * Get UpdateProvisionUseCase instance
   */
  static getUpdateProvisionUseCase(
    provisionRepository: IProvisionRepository
  ): UpdateProvisionUseCase {
    return new UpdateProvisionUseCase(provisionRepository);
  }

  /**
   * Get DeleteProvisionUseCase instance
   */
  static getDeleteProvisionUseCase(
    provisionRepository: IProvisionRepository
  ): DeleteProvisionUseCase {
    return new DeleteProvisionUseCase(provisionRepository);
  }
}

export { TYPES };
