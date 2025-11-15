import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../../domain/entities/Category';
import prisma from '../database/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class CategoryRepository implements ICategoryRepository {
  private toNumber(decimal: Decimal): number {
    return decimal.toNumber();
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        period: data.period,
        monthlyBudget: data.monthlyBudget,
        notes: data.notes,
      },
    });

    return {
      ...category,
      monthlyBudget: this.toNumber(category.monthlyBudget),
      notes: category.notes || undefined,
    };
  }

  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) return null;

    return {
      ...category,
      monthlyBudget: this.toNumber(category.monthlyBudget),
      notes: category.notes || undefined,
    };
  }

  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return categories.map((cat: any) => ({
      ...cat,
      monthlyBudget: this.toNumber(cat.monthlyBudget),
    }));
  }

  async findByPeriod(period: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { period },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat: any) => ({
      ...cat,
      monthlyBudget: this.toNumber(cat.monthlyBudget),
    }));
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.period && { period: data.period }),
        ...(data.monthlyBudget !== undefined && { monthlyBudget: data.monthlyBudget }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return {
      ...category,
      monthlyBudget: this.toNumber(category.monthlyBudget),
      notes: category.notes || undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }
}
