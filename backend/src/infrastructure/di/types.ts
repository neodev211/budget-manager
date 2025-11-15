/**
 * DI Container Types and Symbols
 *
 * Define all symbols (string identifiers) used by the DI container.
 * This allows for type-safe dependency injection using inversify.
 *
 * Structure:
 * - Repositories: Database access interfaces
 * - UseCases: Application logic
 * - Services: Shared utilities
 */

const TYPES = {
  // ===== Repositories =====
  CategoryRepository: Symbol.for('ICategoryRepository'),
  ExpenseRepository: Symbol.for('IExpenseRepository'),
  ProvisionRepository: Symbol.for('IProvisionRepository'),
  ReportRepository: Symbol.for('IReportRepository'),

  // ===== Category Use Cases =====
  CreateCategoryUseCase: Symbol.for('CreateCategoryUseCase'),
  GetCategoriesUseCase: Symbol.for('GetCategoriesUseCase'),
  GetCategoryByIdUseCase: Symbol.for('GetCategoryByIdUseCase'),
  UpdateCategoryUseCase: Symbol.for('UpdateCategoryUseCase'),
  DeleteCategoryUseCase: Symbol.for('DeleteCategoryUseCase'),

  // ===== Expense Use Cases =====
  CreateExpenseUseCase: Symbol.for('CreateExpenseUseCase'),
  GetExpensesUseCase: Symbol.for('GetExpensesUseCase'),
  GetExpenseByIdUseCase: Symbol.for('GetExpenseByIdUseCase'),
  UpdateExpenseUseCase: Symbol.for('UpdateExpenseUseCase'),
  DeleteExpenseUseCase: Symbol.for('DeleteExpenseUseCase'),

  // ===== Provision Use Cases =====
  CreateProvisionUseCase: Symbol.for('CreateProvisionUseCase'),
  GetProvisionsUseCase: Symbol.for('GetProvisionsUseCase'),
  GetProvisionByIdUseCase: Symbol.for('GetProvisionByIdUseCase'),
  UpdateProvisionUseCase: Symbol.for('UpdateProvisionUseCase'),
  DeleteProvisionUseCase: Symbol.for('DeleteProvisionUseCase'),

  // ===== Services =====
  ValidationService: Symbol.for('ValidationService'),
};

export { TYPES };
