import { IExpenseRepository } from '../../../../domain/repositories/IExpenseRepository';
import { Expense, CreateExpenseDTO, UpdateExpenseDTO, PaymentMethod } from '../../../../domain/entities/Expense';
import prisma from '../../../database/prisma';

/**
 * TypeORMExpenseRepository
 *
 * Functional implementation accessing real database via Prisma.
 * Demonstrates that the same interface works with different implementations.
 */
export class TypeORMExpenseRepository implements IExpenseRepository {
  async create(data: CreateExpenseDTO): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        categoryId: data.categoryId,
        date: data.date,
        provisionId: data.provisionId,
        paymentMethod: data.paymentMethod || 'CASH',
      },
    });

    return {
      id: expense.id,
      description: expense.description,
      amount: Number(expense.amount),
      categoryId: expense.categoryId,
      date: expense.date,
      provisionId: expense.provisionId || undefined,
      paymentMethod: expense.paymentMethod as PaymentMethod,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  async findAll(): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany();

    return expenses.map((exp) => ({
      id: exp.id,
      description: exp.description,
      amount: Number(exp.amount),
      categoryId: exp.categoryId,
      date: exp.date,
      provisionId: exp.provisionId || undefined,
      paymentMethod: exp.paymentMethod as PaymentMethod,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    }));
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) return null;

    return {
      id: expense.id,
      description: expense.description,
      amount: Number(expense.amount),
      categoryId: expense.categoryId,
      date: expense.date,
      provisionId: expense.provisionId || undefined,
      paymentMethod: expense.paymentMethod as PaymentMethod,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  async findByCategoryId(categoryId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { categoryId },
    });

    return expenses.map((exp) => ({
      id: exp.id,
      description: exp.description,
      amount: Number(exp.amount),
      categoryId: exp.categoryId,
      date: exp.date,
      provisionId: exp.provisionId || undefined,
      paymentMethod: exp.paymentMethod as PaymentMethod,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    }));
  }

  async findByProvisionId(provisionId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { provisionId },
    });

    return expenses.map((exp) => ({
      id: exp.id,
      description: exp.description,
      amount: Number(exp.amount),
      categoryId: exp.categoryId,
      date: exp.date,
      provisionId: exp.provisionId || undefined,
      paymentMethod: exp.paymentMethod as PaymentMethod,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    }));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return expenses.map((exp) => ({
      id: exp.id,
      description: exp.description,
      amount: Number(exp.amount),
      categoryId: exp.categoryId,
      date: exp.date,
      provisionId: exp.provisionId || undefined,
      paymentMethod: exp.paymentMethod as PaymentMethod,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
    }));
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        description: data.description,
        amount: data.amount,
        categoryId: data.categoryId,
        date: data.date,
        provisionId: data.provisionId,
        paymentMethod: data.paymentMethod,
      },
    });

    return {
      id: expense.id,
      description: expense.description,
      amount: Number(expense.amount),
      categoryId: expense.categoryId,
      date: expense.date,
      provisionId: expense.provisionId || undefined,
      paymentMethod: expense.paymentMethod as PaymentMethod,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.expense.delete({
      where: { id },
    });
  }
}
