import { Request, Response } from 'express';
import { ReportRepository } from '../../infrastructure/repositories/ReportRepository';

const reportRepo = new ReportRepository();

export class ReportController {
  async getExecutiveSummary(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string | undefined;
      const summary = await reportRepo.getExecutiveSummary(period);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getExecutiveSummaryByCategory(req: Request, res: Response): Promise<void> {
    try {
      const summary = await reportRepo.getExecutiveSummaryByCategory(req.params.categoryId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
