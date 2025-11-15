import { Request, Response } from 'express';
import { ExpenseRepository } from '../../infrastructure/repositories/ExpenseRepository';

const expenseRepo = new ExpenseRepository();

export class ExpenseController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const expense = await expenseRepo.create(req.body);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const provisionId = req.query.provisionId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      let expenses;
      if (startDate && endDate) {
        expenses = await expenseRepo.findByDateRange(new Date(startDate), new Date(endDate));
      } else if (categoryId) {
        expenses = await expenseRepo.findByCategoryId(categoryId);
      } else if (provisionId) {
        expenses = await expenseRepo.findByProvisionId(provisionId);
      } else {
        expenses = await expenseRepo.findAll();
      }

      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const expense = await expenseRepo.findById(req.params.id);
      if (!expense) {
        res.status(404).json({ error: 'Expense not found' });
        return;
      }
      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const expense = await expenseRepo.update(req.params.id, req.body);
      res.json(expense);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await expenseRepo.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
