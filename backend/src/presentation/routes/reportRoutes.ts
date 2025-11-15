import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const controller = new ReportController();

router.get('/executive-summary', (req, res) => controller.getExecutiveSummary(req, res));
router.get('/executive-summary/:categoryId', (req, res) => controller.getExecutiveSummaryByCategory(req, res));

export default router;
