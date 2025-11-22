import { Request, Response } from 'express';
import { DIContainer } from '../../infrastructure/di';
import { ValidationError } from '../../application/services/ValidationService';
import { AuthRequest } from '../../infrastructure/middleware/authMiddleware';

/**
 * ExpenseController
 *
 * Handles HTTP requests for expense operations.
 * Uses dependency injection to access use cases.
 * All business logic is delegated to use cases.
 *
 * SECURITY: All operations verify category ownership (multi-tenancy through Category)
 */
export class ExpenseController {
  /**
   * POST /api/expenses
   * Create a new expense (must provide categoryId that belongs to authenticated user)
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const { categoryId, provisionId } = req.body;

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

      // If provisionId is provided, verify it belongs to user's category
      if (provisionId) {
        const provisionUseCase = DIContainer.getGetProvisionByIdUseCase();
        const provision = await provisionUseCase.execute(provisionId);

        if (!provision) {
          res.status(404).json({ error: 'Provision not found' });
          return;
        }

        const provisionCategory = await categoryUseCase.execute(provision.categoryId);
        if (!provisionCategory || provisionCategory.userId !== authReq.userId) {
          res.status(403).json({ error: 'Forbidden: This provision does not belong to you' });
          return;
        }
      }

      // Proceed with creation
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
   * Get all expenses for the authenticated user, optionally filtered by category, provision, or date range
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const categoryId = req.query.categoryId as string | undefined;
      const provisionId = req.query.provisionId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

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

      // If filtering by specific provision, verify it belongs to user's category
      if (provisionId) {
        const provisionUseCase = DIContainer.getGetProvisionByIdUseCase();
        const provision = await provisionUseCase.execute(provisionId);

        if (!provision || !userCategoryIds.includes(provision.categoryId)) {
          res.status(403).json({ error: 'Forbidden: This provision does not belong to you' });
          return;
        }
      }

      // Get the expense repository for queries
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

      // Filter expenses to only include those from user's categories
      const filteredExpenses = expenses.filter((e) =>
        userCategoryIds.includes(e.categoryId)
      );

      res.json(filteredExpenses);
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
   * Get a specific expense by ID (must belong to authenticated user's category)
   */
  async findById(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const useCase = DIContainer.getGetExpenseByIdUseCase();
      const expense = await useCase.execute(req.params.id);

      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }

      // Security check: Verify that the expense's category belongs to the authenticated user
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await categoryUseCase.execute(expense.categoryId);

      if (!category || category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This expense does not belong to you' });
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
   * Update an expense (must belong to authenticated user's category)
   * SECURITY: Validates ownership of both existing and new category/provision
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const getExpenseUseCase = DIContainer.getGetExpenseByIdUseCase();

      // First, check if expense exists and belongs to user's category
      const existingExpense = await getExpenseUseCase.execute(req.params.id);
      if (!existingExpense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }

      // Security check: Verify that the expense's category belongs to the authenticated user
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await categoryUseCase.execute(existingExpense.categoryId);

      if (!category || category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This expense does not belong to you' });
        return;
      }

      // ✅ SECURITY FIX: Validate ownership of NEW category if changing it
      if (req.body.categoryId && req.body.categoryId !== existingExpense.categoryId) {
        const newCategory = await categoryUseCase.execute(req.body.categoryId);
        if (!newCategory) {
          res.status(404).json({ error: 'New category not found' });
          return;
        }
        if (newCategory.userId !== authReq.userId) {
          res.status(403).json({ error: 'Forbidden: The new category does not belong to you' });
          return;
        }
      }

      // ✅ SECURITY FIX: Validate ownership of NEW provision if changing it
      if (req.body.provisionId && req.body.provisionId !== existingExpense.provisionId) {
        const provisionUseCase = DIContainer.getGetProvisionByIdUseCase();
        const newProvision = await provisionUseCase.execute(req.body.provisionId);

        if (!newProvision) {
          res.status(404).json({ error: 'New provision not found' });
          return;
        }

        const provisionCategory = await categoryUseCase.execute(newProvision.categoryId);
        if (!provisionCategory || provisionCategory.userId !== authReq.userId) {
          res.status(403).json({ error: 'Forbidden: The new provision does not belong to you' });
          return;
        }
      }

      // Proceed with update
      const updateUseCase = DIContainer.getUpdateExpenseUseCase();
      const expense = await updateUseCase.execute(req.params.id, req.body);
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
   * Delete an expense (must belong to authenticated user's category)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const getExpenseUseCase = DIContainer.getGetExpenseByIdUseCase();

      // First, check if expense exists and belongs to user's category
      const existingExpense = await getExpenseUseCase.execute(req.params.id);
      if (!existingExpense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }

      // Security check: Verify that the expense's category belongs to the authenticated user
      const categoryUseCase = DIContainer.getGetCategoryByIdUseCase();
      const category = await categoryUseCase.execute(existingExpense.categoryId);

      if (!category || category.userId !== authReq.userId) {
        res.status(403).json({ error: 'Forbidden: This expense does not belong to you' });
        return;
      }

      // Proceed with delete
      const deleteUseCase = DIContainer.getDeleteExpenseUseCase();
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
