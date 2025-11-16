import { Expense, CreateExpenseDTO, PaymentMethod } from '../../../domain/entities/Expense';
import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { ValidationService } from '../../services/ValidationService';
import { Money } from '../../../domain/value-objects/Money';

/**
 * CreateExpenseUseCase
 *
 * Caso de uso para crear un nuevo gasto.
 * Incluye todas las validaciones de negocio.
 *
 * Validaciones:
 * - Descripción no vacía y con longitud válida
 * - Monto negativo (representando un débito)
 * - Categoría existe
 * - Fecha no es en el futuro
 * - Método de pago válido (CASH, TRANSFER, CARD, OTHER)
 */
export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(input: CreateExpenseDTO): Promise<Expense> {
    // Validar entrada
    this.validateInput(input);

    // Verificar que la categoría existe
    const category = await this.categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new Error(`Category with id "${input.categoryId}" not found`);
    }

    // Validar valor objects
    // Convert positive input to negative (debit)
    const amountAsDebit = input.amount > 0 ? -input.amount : input.amount;
    const money = new Money(amountAsDebit);
    if (!money.isNegative()) {
      throw new Error('Expense amount must be negative (a debit)');
    }

    // Si hay provisionId, será validado en fase posterior
    // Por ahora solo validamos formato UUID

    // Crear gasto
    const expense = await this.expenseRepository.create({
      date: input.date,
      description: input.description.trim(),
      categoryId: input.categoryId,
      provisionId: input.provisionId,
      amount: money.value,
      paymentMethod: input.paymentMethod || PaymentMethod.CASH,
    });

    return expense;
  }

  private validateInput(input: CreateExpenseDTO): void {
    const errors = ValidationService.collectErrors([
      () => ValidationService.validateNonEmptyString(input.description, 'description'),
      () => ValidationService.validateMaxLength(input.description, 200, 'description'),
      () => ValidationService.validateExpenseAmount(input.amount, 'amount'),
      () => ValidationService.validateUUID(input.categoryId, 'categoryId'),
      () =>
        input.provisionId &&
        ValidationService.validateUUID(input.provisionId, 'provisionId'),
      () => ValidationService.validateDate(input.date, 'date'),
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
