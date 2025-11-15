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
    const prismaExpense = await prisma.expense.create({
      data: {
        date: data.date,
        description: data.description,
        categoryId: data.categoryId,
        provisionId: data.provisionId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
      },
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
    const prismaExpense = await prisma.expense.update({
      where: { id },
      data: {
        ...(data.date && { date: data.date }),
        ...(data.description && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
      },
    });

    return ExpenseMapper.toDomain(prismaExpense);
  }

  async delete(id: string): Promise<void> {
    await prisma.expense.delete({
      where: { id },
    });
  }
}
