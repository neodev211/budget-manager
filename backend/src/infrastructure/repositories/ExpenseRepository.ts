import { IExpenseRepository } from '../../domain/repositories/IExpenseRepository';
import { Expense, CreateExpenseDTO, UpdateExpenseDTO, PaymentMethod } from '../../domain/entities/Expense';
import prisma from '../database/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class ExpenseRepository implements IExpenseRepository {
  private toNumber(decimal: Decimal): number {
    return decimal.toNumber();
  }

  async create(data: CreateExpenseDTO): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        date: data.date,
        description: data.description,
        categoryId: data.categoryId,
        provisionId: data.provisionId,
        amount: data.amount,
        paymentMethod: data.paymentMethod || 'CASH',
      },
    });

    // Si el gasto está asociado a una provisión, verificar si debe cerrarse
    if (expense.provisionId) {
      await this.checkAndCloseProvisionIfFullyUsed(expense.provisionId);
    }

    return {
      ...expense,
      amount: this.toNumber(expense.amount),
      paymentMethod: expense.paymentMethod as PaymentMethod,
      provisionId: expense.provisionId || undefined,
    };
  }

  private async checkAndCloseProvisionIfFullyUsed(provisionId: string): Promise<void> {
    // Obtener la provisión y calcular el monto usado
    const provision = await prisma.provision.findUnique({
      where: { id: provisionId },
    });

    if (!provision) return;

    // Calcular el total de gastos asociados
    const expensesResult = await prisma.expense.aggregate({
      where: { provisionId },
      _sum: { amount: true },
    });

    const totalUsed = expensesResult._sum.amount ? this.toNumber(expensesResult._sum.amount) : 0;
    const provisionAmount = this.toNumber(provision.amount);

    // Si el monto usado es igual al monto provisionado (en valor absoluto), cerrar la provisión
    if (Math.abs(totalUsed) >= Math.abs(provisionAmount)) {
      await prisma.provision.update({
        where: { id: provisionId },
        data: { status: 'CLOSED' },
      });
    }
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) return null;

    return {
      ...expense,
      amount: this.toNumber(expense.amount),
      paymentMethod: expense.paymentMethod as PaymentMethod,
      provisionId: expense.provisionId || undefined,
    };
  }

  async findAll(): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });

    return expenses.map((exp: any) => ({
      ...exp,
      amount: this.toNumber(exp.amount),
      paymentMethod: exp.paymentMethod as PaymentMethod,
      provisionId: exp.provisionId || undefined,
    }));
  }

  async findByCategoryId(categoryId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { categoryId },
      orderBy: { date: 'desc' },
    });

    return expenses.map((exp: any) => ({
      ...exp,
      amount: this.toNumber(exp.amount),
      paymentMethod: exp.paymentMethod as PaymentMethod,
      provisionId: exp.provisionId || undefined,
    }));
  }

  async findByProvisionId(provisionId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { provisionId },
      orderBy: { date: 'desc' },
    });

    return expenses.map((exp: any) => ({
      ...exp,
      amount: this.toNumber(exp.amount),
      paymentMethod: exp.paymentMethod as PaymentMethod,
      provisionId: exp.provisionId || undefined,
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
      orderBy: { date: 'desc' },
    });

    return expenses.map((exp: any) => ({
      ...exp,
      amount: this.toNumber(exp.amount),
      paymentMethod: exp.paymentMethod as PaymentMethod,
      provisionId: exp.provisionId || undefined,
    }));
  }

  async update(id: string, data: UpdateExpenseDTO): Promise<Expense> {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(data.date && { date: data.date }),
        ...(data.description && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.provisionId !== undefined && { provisionId: data.provisionId }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
      },
    });

    return {
      ...expense,
      amount: this.toNumber(expense.amount),
      paymentMethod: expense.paymentMethod as PaymentMethod,
      provisionId: expense.provisionId || undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.expense.delete({
      where: { id },
    });
  }
}
