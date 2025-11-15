import { Request, Response } from 'express';
import { ProvisionRepository } from '../../infrastructure/repositories/ProvisionRepository';

const provisionRepo = new ProvisionRepository();

export class ProvisionController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const provision = await provisionRepo.create(req.body);
      res.status(201).json(provision);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const openOnly = req.query.openOnly === 'true';

      let provisions;
      if (openOnly) {
        provisions = await provisionRepo.findOpenProvisions();
      } else if (categoryId) {
        provisions = await provisionRepo.findByCategoryId(categoryId);
      } else {
        provisions = await provisionRepo.findAll();
      }

      res.json(provisions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const provision = await provisionRepo.findById(req.params.id);
      if (!provision) {
        res.status(404).json({ error: 'Provision not found' });
        return;
      }
      res.json(provision);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const provision = await provisionRepo.update(req.params.id, req.body);
      res.json(provision);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await provisionRepo.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMaterializedAmount(req: Request, res: Response): Promise<void> {
    try {
      const amount = await provisionRepo.calculateMaterializedAmount(req.params.id);
      res.json({ provisionId: req.params.id, materializedAmount: amount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async copyToCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { targetCategoryId } = req.body;

      if (!targetCategoryId) {
        res.status(400).json({ error: 'targetCategoryId is required' });
        return;
      }

      const copiedProvision = await provisionRepo.copyToCategory(id, targetCategoryId);
      res.status(201).json(copiedProvision);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async bulkCopyToCategory(req: Request, res: Response): Promise<void> {
    try {
      const { provisionIds, targetCategoryId } = req.body;

      if (!Array.isArray(provisionIds) || provisionIds.length === 0) {
        res.status(400).json({ error: 'provisionIds array is required and must not be empty' });
        return;
      }

      if (!targetCategoryId) {
        res.status(400).json({ error: 'targetCategoryId is required' });
        return;
      }

      const copiedProvisions = await provisionRepo.bulkCopyToCategory(provisionIds, targetCategoryId);
      res.status(201).json(copiedProvisions);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
