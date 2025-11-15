import { Category } from '../../../domain/entities/Category';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';
import { Period } from '../../../domain/value-objects/Period';

/**
 * GetCategoriesUseCase
 *
 * Caso de uso para obtener categorías.
 * Soporta búsqueda por período.
 *
 * Validaciones:
 * - Período es optional pero si se proporciona debe ser válido
 */
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input?: { period?: string }): Promise<Category[]> {
    // Validar entrada si se proporciona período
    if (input?.period) {
      ValidationService.validatePeriodFormat(input.period, 'period');
      return this.categoryRepository.findByPeriod(input.period);
    }

    // Si no hay período, obtener todas
    return this.categoryRepository.findAll();
  }
}
