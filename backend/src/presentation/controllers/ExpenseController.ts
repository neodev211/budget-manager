import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/di';
import { ValidationError } from '../../application/services/ValidationService';

/**
 * ExpenseController
 *
 * Handles HTTP requests for expense operations.
 * Uses dependency injection to access use cases.
 * All business logic is delegated to use cases.
 */
export class ExpenseController {
  /**
   * POST /api/expenses
   * Create a new expense
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getCreateExpenseUseCase();
      const expense = await useCase.execute(req.body);
      res.status(201).json(expense);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * GET /api/expenses
   * Get all expenses, optionally filtered by category, provision, or date range
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const provisionId = req.query.provisionId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      // Get the expense repository for direct queries
      const repository = DIContainer.getExpenseRepositoryInstance();
      let expenses;

      if (startDate && endDate) {
        expenses = await repository.findByDateRange(
          new Date(startDate),
          new Date(endDate)
        );
      } else if (categoryId) {
        expenses = await repository.findByCategoryId(categoryId);
      } else if (provisionId) {
        expenses = await repository.findByProvisionId(provisionId);
      } else {
        expenses = await repository.findAll();
      }

      res.json(expenses);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * GET /api/expenses/:id
   * Get a specific expense by ID
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getGetExpenseByIdUseCase();
      const expense = await useCase.execute(req.params.id);
      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json(expense);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  /**
   * PUT /api/expenses/:id
   * Update an expense
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getUpdateExpenseUseCase();
      const expense = await useCase.execute(req.params.id, req.body);
      res.json(expense);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  /**
   * DELETE /api/expenses/:id
   * Delete an expense
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const useCase = DIContainer.getDeleteExpenseUseCase();
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
