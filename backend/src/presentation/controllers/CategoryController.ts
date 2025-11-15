import { Request, Response } from 'express';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';

const categoryRepo = new CategoryRepository();

export class CategoryController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const category = await categoryRepo.create(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string | undefined;
      const categories = period
        ? await categoryRepo.findByPeriod(period)
        : await categoryRepo.findAll();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const category = await categoryRepo.findById(req.params.id);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const category = await categoryRepo.update(req.params.id, req.body);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await categoryRepo.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
