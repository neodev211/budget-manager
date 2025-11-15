import { randomUUID } from 'crypto';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../../../domain/entities/Category';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';

/**
 * Helper function to generate a unique UUID
 */
function generateId(): string {
  return randomUUID();
}

/**
 * InMemoryCategoryRepository
 *
 * In-memory implementation of ICategoryRepository for testing.
 * Stores categories in a Map instead of the database.
 *
 * Perfect for:
 * - Unit testing use cases without database
 * - Integration testing
 * - Mocking in test suites
 */
export class InMemoryCategoryRepository implements ICategoryRepository {
  private categories: Map<string, Category> = new Map();

  async create(data: CreateCategoryDTO): Promise<Category> {
    const id = generateId();
    const now = new Date();

    const category: Category = {
      id,
      name: data.name,
      period: data.period,
      monthlyBudget: data.monthlyBudget,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    this.categories.set(id, category);
    return category;
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.get(id) || null;
  }

  async findAll(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async findByPeriod(period: string): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      cat => cat.period === period
    );
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) {
      throw new Error(`Category with id "${id}" not found`);
    }

    const updated: Category = {
      ...category,
      ...data,
      updatedAt: new Date(),
    };

    this.categories.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!this.categories.has(id)) {
      throw new Error(`Category with id "${id}" not found`);
    }
    this.categories.delete(id);
  }

  /**
   * Clear all categories (useful for test cleanup)
   */
  clear(): void {
    this.categories.clear();
  }

  /**
   * Get size of repository (useful for assertions)
   */
  size(): number {
    return this.categories.size;
  }
}
