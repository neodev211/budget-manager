/**
 * Money Value Object
 *
 * Represents a monetary amount with validation and safe arithmetic operations.
 * - Validates amounts (must be valid numbers)
 * - Automatically rounds to 2 decimals
 * - Provides immutable operations (add, subtract, multiply, divide)
 * - Isolates domain logic from Prisma's Decimal type
 * - Enables type-safe money handling across the application
 */
export class Money {
  private readonly _amount: number;

  constructor(amount: number | string) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
      throw new Error('Invalid money amount: must be a valid number');
    }

    // Redondear a 2 decimales para evitar problemas de precisión en floating point
    this._amount = Math.round(num * 100) / 100;
  }

  /**
   * Factory: crear Money desde cero
   */
  static zero(): Money {
    return new Money(0);
  }

  /**
   * Factory: crear Money desde un Decimal de Prisma
   * Permite transición suave durante refactoring sin tocar Prisma directamente
   */
  static fromDecimal(decimal: any): Money {
    if (decimal === null || decimal === undefined) {
      return Money.zero();
    }
    if (typeof decimal.toNumber === 'function') {
      return new Money(decimal.toNumber());
    }
    return new Money(decimal);
  }

  // ========================================
  // Getters
  // ========================================

  /**
   * Obtener el valor numérico del dinero
   */
  get value(): number {
    return this._amount;
  }

  // ========================================
  // Validaciones
  // ========================================

  /**
   * Verificar si es positivo (> 0)
   */
  isPositive(): boolean {
    return this._amount > 0;
  }

  /**
   * Verificar si es negativo (< 0)
   */
  isNegative(): boolean {
    return this._amount < 0;
  }

  /**
   * Verificar si es cero
   */
  isZero(): boolean {
    return this._amount === 0;
  }

  // ========================================
  // Operaciones Aritméticas
  // ========================================

  /**
   * Sumar otro monto de dinero
   */
  add(other: Money): Money {
    return new Money(this._amount + other.value);
  }

  /**
   * Restar otro monto de dinero
   */
  subtract(other: Money): Money {
    return new Money(this._amount - other.value);
  }

  /**
   * Multiplicar por un factor (ej: 2.5)
   * No permite factores negativos
   */
  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Cannot multiply money by negative factor');
    }
    return new Money(this._amount * factor);
  }

  /**
   * Dividir por un divisor
   * No permite división por cero
   */
  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide money by zero');
    }
    return new Money(this._amount / divisor);
  }

  // ========================================
  // Conversiones
  // ========================================

  /**
   * Convertir a string con 2 decimales (ej: "100.50")
   */
  toString(): string {
    return this._amount.toFixed(2);
  }

  /**
   * Convertir a JSON como número
   */
  toJSON(): number {
    return this._amount;
  }

  // ========================================
  // Comparaciones
  // ========================================

  /**
   * Verificar si es igual a otro monto
   */
  equals(other: Money): boolean {
    return this._amount === other.value;
  }

  /**
   * Verificar si es mayor que otro monto
   */
  greaterThan(other: Money): boolean {
    return this._amount > other.value;
  }

  /**
   * Verificar si es menor que otro monto
   */
  lessThan(other: Money): boolean {
    return this._amount < other.value;
  }

  /**
   * Verificar si es mayor o igual que otro monto
   */
  greaterThanOrEqual(other: Money): boolean {
    return this._amount >= other.value;
  }

  /**
   * Verificar si es menor o igual que otro monto
   */
  lessThanOrEqual(other: Money): boolean {
    return this._amount <= other.value;
  }
}
