import { ExecutiveSummary } from '../entities/ExecutiveSummary';
import { CategoryDetailReport } from '../entities/CategoryDetailReport';
import { PeriodComparisonReport } from '../entities/PeriodComparisonReport';
import { PaymentMethodReport } from '../entities/PaymentMethodReport';
import { ProvisionFulfillmentReport } from '../entities/ProvisionFulfillmentReport';

export interface IReportRepository {
  getExecutiveSummary(period?: string): Promise<ExecutiveSummary[]>;
  getExecutiveSummaryByCategory(categoryId: string): Promise<ExecutiveSummary>;

  // New report methods
  getCategoryDetailReport(categoryId: string, period: string): Promise<CategoryDetailReport>;
  getPeriodComparisonReport(periods: string[]): Promise<PeriodComparisonReport>;
  getPaymentMethodReport(period: string): Promise<PaymentMethodReport>;
  getProvisionFulfillmentReport(period: string): Promise<ProvisionFulfillmentReport>;
}
