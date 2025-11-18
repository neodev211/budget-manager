import { ExecutiveSummary } from '../entities/ExecutiveSummary';
import { CategoryDetailReport } from '../entities/CategoryDetailReport';
import { PeriodComparisonReport } from '../entities/PeriodComparisonReport';
import { PaymentMethodReport } from '../entities/PaymentMethodReport';
import { ProvisionFulfillmentReport } from '../entities/ProvisionFulfillmentReport';

export interface IReportRepository {
  // All methods now require userId for multi-tenancy support
  getExecutiveSummary(userId: string, period?: string): Promise<ExecutiveSummary[]>;
  getExecutiveSummaryByCategory(userId: string, categoryId: string): Promise<ExecutiveSummary>;

  // New report methods
  getCategoryDetailReport(userId: string, categoryId: string, period: string): Promise<CategoryDetailReport>;
  getPeriodComparisonReport(userId: string, periods: string[]): Promise<PeriodComparisonReport>;
  getPaymentMethodReport(userId: string, period: string): Promise<PaymentMethodReport>;
  getProvisionFulfillmentReport(userId: string, period: string): Promise<ProvisionFulfillmentReport>;
}
