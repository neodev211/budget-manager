import { Expense, UpdateExpenseDTO, PaymentMethod } from '../../../domain/entities/Expense';
import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';
import { Money } from '../../../domain/value-objects/Money';

/**
 * UpdateExpenseUseCase
 *
 * Caso de uso para actualizar un gasto.
 * Solo los campos proporcionados son actualizados (partial update).
 */
export class UpdateExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string, input: UpdateExpenseDTO): Promise<Expense> {
    // Validar ID
    ValidationService.validateUUID(id, 'expenseId');

    // Verificar que el gasto existe
    const existing = await this.expenseRepository.findById(id);
    if (!existing) {
      throw new Error(`Expense with id "${id}" not found`);
    }

    // Validar entrada
    this.validateInput(input);

    // Si se actualiza categoryId, verificar que existe
    if (input.categoryId) {
      const category = await this.categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new Error(`Category with id "${input.categoryId}" not found`);
      }
    }

    // Validar monto si se proporciona
    if (input.amount !== undefined) {
      const money = new Money(input.amount);
      if (!money.isNegative()) {
        throw new Error('Expense amount must be negative (a debit)');
      }
    }

    // Actualizar gasto
    const updated = await this.expenseRepository.update(id, input);

    return updated;
  }

  private validateInput(input: UpdateExpenseDTO): void {
    const errors = ValidationService.collectErrors([
      () =>
        input.description &&
        ValidationService.validateNonEmptyString(input.description, 'description'),
      () =>
        input.description &&
        ValidationService.validateMaxLength(input.description, 200, 'description'),
      () =>
        input.amount !== undefined &&
        ValidationService.validateExpenseAmount(input.amount, 'amount'),
      () =>
        input.categoryId &&
        ValidationService.validateUUID(input.categoryId, 'categoryId'),
      () =>
        input.provisionId &&
        ValidationService.validateUUID(input.provisionId, 'provisionId'),
      () =>
        input.date &&
        ValidationService.validateDate(input.date, 'date'),
      () =>
        input.paymentMethod &&
        ValidationService.validateEnum(
          input.paymentMethod,
          Object.values(PaymentMethod),
          'paymentMethod'
        ),
    ]);

    ValidationService.throwIfErrors(errors);
  }
}
