"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ValidationService_1 = require("../../../src/application/services/ValidationService");
describe('ValidationService', () => {
    describe('validateNonEmptyString', () => {
        it('should pass for non-empty string', () => {
            expect(() => ValidationService_1.ValidationService.validateNonEmptyString('test', 'field')).not.toThrow();
        });
        it('should throw for empty string', () => {
            expect(() => ValidationService_1.ValidationService.validateNonEmptyString('', 'field')).toThrow(ValidationService_1.ValidationError);
        });
        it('should throw for whitespace-only string', () => {
            expect(() => ValidationService_1.ValidationService.validateNonEmptyString('   ', 'field')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validateMinLength', () => {
        it('should pass for string with sufficient length', () => {
            expect(() => ValidationService_1.ValidationService.validateMinLength('hello', 3, 'field')).not.toThrow();
        });
        it('should throw for string below minimum length', () => {
            expect(() => ValidationService_1.ValidationService.validateMinLength('hi', 3, 'field')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validateMaxLength', () => {
        it('should pass for string within max length', () => {
            expect(() => ValidationService_1.ValidationService.validateMaxLength('hello', 10, 'field')).not.toThrow();
        });
        it('should throw for string exceeding max length', () => {
            expect(() => ValidationService_1.ValidationService.validateMaxLength('hello world', 5, 'field')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validatePositiveNumber', () => {
        it('should pass for positive number', () => {
            expect(() => ValidationService_1.ValidationService.validatePositiveNumber(100, 'field')).not.toThrow();
        });
        it('should throw for zero', () => {
            expect(() => ValidationService_1.ValidationService.validatePositiveNumber(0, 'field')).toThrow(ValidationService_1.ValidationError);
        });
        it('should throw for negative number', () => {
            expect(() => ValidationService_1.ValidationService.validatePositiveNumber(-100, 'field')).toThrow(ValidationService_1.ValidationError);
        });
        it('should throw for NaN', () => {
            expect(() => ValidationService_1.ValidationService.validatePositiveNumber(NaN, 'field')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validateNonNegativeNumber', () => {
        it('should pass for positive number', () => {
            expect(() => ValidationService_1.ValidationService.validateNonNegativeNumber(100, 'field')).not.toThrow();
        });
        it('should pass for zero', () => {
            expect(() => ValidationService_1.ValidationService.validateNonNegativeNumber(0, 'field')).not.toThrow();
        });
        it('should throw for negative number', () => {
            expect(() => ValidationService_1.ValidationService.validateNonNegativeNumber(-100, 'field')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validateTwoDecimals', () => {
        it('should pass for number with 2 or fewer decimals', () => {
            expect(() => ValidationService_1.ValidationService.validateTwoDecimals(100.5, 'field')).not.toThrow();
            expect(() => ValidationService_1.ValidationService.validateTwoDecimals(100.55, 'field')).not.toThrow();
            expect(() => ValidationService_1.ValidationService.validateTwoDecimals(100, 'field')).not.toThrow();
        });
        it('should throw for number with more than 2 decimals', () => {
            expect(() => ValidationService_1.ValidationService.validateTwoDecimals(100.555, 'field')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validatePeriodFormat', () => {
        it('should pass for valid YYYY-MM format', () => {
            expect(() => ValidationService_1.ValidationService.validatePeriodFormat('2025-01', 'period')).not.toThrow();
            expect(() => ValidationService_1.ValidationService.validatePeriodFormat('2025-12', 'period')).not.toThrow();
        });
        it('should throw for invalid format', () => {
            expect(() => ValidationService_1.ValidationService.validatePeriodFormat('2025-1', 'period')).toThrow(ValidationService_1.ValidationError);
            expect(() => ValidationService_1.ValidationService.validatePeriodFormat('25-01', 'period')).toThrow(ValidationService_1.ValidationError);
        });
        it('should throw for invalid month', () => {
            expect(() => ValidationService_1.ValidationService.validatePeriodFormat('2025-13', 'period')).toThrow(ValidationService_1.ValidationError);
            expect(() => ValidationService_1.ValidationService.validatePeriodFormat('2025-00', 'period')).toThrow(ValidationService_1.ValidationError);
        });
        it('should throw for invalid year', () => {
            expect(() => ValidationService_1.ValidationService.validatePeriodFormat('1800-01', 'period')).toThrow(ValidationService_1.ValidationError);
            expect(() => ValidationService_1.ValidationService.validatePeriodFormat('2200-01', 'period')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validateDate', () => {
        it('should pass for valid date', () => {
            expect(() => ValidationService_1.ValidationService.validateDate(new Date(), 'field')).not.toThrow();
        });
        it('should throw for invalid date', () => {
            expect(() => ValidationService_1.ValidationService.validateDate(new Date('invalid'), 'field')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validateUUID', () => {
        it('should pass for valid UUID', () => {
            const validUUID = '550e8400-e29b-41d4-a716-446655440000';
            expect(() => ValidationService_1.ValidationService.validateUUID(validUUID, 'id')).not.toThrow();
        });
        it('should throw for invalid UUID', () => {
            expect(() => ValidationService_1.ValidationService.validateUUID('not-a-uuid', 'id')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validateEnum', () => {
        it('should pass for valid enum value', () => {
            const validValues = ['CASH', 'CARD', 'TRANSFER'];
            expect(() => ValidationService_1.ValidationService.validateEnum('CASH', validValues, 'method')).not.toThrow();
        });
        it('should throw for invalid enum value', () => {
            const validValues = ['CASH', 'CARD', 'TRANSFER'];
            expect(() => ValidationService_1.ValidationService.validateEnum('INVALID', validValues, 'method')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('validateExpenseAmount', () => {
        it('should pass for negative amount', () => {
            expect(() => ValidationService_1.ValidationService.validateExpenseAmount(-100, 'amount')).not.toThrow();
        });
        it('should throw for positive amount', () => {
            expect(() => ValidationService_1.ValidationService.validateExpenseAmount(100, 'amount')).toThrow(ValidationService_1.ValidationError);
        });
        it('should pass for zero (edge case)', () => {
            expect(() => ValidationService_1.ValidationService.validateExpenseAmount(0, 'amount')).not.toThrow();
        });
    });
    describe('validateMonthlyBudget', () => {
        it('should pass for positive amount', () => {
            expect(() => ValidationService_1.ValidationService.validateMonthlyBudget(100, 'budget')).not.toThrow();
        });
        it('should throw for negative amount', () => {
            expect(() => ValidationService_1.ValidationService.validateMonthlyBudget(-100, 'budget')).toThrow(ValidationService_1.ValidationError);
        });
        it('should throw for zero', () => {
            expect(() => ValidationService_1.ValidationService.validateMonthlyBudget(0, 'budget')).toThrow(ValidationService_1.ValidationError);
        });
    });
    describe('collectErrors', () => {
        it('should collect multiple validation errors', () => {
            const errors = ValidationService_1.ValidationService.collectErrors([
                () => ValidationService_1.ValidationService.validateNonEmptyString('', 'field1'),
                () => ValidationService_1.ValidationService.validatePositiveNumber(-100, 'field2'),
            ]);
            expect(errors).toHaveLength(2);
            expect(errors[0] instanceof ValidationService_1.ValidationError).toBe(true);
            expect(errors[1] instanceof ValidationService_1.ValidationError).toBe(true);
        });
        it('should return empty array if no errors', () => {
            const errors = ValidationService_1.ValidationService.collectErrors([
                () => ValidationService_1.ValidationService.validateNonEmptyString('test', 'field'),
                () => ValidationService_1.ValidationService.validatePositiveNumber(100, 'field'),
            ]);
            expect(errors).toHaveLength(0);
        });
    });
    describe('throwIfErrors', () => {
        it('should throw if errors exist', () => {
            const errors = [
                new ValidationService_1.ValidationError('Error 1', 'field1'),
                new ValidationService_1.ValidationError('Error 2', 'field2'),
            ];
            expect(() => ValidationService_1.ValidationService.throwIfErrors(errors)).toThrow(ValidationService_1.ValidationError);
        });
        it('should not throw if no errors', () => {
            expect(() => ValidationService_1.ValidationService.throwIfErrors([])).not.toThrow();
        });
    });
    describe('ValidationError', () => {
        it('should store field and value information', () => {
            const error = new ValidationService_1.ValidationError('Test error', 'fieldName', 'someValue');
            expect(error.message).toBe('Test error');
            expect(error.field).toBe('fieldName');
            expect(error.value).toBe('someValue');
            expect(error.name).toBe('ValidationError');
        });
    });
});
