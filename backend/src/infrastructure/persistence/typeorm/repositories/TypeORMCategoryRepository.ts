import { ICategoryRepository } from '../../../../domain/repositories/ICategoryRepository';
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '../../../../domain/entities/Category';
import prisma from '../../../database/prisma';

/**
 * TypeORMCategoryRepository
 *
 * Hybrid implementation using Prisma client to access the actual database.
 * While named TypeORM (for architectural demonstration), this uses Prisma
 * to read/write data, proving that the interface is truly ORM-agnostic.
 *
 * This demonstrates:
 * - Same interface (ICategoryRepository) works with different implementations
 * - Controllers don't care about implementation details
 * - Data access layer is fully decoupled from presentation layer
 */
export class TypeORMCategoryRepository implements ICategoryRepository {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryDTO): Promise<Category> {
    const category = await prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        period: data.period,
        monthlyBudget: data.monthlyBudget,
      },
    });

    return {
      id: category.id,
      userId: category.userId,
      name: category.name,
      period: category.period,
      monthlyBudget: Number(category.monthlyBudget),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Get all categories
   */
  async findAll(): Promise<Category[]> {
    const categories = await prisma.category.findMany();

    return categories.map((cat) => ({
      id: cat.id,
      userId: cat.userId,
      name: cat.name,
      period: cat.period,
      monthlyBudget: Number(cat.monthlyBudget),
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  /**
   * Get category by ID
   */
  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) return null;

    return {
      id: category.id,
      userId: category.userId,
      name: category.name,
      period: category.period,
      monthlyBudget: Number(category.monthlyBudget),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Get categories by period
   */
  async findByPeriod(period: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { period },
    });

    return categories.map((cat) => ({
      id: cat.id,
      userId: cat.userId,
      name: cat.name,
      period: cat.period,
      monthlyBudget: Number(cat.monthlyBudget),
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  /**
   * Get categories by userId
   */
  async findByUserId(userId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { userId },
    });

    return categories.map((cat) => ({
      id: cat.id,
      userId: cat.userId,
      name: cat.name,
      period: cat.period,
      monthlyBudget: Number(cat.monthlyBudget),
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  /**
   * Get categories by userId and period
   */
  async findByUserIdAndPeriod(userId: string, period: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { userId, period },
    });

    return categories.map((cat) => ({
      id: cat.id,
      userId: cat.userId,
      name: cat.name,
      period: cat.period,
      monthlyBudget: Number(cat.monthlyBudget),
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  }

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        period: data.period,
        monthlyBudget: data.monthlyBudget,
      },
    });

    return {
      id: category.id,
      userId: category.userId,
      name: category.name,
      period: category.period,
      monthlyBudget: Number(category.monthlyBudget),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }
}
