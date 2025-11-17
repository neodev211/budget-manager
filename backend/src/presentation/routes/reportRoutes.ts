import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const controller = new ReportController();

// Existing routes
router.get('/executive-summary', (req, res) => controller.getExecutiveSummary(req, res));
router.get('/executive-summary/:categoryId', (req, res) => controller.getExecutiveSummaryByCategory(req, res));

// New report routes
router.get('/category/:categoryId/detail', (req, res) => controller.getCategoryDetailReport(req, res));
router.get('/period-comparison', (req, res) => controller.getPeriodComparisonReport(req, res));
router.get('/payment-methods', (req, res) => controller.getPaymentMethodReport(req, res));
router.get('/provisions/fulfillment', (req, res) => controller.getProvisionFulfillmentReport(req, res));

export default router;
