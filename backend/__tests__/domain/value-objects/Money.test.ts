import { Money } from '../../../src/domain/value-objects/Money';

describe('Money Value Object', () => {
  describe('Constructor', () => {
    it('should create money from number', () => {
      const money = new Money(100);
      expect(money.value).toBe(100);
    });

    it('should create money from string', () => {
      const money = new Money('100.50');
      expect(money.value).toBe(100.5);
    });

    it('should create money from decimal string', () => {
      const money = new Money('50.99');
      expect(money.value).toBe(50.99);
    });

    it('should round to 2 decimals automatically', () => {
      const money = new Money(100.555);
      expect(money.value).toBe(100.56);
    });

    it('should round down correctly', () => {
      const money = new Money(100.554);
      expect(money.value).toBe(100.55);
    });

    it('should throw on invalid string input', () => {
      expect(() => new Money('invalid')).toThrow('Invalid money amount: must be a valid number');
    });

    it('should throw on NaN', () => {
      expect(() => new Money(NaN)).toThrow('Invalid money amount: must be a valid number');
    });

    it('should handle zero correctly', () => {
      const money = new Money(0);
      expect(money.value).toBe(0);
    });

    it('should handle negative numbers', () => {
      const money = new Money(-50.25);
      expect(money.value).toBe(-50.25);
    });
  });

  describe('Factory Methods', () => {
    it('should create zero money with static zero()', () => {
      const money = Money.zero();
      expect(money.value).toBe(0);
      expect(money.isZero()).toBe(true);
    });

    it('should create money from Prisma Decimal object', () => {
      // Mock Prisma Decimal
      const prismaMockDecimal = {
        toNumber: () => 100.5,
      };
      const money = Money.fromDecimal(prismaMockDecimal);
      expect(money.value).toBe(100.5);
    });

    it('should create money from plain number when Decimal lacks toNumber', () => {
      const money = Money.fromDecimal(75.25);
      expect(money.value).toBe(75.25);
    });

    it('should handle null/undefined in fromDecimal', () => {
      const moneyFromNull = Money.fromDecimal(null);
      expect(moneyFromNull.value).toBe(0);

      const moneyFromUndefined = Money.fromDecimal(undefined);
      expect(moneyFromUndefined.value).toBe(0);
    });
  });

  describe('Validation Methods', () => {
    it('should identify positive money', () => {
      const money = new Money(100);
      expect(money.isPositive()).toBe(true);
      expect(money.isNegative()).toBe(false);
      expect(money.isZero()).toBe(false);
    });

    it('should identify negative money', () => {
      const money = new Money(-50);
      expect(money.isNegative()).toBe(true);
      expect(money.isPositive()).toBe(false);
      expect(money.isZero()).toBe(false);
    });

    it('should identify zero money', () => {
      const money = Money.zero();
      expect(money.isZero()).toBe(true);
      expect(money.isPositive()).toBe(false);
      expect(money.isNegative()).toBe(false);
    });
  });

  describe('Arithmetic Operations', () => {
    it('should add money correctly', () => {
      const a = new Money(100);
      const b = new Money(50);
      const result = a.add(b);
      expect(result.value).toBe(150);
    });

    it('should add with decimal precision', () => {
      const a = new Money(100.50);
      const b = new Money(50.25);
      const result = a.add(b);
      expect(result.value).toBe(150.75);
    });

    it('should subtract money correctly', () => {
      const a = new Money(100);
      const b = new Money(30);
      const result = a.subtract(b);
      expect(result.value).toBe(70);
    });

    it('should subtract with decimal precision', () => {
      const a = new Money(100.75);
      const b = new Money(25.50);
      const result = a.subtract(b);
      expect(result.value).toBe(75.25);
    });

    it('should multiply money by positive factor', () => {
      const money = new Money(100);
      const result = money.multiply(2);
      expect(result.value).toBe(200);
    });

    it('should multiply with decimal factor', () => {
      const money = new Money(100);
      const result = money.multiply(1.5);
      expect(result.value).toBe(150);
    });

    it('should multiply with decimal precision', () => {
      const money = new Money(33.33);
      const result = money.multiply(3);
      expect(result.value).toBe(99.99);
    });

    it('should throw when multiplying by negative factor', () => {
      const money = new Money(100);
      expect(() => money.multiply(-2)).toThrow('Cannot multiply money by negative factor');
    });

    it('should divide money by positive divisor', () => {
      const money = new Money(100);
      const result = money.divide(2);
      expect(result.value).toBe(50);
    });

    it('should divide with decimal precision', () => {
      const money = new Money(100);
      const result = money.divide(3);
      expect(result.value).toBeCloseTo(33.33, 2);
    });

    it('should throw when dividing by zero', () => {
      const money = new Money(100);
      expect(() => money.divide(0)).toThrow('Cannot divide money by zero');
    });
  });

  describe('Comparison Methods', () => {
    const a = new Money(100);
    const b = new Money(50);
    const c = new Money(100);

    it('should compare equals correctly', () => {
      expect(a.equals(c)).toBe(true);
      expect(a.equals(b)).toBe(false);
    });

    it('should compare greaterThan correctly', () => {
      expect(a.greaterThan(b)).toBe(true);
      expect(b.greaterThan(a)).toBe(false);
      expect(a.greaterThan(c)).toBe(false);
    });

    it('should compare lessThan correctly', () => {
      expect(b.lessThan(a)).toBe(true);
      expect(a.lessThan(b)).toBe(false);
      expect(a.lessThan(c)).toBe(false);
    });

    it('should compare greaterThanOrEqual correctly', () => {
      expect(a.greaterThanOrEqual(b)).toBe(true);
      expect(a.greaterThanOrEqual(c)).toBe(true);
      expect(b.greaterThanOrEqual(a)).toBe(false);
    });

    it('should compare lessThanOrEqual correctly', () => {
      expect(b.lessThanOrEqual(a)).toBe(true);
      expect(a.lessThanOrEqual(c)).toBe(true);
      expect(a.lessThanOrEqual(b)).toBe(false);
    });
  });

  describe('Conversion Methods', () => {
    it('should convert to string with 2 decimals', () => {
      const money = new Money(100.1);
      expect(money.toString()).toBe('100.10');
    });

    it('should convert whole number to string with decimals', () => {
      const money = new Money(100);
      expect(money.toString()).toBe('100.00');
    });

    it('should convert to JSON as number', () => {
      const money = new Money(100.50);
      expect(JSON.stringify(money)).toBe('100.5');
    });

    it('should handle edge case decimals in toString', () => {
      const money = new Money(0.01);
      expect(money.toString()).toBe('0.01');
    });
  });

  describe('Immutability', () => {
    it('should not modify original money after add operation', () => {
      const a = new Money(100);
      const b = new Money(50);
      const result = a.add(b);
      expect(a.value).toBe(100);
      expect(result.value).toBe(150);
    });

    it('should not modify original money after subtract operation', () => {
      const a = new Money(100);
      const b = new Money(30);
      const result = a.subtract(b);
      expect(a.value).toBe(100);
      expect(result.value).toBe(70);
    });

    it('should not modify original money after multiply operation', () => {
      const money = new Money(100);
      const result = money.multiply(2);
      expect(money.value).toBe(100);
      expect(result.value).toBe(200);
    });
  });

  describe('Chaining Operations', () => {
    it('should support operation chaining', () => {
      const money = new Money(100)
        .add(new Money(50))
        .subtract(new Money(25))
        .multiply(2);
      expect(money.value).toBe(250);
    });
  });
});
