import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { ValidationService } from '../../services/ValidationService';

/**
 * DeleteExpenseUseCase
 *
 * Caso de uso para eliminar un gasto.
 */
export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(id: string): Promise<void> {
    // Validar ID
    ValidationService.validateUUID(id, 'expenseId');

    // Verificar que existe
    const existing = await this.expenseRepository.findById(id);
    if (!existing) {
      throw new Error(`Expense with id "${id}" not found`);
    }

    // Eliminar gasto
    await this.expenseRepository.delete(id);
  }
}
