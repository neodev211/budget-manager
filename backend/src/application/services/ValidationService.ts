/**
 * ValidationService
 *
 * Servicio centralizado de validaciones para Use Cases.
 * Garantiza que todos los datos sean válidos antes de procesarlos.
 * Proporciona validaciones reutilizables para todo el dominio.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ValidationService {
  /**
   * Validar que un string no esté vacío
   */
  static validateNonEmptyString(value: string, fieldName: string): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError(
        `${fieldName} cannot be empty`,
        fieldName,
        value
      );
    }
  }

  /**
   * Validar que un string tenga una longitud mínima
   */
  static validateMinLength(
    value: string,
    minLength: number,
    fieldName: string
  ): void {
    if (!value || value.trim().length < minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${minLength} characters long`,
        fieldName,
        value
      );
    }
  }

  /**
   * Validar que un string tenga una longitud máxima
   */
  static validateMaxLength(
    value: string,
    maxLength: number,
    fieldName: string
  ): void {
    if (value && value.length > maxLength) {
      throw new ValidationError(
        `${fieldName} cannot exceed ${maxLength} characters`,
        fieldName,
        value
      );
    }
  }

  /**
   * Validar que un número sea positivo (> 0)
   */
  static validatePositiveNumber(value: number, fieldName: string): void {
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      throw new ValidationError(
        `${fieldName} must be a positive number`,
        fieldName,
        value
      );
    }
  }

  /**
   * Validar que un número sea no-negativo (>= 0)
   */
  static validateNonNegativeNumber(value: number, fieldName: string): void {
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      throw new ValidationError(
        `${fieldName} cannot be negative`,
        fieldName,
        value
      );
    }
  }

  /**
   * Validar que un número tenga como máximo 2 decimales
   */
  static validateTwoDecimals(value: number, fieldName: string): void {
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new ValidationError(
        `${fieldName} cannot have more than 2 decimal places`,
        fieldName,
        value
      );
    }
  }

  /**
   * Validar formato de período YYYY-MM
   */
  static validatePeriodFormat(period: string, fieldName: string = 'period'): void {
    if (!/^\d{4}-\d{2}$/.test(period)) {
      throw new ValidationError(
        `${fieldName} must be in YYYY-MM format (e.g., "2025-01")`,
        fieldName,
        period
      );
    }

    const [year, month] = period.split('-').map(Number);
    if (month < 1 || month > 12) {
      throw new ValidationError(
        `${fieldName} month must be between 01 and 12`,
        fieldName,
        period
      );
    }

    if (year < 1900 || year > 2100) {
      throw new ValidationError(
        `${fieldName} year must be between 1900 and 2100`,
        fieldName,
        period
      );
    }
  }

  /**
   * Validar que una fecha sea válida
   */
  static validateDate(date: Date, fieldName: string): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new ValidationError(
        `${fieldName} must be a valid date`,
        fieldName,
        date
      );
    }
  }

  /**
   * Validar que una fecha no sea en el futuro
   */
  static validateNotFutureDate(date: Date, fieldName: string): void {
    this.validateDate(date, fieldName);
    if (date > new Date()) {
      throw new ValidationError(
        `${fieldName} cannot be in the future`,
        fieldName,
        date
      );
    }
  }

  /**
   * Validar que una UUID sea válida
   */
  static validateUUID(id: string, fieldName: string = 'id'): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError(
        `${fieldName} must be a valid UUID`,
        fieldName,
        id
      );
    }
  }

  /**
   * Validar que un valor esté en una lista de opciones válidas
   */
  static validateEnum<T>(
    value: T,
    validValues: T[],
    fieldName: string
  ): void {
    if (!validValues.includes(value)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${validValues.join(', ')}`,
        fieldName,
        value
      );
    }
  }

  /**
   * Validar que dos valores sean diferentes
   */
  static validateDifferent(
    value1: any,
    value2: any,
    message: string
  ): void {
    if (value1 === value2) {
      throw new ValidationError(message);
    }
  }

  /**
   * Validar regla de negocio: monto debe ser un número válido (positivo o negativo)
   * El sistema automáticamente convierte valores positivos a negativos (débito)
   */
  static validateExpenseAmount(
    amount: number,
    fieldName: string = 'amount'
  ): void {
    // Accept both positive and negative values
    // Positive values will be converted to negative in the use case
    this.validatePositiveNumber(Math.abs(amount), fieldName);
    this.validateTwoDecimals(Math.abs(amount), fieldName);
  }

  /**
   * Validar presupuesto mensual positivo
   */
  static validateMonthlyBudget(
    amount: number,
    fieldName: string = 'monthlyBudget'
  ): void {
    this.validatePositiveNumber(amount, fieldName);
    this.validateTwoDecimals(amount, fieldName);
  }

  /**
   * Validar monto de provisión (negativo, como gasto)
   */
  static validateProvisionAmount(
    amount: number,
    fieldName: string = 'amount'
  ): void {
    this.validateExpenseAmount(amount, fieldName);
  }

  /**
   * Recolectar múltiples errores
   */
  static collectErrors(
    validations: Array<() => void>
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    validations.forEach(validation => {
      try {
        validation();
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(error);
        }
      }
    });

    return errors;
  }

  /**
   * Lanzar si hay errores
   */
  static throwIfErrors(errors: ValidationError[]): void {
    if (errors.length > 0) {
      const message = errors
        .map(e => `${e.field || 'Field'}: ${e.message}`)
        .join('\n');
      throw new ValidationError(`Validation failed:\n${message}`);
    }
  }
}
