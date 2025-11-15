import { Router } from 'express';
import { ProvisionController } from '../controllers/ProvisionController';

const router = Router();
const controller = new ProvisionController();

router.post('/', (req, res) => controller.create(req, res));
router.post('/bulk-copy', (req, res) => controller.bulkCopyToCategory(req, res));
router.post('/:id/copy', (req, res) => controller.copyToCategory(req, res));
router.get('/', (req, res) => controller.findAll(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));
router.get('/:id/materialized', (req, res) => controller.getMaterializedAmount(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
