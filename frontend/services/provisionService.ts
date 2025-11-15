import { api } from '@/lib/api';
import { Provision, CreateProvisionDTO, UpdateProvisionDTO } from '@/types';

export const provisionService = {
  async getAll(): Promise<Provision[]> {
    const response = await api.get<Provision[]>('/provisions');
    return response.data;
  },

  async getById(id: string): Promise<Provision> {
    const response = await api.get<Provision>(`/provisions/${id}`);
    return response.data;
  },

  async getByCategoryId(categoryId: string): Promise<Provision[]> {
    const response = await api.get<Provision[]>(`/provisions?categoryId=${categoryId}`);
    return response.data;
  },

  async getOpenProvisions(): Promise<Provision[]> {
    const response = await api.get<Provision[]>('/provisions?openOnly=true');
    return response.data;
  },

  async create(data: CreateProvisionDTO): Promise<Provision> {
    const response = await api.post<Provision>('/provisions', data);
    return response.data;
  },

  async update(id: string, data: UpdateProvisionDTO): Promise<Provision> {
    const response = await api.put<Provision>(`/provisions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/provisions/${id}`);
  },

  async copyToCategory(id: string, targetCategoryId: string): Promise<Provision> {
    const response = await api.post<Provision>(
      `/provisions/${id}/copy`,
      { targetCategoryId }
    );
    return response.data;
  },

  async bulkCopyToCategory(provisionIds: string[], targetCategoryId: string): Promise<Provision[]> {
    const response = await api.post<Provision[]>(
      '/provisions/bulk-copy',
      { provisionIds, targetCategoryId }
    );
    return response.data;
  },
};
