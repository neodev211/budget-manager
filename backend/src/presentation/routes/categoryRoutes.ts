import { Router, Request, Response } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import {
  validateCategoryInput,
  handleValidationErrors,
  sanitizeRequestBody,
} from '../../infrastructure/middleware/sanitizationMiddleware';

const router = Router();
const controller = new CategoryController();

// ✅ SECURITY: Validate and sanitize inputs on POST (create) and PUT (update) operations
router.post(
  '/',
  validateCategoryInput,
  handleValidationErrors,
  sanitizeRequestBody,
  (req: Request, res: Response) => controller.create(req, res)
);

router.get('/', (req: Request, res: Response) => controller.findAll(req, res));
router.get('/:id', (req: Request, res: Response) => controller.findById(req, res));

router.put(
  '/:id',
  validateCategoryInput,
  handleValidationErrors,
  sanitizeRequestBody,
  (req: Request, res: Response) => controller.update(req, res)
);

router.delete('/:id', (req: Request, res: Response) => controller.delete(req, res));

export default router;
