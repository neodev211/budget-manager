import { ValidationService, ValidationError } from '../../../src/application/services/ValidationService';

describe('ValidationService', () => {
  describe('validateNonEmptyString', () => {
    it('should pass for non-empty string', () => {
      expect(() => ValidationService.validateNonEmptyString('test', 'field')).not.toThrow();
    });

    it('should throw for empty string', () => {
      expect(() => ValidationService.validateNonEmptyString('', 'field')).toThrow(ValidationError);
    });

    it('should throw for whitespace-only string', () => {
      expect(() => ValidationService.validateNonEmptyString('   ', 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateMinLength', () => {
    it('should pass for string with sufficient length', () => {
      expect(() => ValidationService.validateMinLength('hello', 3, 'field')).not.toThrow();
    });

    it('should throw for string below minimum length', () => {
      expect(() => ValidationService.validateMinLength('hi', 3, 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateMaxLength', () => {
    it('should pass for string within max length', () => {
      expect(() => ValidationService.validateMaxLength('hello', 10, 'field')).not.toThrow();
    });

    it('should throw for string exceeding max length', () => {
      expect(() => ValidationService.validateMaxLength('hello world', 5, 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validatePositiveNumber', () => {
    it('should pass for positive number', () => {
      expect(() => ValidationService.validatePositiveNumber(100, 'field')).not.toThrow();
    });

    it('should throw for zero', () => {
      expect(() => ValidationService.validatePositiveNumber(0, 'field')).toThrow(ValidationError);
    });

    it('should throw for negative number', () => {
      expect(() => ValidationService.validatePositiveNumber(-100, 'field')).toThrow(
        ValidationError
      );
    });

    it('should throw for NaN', () => {
      expect(() => ValidationService.validatePositiveNumber(NaN, 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateNonNegativeNumber', () => {
    it('should pass for positive number', () => {
      expect(() => ValidationService.validateNonNegativeNumber(100, 'field')).not.toThrow();
    });

    it('should pass for zero', () => {
      expect(() => ValidationService.validateNonNegativeNumber(0, 'field')).not.toThrow();
    });

    it('should throw for negative number', () => {
      expect(() => ValidationService.validateNonNegativeNumber(-100, 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateTwoDecimals', () => {
    it('should pass for number with 2 or fewer decimals', () => {
      expect(() => ValidationService.validateTwoDecimals(100.5, 'field')).not.toThrow();
      expect(() => ValidationService.validateTwoDecimals(100.55, 'field')).not.toThrow();
      expect(() => ValidationService.validateTwoDecimals(100, 'field')).not.toThrow();
    });

    it('should throw for number with more than 2 decimals', () => {
      expect(() => ValidationService.validateTwoDecimals(100.555, 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validatePeriodFormat', () => {
    it('should pass for valid YYYY-MM format', () => {
      expect(() => ValidationService.validatePeriodFormat('2025-01', 'period')).not.toThrow();
      expect(() => ValidationService.validatePeriodFormat('2025-12', 'period')).not.toThrow();
    });

    it('should throw for invalid format', () => {
      expect(() => ValidationService.validatePeriodFormat('2025-1', 'period')).toThrow(
        ValidationError
      );
      expect(() => ValidationService.validatePeriodFormat('25-01', 'period')).toThrow(
        ValidationError
      );
    });

    it('should throw for invalid month', () => {
      expect(() => ValidationService.validatePeriodFormat('2025-13', 'period')).toThrow(
        ValidationError
      );
      expect(() => ValidationService.validatePeriodFormat('2025-00', 'period')).toThrow(
        ValidationError
      );
    });

    it('should throw for invalid year', () => {
      expect(() => ValidationService.validatePeriodFormat('1800-01', 'period')).toThrow(
        ValidationError
      );
      expect(() => ValidationService.validatePeriodFormat('2200-01', 'period')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateDate', () => {
    it('should pass for valid date', () => {
      expect(() => ValidationService.validateDate(new Date(), 'field')).not.toThrow();
    });

    it('should throw for invalid date', () => {
      expect(() => ValidationService.validateDate(new Date('invalid'), 'field')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateUUID', () => {
    it('should pass for valid UUID', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => ValidationService.validateUUID(validUUID, 'id')).not.toThrow();
    });

    it('should throw for invalid UUID', () => {
      expect(() => ValidationService.validateUUID('not-a-uuid', 'id')).toThrow(ValidationError);
    });
  });

  describe('validateEnum', () => {
    it('should pass for valid enum value', () => {
      const validValues = ['CASH', 'CARD', 'TRANSFER'];
      expect(() => ValidationService.validateEnum('CASH', validValues as any, 'method')).not.toThrow();
    });

    it('should throw for invalid enum value', () => {
      const validValues = ['CASH', 'CARD', 'TRANSFER'];
      expect(() => ValidationService.validateEnum('INVALID', validValues as any, 'method')).toThrow(
        ValidationError
      );
    });
  });

  describe('validateExpenseAmount', () => {
    it('should pass for negative amount', () => {
      expect(() => ValidationService.validateExpenseAmount(-100, 'amount')).not.toThrow();
    });

    it('should pass for positive amount (will be converted to negative by use case)', () => {
      expect(() => ValidationService.validateExpenseAmount(100, 'amount')).not.toThrow();
    });

    it('should throw for zero (must be greater than 0)', () => {
      expect(() => ValidationService.validateExpenseAmount(0, 'amount')).toThrow(ValidationError);
    });
  });

  describe('validateMonthlyBudget', () => {
    it('should pass for positive amount', () => {
      expect(() => ValidationService.validateMonthlyBudget(100, 'budget')).not.toThrow();
    });

    it('should throw for negative amount', () => {
      expect(() => ValidationService.validateMonthlyBudget(-100, 'budget')).toThrow(ValidationError);
    });

    it('should throw for zero', () => {
      expect(() => ValidationService.validateMonthlyBudget(0, 'budget')).toThrow(ValidationError);
    });
  });

  describe('collectErrors', () => {
    it('should collect multiple validation errors', () => {
      const errors = ValidationService.collectErrors([
        () => ValidationService.validateNonEmptyString('', 'field1'),
        () => ValidationService.validatePositiveNumber(-100, 'field2'),
      ]);

      expect(errors).toHaveLength(2);
      expect(errors[0] instanceof ValidationError).toBe(true);
      expect(errors[1] instanceof ValidationError).toBe(true);
    });

    it('should return empty array if no errors', () => {
      const errors = ValidationService.collectErrors([
        () => ValidationService.validateNonEmptyString('test', 'field'),
        () => ValidationService.validatePositiveNumber(100, 'field'),
      ]);

      expect(errors).toHaveLength(0);
    });
  });

  describe('throwIfErrors', () => {
    it('should throw if errors exist', () => {
      const errors = [
        new ValidationError('Error 1', 'field1'),
        new ValidationError('Error 2', 'field2'),
      ];

      expect(() => ValidationService.throwIfErrors(errors)).toThrow(ValidationError);
    });

    it('should not throw if no errors', () => {
      expect(() => ValidationService.throwIfErrors([])).not.toThrow();
    });
  });

  describe('ValidationError', () => {
    it('should store field and value information', () => {
      const error = new ValidationError('Test error', 'fieldName', 'someValue');

      expect(error.message).toBe('Test error');
      expect(error.field).toBe('fieldName');
      expect(error.value).toBe('someValue');
      expect(error.name).toBe('ValidationError');
    });
  });
});
