import { api } from '@/lib/api';
import {
  ExecutiveSummary,
  CategoryDetailReport,
  PeriodComparisonReport,
  PaymentMethodReport,
  ProvisionFulfillmentReport,
} from '@/types';

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

  async getCategoryDetailReport(
    categoryId: string,
    period: string
  ): Promise<CategoryDetailReport> {
    const response = await api.get<CategoryDetailReport>(
      `/reports/category/${categoryId}/detail?period=${period}`
    );
    return response.data;
  },

  async getPeriodComparisonReport(periods: string[]): Promise<PeriodComparisonReport> {
    const periodQuery = periods.join(',');
    const response = await api.get<PeriodComparisonReport>(
      `/reports/period-comparison?periods=${periodQuery}`
    );
    return response.data;
  },

  async getPaymentMethodReport(period: string): Promise<PaymentMethodReport> {
    const response = await api.get<PaymentMethodReport>(
      `/reports/payment-methods?period=${period}`
    );
    return response.data;
  },

  async getProvisionFulfillmentReport(period: string): Promise<ProvisionFulfillmentReport> {
    const response = await api.get<ProvisionFulfillmentReport>(
      `/reports/provisions/fulfillment?period=${period}`
    );
    return response.data;
  },
};
