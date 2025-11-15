import { DIContainer, TYPES } from '../../../src/infrastructure/di';
import { InMemoryCategoryRepository } from '../../../src/infrastructure/persistence/in-memory/InMemoryCategoryRepository';
import { InMemoryExpenseRepository } from '../../../src/infrastructure/persistence/in-memory/InMemoryExpenseRepository';
import { InMemoryProvisionRepository } from '../../../src/infrastructure/persistence/in-memory/InMemoryProvisionRepository';
import {
  CreateCategoryUseCase,
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
} from '../../../src/application/use-cases/categories';
import {
  CreateExpenseUseCase,
  GetExpensesUseCase,
  GetExpenseByIdUseCase,
  UpdateExpenseUseCase,
  DeleteExpenseUseCase,
} from '../../../src/application/use-cases/expenses';
import {
  CreateProvisionUseCase,
  GetProvisionsUseCase,
  GetProvisionByIdUseCase,
  UpdateProvisionUseCase,
  DeleteProvisionUseCase,
} from '../../../src/application/use-cases/provisions';

describe('DIContainer', () => {
  describe('TYPES', () => {
    it('should have all repository symbols', () => {
      expect(TYPES.CategoryRepository).toBeDefined();
      expect(TYPES.ExpenseRepository).toBeDefined();
      expect(TYPES.ProvisionRepository).toBeDefined();
    });

    it('should have all category use case symbols', () => {
      expect(TYPES.CreateCategoryUseCase).toBeDefined();
      expect(TYPES.GetCategoriesUseCase).toBeDefined();
      expect(TYPES.GetCategoryByIdUseCase).toBeDefined();
      expect(TYPES.UpdateCategoryUseCase).toBeDefined();
      expect(TYPES.DeleteCategoryUseCase).toBeDefined();
    });

    it('should have all expense use case symbols', () => {
      expect(TYPES.CreateExpenseUseCase).toBeDefined();
      expect(TYPES.GetExpensesUseCase).toBeDefined();
      expect(TYPES.GetExpenseByIdUseCase).toBeDefined();
      expect(TYPES.UpdateExpenseUseCase).toBeDefined();
      expect(TYPES.DeleteExpenseUseCase).toBeDefined();
    });

    it('should have all provision use case symbols', () => {
      expect(TYPES.CreateProvisionUseCase).toBeDefined();
      expect(TYPES.GetProvisionsUseCase).toBeDefined();
      expect(TYPES.GetProvisionByIdUseCase).toBeDefined();
      expect(TYPES.UpdateProvisionUseCase).toBeDefined();
      expect(TYPES.DeleteProvisionUseCase).toBeDefined();
    });

    it('should use unique symbols', () => {
      const allSymbols = Object.values(TYPES);
      const uniqueSymbols = new Set(allSymbols);
      expect(allSymbols.length).toBe(uniqueSymbols.size);
    });
  });

  describe('Category Use Case Getters', () => {
    let categoryRepository: InMemoryCategoryRepository;

    beforeEach(() => {
      categoryRepository = new InMemoryCategoryRepository();
    });

    it('should create CreateCategoryUseCase', () => {
      const useCase = DIContainer.getCreateCategoryUseCase(categoryRepository);
      expect(useCase).toBeInstanceOf(CreateCategoryUseCase);
    });

    it('should create GetCategoriesUseCase', () => {
      const useCase = DIContainer.getGetCategoriesUseCase(categoryRepository);
      expect(useCase).toBeInstanceOf(GetCategoriesUseCase);
    });

    it('should create GetCategoryByIdUseCase', () => {
      const useCase = DIContainer.getGetCategoryByIdUseCase(categoryRepository);
      expect(useCase).toBeInstanceOf(GetCategoryByIdUseCase);
    });

    it('should create UpdateCategoryUseCase', () => {
      const useCase = DIContainer.getUpdateCategoryUseCase(categoryRepository);
      expect(useCase).toBeInstanceOf(UpdateCategoryUseCase);
    });

    it('should create DeleteCategoryUseCase', () => {
      const useCase = DIContainer.getDeleteCategoryUseCase(categoryRepository);
      expect(useCase).toBeInstanceOf(DeleteCategoryUseCase);
    });
  });

  describe('Expense Use Case Getters', () => {
    let expenseRepository: InMemoryExpenseRepository;
    let categoryRepository: InMemoryCategoryRepository;

    beforeEach(() => {
      expenseRepository = new InMemoryExpenseRepository();
      categoryRepository = new InMemoryCategoryRepository();
    });

    it('should create CreateExpenseUseCase', () => {
      const useCase = DIContainer.getCreateExpenseUseCase(
        expenseRepository,
        categoryRepository
      );
      expect(useCase).toBeInstanceOf(CreateExpenseUseCase);
    });

    it('should create GetExpensesUseCase', () => {
      const useCase = DIContainer.getGetExpensesUseCase(expenseRepository);
      expect(useCase).toBeInstanceOf(GetExpensesUseCase);
    });

    it('should create GetExpenseByIdUseCase', () => {
      const useCase = DIContainer.getGetExpenseByIdUseCase(expenseRepository);
      expect(useCase).toBeInstanceOf(GetExpenseByIdUseCase);
    });

    it('should create UpdateExpenseUseCase', () => {
      const useCase = DIContainer.getUpdateExpenseUseCase(
        expenseRepository,
        categoryRepository
      );
      expect(useCase).toBeInstanceOf(UpdateExpenseUseCase);
    });

    it('should create DeleteExpenseUseCase', () => {
      const useCase = DIContainer.getDeleteExpenseUseCase(expenseRepository);
      expect(useCase).toBeInstanceOf(DeleteExpenseUseCase);
    });
  });

  describe('Provision Use Case Getters', () => {
    let provisionRepository: InMemoryProvisionRepository;
    let categoryRepository: InMemoryCategoryRepository;

    beforeEach(() => {
      provisionRepository = new InMemoryProvisionRepository();
      categoryRepository = new InMemoryCategoryRepository();
    });

    it('should create CreateProvisionUseCase', () => {
      const useCase = DIContainer.getCreateProvisionUseCase(
        provisionRepository,
        categoryRepository
      );
      expect(useCase).toBeInstanceOf(CreateProvisionUseCase);
    });

    it('should create GetProvisionsUseCase', () => {
      const useCase = DIContainer.getGetProvisionsUseCase(
        provisionRepository
      );
      expect(useCase).toBeInstanceOf(GetProvisionsUseCase);
    });

    it('should create GetProvisionByIdUseCase', () => {
      const useCase = DIContainer.getGetProvisionByIdUseCase(
        provisionRepository
      );
      expect(useCase).toBeInstanceOf(GetProvisionByIdUseCase);
    });

    it('should create UpdateProvisionUseCase', () => {
      const useCase = DIContainer.getUpdateProvisionUseCase(
        provisionRepository
      );
      expect(useCase).toBeInstanceOf(UpdateProvisionUseCase);
    });

    it('should create DeleteProvisionUseCase', () => {
      const useCase = DIContainer.getDeleteProvisionUseCase(
        provisionRepository
      );
      expect(useCase).toBeInstanceOf(DeleteProvisionUseCase);
    });
  });

  describe('Use Case Integration', () => {
    it('should wire up complete category workflow with in-memory repository', async () => {
      const categoryRepository = new InMemoryCategoryRepository();

      // Create use case
      const createUseCase = DIContainer.getCreateCategoryUseCase(
        categoryRepository
      );
      const created = await createUseCase.execute({
        name: 'Food',
        period: '2025-01',
        monthlyBudget: 500,
      });

      // Get by ID use case
      const getByIdUseCase = DIContainer.getGetCategoryByIdUseCase(
        categoryRepository
      );
      const found = await getByIdUseCase.execute(created.id);
      expect(found.name).toBe('Food');

      // Update use case
      const updateUseCase = DIContainer.getUpdateCategoryUseCase(
        categoryRepository
      );
      const updated = await updateUseCase.execute(created.id, {
        name: 'Groceries',
      });
      expect(updated.name).toBe('Groceries');

      // Get all use case
      const getAllUseCase = DIContainer.getGetCategoriesUseCase(
        categoryRepository
      );
      const all = await getAllUseCase.execute();
      expect(all).toHaveLength(1);
      expect(all[0].name).toBe('Groceries');

      // Delete use case
      const deleteUseCase = DIContainer.getDeleteCategoryUseCase(
        categoryRepository
      );
      await deleteUseCase.execute(created.id);

      const allAfterDelete = await getAllUseCase.execute();
      expect(allAfterDelete).toHaveLength(0);
    });

    it('should wire up complete expense workflow with in-memory repositories', async () => {
      const categoryRepository = new InMemoryCategoryRepository();
      const expenseRepository = new InMemoryExpenseRepository();

      // Create category first
      const category = await categoryRepository.create({
        name: 'Food',
        period: '2025-01',
        monthlyBudget: 500,
      });

      // Create expense use case
      const createUseCase = DIContainer.getCreateExpenseUseCase(
        expenseRepository,
        categoryRepository
      );
      const created = await createUseCase.execute({
        date: new Date('2025-01-15'),
        description: 'Grocery shopping',
        categoryId: category.id,
        amount: -50.75,
      });

      // Get by ID use case
      const getByIdUseCase = DIContainer.getGetExpenseByIdUseCase(
        expenseRepository
      );
      const found = await getByIdUseCase.execute(created.id);
      expect(found.description).toBe('Grocery shopping');

      // Get by category
      const getAllUseCase = DIContainer.getGetExpensesUseCase(
        expenseRepository
      );
      const byCategory = await getAllUseCase.execute({
        categoryId: category.id,
      });
      expect(byCategory).toHaveLength(1);
    });
  });
});
