/**
 * Period Value Object
 *
 * Represents a budget period in "YYYY-MM" format (e.g., "2025-01" for January 2025).
 * - Validates format (YYYY-MM pattern)
 * - Provides temporal navigation (previous, next, range)
 * - Immutable value object
 * - Supports comparisons and temporal queries
 */
export class Period {
  private readonly _period: string;

  constructor(period: string) {
    if (!Period.isValid(period)) {
      throw new Error(`Invalid period format: "${period}". Use format YYYY-MM (e.g., "2025-01")`);
    }
    this._period = period;
  }

  // ========================================
  // Validación de Formato
  // ========================================

  /**
   * Validar si un string tiene formato válido YYYY-MM
   */
  static isValid(period: string): boolean {
    return /^\d{4}-\d{2}$/.test(period);
  }

  // ========================================
  // Factory Methods
  // ========================================

  /**
   * Crear Period del mes actual (hoy)
   */
  static now(): Period {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return new Period(`${year}-${month}`);
  }

  /**
   * Crear Period desde una Date
   * Extrae el año y mes de la fecha
   */
  static fromDate(date: Date): Period {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return new Period(`${year}-${month}`);
  }

  // ========================================
  // Getters
  // ========================================

  /**
   * Obtener el valor del período en string
   */
  get value(): string {
    return this._period;
  }

  // ========================================
  // Extractores
  // ========================================

  /**
   * Extraer el año del período
   */
  getYear(): number {
    return parseInt(this._period.split('-')[0], 10);
  }

  /**
   * Extraer el mes del período (1-12)
   */
  getMonth(): number {
    return parseInt(this._period.split('-')[1], 10);
  }

  // ========================================
  // Navegación Temporal
  // ========================================

  /**
   * Obtener el período anterior
   * Ejemplo: "2025-01" → "2024-12"
   */
  previous(): Period {
    const [year, month] = this._period.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;

    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }

    return new Period(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  }

  /**
   * Obtener el período siguiente
   * Ejemplo: "2025-01" → "2025-02"
   */
  next(): Period {
    const [year, month] = this._period.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;

    if (newMonth === 13) {
      newMonth = 1;
      newYear += 1;
    }

    return new Period(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  }

  /**
   * Obtener rango de períodos (inclusive)
   * Ejemplo: rango de "2025-01" a "2025-03" retorna ["2025-01", "2025-02", "2025-03"]
   */
  static range(startPeriod: Period, endPeriod: Period): Period[] {
    const periods: Period[] = [];
    let current = startPeriod;

    while (current.value <= endPeriod.value) {
      periods.push(current);
      current = current.next();
    }

    return periods;
  }

  // ========================================
  // Conversiones
  // ========================================

  /**
   * Convertir a string
   */
  toString(): string {
    return this._period;
  }

  /**
   * Convertir a JSON como string
   */
  toJSON(): string {
    return this._period;
  }

  /**
   * Convertir a Date (primer día del mes)
   * Ejemplo: "2025-01" → Date(2025, 0, 1)
   * Nota: Crea la fecha en la zona horaria local para evitar problemas de desplazamiento UTC
   */
  toDate(): Date {
    const [year, month] = this._period.split('-').map(Number);
    // Usar constructor con números para asegurar fecha en zona horaria local
    return new Date(year, month - 1, 1);
  }

  // ========================================
  // Comparaciones
  // ========================================

  /**
   * Verificar si es igual a otro período
   */
  equals(other: Period): boolean {
    return this._period === other.value;
  }

  /**
   * Verificar si es posterior a otro período
   */
  isAfter(other: Period): boolean {
    return this._period > other.value;
  }

  /**
   * Verificar si es anterior a otro período
   */
  isBefore(other: Period): boolean {
    return this._period < other.value;
  }

  /**
   * Verificar si es posterior o igual a otro período
   */
  isSameOrAfter(other: Period): boolean {
    return this._period >= other.value;
  }

  /**
   * Verificar si es anterior o igual a otro período
   */
  isSameOrBefore(other: Period): boolean {
    return this._period <= other.value;
  }

  // ========================================
  // Consultas Temporales
  // ========================================

  /**
   * Verificar si es el período actual
   */
  isCurrent(): boolean {
    return this.equals(Period.now());
  }

  /**
   * Verificar si es un período pasado
   */
  isInPast(): boolean {
    return this.isBefore(Period.now());
  }

  /**
   * Verificar si es un período futuro
   */
  isInFuture(): boolean {
    return this.isAfter(Period.now());
  }
}
