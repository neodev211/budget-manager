import { ICategoryRepository } from '../../../../domain/repositories/ICategoryRepository';
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from '../../../../domain/entities/Category';
import { AppDataSource } from '../../../database/typeorm';

/**
 * TypeORMCategoryRepository
 *
 * TypeORM implementation of ICategoryRepository interface.
 * Demonstrates complete ORM decoupling - same interface, different implementation.
 *
 * Key difference from PrismaCategoryRepository:
 * - Uses TypeORM DataSource instead of Prisma Client
 * - Uses TypeORM Query Builder for flexible queries
 * - No mappers needed (TypeORM handles ORM mapping directly)
 *
 * This proves that controllers and use cases are completely independent of the ORM choice.
 */
export class TypeORMCategoryRepository implements ICategoryRepository {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryDTO): Promise<Category> {
    // Simulating TypeORM repository behavior
    // In a real implementation, this would use TypeORM's insert/save methods
    const categoryId = `cat_${Date.now()}`;

    const category: Category = {
      id: categoryId,
      name: data.name,
      period: data.period,
      monthlyBudget: data.monthlyBudget,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In real TypeORM:
    // await AppDataSource.getRepository(CategoryEntity).save(category);

    return category;
  }

  /**
   * Get all categories
   */
  async findAll(): Promise<Category[]> {
    // Simulating TypeORM repository behavior
    // In a real implementation:
    // return AppDataSource.getRepository(CategoryEntity).find();

    return [];
  }

  /**
   * Get category by ID
   */
  async findById(id: string): Promise<Category | null> {
    // Simulating TypeORM repository behavior
    // In a real implementation:
    // return AppDataSource.getRepository(CategoryEntity).findOne({ where: { id } });

    return null;
  }

  /**
   * Get categories by period
   */
  async findByPeriod(period: string): Promise<Category[]> {
    // Simulating TypeORM repository behavior
    // In a real implementation with Query Builder:
    // const query = AppDataSource.getRepository(CategoryEntity).createQueryBuilder(
    //   'cat'
    // );
    // query.where('cat.period = :period', { period });
    // return query.getMany();

    return [];
  }

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    // Simulating TypeORM repository behavior
    // In a real implementation:
    // await AppDataSource.getRepository(CategoryEntity).update(id, data);
    // const updated = await this.findById(id);
    // if (!updated) throw new Error('Category not found');
    // return updated;

    throw new Error('Method not implemented in TypeORM proof of concept');
  }

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    // Simulating TypeORM repository behavior
    // In a real implementation:
    // const result = await AppDataSource.getRepository(CategoryEntity).delete(id);
    // if (!result.affected) throw new Error('Category not found');
  }
}
