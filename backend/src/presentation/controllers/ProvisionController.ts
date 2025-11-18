import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/di';
import { ValidationError } from '../../application/services/ValidationService';
import { AuthRequest } from '../../infrastructure/middleware/authMiddleware';

/**
 * ProvisionController
 *
 * Handles HTTP requests for provision operations.
 * Uses dependency injection to access use cases.
 * All business logic is delegated to use cases.
 *
 * SECURITY: All operations verify category ownership (multi-tenancy through Category)
 */
export class ProvisionController {
  /**
   * POST /api/provisions
   * Create a new provision (must provide categoryId that belongs to authenticated user)
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const { categoryId } = req.body;

      // Security check: Verify that the category belongs to the authenticated user
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await categoryUseCase.execute(categoryId);

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      if (category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This category does not belong to you' });
        return;
      }

      // Proceed with creation
      const useCase = DIContainer.getCreateProvisionUseCase();
      const provision = await useCase.execute(req.body);
      res.status(201).json(provision);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * GET /api/provisions
   * Get all provisions for the authenticated user, optionally filtered by category or open status
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const categoryId = req.query.categoryId as string | undefined;
      const openOnly = req.query.openOnly === 'true';

      // Security: First get all categories that belong to the authenticated user
      const categoriesUseCase = DIContainer.getGetCategoriesUseCase();
      const userCategories = await categoriesUseCase.execute({
        userId: authReq.userId,
      });

      // Extract category IDs
      const userCategoryIds = userCategories.map((c) => c.id);

      // If user has no categories, return empty array
      if (userCategoryIds.length === 0) {
        res.json([]);
        return;
      }

      // If filtering by specific category, verify it belongs to user
      if (categoryId) {
        if (!userCategoryIds.includes(categoryId)) {
          res.status(403).json({ error: 'Forbidden: This category does not belong to you' });
          return;
        }
      }

      // Get the provision repository for queries
      const repository = DIContainer.getProvisionRepositoryInstance();
      let provisions;

      if (openOnly) {
        provisions = await repository.findOpenProvisions();
      } else if (categoryId) {
        provisions = await repository.findByCategoryId(categoryId);
      } else {
        provisions = await repository.findAll();
      }

      // Filter provisions to only include those from user's categories
      const filteredProvisions = provisions.filter((p) =>
        userCategoryIds.includes(p.categoryId)
      );

      res.json(filteredProvisions);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * GET /api/provisions/:id
   * Get a specific provision by ID (must belong to authenticated user's category)
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const useCase = DIContainer.getGetProvisionByIdUseCase();
      const provision = await useCase.execute(req.params.id);

      if (!provision) {
        res.status(404).json({ error: 'Provision not found' });
        return;
      }

      // Security check: Verify that the provision's category belongs to the authenticated user
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await categoryUseCase.execute(provision.categoryId);

      if (!category || category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This provision does not belong to you' });
        return;
      }

      res.json(provision);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * PUT /api/provisions/:id
   * Update a provision (must belong to authenticated user's category)
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const getProvisionUseCase = DIContainer.getGetProvisionByIdUseCase();

      // First, check if provision exists and belongs to user's category
      const existingProvision = await getProvisionUseCase.execute(req.params.id);
      if (!existingProvision) {
        res.status(404).json({ error: 'Provision not found' });
        return;
      }

      // Security check: Verify that the provision's category belongs to the authenticated user
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await categoryUseCase.execute(existingProvision.categoryId);

      if (!category || category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This provision does not belong to you' });
        return;
      }

      // Proceed with update
      const updateUseCase = DIContainer.getUpdateProvisionUseCase();
      const provision = await updateUseCase.execute(req.params.id, req.body);
      res.json(provision);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * DELETE /api/provisions/:id
   * Delete a provision (must belong to authenticated user's category)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const getProvisionUseCase = DIContainer.getGetProvisionByIdUseCase();

      // First, check if provision exists and belongs to user's category
      const existingProvision = await getProvisionUseCase.execute(req.params.id);
      if (!existingProvision) {
        res.status(404).json({ error: 'Provision not found' });
        return;
      }

      // Security check: Verify that the provision's category belongs to the authenticated user
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await categoryUseCase.execute(existingProvision.categoryId);

      if (!category || category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This provision does not belong to you' });
        return;
      }

      // Proceed with delete
      const deleteUseCase = DIContainer.getDeleteProvisionUseCase();
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

  /**
   * GET /api/provisions/:id/materialized-amount
   * Get the materialized amount for a provision (must belong to authenticated user's category)
   *
   * Note: This endpoint will be refactored in future phases
   * to use a dedicated use case for this calculation
   */
  async getMaterializedAmount(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const getProvisionUseCase = DIContainer.getGetProvisionByIdUseCase();

      // First, check if provision exists and belongs to user's category
      const provision = await getProvisionUseCase.execute(req.params.id);
      if (!provision) {
        res.status(404).json({ error: 'Provision not found' });
        return;
      }

      // Security check: Verify that the provision's category belongs to the authenticated user
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await categoryUseCase.execute(provision.categoryId);

      if (!category || category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This provision does not belong to you' });
        return;
      }

      // Get the provision repository to calculate materialized amount
      // This is a direct repository call as there's no use case for this yet
      const repository = DIContainer.getProvisionRepositoryInstance();
      const amount = await (repository as any).calculateMaterializedAmount(req.params.id);
      res.json({ provisionId: req.params.id, materializedAmount: amount });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * POST /api/provisions/:id/copy
   * Copy a provision to another category (both categories must belong to authenticated user)
   *
   * Note: This endpoint will be refactored in future phases
   * to use a dedicated use case
   */
  async copyToCategory(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const { id } = req.params;
      const { targetCategoryId } = req.body;

      if (!targetCategoryId) {
        res.status(400).json({ error: 'targetCategoryId is required' });
        return;
      }

      const getProvisionUseCase = DIContainer.getGetProvisionByIdUseCase();
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();

      // Security check 1: Verify source provision's category belongs to user
      const sourceProvision = await getProvisionUseCase.execute(id);
      if (!sourceProvision) {
        res.status(404).json({ error: 'Source provision not found' });
        return;
      }

      const sourceCategory = await categoryUseCase.execute(sourceProvision.categoryId);
      if (!sourceCategory || sourceCategory.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: Source provision does not belong to you' });
        return;
      }

      // Security check 2: Verify target category belongs to user
      const targetCategory = await categoryUseCase.execute(targetCategoryId);
      if (!targetCategory) {
        res.status(404).json({ error: 'Target category not found' });
        return;
      }

      if (targetCategory.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: Target category does not belong to you' });
        return;
      }

      // Get the provision repository to copy provision
      // This is a direct repository call as there's no use case for this yet
      const repository = DIContainer.getProvisionRepositoryInstance();
      const copiedProvision = await (repository as any).copyToCategory(id, targetCategoryId);
      res.status(201).json(copiedProvision);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * POST /api/provisions/bulk-copy
   * Copy multiple provisions to another category (all provisions and target category must belong to authenticated user)
   *
   * Note: This endpoint will be refactored in future phases
   * to use a dedicated use case
   */
  async bulkCopyToCategory(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const { provisionIds, targetCategoryId } = req.body;

      if (!Array.isArray(provisionIds) || provisionIds.length === 0) {
        res.status(400).json({ error: 'provisionIds array is required and must not be empty' });
        return;
      }

      if (!targetCategoryId) {
        res.status(400).json({ error: 'targetCategoryId is required' });
        return;
      }

      const getProvisionUseCase = DIContainer.getGetProvisionByIdUseCase();
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();

      // Security check 1: Verify all source provisions belong to user's categories
      for (const provisionId of provisionIds) {
        const provision = await getProvisionUseCase.execute(provisionId);
        if (!provision) {
          res.status(404).json({ error: `Provision ${provisionId} not found` });
          return;
        }

        const category = await categoryUseCase.execute(provision.categoryId);
        if (!category || category.userId !== authReq.userId) {
          res.status(403).json({ error: `Forbidden: Provision ${provisionId} does not belong to you` });
          return;
        }
      }

      // Security check 2: Verify target category belongs to user
      const targetCategory = await categoryUseCase.execute(targetCategoryId);
      if (!targetCategory) {
        res.status(404).json({ error: 'Target category not found' });
        return;
      }

      if (targetCategory.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: Target category does not belong to you' });
        return;
      }

      // Get the provision repository to bulk copy provisions
      // This is a direct repository call as there's no use case for this yet
      const repository = DIContainer.getProvisionRepositoryInstance();
      const copiedProvisions = await (repository as any).bulkCopyToCategory(provisionIds, targetCategoryId);
      res.status(201).json(copiedProvisions);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
}
