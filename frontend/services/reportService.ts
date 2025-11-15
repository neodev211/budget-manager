import { api } from '@/lib/api';
import { ExecutiveSummary } from '@/types';

export const reportService = {
  async getExecutiveSummary(period?: string): Promise<ExecutiveSummary[]> {
    const url = period ? `/reports/executive-summary?period=${period}` : '/reports/executive-summary';
    const response = await api.get<ExecutiveSummary[]>(url);
    return response.data;
  },

  async getExecutiveSummaryByCategory(categoryId: string): Promise<ExecutiveSummary> {
    const response = await api.get<ExecutiveSummary>(`/reports/executive-summary/${categoryId}`);
    return response.data;
  },
};
