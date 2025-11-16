"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const di_1 = require("../../../src/infrastructure/di");
const InMemoryCategoryRepository_1 = require("../../../src/infrastructure/persistence/in-memory/InMemoryCategoryRepository");
const InMemoryExpenseRepository_1 = require("../../../src/infrastructure/persistence/in-memory/InMemoryExpenseRepository");
const InMemoryProvisionRepository_1 = require("../../../src/infrastructure/persistence/in-memory/InMemoryProvisionRepository");
const categories_1 = require("../../../src/application/use-cases/categories");
const expenses_1 = require("../../../src/application/use-cases/expenses");
const provisions_1 = require("../../../src/application/use-cases/provisions");
describe('DIContainer', () => {
    describe('TYPES', () => {
        it('should have all repository symbols', () => {
            expect(di_1.TYPES.CategoryRepository).toBeDefined();
            expect(di_1.TYPES.ExpenseRepository).toBeDefined();
            expect(di_1.TYPES.ProvisionRepository).toBeDefined();
        });
        it('should have all category use case symbols', () => {
            expect(di_1.TYPES.CreateCategoryUseCase).toBeDefined();
            expect(di_1.TYPES.GetCategoriesUseCase).toBeDefined();
            expect(di_1.TYPES.GetCategoryByIdUseCase).toBeDefined();
            expect(di_1.TYPES.UpdateCategoryUseCase).toBeDefined();
            expect(di_1.TYPES.DeleteCategoryUseCase).toBeDefined();
        });
        it('should have all expense use case symbols', () => {
            expect(di_1.TYPES.CreateExpenseUseCase).toBeDefined();
            expect(di_1.TYPES.GetExpensesUseCase).toBeDefined();
            expect(di_1.TYPES.GetExpenseByIdUseCase).toBeDefined();
            expect(di_1.TYPES.UpdateExpenseUseCase).toBeDefined();
            expect(di_1.TYPES.DeleteExpenseUseCase).toBeDefined();
        });
        it('should have all provision use case symbols', () => {
            expect(di_1.TYPES.CreateProvisionUseCase).toBeDefined();
            expect(di_1.TYPES.GetProvisionsUseCase).toBeDefined();
            expect(di_1.TYPES.GetProvisionByIdUseCase).toBeDefined();
            expect(di_1.TYPES.UpdateProvisionUseCase).toBeDefined();
            expect(di_1.TYPES.DeleteProvisionUseCase).toBeDefined();
        });
        it('should use unique symbols', () => {
            const allSymbols = Object.values(di_1.TYPES);
            const uniqueSymbols = new Set(allSymbols);
            expect(allSymbols.length).toBe(uniqueSymbols.size);
        });
    });
    describe('Category Use Case Getters', () => {
        let categoryRepository;
        beforeEach(() => {
            categoryRepository = new InMemoryCategoryRepository_1.InMemoryCategoryRepository();
        });
        it('should create CreateCategoryUseCase', () => {
            const useCase = di_1.DIContainer.getCreateCategoryUseCase(categoryRepository);
            expect(useCase).toBeInstanceOf(categories_1.CreateCategoryUseCase);
        });
        it('should create GetCategoriesUseCase', () => {
            const useCase = di_1.DIContainer.getGetCategoriesUseCase(categoryRepository);
            expect(useCase).toBeInstanceOf(categories_1.GetCategoriesUseCase);
        });
        it('should create GetCategoryByIdUseCase', () => {
            const useCase = di_1.DIContainer.getGetCategoryByIdUseCase(categoryRepository);
            expect(useCase).toBeInstanceOf(categories_1.GetCategoryByIdUseCase);
        });
        it('should create UpdateCategoryUseCase', () => {
            const useCase = di_1.DIContainer.getUpdateCategoryUseCase(categoryRepository);
            expect(useCase).toBeInstanceOf(categories_1.UpdateCategoryUseCase);
        });
        it('should create DeleteCategoryUseCase', () => {
            const useCase = di_1.DIContainer.getDeleteCategoryUseCase(categoryRepository);
            expect(useCase).toBeInstanceOf(categories_1.DeleteCategoryUseCase);
        });
    });
    describe('Expense Use Case Getters', () => {
        let expenseRepository;
        let categoryRepository;
        beforeEach(() => {
            expenseRepository = new InMemoryExpenseRepository_1.InMemoryExpenseRepository();
            categoryRepository = new InMemoryCategoryRepository_1.InMemoryCategoryRepository();
        });
        it('should create CreateExpenseUseCase', () => {
            const useCase = di_1.DIContainer.getCreateExpenseUseCase(expenseRepository, categoryRepository);
            expect(useCase).toBeInstanceOf(expenses_1.CreateExpenseUseCase);
        });
        it('should create GetExpensesUseCase', () => {
            const useCase = di_1.DIContainer.getGetExpensesUseCase(expenseRepository);
            expect(useCase).toBeInstanceOf(expenses_1.GetExpensesUseCase);
        });
        it('should create GetExpenseByIdUseCase', () => {
            const useCase = di_1.DIContainer.getGetExpenseByIdUseCase(expenseRepository);
            expect(useCase).toBeInstanceOf(expenses_1.GetExpenseByIdUseCase);
        });
        it('should create UpdateExpenseUseCase', () => {
            const useCase = di_1.DIContainer.getUpdateExpenseUseCase(expenseRepository, categoryRepository);
            expect(useCase).toBeInstanceOf(expenses_1.UpdateExpenseUseCase);
        });
        it('should create DeleteExpenseUseCase', () => {
            const useCase = di_1.DIContainer.getDeleteExpenseUseCase(expenseRepository);
            expect(useCase).toBeInstanceOf(expenses_1.DeleteExpenseUseCase);
        });
    });
    describe('Provision Use Case Getters', () => {
        let provisionRepository;
        let categoryRepository;
        beforeEach(() => {
            provisionRepository = new InMemoryProvisionRepository_1.InMemoryProvisionRepository();
            categoryRepository = new InMemoryCategoryRepository_1.InMemoryCategoryRepository();
        });
        it('should create CreateProvisionUseCase', () => {
            const useCase = di_1.DIContainer.getCreateProvisionUseCase(provisionRepository, categoryRepository);
            expect(useCase).toBeInstanceOf(provisions_1.CreateProvisionUseCase);
        });
        it('should create GetProvisionsUseCase', () => {
            const useCase = di_1.DIContainer.getGetProvisionsUseCase(provisionRepository);
            expect(useCase).toBeInstanceOf(provisions_1.GetProvisionsUseCase);
        });
        it('should create GetProvisionByIdUseCase', () => {
            const useCase = di_1.DIContainer.getGetProvisionByIdUseCase(provisionRepository);
            expect(useCase).toBeInstanceOf(provisions_1.GetProvisionByIdUseCase);
        });
        it('should create UpdateProvisionUseCase', () => {
            const useCase = di_1.DIContainer.getUpdateProvisionUseCase(provisionRepository);
            expect(useCase).toBeInstanceOf(provisions_1.UpdateProvisionUseCase);
        });
        it('should create DeleteProvisionUseCase', () => {
            const useCase = di_1.DIContainer.getDeleteProvisionUseCase(provisionRepository);
            expect(useCase).toBeInstanceOf(provisions_1.DeleteProvisionUseCase);
        });
    });
    describe('Use Case Integration', () => {
        it('should wire up complete category workflow with in-memory repository', async () => {
            const categoryRepository = new InMemoryCategoryRepository_1.InMemoryCategoryRepository();
            // Create use case
            const createUseCase = di_1.DIContainer.getCreateCategoryUseCase(categoryRepository);
            const created = await createUseCase.execute({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            // Get by ID use case
            const getByIdUseCase = di_1.DIContainer.getGetCategoryByIdUseCase(categoryRepository);
            const found = await getByIdUseCase.execute(created.id);
            expect(found.name).toBe('Food');
            // Update use case
            const updateUseCase = di_1.DIContainer.getUpdateCategoryUseCase(categoryRepository);
            const updated = await updateUseCase.execute(created.id, {
                name: 'Groceries',
            });
            expect(updated.name).toBe('Groceries');
            // Get all use case
            const getAllUseCase = di_1.DIContainer.getGetCategoriesUseCase(categoryRepository);
            const all = await getAllUseCase.execute();
            expect(all).toHaveLength(1);
            expect(all[0].name).toBe('Groceries');
            // Delete use case
            const deleteUseCase = di_1.DIContainer.getDeleteCategoryUseCase(categoryRepository);
            await deleteUseCase.execute(created.id);
            const allAfterDelete = await getAllUseCase.execute();
            expect(allAfterDelete).toHaveLength(0);
        });
        it('should wire up complete expense workflow with in-memory repositories', async () => {
            const categoryRepository = new InMemoryCategoryRepository_1.InMemoryCategoryRepository();
            const expenseRepository = new InMemoryExpenseRepository_1.InMemoryExpenseRepository();
            // Create category first
            const category = await categoryRepository.create({
                name: 'Food',
                period: '2025-01',
                monthlyBudget: 500,
            });
            // Create expense use case
            const createUseCase = di_1.DIContainer.getCreateExpenseUseCase(expenseRepository, categoryRepository);
            const created = await createUseCase.execute({
                date: new Date('2025-01-15'),
                description: 'Grocery shopping',
                categoryId: category.id,
                amount: -50.75,
            });
            // Get by ID use case
            const getByIdUseCase = di_1.DIContainer.getGetExpenseByIdUseCase(expenseRepository);
            const found = await getByIdUseCase.execute(created.id);
            expect(found.description).toBe('Grocery shopping');
            // Get by category
            const getAllUseCase = di_1.DIContainer.getGetExpensesUseCase(expenseRepository);
            const byCategory = await getAllUseCase.execute({
                categoryId: category.id,
            });
            expect(byCategory).toHaveLength(1);
        });
    });
});
