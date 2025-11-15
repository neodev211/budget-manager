import { ExpenseMapper } from '../../../../../src/infrastructure/persistence/prisma/mappers/ExpenseMapper';
import { Expense as ExpenseEntity, PaymentMethod as PrismaPaymentMethod } from '@prisma/client';
import { Expense, PaymentMethod } from '../../../../../src/domain/entities/Expense';
import { Money } from '../../../../../src/domain/value-objects/Money';

describe('ExpenseMapper', () => {
  // Mock Prisma Expense
  const mockPrismaExpense: ExpenseEntity = {
    id: 'exp-1',
    date: new Date('2025-01-15'),
    description: 'Grocery shopping',
    categoryId: 'cat-1',
    provisionId: null,
    amount: {
      toNumber: () => -50.75,
    } as any,
    paymentMethod: PrismaPaymentMethod.CARD,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  };

  // Mock Domain Expense
  const mockDomainExpense: Expense = {
    id: 'exp-1',
    date: new Date('2025-01-15'),
    description: 'Grocery shopping',
    categoryId: 'cat-1',
    provisionId: undefined,
    amount: -50.75,
    paymentMethod: PaymentMethod.CARD,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  };

  describe('toDomain', () => {
    it('should convert Prisma Expense to Domain Expense', () => {
      const result = ExpenseMapper.toDomain(mockPrismaExpense);

      expect(result.id).toBe('exp-1');
      expect(result.date).toEqual(new Date('2025-01-15'));
      expect(result.description).toBe('Grocery shopping');
      expect(result.categoryId).toBe('cat-1');
      expect(result.provisionId).toBeUndefined();
      expect(result.amount).toBe(-50.75);
      expect(result.paymentMethod).toBe(PaymentMethod.CARD);
    });

    it('should handle expense with provision', () => {
      const expenseWithProvision: ExpenseEntity = {
        ...mockPrismaExpense,
        provisionId: 'prov-1',
      };

      const result = ExpenseMapper.toDomain(expenseWithProvision);
      expect(result.provisionId).toBe('prov-1');
    });

    it('should convert all payment methods', () => {
      const methods = [
        PrismaPaymentMethod.CASH,
        PrismaPaymentMethod.TRANSFER,
        PrismaPaymentMethod.CARD,
        PrismaPaymentMethod.OTHER,
      ];

      methods.forEach(method => {
        const expense: ExpenseEntity = {
          ...mockPrismaExpense,
          paymentMethod: method,
        };

        const result = ExpenseMapper.toDomain(expense);
        expect(result.paymentMethod).toBe(method as PaymentMethod);
      });
    });

    it('should handle negative amounts (expenses)', () => {
      const result = ExpenseMapper.toDomain(mockPrismaExpense);
      expect(result.amount).toBeLessThan(0);
      expect(result.amount).toBe(-50.75);
    });

    it('should handle zero amount', () => {
      const zeroExpense: ExpenseEntity = {
        ...mockPrismaExpense,
        amount: { toNumber: () => 0 } as any,
      };

      const result = ExpenseMapper.toDomain(zeroExpense);
      expect(result.amount).toBe(0);
    });
  });

  describe('toDomainArray', () => {
    it('should convert array of Prisma Expenses to Domain Expenses', () => {
      const expenses = [
        mockPrismaExpense,
        {
          ...mockPrismaExpense,
          id: 'exp-2',
          amount: { toNumber: () => -25.5 } as any,
          description: 'Lunch',
        },
      ];

      const result = ExpenseMapper.toDomainArray(expenses);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('exp-1');
      expect(result[1].id).toBe('exp-2');
      expect(result[1].amount).toBe(-25.5);
    });

    it('should handle empty array', () => {
      const result = ExpenseMapper.toDomainArray([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('toPersistence', () => {
    it('should convert Domain Expense to Prisma format', () => {
      const result = ExpenseMapper.toPersistence(mockDomainExpense);

      expect(result.id).toBe('exp-1');
      expect(result.date).toEqual(new Date('2025-01-15'));
      expect(result.description).toBe('Grocery shopping');
      expect(result.categoryId).toBe('cat-1');
      expect(result.provisionId).toBeNull();
      expect(result.amount).toBe(-50.75);
      expect(result.paymentMethod).toBe(PaymentMethod.CARD);
    });

    it('should convert undefined provisionId to null', () => {
      const result = ExpenseMapper.toPersistence(mockDomainExpense);
      expect(result.provisionId).toBeNull();
    });

    it('should preserve provisionId when present', () => {
      const expenseWithProvision: Expense = {
        ...mockDomainExpense,
        provisionId: 'prov-1',
      };

      const result = ExpenseMapper.toPersistence(expenseWithProvision);
      expect(result.provisionId).toBe('prov-1');
    });
  });

  describe('getAmount', () => {
    it('should return Money value object', () => {
      const result = ExpenseMapper.getAmount(mockPrismaExpense);

      expect(result).toBeInstanceOf(Money);
      expect(result.value).toBe(-50.75);
    });

    it('should support arithmetic operations on returned Money', () => {
      const amount = ExpenseMapper.getAmount(mockPrismaExpense);
      const doubled = amount.multiply(2);

      expect(doubled.value).toBe(-101.5);
    });

    it('should correctly identify negative amounts', () => {
      const amount = ExpenseMapper.getAmount(mockPrismaExpense);
      expect(amount.isNegative()).toBe(true);
    });
  });

  describe('isExpense', () => {
    it('should identify negative amount as expense', () => {
      const result = ExpenseMapper.isExpense(mockPrismaExpense);
      expect(result).toBe(true);
    });

    it('should identify zero amount as expense', () => {
      const zeroExpense: ExpenseEntity = {
        ...mockPrismaExpense,
        amount: { toNumber: () => 0 } as any,
      };

      const result = ExpenseMapper.isExpense(zeroExpense);
      expect(result).toBe(true);
    });

    it('should handle domain expense format', () => {
      const result = ExpenseMapper.isExpense(mockDomainExpense);
      expect(result).toBe(true);
    });

    it('should identify positive amount as not expense', () => {
      const notExpense: ExpenseEntity = {
        ...mockPrismaExpense,
        amount: { toNumber: () => 100 } as any,
      };

      const result = ExpenseMapper.isExpense(notExpense);
      expect(result).toBe(false);
    });
  });

  describe('Round-trip conversion', () => {
    it('should convert Prisma → Domain → Prisma without data loss', () => {
      // Prisma → Domain
      const domain = ExpenseMapper.toDomain(mockPrismaExpense);

      // Domain → Prisma
      const persistence = ExpenseMapper.toPersistence(domain);

      expect(persistence.id).toBe(mockPrismaExpense.id);
      expect(persistence.date).toEqual(mockPrismaExpense.date);
      expect(persistence.description).toBe(mockPrismaExpense.description);
      expect(persistence.categoryId).toBe(mockPrismaExpense.categoryId);
      expect(persistence.amount).toBe(-50.75);
      expect(persistence.paymentMethod).toBe(PaymentMethod.CARD);
    });
  });

  describe('Edge cases', () => {
    it('should handle expense with special characters', () => {
      const specialExpense: ExpenseEntity = {
        ...mockPrismaExpense,
        description: 'Café @ Startup HQ',
      };

      const result = ExpenseMapper.toDomain(specialExpense);
      expect(result.description).toBe('Café @ Startup HQ');
    });

    it('should handle large negative amounts', () => {
      const largeExpense: ExpenseEntity = {
        ...mockPrismaExpense,
        amount: { toNumber: () => -9999.99 } as any,
      };

      const result = ExpenseMapper.toDomain(largeExpense);
      expect(result.amount).toBe(-9999.99);
    });

    it('should preserve exact decimal amounts', () => {
      const amounts = [-0.01, -0.5, -1.5, -99.99, -100.0];

      amounts.forEach(amount => {
        const expense: ExpenseEntity = {
          ...mockPrismaExpense,
          amount: { toNumber: () => amount } as any,
        };

        const result = ExpenseMapper.toDomain(expense);
        expect(result.amount).toBe(amount);
      });
    });

    it('should handle various dates', () => {
      const dates = [
        new Date('2025-01-01'),
        new Date('2025-06-15'),
        new Date('2025-12-31'),
      ];

      dates.forEach(date => {
        const expense: ExpenseEntity = {
          ...mockPrismaExpense,
          date,
        };

        const result = ExpenseMapper.toDomain(expense);
        expect(result.date).toEqual(date);
      });
    });
  });

  describe('Value object integration', () => {
    it('should create Money that can validate', () => {
      const expense = ExpenseMapper.toDomain(mockPrismaExpense);
      const money = new Money(expense.amount);

      expect(money.isNegative()).toBe(true);
      expect(money.value).toBe(-50.75);
    });

    it('should support complex money operations', () => {
      const amount1 = ExpenseMapper.getAmount(mockPrismaExpense);
      const amount2 = new Money(-25.5);

      const total = amount1.add(amount2);
      expect(total.value).toBe(-76.25);
    });
  });
});
