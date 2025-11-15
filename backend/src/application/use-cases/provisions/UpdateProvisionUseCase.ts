import { Provision, UpdateProvisionDTO, ProvisionStatus } from '../../../domain/entities/Provision';
import { IProvisionRepository } from '../../../domain/repositories/IProvisionRepository';
import { ValidationService } from '../../services/ValidationService';
import { Money } from '../../../domain/value-objects/Money';

/**
 * UpdateProvisionUseCase
 *
 * Caso de uso para actualizar una provisión.
 * Solo los campos proporcionados son actualizados (partial update).
 */
export class UpdateProvisionUseCase {
  constructor(private readonly provisionRepository: IProvisionRepository) {}

  async execute(id: string, input: UpdateProvisionDTO): Promise<Provision> {
    // Validar ID
    ValidationService.validateUUID(id, 'provisionId');

    // Verificar que la provisión existe
    const existing = await this.provisionRepository.findById(id);
    if (!existing) {
      throw new Error(`Provision with id "${id}" not found`);
    }

    // Validar entrada
    this.validateInput(input);

    // Validar monto si se proporciona
    if (input.amount !== undefined) {
      const money = new Money(input.amount);
      if (!money.isNegative()) {
        throw new Error('Provision amount must be negative (a reserved debit)');
      }
    }

    // Actualizar provisión
    const updated = await this.provisionRepository.update(id, input);

    return updated;
  }

  private validateInput(input: UpdateProvisionDTO): void {
    const errors = ValidationService.collectErrors([
      () =>
        input.item &&
        ValidationService.validateNonEmptyString(input.item, 'item'),
      () =>
        input.item &&
        ValidationService.validateMaxLength(input.item, 100, 'item'),
      () =>
        input.amount !== undefined &&
        ValidationService.validateProvisionAmount(input.amount, 'amount'),
      () =>
        input.dueDate &&
        ValidationService.validateDate(input.dueDate, 'dueDate'),
      () =>
        input.status &&
        ValidationService.validateEnum(
          input.status,
          Object.values(ProvisionStatus),
          'status'
        ),
      () =>
        input.notes !== undefined &&
        input.notes &&
        ValidationService.validateMaxLength(input.notes, 500, 'notes'),
    ]);

    ValidationService.throwIfErrors(errors);
  }
}
