import { api } from '@/lib/api';
import { Expense, CreateExpenseDTO } from '@/types';

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const response = await api.get<Expense[]>('/expenses');
    return response.data;
  },

  async getById(id: string): Promise<Expense> {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  async getByCategoryId(categoryId: string): Promise<Expense[]> {
    const response = await api.get<Expense[]>(`/expenses?categoryId=${categoryId}`);
    return response.data;
  },

  async create(data: CreateExpenseDTO): Promise<Expense> {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateExpenseDTO>): Promise<Expense> {
    const response = await api.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
