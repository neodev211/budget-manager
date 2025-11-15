import { IProvisionRepository } from '../../../domain/repositories/IProvisionRepository';
import { ValidationService } from '../../services/ValidationService';

/**
 * DeleteProvisionUseCase
 *
 * Caso de uso para eliminar una provisión.
 */
export class DeleteProvisionUseCase {
  constructor(private readonly provisionRepository: IProvisionRepository) {}

  async execute(id: string): Promise<void> {
    // Validar ID
    ValidationService.validateUUID(id, 'provisionId');

    // Verificar que existe
    const existing = await this.provisionRepository.findById(id);
    if (!existing) {
      throw new Error(`Provision with id "${id}" not found`);
    }

    // Eliminar provisión
    await this.provisionRepository.delete(id);
  }
}
