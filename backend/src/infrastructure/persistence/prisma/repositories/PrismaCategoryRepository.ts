import { ICategoryRepository } from '../../../../domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../../../../domain/entities/Category';
import { CategoryMapper } from '../mappers/CategoryMapper';
import prisma from '../../../database/prisma';

/**
 * PrismaCategoryRepository
 *
 * Prisma implementation of ICategoryRepository interface.
 * Uses CategoryMapper to convert between Prisma and Domain types.
 * All monetary values are properly converted using Money value object.
 */
export class PrismaCategoryRepository implements ICategoryRepository {
  async create(data: CreateCategoryDTO): Promise<Category> {
    const prismaCategory = await prisma.category.create({
      data: {
        userId: data.userId,
        name: data.name,
        period: data.period,
        monthlyBudget: data.monthlyBudget,
        notes: data.notes,
      },
    });

    return CategoryMapper.toDomain(prismaCategory);
  }

  async findById(id: string): Promise<Category | null> {
    const prismaCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!prismaCategory) return null;

    return CategoryMapper.toDomain(prismaCategory);
  }

  async findAll(): Promise<Category[]> {
    const prismaCategories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return CategoryMapper.toDomainArray(prismaCategories);
  }

  async findByPeriod(period: string): Promise<Category[]> {
    const prismaCategories = await prisma.category.findMany({
      where: { period },
      orderBy: { name: 'asc' },
    });

    return CategoryMapper.toDomainArray(prismaCategories);
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const prismaCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.period && { period: data.period }),
        ...(data.monthlyBudget !== undefined && { monthlyBudget: data.monthlyBudget }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return CategoryMapper.toDomain(prismaCategory);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }
}
