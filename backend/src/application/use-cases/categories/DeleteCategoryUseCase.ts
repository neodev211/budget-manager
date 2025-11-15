import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';

/**
 * DeleteCategoryUseCase
 *
 * Caso de uso para eliminar una categoría.
 *
 * Validaciones:
 * - ID debe ser un UUID válido
 * - La categoría debe existir
 */
export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    // Validar ID
    ValidationService.validateUUID(id, 'categoryId');

    // Verificar que existe
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new Error(`Category with id "${id}" not found`);
    }

    // Eliminar categoría
    await this.categoryRepository.delete(id);
  }
}
