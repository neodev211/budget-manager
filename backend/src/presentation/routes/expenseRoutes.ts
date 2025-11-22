import { Router, Request, Response } from 'express';
import { ExpenseController } from '../controllers/ExpenseController';
import {
  validateExpenseInput,
  handleValidationErrors,
  sanitizeRequestBody,
} from '../../infrastructure/middleware/sanitizationMiddleware';

const router = Router();
const controller = new ExpenseController();

// ✅ SECURITY: Validate and sanitize inputs on POST (create) and PUT (update) operations
router.post(
  '/',
  validateExpenseInput,
  handleValidationErrors,
  sanitizeRequestBody,
  (req: Request, res: Response) => controller.create(req, res)
);

router.get('/', (req: Request, res: Response) => controller.findAll(req, res));
router.get('/:id', (req: Request, res: Response) => controller.findById(req, res));

router.put(
  '/:id',
  validateExpenseInput,
  handleValidationErrors,
  sanitizeRequestBody,
  (req: Request, res: Response) => controller.update(req, res)
);

router.delete('/:id', (req: Request, res: Response) => controller.delete(req, res));

export default router;
