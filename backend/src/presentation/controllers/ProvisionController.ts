import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/di';
import { ValidationError } from '../../application/services/ValidationService';

/**
 * ProvisionController
 *
 * Handles HTTP requests for provision operations.
 * Uses dependency injection to access use cases.
 * All business logic is delegated to use cases.
 */
export class ProvisionController {
  /**
   * POST /api/provisions
   * Create a new provision
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
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
   * Get all provisions, optionally filtered by category or open status
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const openOnly = req.query.openOnly === 'true';

      // Get the provision repository for direct queries
      const repository = DIContainer.getProvisionRepositoryInstance();
      let provisions;

      if (openOnly) {
        provisions = await repository.findOpenProvisions();
      } else if (categoryId) {
        provisions = await repository.findByCategoryId(categoryId);
      } else {
        provisions = await repository.findAll();
      }

      res.json(provisions);
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
   * Get a specific provision by ID
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getGetProvisionByIdUseCase();
      const provision = await useCase.execute(req.params.id);
      if (!provision) {
        res.status(404).json({ error: 'Provision not found' });
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
   * Update a provision
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getUpdateProvisionUseCase();
      const provision = await useCase.execute(req.params.id, req.body);
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
   * Delete a provision
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getDeleteProvisionUseCase();
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

  /**
   * GET /api/provisions/:id/materialized-amount
   * Get the materialized amount for a provision
   *
   * Note: This endpoint will be refactored in future phases
   * to use a dedicated use case for this calculation
   */
  async getMaterializedAmount(req: Request, res: Response): Promise<void> {
    try {
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
   * Copy a provision to another category
   *
   * Note: This endpoint will be refactored in future phases
   * to use a dedicated use case
   */
  async copyToCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { targetCategoryId } = req.body;

      if (!targetCategoryId) {
        res.status(400).json({ error: 'targetCategoryId is required' });
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
   * Copy multiple provisions to another category
   *
   * Note: This endpoint will be refactored in future phases
   * to use a dedicated use case
   */
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
