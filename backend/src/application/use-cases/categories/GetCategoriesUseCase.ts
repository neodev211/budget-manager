import { Category } from '../../../domain/entities/Category';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';
import { Period } from '../../../domain/value-objects/Period';

/**
 * GetCategoriesUseCase
 *
 * Caso de uso para obtener categorías de un usuario específico.
 * Soporta búsqueda por período.
 *
 * Validaciones:
 * - userId es requerido para multi-tenancy
 * - Período es optional pero si se proporciona debe ser válido
 *
 * SECURITY: Siempre filtra por userId para garantizar aislamiento de datos
 */
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: { userId: string; period?: string }): Promise<Category[]> {
    // Validar userId
    ValidationService.validateNonEmptyString(input.userId, 'userId');
    ValidationService.validateUUID(input.userId, 'userId');

    // Validar entrada si se proporciona período
    if (input.period) {
      ValidationService.validatePeriodFormat(input.period, 'period');
      return this.categoryRepository.findByUserIdAndPeriod(input.userId, input.period);
    }

    // Si no hay período, obtener todas las categorías del usuario
    return this.categoryRepository.findByUserId(input.userId);
  }
}
