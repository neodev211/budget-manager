import { ExecutiveSummary } from '../entities/ExecutiveSummary';

export interface IReportRepository {
  getExecutiveSummary(period?: string): Promise<ExecutiveSummary[]>;
  getExecutiveSummaryByCategory(categoryId: string): Promise<ExecutiveSummary>;
}
