import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../entities/Category';

/**
 * ICategoryRepository Interface
 *
 * Defines the contract for category data access.
 * Implementations can use different data sources (Prisma, TypeORM, InMemory, etc.)
 *
 * SECURITY: Methods that retrieve data must filter by userId for multi-tenancy
 */
export interface ICategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>; // Deprecated - use findByUserId instead
  findByPeriod(period: string): Promise<Category[]>; // Deprecated - use findByUserIdAndPeriod instead
  findByUserId(userId: string): Promise<Category[]>;
  findByUserIdAndPeriod(userId: string, period: string): Promise<Category[]>;
  update(id: string, data: UpdateCategoryDTO): Promise<Category>;
  delete(id: string): Promise<void>;
}
