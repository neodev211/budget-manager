import { Period } from '../../../src/domain/value-objects/Period';

describe('Period Value Object', () => {
  describe('Constructor', () => {
    it('should create period with valid YYYY-MM format', () => {
      const period = new Period('2025-01');
      expect(period.value).toBe('2025-01');
    });

    it('should create period with valid format for different months', () => {
      const january = new Period('2025-01');
      const december = new Period('2025-12');
      expect(january.value).toBe('2025-01');
      expect(december.value).toBe('2025-12');
    });

    it('should throw on invalid format - single digit month', () => {
      expect(() => new Period('2025-1')).toThrow('Invalid period format');
    });

    it('should throw on invalid format - single digit year', () => {
      expect(() => new Period('25-01')).toThrow('Invalid period format');
    });

    it('should throw on invalid format - invalid separator', () => {
      expect(() => new Period('2025/01')).toThrow('Invalid period format');
    });

    it('should throw on completely invalid format', () => {
      expect(() => new Period('invalid')).toThrow('Invalid period format');
    });

    it('should throw on empty string', () => {
      expect(() => new Period('')).toThrow('Invalid period format');
    });

    it('should throw on null-like string', () => {
      expect(() => new Period('null')).toThrow('Invalid period format');
    });
  });

  describe('Static Validation', () => {
    it('should validate correct format', () => {
      expect(Period.isValid('2025-01')).toBe(true);
      expect(Period.isValid('2000-12')).toBe(true);
      expect(Period.isValid('1999-01')).toBe(true);
    });

    it('should invalidate incorrect formats', () => {
      expect(Period.isValid('2025-1')).toBe(false);
      expect(Period.isValid('25-01')).toBe(false);
      expect(Period.isValid('2025/01')).toBe(false);
      expect(Period.isValid('invalid')).toBe(false);
      expect(Period.isValid('')).toBe(false);
    });
  });

  describe('Factory Methods', () => {
    it('should create current period with now()', () => {
      const now = Period.now();
      const today = new Date();
      const expectedYear = today.getFullYear();
      const expectedMonth = String(today.getMonth() + 1).padStart(2, '0');
      expect(now.value).toBe(`${expectedYear}-${expectedMonth}`);
    });

    it('should create period from specific date', () => {
      const date = new Date(2025, 2, 15); // March 15, 2025 (month is 0-indexed)
      const period = Period.fromDate(date);
      expect(period.value).toBe('2025-03');
    });

    it('should create period from date correctly for January', () => {
      const date = new Date(2025, 0, 1); // January 1, 2025 (month is 0-indexed)
      const period = Period.fromDate(date);
      expect(period.value).toBe('2025-01');
    });

    it('should create period from date correctly for December', () => {
      const date = new Date(2025, 11, 31); // December 31, 2025 (month is 0-indexed)
      const period = Period.fromDate(date);
      expect(period.value).toBe('2025-12');
    });
  });

  describe('Extractors', () => {
    it('should extract year correctly', () => {
      const period = new Period('2025-06');
      expect(period.getYear()).toBe(2025);
    });

    it('should extract month correctly', () => {
      const period = new Period('2025-06');
      expect(period.getMonth()).toBe(6);
    });

    it('should extract single digit months with padding', () => {
      const period = new Period('2025-01');
      expect(period.getMonth()).toBe(1);
    });

    it('should extract year and month from edge cases', () => {
      const january = new Period('2025-01');
      const december = new Period('2025-12');
      expect(january.getYear()).toBe(2025);
      expect(january.getMonth()).toBe(1);
      expect(december.getYear()).toBe(2025);
      expect(december.getMonth()).toBe(12);
    });
  });

  describe('Navigation - Previous', () => {
    it('should get previous period for regular months', () => {
      const period = new Period('2025-06');
      const previous = period.previous();
      expect(previous.value).toBe('2025-05');
    });

    it('should get previous period crossing year boundary', () => {
      const period = new Period('2025-01');
      const previous = period.previous();
      expect(previous.value).toBe('2024-12');
    });

    it('should handle multiple iterations', () => {
      const period = new Period('2025-03');
      const prev1 = period.previous();
      const prev2 = prev1.previous();
      const prev3 = prev2.previous();
      expect(prev1.value).toBe('2025-02');
      expect(prev2.value).toBe('2025-01');
      expect(prev3.value).toBe('2024-12');
    });
  });

  describe('Navigation - Next', () => {
    it('should get next period for regular months', () => {
      const period = new Period('2025-06');
      const next = period.next();
      expect(next.value).toBe('2025-07');
    });

    it('should get next period crossing year boundary', () => {
      const period = new Period('2025-12');
      const next = period.next();
      expect(next.value).toBe('2026-01');
    });

    it('should handle multiple iterations', () => {
      const period = new Period('2025-11');
      const next1 = period.next();
      const next2 = next1.next();
      const next3 = next2.next();
      expect(next1.value).toBe('2025-12');
      expect(next2.value).toBe('2026-01');
      expect(next3.value).toBe('2026-02');
    });
  });

  describe('Navigation - Range', () => {
    it('should generate range of periods', () => {
      const start = new Period('2025-01');
      const end = new Period('2025-03');
      const range = Period.range(start, end);
      expect(range).toHaveLength(3);
      expect(range[0].value).toBe('2025-01');
      expect(range[1].value).toBe('2025-02');
      expect(range[2].value).toBe('2025-03');
    });

    it('should generate range for single period', () => {
      const period = new Period('2025-01');
      const range = Period.range(period, period);
      expect(range).toHaveLength(1);
      expect(range[0].value).toBe('2025-01');
    });

    it('should generate range crossing year boundary', () => {
      const start = new Period('2024-11');
      const end = new Period('2025-02');
      const range = Period.range(start, end);
      expect(range).toHaveLength(4);
      expect(range[0].value).toBe('2024-11');
      expect(range[1].value).toBe('2024-12');
      expect(range[2].value).toBe('2025-01');
      expect(range[3].value).toBe('2025-02');
    });

    it('should generate large range', () => {
      const start = new Period('2025-01');
      const end = new Period('2025-12');
      const range = Period.range(start, end);
      expect(range).toHaveLength(12);
      expect(range[0].value).toBe('2025-01');
      expect(range[11].value).toBe('2025-12');
    });
  });

  describe('Conversions', () => {
    it('should convert to string', () => {
      const period = new Period('2025-06');
      expect(period.toString()).toBe('2025-06');
    });

    it('should convert to JSON as string', () => {
      const period = new Period('2025-06');
      expect(JSON.stringify(period)).toBe('"2025-06"');
    });

    it('should convert to Date as first day of month', () => {
      const period = new Period('2025-06');
      const date = period.toDate();
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(5); // JavaScript months are 0-indexed
      expect(date.getDate()).toBe(1);
    });

    it('should convert January to Date correctly', () => {
      const period = new Period('2025-01');
      const date = period.toDate();
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(1);
    });

    it('should convert December to Date correctly', () => {
      const period = new Period('2025-12');
      const date = period.toDate();
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(11);
      expect(date.getDate()).toBe(1);
    });
  });

  describe('Comparison Methods', () => {
    const p1 = new Period('2025-02');
    const p2 = new Period('2025-01');
    const p3 = new Period('2025-02');

    it('should compare equals correctly', () => {
      expect(p1.equals(p3)).toBe(true);
      expect(p1.equals(p2)).toBe(false);
    });

    it('should identify after relationship', () => {
      expect(p1.isAfter(p2)).toBe(true);
      expect(p2.isAfter(p1)).toBe(false);
      expect(p1.isAfter(p3)).toBe(false);
    });

    it('should identify before relationship', () => {
      expect(p2.isBefore(p1)).toBe(true);
      expect(p1.isBefore(p2)).toBe(false);
      expect(p1.isBefore(p3)).toBe(false);
    });

    it('should compare sameOrAfter correctly', () => {
      expect(p1.isSameOrAfter(p2)).toBe(true);
      expect(p1.isSameOrAfter(p3)).toBe(true);
      expect(p2.isSameOrAfter(p1)).toBe(false);
    });

    it('should compare sameOrBefore correctly', () => {
      expect(p2.isSameOrBefore(p1)).toBe(true);
      expect(p1.isSameOrBefore(p3)).toBe(true);
      expect(p1.isSameOrBefore(p2)).toBe(false);
    });

    it('should handle year boundary comparisons', () => {
      const dec2024 = new Period('2024-12');
      const jan2025 = new Period('2025-01');
      expect(jan2025.isAfter(dec2024)).toBe(true);
      expect(dec2024.isBefore(jan2025)).toBe(true);
    });
  });

  describe('Temporal Checks', () => {
    it('should identify current period', () => {
      const now = Period.now();
      expect(now.isCurrent()).toBe(true);
    });

    it('should identify past period', () => {
      const pastPeriod = new Period('2020-01');
      expect(pastPeriod.isInPast()).toBe(true);
      expect(pastPeriod.isCurrent()).toBe(false);
      expect(pastPeriod.isInFuture()).toBe(false);
    });

    it('should identify future period', () => {
      const futurePeriod = new Period('2030-12');
      expect(futurePeriod.isInFuture()).toBe(true);
      expect(futurePeriod.isCurrent()).toBe(false);
      expect(futurePeriod.isInPast()).toBe(false);
    });

    it('should handle edge case of very recent past', () => {
      const lastMonth = Period.now().previous();
      expect(lastMonth.isInPast()).toBe(true);
      expect(lastMonth.isInFuture()).toBe(false);
    });

    it('should handle edge case of very near future', () => {
      const nextMonth = Period.now().next();
      expect(nextMonth.isInFuture()).toBe(true);
      expect(nextMonth.isInPast()).toBe(false);
    });
  });

  describe('Immutability', () => {
    it('should not modify original period after previous()', () => {
      const period = new Period('2025-06');
      const previous = period.previous();
      expect(period.value).toBe('2025-06');
      expect(previous.value).toBe('2025-05');
    });

    it('should not modify original period after next()', () => {
      const period = new Period('2025-06');
      const next = period.next();
      expect(period.value).toBe('2025-06');
      expect(next.value).toBe('2025-07');
    });
  });

  describe('Chaining Navigation', () => {
    it('should support navigation chaining', () => {
      const period = new Period('2025-06');
      const result = period.next().next().previous();
      expect(result.value).toBe('2025-07');
    });

    it('should handle complex chaining with range', () => {
      const start = new Period('2025-01');
      const range = Period.range(start, start.next().next());
      expect(range).toHaveLength(3);
      expect(range[0].value).toBe('2025-01');
      expect(range[2].value).toBe('2025-03');
    });
  });
});
