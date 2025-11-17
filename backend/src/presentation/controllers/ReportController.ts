import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/di';

/**
 * ReportController
 *
 * Handles HTTP requests for report operations.
 * Uses dependency injection to access repositories.
 */
export class ReportController {
  /**
   * GET /api/reports/executive-summary
   * Get executive summary for all categories or a specific period
   */
  async getExecutiveSummary(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string | undefined;
      const repository = DIContainer.getReportRepositoryInstance();
      const summary = await repository.getExecutiveSummary(period);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/executive-summary/:categoryId
   * Get executive summary for a specific category
   */
  async getExecutiveSummaryByCategory(req: Request, res: Response): Promise<void> {
    try {
      const repository = DIContainer.getReportRepositoryInstance();
      const summary = await repository.getExecutiveSummaryByCategory(req.params.categoryId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/category/:categoryId/detail
   * Get detailed report for a specific category and period
   */
  async getCategoryDetailReport(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const period = req.query.period as string;

      if (!period) {
        res.status(400).json({ error: 'Period is required' });
        return;
      }

      const repository = DIContainer.getReportRepositoryInstance();
      const report = await repository.getCategoryDetailReport(categoryId, period);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/period-comparison
   * Compare budgets and spending across multiple periods
   */
  async getPeriodComparisonReport(req: Request, res: Response): Promise<void> {
    try {
      const periods = req.query.periods as string | string[];

      if (!periods) {
        res.status(400).json({ error: 'Periods are required' });
        return;
      }

      const periodArray = Array.isArray(periods) ? periods : periods.split(',');

      const repository = DIContainer.getReportRepositoryInstance();
      const report = await repository.getPeriodComparisonReport(periodArray);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/payment-methods
   * Get breakdown of spending by payment method
   */
  async getPaymentMethodReport(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string;

      if (!period) {
        res.status(400).json({ error: 'Period is required' });
        return;
      }

      const repository = DIContainer.getReportRepositoryInstance();
      const report = await repository.getPaymentMethodReport(period);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/provisions/fulfillment
   * Get provision fulfillment metrics and analysis
   */
  async getProvisionFulfillmentReport(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string;

      if (!period) {
        res.status(400).json({ error: 'Period is required' });
        return;
      }

      const repository = DIContainer.getReportRepositoryInstance();
      const report = await repository.getProvisionFulfillmentReport(period);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
