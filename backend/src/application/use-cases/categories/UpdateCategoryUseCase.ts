import { Category, UpdateCategoryDTO } from '../../../domain/entities/Category';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';
import { Money } from '../../../domain/value-objects/Money';
import { Period } from '../../../domain/value-objects/Period';

/**
 * UpdateCategoryUseCase
 *
 * Caso de uso para actualizar una categoría.
 * Solo los campos proporcionar son actualizados (partial update).
 *
 * Validaciones:
 * - ID debe ser un UUID válido
 * - Categoría debe existir
 * - Todos los campos opcionales deben pasar validaciones si se proporcionan
 */
export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string, input: UpdateCategoryDTO): Promise<Category> {
    // Validar ID
    ValidationService.validateUUID(id, 'categoryId');

    // Verificar que la categoría existe
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Category with id "${id}" not found`);
    }

    // Validar campos opcionales proporcionados
    this.validateInput(input);

    // Validar value objects si se proporcionan
    if (input.period) {
      new Period(input.period);
    }
    if (input.monthlyBudget !== undefined) {
      new Money(input.monthlyBudget);
    }

    // Actualizar categoría
    const updated = await this.categoryRepository.update(id, input);

    return updated;
  }

  private validateInput(input: UpdateCategoryDTO): void {
    const errors = ValidationService.collectErrors([
      () =>
        input.name &&
        ValidationService.validateNonEmptyString(input.name, 'name'),
      () =>
        input.name &&
        ValidationService.validateMaxLength(input.name, 100, 'name'),
      () =>
        input.period &&
        ValidationService.validatePeriodFormat(input.period, 'period'),
      () =>
        input.monthlyBudget !== undefined &&
        ValidationService.validateMonthlyBudget(input.monthlyBudget),
      () =>
        input.notes !== undefined &&
        input.notes &&
        ValidationService.validateMaxLength(input.notes, 500, 'notes'),
    ]);

    ValidationService.throwIfErrors(errors);
  }
}
