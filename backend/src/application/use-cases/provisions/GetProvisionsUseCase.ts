import { Provision } from '../../../domain/entities/Provision';
import { IProvisionRepository } from '../../../domain/repositories/IProvisionRepository';
import { ValidationService } from '../../services/ValidationService';

/**
 * GetProvisionsUseCase
 *
 * Caso de uso para obtener provisiones.
 * Soporta búsqueda por:
 * - Categoría
 * - Solo abiertas
 * - Todas
 */
export class GetProvisionsUseCase {
  constructor(private readonly provisionRepository: IProvisionRepository) {}

  async execute(input?: {
    categoryId?: string;
    onlyOpen?: boolean;
  }): Promise<Provision[]> {
    // Validar entrada si se proporciona
    if (input?.categoryId) {
      ValidationService.validateUUID(input.categoryId, 'categoryId');
      return this.provisionRepository.findByCategoryId(input.categoryId);
    }

    if (input?.onlyOpen) {
      return this.provisionRepository.findOpenProvisions();
    }

    // Si no hay filtros específicos, obtener todas
    return this.provisionRepository.findAll();
  }
}
