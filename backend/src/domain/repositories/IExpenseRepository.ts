import { Expense, CreateExpenseDTO, UpdateExpenseDTO } from '../entities/Expense';

export interface IExpenseRepository {
  create(data: CreateExpenseDTO): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findAll(): Promise<Expense[]>;
  findByCategoryId(categoryId: string): Promise<Expense[]>;
  findByProvisionId(provisionId: string): Promise<Expense[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  update(id: string, data: UpdateExpenseDTO): Promise<Expense>;
  delete(id: string): Promise<void>;
}
