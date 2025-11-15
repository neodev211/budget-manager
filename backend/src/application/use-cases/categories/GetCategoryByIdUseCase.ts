import { Category } from '../../../domain/entities/Category';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';

/**
 * GetCategoryByIdUseCase
 *
 * Caso de uso para obtener una categoría por su ID.
 *
 * Validaciones:
 * - ID debe ser un UUID válido
 * - La categoría debe existir
 */
export class GetCategoryByIdUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<Category> {
    ValidationService.validateUUID(id, 'categoryId');

    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new Error(`Category with id "${id}" not found`);
    }

    return category;
  }
}
