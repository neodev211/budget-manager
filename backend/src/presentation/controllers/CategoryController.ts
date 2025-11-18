import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/di';
import { ValidationError } from '../../application/services/ValidationService';
import { AuthRequest } from '../../infrastructure/middleware/authMiddleware';

/**
 * CategoryController
 *
 * Handles HTTP requests for category operations.
 * Uses dependency injection to access use cases.
 * All business logic is delegated to use cases.
 *
 * SECURITY: All operations are scoped to the authenticated user (userId)
 */
export class CategoryController {
  /**
   * POST /api/categories
   * Create a new category for the authenticated user
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const useCase = DIContainer.getCreateCategoryUseCase();

      // Add userId from auth token to the request body
      const categoryData = {
        ...req.body,
        userId: authReq.userId,
      };

      const category = await useCase.execute(categoryData);
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
   * Get all categories for the authenticated user, optionally filtered by period
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const period = req.query.period as string | undefined;
      const useCase = DIContainer.getGetCategoriesUseCase();

      // Filter by userId to ensure multi-tenancy
      const categories = await useCase.execute({
        userId: authReq.userId,
        period,
      });

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
   * Get a specific category by ID (must belong to authenticated user)
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const useCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await useCase.execute(req.params.id);

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      // Security check: Ensure category belongs to authenticated user
      if (category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This category does not belong to you' });
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
   * Update a category (must belong to authenticated user)
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const useCase = DIContainer.getGetCategoryByIdUseCase();

      // First, check if category exists and belongs to user
      const existingCategory = await useCase.execute(req.params.id);
      if (!existingCategory) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      if (existingCategory.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This category does not belong to you' });
        return;
      }

      // Proceed with update
      const updateUseCase = DIContainer.getUpdateCategoryUseCase();
      const category = await updateUseCase.execute(req.params.id, req.body);
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
   * Delete a category (must belong to authenticated user)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const useCase = DIContainer.getGetCategoryByIdUseCase();

      // First, check if category exists and belongs to user
      const existingCategory = await useCase.execute(req.params.id);
      if (!existingCategory) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      if (existingCategory.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This category does not belong to you' });
        return;
      }

      // Proceed with delete
      const deleteUseCase = DIContainer.getDeleteCategoryUseCase();
      await deleteUseCase.execute(req.params.id);
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
