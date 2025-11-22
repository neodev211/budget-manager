import { Router, Request, Response } from 'express';
import { ProvisionController } from '../controllers/ProvisionController';
import {
  validateProvisionInput,
  handleValidationErrors,
  sanitizeRequestBody,
} from '../../infrastructure/middleware/sanitizationMiddleware';

const router = Router();
const controller = new ProvisionController();

// ✅ SECURITY: Validate and sanitize inputs on POST (create) and PUT (update) operations
router.post(
  '/',
  validateProvisionInput,
  handleValidationErrors,
  sanitizeRequestBody,
  (req: Request, res: Response) => controller.create(req, res)
);

router.post('/bulk-copy', (req: Request, res: Response) => controller.bulkCopyToCategory(req, res));
router.post('/:id/copy', (req: Request, res: Response) => controller.copyToCategory(req, res));
router.get('/', (req: Request, res: Response) => controller.findAll(req, res));
router.get('/:id', (req: Request, res: Response) => controller.findById(req, res));
router.get('/:id/materialized', (req: Request, res: Response) => controller.getMaterializedAmount(req, res));

router.put(
  '/:id',
  validateProvisionInput,
  handleValidationErrors,
  sanitizeRequestBody,
  (req: Request, res: Response) => controller.update(req, res)
);

router.delete('/:id', (req: Request, res: Response) => controller.delete(req, res));

export default router;
