import { Category, CreateCategoryDTO } from '../../../domain/entities/Category';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';
import { Money } from '../../../domain/value-objects/Money';
import { Period } from '../../../domain/value-objects/Period';

/**
 * CreateCategoryUseCase
 *
 * Caso de uso para crear una nueva categoría de presupuesto.
 * Incluye todas las validaciones de negocio antes de persistir.
 *
 * Validaciones:
 * - Nombre no vacío y con longitud válida
 * - Período en formato YYYY-MM válido
 * - Presupuesto positivo con máximo 2 decimales
 * - No existen validaciones de unicidad en el use case (responsabilidad de BD)
 */
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryDTO): Promise<Category> {
    // Validar entrada
    this.validateInput(input);

    // Crear value objects para validación adicional
    const money = new Money(input.monthlyBudget);
    const period = new Period(input.period);

    // Validar que money y period sean válidos (ya lo hace el constructor)
    // Pero podemos hacer validaciones de negocio adicionales
    if (!money.isPositive()) {
      throw new Error('Monthly budget must be positive');
    }

    // Crear la categoría
    const category = await this.categoryRepository.create({
      name: input.name.trim(),
      period: period.value,
      monthlyBudget: money.value,
      notes: input.notes?.trim(),
    });

    return category;
  }

  private validateInput(input: CreateCategoryDTO): void {
    const errors = ValidationService.collectErrors([
      () => ValidationService.validateNonEmptyString(input.name, 'name'),
      () => ValidationService.validateMaxLength(input.name, 100, 'name'),
      () => ValidationService.validatePeriodFormat(input.period, 'period'),
      () => ValidationService.validateMonthlyBudget(input.monthlyBudget),
      () =>
        input.notes &&
        ValidationService.validateMaxLength(input.notes, 500, 'notes'),
    ]);

    ValidationService.throwIfErrors(errors);
  }
}
