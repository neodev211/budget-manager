import { Provision } from '../../../domain/entities/Provision';
import { IProvisionRepository } from '../../../domain/repositories/IProvisionRepository';
import { ValidationService } from '../../services/ValidationService';

/**
 * GetProvisionByIdUseCase
 *
 * Caso de uso para obtener una provisión por su ID.
 */
export class GetProvisionByIdUseCase {
  constructor(private readonly provisionRepository: IProvisionRepository) {}

  async execute(id: string): Promise<Provision> {
    ValidationService.validateUUID(id, 'provisionId');

    // ✅ MATERIALIZED: usedAmount now comes directly from DB, no separate query needed
    const provision = await this.provisionRepository.findById(id);

    if (!provision) {
      throw new Error(`Provision with id "${id}" not found`);
    }

    return provision;
  }
}
