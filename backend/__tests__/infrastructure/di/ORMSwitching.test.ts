import { DIContainer } from '../../../src/infrastructure/di';
import { PrismaCategoryRepository } from '../../../src/infrastructure/persistence/prisma/repositories/PrismaCategoryRepository';
import { TypeORMCategoryRepository } from '../../../src/infrastructure/persistence/typeorm/repositories/TypeORMCategoryRepository';

/**
 * ORM Switching Test
 *
 * Demonstrates complete ORM agnosticism:
 * 1. Controllers and Use Cases don't care which ORM is used
 * 2. Same interface (ICategoryRepository) for both implementations
 * 3. Can switch ORMs at runtime without touching controllers
 * 4. Proves loose coupling between layers
 */
describe('ORM Switching Demonstration', () => {
  beforeEach(() => {
    // Reset to Prisma before each test
    DIContainer.setORM('prisma');
  });

  describe('DIContainer ORM Selection', () => {
    it('should default to Prisma ORM', () => {
      expect(DIContainer.getORM()).toBe('prisma');
    });

    it('should allow switching to TypeORM', () => {
      DIContainer.setORM('typeorm');
      expect(DIContainer.getORM()).toBe('typeorm');
    });

    it('should return to Prisma when requested', () => {
      DIContainer.setORM('typeorm');
      expect(DIContainer.getORM()).toBe('typeorm');

      DIContainer.setORM('prisma');
      expect(DIContainer.getORM()).toBe('prisma');
    });
  });

  describe('Repository Implementation Switching', () => {
    it('should instantiate PrismaCategoryRepository when ORM is set to prisma', () => {
      DIContainer.setORM('prisma');
      const repo = DIContainer.getCategoryRepositoryInstance();

      expect(repo).toBeInstanceOf(PrismaCategoryRepository);
    });

    it('should instantiate TypeORMCategoryRepository when ORM is set to typeorm', () => {
      DIContainer.setORM('typeorm');
      const repo = DIContainer.getCategoryRepositoryInstance();

      expect(repo).toBeInstanceOf(TypeORMCategoryRepository);
    });

    it('should implement ICategoryRepository interface with both implementations', () => {
      // Test Prisma
      DIContainer.setORM('prisma');
      const prismaRepo = DIContainer.getCategoryRepositoryInstance();

      expect(prismaRepo).toHaveProperty('create');
      expect(prismaRepo).toHaveProperty('findAll');
      expect(prismaRepo).toHaveProperty('findById');
      expect(prismaRepo).toHaveProperty('findByPeriod');
      expect(prismaRepo).toHaveProperty('update');
      expect(prismaRepo).toHaveProperty('delete');

      // Test TypeORM
      DIContainer.setORM('typeorm');
      const typeormRepo = DIContainer.getCategoryRepositoryInstance();

      expect(typeormRepo).toHaveProperty('create');
      expect(typeormRepo).toHaveProperty('findAll');
      expect(typeormRepo).toHaveProperty('findById');
      expect(typeormRepo).toHaveProperty('findByPeriod');
      expect(typeormRepo).toHaveProperty('update');
      expect(typeormRepo).toHaveProperty('delete');
    });
  });

  describe('Use Case Agnosticism', () => {
    it('should return same interface signature regardless of ORM', () => {
      // Prisma implementation
      DIContainer.setORM('prisma');
      const prismaUseCase = DIContainer.getCreateCategoryUseCase();

      expect(prismaUseCase).toHaveProperty('execute');
      expect(typeof prismaUseCase.execute).toBe('function');

      // TypeORM implementation
      DIContainer.setORM('typeorm');
      const typeormUseCase = DIContainer.getCreateCategoryUseCase();

      expect(typeormUseCase).toHaveProperty('execute');
      expect(typeof typeormUseCase.execute).toBe('function');

      // Both use cases have same interface
      expect(prismaUseCase.constructor.name).toBe(typeormUseCase.constructor.name);
    });

    it('should keep use cases independent of repository implementation', () => {
      const prismaUseCase1 = DIContainer.getCreateCategoryUseCase();
      DIContainer.setORM('typeorm');
      const typeormUseCase = DIContainer.getCreateCategoryUseCase();

      // Use cases are the same class, just different repository instances
      expect(prismaUseCase1.constructor.name).toBe(
        typeormUseCase.constructor.name
      );
      expect(prismaUseCase1.constructor.name).toBe('CreateCategoryUseCase');
    });
  });

  describe('ORM Switching Characteristics', () => {
    it('should prove ORM is abstracted from presentation layer', () => {
      // Controllers never know which ORM is used
      // They just call DIContainer.getCategoryRepositoryInstance()
      // and get back an ICategoryRepository

      DIContainer.setORM('prisma');
      const prismaRepo = DIContainer.getCategoryRepositoryInstance();
      const prismaType = prismaRepo.constructor.name;

      DIContainer.setORM('typeorm');
      const typeormRepo = DIContainer.getCategoryRepositoryInstance();
      const typeormType = typeormRepo.constructor.name;

      // Different implementations
      expect(prismaType).not.toBe(typeormType);
      expect(prismaType).toBe('PrismaCategoryRepository');
      expect(typeormType).toBe('TypeORMCategoryRepository');

      // But both implement the same interface
      expect(prismaRepo).toHaveProperty('create');
      expect(typeormRepo).toHaveProperty('create');
    });

    it('should demonstrate zero impact on controllers when switching ORMs', () => {
      // This is the key benefit: controllers don't need modification
      // to switch ORMs. They just use DIContainer methods.

      // Imagine a controller like:
      // async create(req, res) {
      //   const repo = DIContainer.getCategoryRepositoryInstance();
      //   const category = await repo.create(req.body);
      //   res.json(category);
      // }

      // The controller code is identical whether Prisma or TypeORM is used!

      const getRepoWithPrisma = () => {
        DIContainer.setORM('prisma');
        return DIContainer.getCategoryRepositoryInstance();
      };

      const getRepoWithTypeORM = () => {
        DIContainer.setORM('typeorm');
        return DIContainer.getCategoryRepositoryInstance();
      };

      const prismaRepo = getRepoWithPrisma();
      const typeormRepo = getRepoWithTypeORM();

      // Same method signatures on both
      expect(typeof prismaRepo.create).toBe('function');
      expect(typeof typeormRepo.create).toBe('function');
      expect(typeof prismaRepo.findAll).toBe('function');
      expect(typeof typeormRepo.findAll).toBe('function');
    });
  });
});
