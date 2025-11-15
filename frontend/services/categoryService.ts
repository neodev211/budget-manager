import { api } from '@/lib/api';
import { Category, CreateCategoryDTO } from '@/types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  async getByPeriod(period: string): Promise<Category[]> {
    const response = await api.get<Category[]>(`/categories?period=${period}`);
    return response.data;
  },

  async create(data: CreateCategoryDTO): Promise<Category> {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCategoryDTO>): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
