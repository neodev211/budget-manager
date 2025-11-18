import { Router, Request, Response } from 'express';
import { ReportController } from '../controllers/ReportController';
import { AuthRequest } from '../../infrastructure/middleware/authMiddleware';

const router = Router();
const controller = new ReportController();

// Existing routes
router.get('/executive-summary', (req: Request, res: Response) =>
  controller.getExecutiveSummary(req as AuthRequest, res)
);
router.get('/executive-summary/:categoryId', (req: Request, res: Response) =>
  controller.getExecutiveSummaryByCategory(req as AuthRequest, res)
);

// New report routes
router.get('/category/:categoryId/detail', (req: Request, res: Response) =>
  controller.getCategoryDetailReport(req as AuthRequest, res)
);
router.get('/period-comparison', (req: Request, res: Response) =>
  controller.getPeriodComparisonReport(req as AuthRequest, res)
);
router.get('/payment-methods', (req: Request, res: Response) =>
  controller.getPaymentMethodReport(req as AuthRequest, res)
);
router.get('/provisions/fulfillment', (req: Request, res: Response) =>
  controller.getProvisionFulfillmentReport(req as AuthRequest, res)
);

export default router;
