import { Expense } from '../../../domain/entities/Expense';
import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import { ValidationService } from '../../services/ValidationService';

/**
 * GetExpensesUseCase
 *
 * Caso de uso para obtener gastos.
 * Soporta búsqueda por:
 * - Categoría
 * - Provisión
 * - Rango de fechas
 * - Todos los gastos
 */
export class GetExpensesUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {}

  async execute(input?: {
    categoryId?: string;
    provisionId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Expense[]> {
    // Validar entrada si se proporciona
    if (input?.categoryId) {
      ValidationService.validateUUID(input.categoryId, 'categoryId');
      return this.expenseRepository.findByCategoryId(input.categoryId);
    }

    if (input?.provisionId) {
      ValidationService.validateUUID(input.provisionId, 'provisionId');
      return this.expenseRepository.findByProvisionId(input.provisionId);
    }

    if (input?.startDate && input?.endDate) {
      ValidationService.validateDate(input.startDate, 'startDate');
      ValidationService.validateDate(input.endDate, 'endDate');

      if (input.startDate > input.endDate) {
        throw new Error('startDate must be before or equal to endDate');
      }

      return this.expenseRepository.findByDateRange(
        input.startDate,
        input.endDate
      );
    }

    // Si no hay filtros específicos, obtener todos
    return this.expenseRepository.findAll();
  }
}
