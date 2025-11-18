import { Response } from 'express';
import { DIContainer } from '../../infrastructure/di';
import { AuthRequest } from '../../infrastructure/middleware/authMiddleware';

/**
 * ReportController
 *
 * Handles HTTP requests for report operations.
 * Uses dependency injection to access repositories.
 * All methods require authenticated user (userId from AuthRequest)
 */
export class ReportController {
  /**
   * GET /api/reports/executive-summary
   * Get executive summary for all categories or a specific period
   */
  async getExecutiveSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const period = req.query.period as string | undefined;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found in request' });
        return;
      }

      const repository = DIContainer.getReportRepositoryInstance();
      const summary = await repository.getExecutiveSummary(userId, period);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/executive-summary/:categoryId
   * Get executive summary for a specific category
   */
  async getExecutiveSummaryByCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const categoryId = req.params.categoryId;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found in request' });
        return;
      }

      const repository = DIContainer.getReportRepositoryInstance();
      const summary = await repository.getExecutiveSummaryByCategory(userId, categoryId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/category/:categoryId/detail
   * Get detailed report for a specific category and period
   */
  async getCategoryDetailReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;
      const period = req.query.period as string;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found in request' });
        return;
      }

      if (!period) {
        res.status(400).json({ error: 'Period is required' });
        return;
      }

      const repository = DIContainer.getReportRepositoryInstance();
      const report = await repository.getCategoryDetailReport(userId, categoryId, period);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/period-comparison
   * Compare budgets and spending across multiple periods
   */
  async getPeriodComparisonReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const periods = req.query.periods as string | string[];
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found in request' });
        return;
      }

      if (!periods) {
        res.status(400).json({ error: 'Periods are required' });
        return;
      }

      const periodArray = Array.isArray(periods) ? periods : periods.split(',');

      const repository = DIContainer.getReportRepositoryInstance();
      const report = await repository.getPeriodComparisonReport(userId, periodArray);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/payment-methods
   * Get breakdown of spending by payment method
   */
  async getPaymentMethodReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const period = req.query.period as string;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found in request' });
        return;
      }

      if (!period) {
        res.status(400).json({ error: 'Period is required' });
        return;
      }

      const repository = DIContainer.getReportRepositoryInstance();
      const report = await repository.getPaymentMethodReport(userId, period);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/reports/provisions/fulfillment
   * Get provision fulfillment metrics and analysis
   */
  async getProvisionFulfillmentReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const period = req.query.period as string;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found in request' });
        return;
      }

      if (!period) {
        res.status(400).json({ error: 'Period is required' });
        return;
      }

      const repository = DIContainer.getReportRepositoryInstance();
      const report = await repository.getProvisionFulfillmentReport(userId, period);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
