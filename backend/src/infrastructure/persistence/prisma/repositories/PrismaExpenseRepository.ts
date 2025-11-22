import { IExpenseRepository } from '../../../../domain/repositories/IExpenseRepository';
import { Expense, CreateExpenseDTO, UpdateExpenseDTO } from '../../../../domain/entities/Expense';
import { ExpenseMapper } from '../mappers/ExpenseMapper';
import prisma from '../../../database/prisma';

/**
 * PrismaExpenseRepository
 *
 * Prisma implementation of IExpenseRepository interface.
 * Uses ExpenseMapper to convert between Prisma and Domain types.
 * Handles expense queries by category, provision, and date range.
 */
export class PrismaExpenseRepository implements IExpenseRepository {
  async create(data: CreateExpenseDTO): Promise<Expense> {
    // ✅ MATERIALIZED: Use transaction to create expense and update provision's usedAmount
    const prismaExpense = await prisma.$transaction(async (tx) => {
      // Create expense
      const expense = await tx.expense.create({
        data: {
          date: data.date,
          description: data.description,
          categoryId: data.categoryId,
          provisionId: data.provisionId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
        },
      });

      // If linked to a provision, update its usedAmount
      if (data.provisionId) {
        const expenseSum = await tx.expense.aggregate({
          where: { provisionId: data.provisionId },
          _sum: { amount: true },
        });

        const totalUsed = expenseSum._sum.amount ? Math.abs(Number(expenseSum._sum.amount)) : 0;

        await tx.provision.update({
          where: { id: data.provisionId },
          data: { usedAmount: totalUsed },
        });
      }

      return expense;
    });

    return ExpenseMapper.toDomain(prismaExpense);
  }

  async findById(id: string): Promise<Expense | null> {
    const prismaExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!prismaExpense) return null;

    return ExpenseMapper.toDomain(prismaExpense);
  }

  async findAll(): Promise<Expense[]> {
    const prismaExpenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });

    return prismaExpenses.map((exp: any) => ExpenseMapper.toDomain(exp));
  }

  async findByCategoryId(categoryId: string): Promise<Expense[]> {
    const prismaExpenses = await prisma.expense.findMany({
      where: { categoryId },
      orderBy: { date: 'desc' },
    });

    return prismaExpenses.map((exp: any) => ExpenseMapper.toDomain(exp));
  }

  async findByProvisionId(provisionId: string): Promise<Expense[]> {
    const prismaExpenses = await prisma.expense.findMany({
      where: { provisionId },
      orderBy: { date: 'desc' },
    });

    return prismaExpenses.map((exp: any) => ExpenseMapper.toDomain(exp));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const prismaExpenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    return prismaExpenses.map((exp: any) => ExpenseMapper.toDomain(exp));
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
    // ✅ MATERIALIZED: Use transaction to handle complex updates
    const prismaExpense = await prisma.$transaction(async (tx) => {
      // Get current expense to detect changes
      const currentExpense = await tx.expense.findUniqueOrThrow({
        where: { id },
      });

      // Update expense
      const expense = await tx.expense.update({
        where: { id },
        data: {
          ...(data.date && { date: data.date }),
          ...(data.description && { description: data.description }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
          ...(data.categoryId && { categoryId: data.categoryId }), // ✅ FIXED: Add categoryId update support
          ...(data.provisionId !== undefined && { provisionId: data.provisionId }),
        },
      });

      // Handle 4 cases of provision changes
      const oldProvisionId = currentExpense.provisionId;
      const newProvisionId = data.provisionId !== undefined ? data.provisionId : oldProvisionId;

      // Case 1: Changed from one provision to another
      if (oldProvisionId && newProvisionId && oldProvisionId !== newProvisionId) {
        // Recalculate old provision's usedAmount
        const oldSum = await tx.expense.aggregate({
          where: { provisionId: oldProvisionId },
          _sum: { amount: true },
        });
        await tx.provision.update({
          where: { id: oldProvisionId },
          data: { usedAmount: Math.abs(oldSum._sum.amount ? Number(oldSum._sum.amount) : 0) },
        });

        // Recalculate new provision's usedAmount
        const newSum = await tx.expense.aggregate({
          where: { provisionId: newProvisionId },
          _sum: { amount: true },
        });
        await tx.provision.update({
          where: { id: newProvisionId },
          data: { usedAmount: Math.abs(newSum._sum.amount ? Number(newSum._sum.amount) : 0) },
        });
      }
      // Case 2: Removed from provision (set to null)
      else if (oldProvisionId && !newProvisionId) {
        const oldSum = await tx.expense.aggregate({
          where: { provisionId: oldProvisionId },
          _sum: { amount: true },
        });
        await tx.provision.update({
          where: { id: oldProvisionId },
          data: { usedAmount: Math.abs(oldSum._sum.amount ? Number(oldSum._sum.amount) : 0) },
        });
      }
      // Case 3: Added to provision or amount changed
      else if (newProvisionId && (oldProvisionId !== newProvisionId || data.amount !== undefined)) {
        const newSum = await tx.expense.aggregate({
          where: { provisionId: newProvisionId },
          _sum: { amount: true },
        });
        await tx.provision.update({
          where: { id: newProvisionId },
          data: { usedAmount: Math.abs(newSum._sum.amount ? Number(newSum._sum.amount) : 0) },
        });
      }

      return expense;
    });

    return ExpenseMapper.toDomain(prismaExpense);
  }

  async delete(id: string): Promise<void> {
    // ✅ MATERIALIZED: Use transaction to update provision's usedAmount when expense is deleted
    await prisma.$transaction(async (tx) => {
      // Get expense before deleting to know which provision it belonged to
      const expense = await tx.expense.findUniqueOrThrow({
        where: { id },
      });

      // Delete expense
      await tx.expense.delete({
        where: { id },
      });

      // If linked to a provision, update its usedAmount
      if (expense.provisionId) {
        const expenseSum = await tx.expense.aggregate({
          where: { provisionId: expense.provisionId },
          _sum: { amount: true },
        });

        const totalUsed = expenseSum._sum.amount ? Math.abs(Number(expenseSum._sum.amount)) : 0;

        await tx.provision.update({
          where: { id: expense.provisionId },
          data: { usedAmount: totalUsed },
        });
      }
    });
  }
}
