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
}
