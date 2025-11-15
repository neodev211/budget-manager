import { Expense } from '../../../domain/entities/Expense';
import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { ValidationService } from '../../services/ValidationService';

/**
 * GetExpenseByIdUseCase
 *
 * Caso de uso para obtener un gasto por su ID.
 */
export class GetExpenseByIdUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(id: string): Promise<Expense> {
    ValidationService.validateUUID(id, 'expenseId');

    const expense = await this.expenseRepository.findById(id);

    if (!expense) {
      throw new Error(`Expense with id "${id}" not found`);
    }

    return expense;
  }
}
