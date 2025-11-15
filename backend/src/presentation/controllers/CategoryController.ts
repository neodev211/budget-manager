import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/di';
import { ValidationError } from '../../application/services/ValidationService';

/**
 * CategoryController
 *
 * Handles HTTP requests for category operations.
 * Uses dependency injection to access use cases.
 * All business logic is delegated to use cases.
 */
export class CategoryController {
  /**
   * POST /api/categories
   * Create a new category
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getCreateCategoryUseCase();
      const category = await useCase.execute(req.body);
      res.status(201).json(category);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * GET /api/categories
   * Get all categories, optionally filtered by period
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string | undefined;
      const useCase = DIContainer.getGetCategoriesUseCase();
      const categories = await useCase.execute(period ? { period } : undefined);
      res.json(categories);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * GET /api/categories/:id
   * Get a specific category by ID
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await useCase.execute(req.params.id);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * PUT /api/categories/:id
   * Update a category
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getUpdateCategoryUseCase();
      const category = await useCase.execute(req.params.id, req.body);
      res.json(category);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * DELETE /api/categories/:id
   * Delete a category
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getDeleteCategoryUseCase();
      await useCase.execute(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}
