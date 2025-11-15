import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../entities/Category';

export interface ICategoryRepository {
  create(data: CreateCategoryDTO): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findByPeriod(period: string): Promise<Category[]>;
  update(id: string, data: UpdateCategoryDTO): Promise<Category>;
  delete(id: string): Promise<void>;
}
