import { CategoryMapper } from '../../../../../src/infrastructure/persistence/prisma/mappers/CategoryMapper';
import { Category as CategoryEntity } from '@prisma/client';
import { Category } from '../../../../../src/domain/entities/Category';
import { Money } from '../../../../../src/domain/value-objects/Money';
import { Period } from '../../../../../src/domain/value-objects/Period';

describe('CategoryMapper', () => {
  // Mock Prisma Category
  const mockPrismaCategory: CategoryEntity = {
    id: 'cat-1',
    name: 'Food',
    period: '2025-01',
    monthlyBudget: {
      toNumber: () => 500.5,
    } as any,
    notes: 'Grocery budget',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  };

  // Mock Domain Category
  const mockDomainCategory: Category = {
    id: 'cat-1',
    name: 'Food',
    period: '2025-01',
    monthlyBudget: 500.5,
    notes: 'Grocery budget',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  };

  describe('toDomain', () => {
    it('should convert Prisma Category to Domain Category', () => {
      const result = CategoryMapper.toDomain(mockPrismaCategory);

      expect(result.id).toBe('cat-1');
      expect(result.name).toBe('Food');
      expect(result.period).toBe('2025-01');
      expect(result.monthlyBudget).toBe(500.5);
      expect(result.notes).toBe('Grocery budget');
      expect(result.createdAt).toEqual(new Date('2025-01-01'));
      expect(result.updatedAt).toEqual(new Date('2025-01-02'));
    });

    it('should handle undefined notes', () => {
      const categoryWithoutNotes: CategoryEntity = {
        ...mockPrismaCategory,
        notes: null,
      };

      const result = CategoryMapper.toDomain(categoryWithoutNotes);
      expect(result.notes).toBeUndefined();
    });

    it('should convert Decimal to Money correctly', () => {
      const result = CategoryMapper.toDomain(mockPrismaCategory);
      expect(result.monthlyBudget).toBe(500.5);
    });

    it('should handle zero budget', () => {
      const zeroCategory: CategoryEntity = {
        ...mockPrismaCategory,
        monthlyBudget: { toNumber: () => 0 } as any,
      };

      const result = CategoryMapper.toDomain(zeroCategory);
      expect(result.monthlyBudget).toBe(0);
    });

    it('should handle large amounts', () => {
      const largeCategory: CategoryEntity = {
        ...mockPrismaCategory,
        monthlyBudget: { toNumber: () => 999999.99 } as any,
      };

      const result = CategoryMapper.toDomain(largeCategory);
      expect(result.monthlyBudget).toBe(999999.99);
    });
  });

  describe('toDomainArray', () => {
    it('should convert array of Prisma Categories to Domain Categories', () => {
      const categories = [
        mockPrismaCategory,
        {
          ...mockPrismaCategory,
          id: 'cat-2',
          name: 'Transport',
          monthlyBudget: { toNumber: () => 200 } as any,
        },
      ];

      const result = CategoryMapper.toDomainArray(categories);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('cat-1');
      expect(result[1].id).toBe('cat-2');
      expect(result[1].name).toBe('Transport');
      expect(result[1].monthlyBudget).toBe(200);
    });

    it('should handle empty array', () => {
      const result = CategoryMapper.toDomainArray([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('toPersistence', () => {
    it('should convert Domain Category to Prisma format', () => {
      const result = CategoryMapper.toPersistence(mockDomainCategory);

      expect(result.id).toBe('cat-1');
      expect(result.name).toBe('Food');
      expect(result.period).toBe('2025-01');
      expect(result.monthlyBudget).toBe(500.5);
      expect(result.notes).toBe('Grocery budget');
    });

    it('should convert undefined notes to null', () => {
      const categoryWithoutNotes: Category = {
        ...mockDomainCategory,
        notes: undefined,
      };

      const result = CategoryMapper.toPersistence(categoryWithoutNotes);
      expect(result.notes).toBeNull();
    });

    it('should preserve all required fields', () => {
      const result = CategoryMapper.toPersistence(mockDomainCategory);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('period');
      expect(result).toHaveProperty('monthlyBudget');
    });
  });

  describe('getPeriod', () => {
    it('should return Period value object', () => {
      const result = CategoryMapper.getPeriod(mockPrismaCategory);

      expect(result).toBeInstanceOf(Period);
      expect(result.value).toBe('2025-01');
      expect(result.getYear()).toBe(2025);
      expect(result.getMonth()).toBe(1);
    });

    it('should support period navigation on returned object', () => {
      const period = CategoryMapper.getPeriod(mockPrismaCategory);
      const nextPeriod = period.next();

      expect(nextPeriod.value).toBe('2025-02');
    });
  });

  describe('getMonthlyBudget', () => {
    it('should return Money value object', () => {
      const result = CategoryMapper.getMonthlyBudget(mockPrismaCategory);

      expect(result).toBeInstanceOf(Money);
      expect(result.value).toBe(500.5);
    });

    it('should support arithmetic operations on returned Money', () => {
      const budget = CategoryMapper.getMonthlyBudget(mockPrismaCategory);
      const half = budget.divide(2);

      expect(half.value).toBe(250.25);
    });

    it('should handle Decimal with toNumber method', () => {
      const categoryWithDecimal: CategoryEntity = {
        ...mockPrismaCategory,
        monthlyBudget: { toNumber: () => 1000.55 } as any,
      };

      const result = CategoryMapper.getMonthlyBudget(categoryWithDecimal);
      expect(result.value).toBe(1000.55);
    });
  });

  describe('Round-trip conversion', () => {
    it('should convert Prisma → Domain → Prisma without data loss', () => {
      // Prisma → Domain
      const domain = CategoryMapper.toDomain(mockPrismaCategory);

      // Domain → Prisma
      const persistence = CategoryMapper.toPersistence(domain);

      expect(persistence.id).toBe(mockPrismaCategory.id);
      expect(persistence.name).toBe(mockPrismaCategory.name);
      expect(persistence.period).toBe(mockPrismaCategory.period);
      expect(persistence.monthlyBudget).toBe(500.5);
      expect(persistence.notes).toBe(mockPrismaCategory.notes);
    });
  });

  describe('Edge cases', () => {
    it('should handle category with special characters in name', () => {
      const specialCategory: CategoryEntity = {
        ...mockPrismaCategory,
        name: 'Café & Restaurant',
      };

      const result = CategoryMapper.toDomain(specialCategory);
      expect(result.name).toBe('Café & Restaurant');
    });

    it('should handle period with valid format', () => {
      const categories = [
        { ...mockPrismaCategory, period: '2020-01' },
        { ...mockPrismaCategory, period: '2025-12' },
        { ...mockPrismaCategory, period: '1999-06' },
      ];

      categories.forEach(cat => {
        const period = CategoryMapper.getPeriod(cat);
        expect(Period.isValid(period.value)).toBe(true);
      });
    });

    it('should preserve exact decimal values', () => {
      const amounts = [0.01, 0.5, 1.5, 99.99, 100.0];

      amounts.forEach(amount => {
        const category: CategoryEntity = {
          ...mockPrismaCategory,
          monthlyBudget: { toNumber: () => amount } as any,
        };

        const result = CategoryMapper.toDomain(category);
        expect(result.monthlyBudget).toBe(amount);
      });
    });
  });

  describe('Value object integration', () => {
    it('should create Period that can be compared', () => {
      const category = CategoryMapper.toDomain(mockPrismaCategory);
      const period = new Period(category.period);

      expect(period.value).toBe('2025-01');
      expect(period.isInPast()).toBe(true);
    });

    it('should create Money that supports operations', () => {
      const category = CategoryMapper.toDomain(mockPrismaCategory);
      const money = new Money(category.monthlyBudget);

      expect(money.isPositive()).toBe(true);
      expect(money.value).toBe(500.5);
    });
  });
});
