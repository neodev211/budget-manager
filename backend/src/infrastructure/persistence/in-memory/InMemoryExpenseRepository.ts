import { randomUUID } from 'crypto';
import { Expense, CreateExpenseDTO, UpdateExpenseDTO, PaymentMethod } from '../../../domain/entities/Expense';
import { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';

/**
 * Helper function to generate a unique UUID
 */
function generateId(): string {
  return randomUUID();
}

/**
 * InMemoryExpenseRepository
 *
 * In-memory implementation of IExpenseRepository for testing.
 * Stores expenses in a Map instead of the database.
 */
export class InMemoryExpenseRepository implements IExpenseRepository {
  private expenses: Map<string, Expense> = new Map();

  async create(data: CreateExpenseDTO): Promise<Expense> {
    const id = generateId();
    const now = new Date();

    const expense: Expense = {
      id,
      date: data.date,
      description: data.description,
      categoryId: data.categoryId,
      provisionId: data.provisionId,
      amount: data.amount,
      paymentMethod: data.paymentMethod || PaymentMethod.CASH,
      createdAt: now,
      updatedAt: now,
    };

    this.expenses.set(id, expense);
    return expense;
  }

  async findById(id: string): Promise<Expense | null> {
    return this.expenses.get(id) || null;
  }

  async findAll(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async findByCategoryId(categoryId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      exp => exp.categoryId === categoryId
    );
  }

  async findByProvisionId(provisionId: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      exp => exp.provisionId === provisionId
    );
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      exp => exp.date >= startDate && exp.date <= endDate
    );
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
    const expense = this.expenses.get(id);
    if (!expense) {
      throw new Error(`Expense with id "${id}" not found`);
    }

    const updated: Expense = {
      ...expense,
      ...data,
      updatedAt: new Date(),
    };

    this.expenses.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.expenses.has(id)) {
      throw new Error(`Expense with id "${id}" not found`);
    }
    this.expenses.delete(id);
  }

  /**
   * Clear all expenses (useful for test cleanup)
   */
  clear(): void {
    this.expenses.clear();
  }

  /**
   * Get size of repository (useful for assertions)
   */
  size(): number {
    return this.expenses.size;
  }
}
