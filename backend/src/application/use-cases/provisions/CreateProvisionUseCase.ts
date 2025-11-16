import { Provision, CreateProvisionDTO, ProvisionStatus } from '../../../domain/entities/Provision';
import { IProvisionRepository } from '../../../domain/repositories/IProvisionRepository';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';
import { Money } from '../../../domain/value-objects/Money';

/**
 * CreateProvisionUseCase
 *
 * Caso de uso para crear una provisión (presupuesto reservado).
 * Las provisiones representan montos reservados para gastos específicos futuros.
 *
 * Validaciones:
 * - Descripción (item) no vacía y con longitud válida
 * - Monto negativo (débito reservado)
 * - Categoría existe
 * - Fecha de vencimiento válida
 */
export class CreateProvisionUseCase {
  constructor(
    private readonly provisionRepository: IProvisionRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(input: CreateProvisionDTO): Promise<Provision> {
    // Validar entrada
    this.validateInput(input);

    // Verificar que la categoría existe
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new Error(`Category with id "${input.categoryId}" not found`);
    }

    // Validar value objects
    // Convert positive input to negative (reserved debit)
    const amountAsDebit = input.amount > 0 ? -input.amount : input.amount;
    const money = new Money(amountAsDebit);
    if (!money.isNegative()) {
      throw new Error('Provision amount must be negative (a reserved debit)');
    }

    // Crear provisión
    const provision = await this.provisionRepository.create({
      item: input.item.trim(),
      categoryId: input.categoryId,
      amount: money.value,
      dueDate: input.dueDate,
      notes: input.notes?.trim(),
    });

    return provision;
  }

  private validateInput(input: CreateProvisionDTO): void {
    const errors = ValidationService.collectErrors([
      () => ValidationService.validateNonEmptyString(input.item, 'item'),
      () => ValidationService.validateMaxLength(input.item, 100, 'item'),
      () => ValidationService.validateProvisionAmount(input.amount, 'amount'),
      () => ValidationService.validateUUID(input.categoryId, 'categoryId'),
      () => ValidationService.validateDate(input.dueDate, 'dueDate'),
      () =>
        input.notes &&
        ValidationService.validateMaxLength(input.notes, 500, 'notes'),
    ]);

    ValidationService.throwIfErrors(errors);
  }
}
