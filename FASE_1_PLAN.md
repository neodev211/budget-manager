# FASE 1: Fundamentos - Value Objects

## 🎯 Objetivo

Crear los **Value Objects** fundamentales que aislarán la lógica de negocio de los tipos del ORM.

**Tiempo Estimado:** 2-3 horas
**Complejidad:** ⭐ Baja
**Riesgo:** 🟢 Ninguno (no toca código existente)

---

## 📋 Tareas de Fase 1

### 1.1 Crear estructura de carpetas

```bash
mkdir -p backend/src/domain/value-objects
```

### 1.2 Implementar Money.ts

**Archivo:** `backend/src/domain/value-objects/Money.ts`

```typescript
/**
 * Value Object para representar dinero
 * - Valida amounts
 * - Redondea a 2 decimales
 * - Proporciona operaciones aritméticas seguras
 * - Aísla de Decimal de Prisma
 */
export class Money {
  private readonly _amount: number;

  constructor(amount: number | string) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(num)) {
      throw new Error('Invalid money amount: must be a valid number');
    }

    // Redondear a 2 decimales
    this._amount = Math.round(num * 100) / 100;
  }

  /**
   * Factory: crear Money de cero
   */
  static zero(): Money {
    return new Money(0);
  }

  /**
   * Factory: crear Money de un Decimal de Prisma
   * Permite transición suave durante refactor
   */
  static fromDecimal(decimal: any): Money {
    if (decimal && typeof decimal.toNumber === 'function') {
      return new Money(decimal.toNumber());
    }
    return new Money(decimal);
  }

  // Getters
  get value(): number {
    return this._amount;
  }

  // Validaciones
  isPositive(): boolean {
    return this._amount > 0;
  }

  isNegative(): boolean {
    return this._amount < 0;
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  // Operaciones
  add(other: Money): Money {
    return new Money(this._amount + other.value);
  }

  subtract(other: Money): Money {
    return new Money(this._amount - other.value);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Cannot multiply money by negative factor');
    }
    return new Money(this._amount * factor);
  }

  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide money by zero');
    }
    return new Money(this._amount / divisor);
  }

  // Conversiones
  toString(): string {
    return this._amount.toFixed(2);
  }

  toJSON(): number {
    return this._amount;
  }

  // Comparación
  equals(other: Money): boolean {
    return this._amount === other.value;
  }

  greaterThan(other: Money): boolean {
    return this._amount > other.value;
  }

  lessThan(other: Money): boolean {
    return this._amount < other.value;
  }

  greaterThanOrEqual(other: Money): boolean {
    return this._amount >= other.value;
  }

  lessThanOrEqual(other: Money): boolean {
    return this._amount <= other.value;
  }
}
```

### 1.3 Implementar Period.ts

**Archivo:** `backend/src/domain/value-objects/Period.ts`

```typescript
/**
 * Value Object para representar un período de presupuesto
 * - Formato: "YYYY-MM" (ej: "2025-01")
 * - Valida formato
 * - Proporciona operaciones de navegación temporal
 */
export class Period {
  private readonly _period: string;

  constructor(period: string) {
    if (!Period.isValid(period)) {
      throw new Error(`Invalid period format: "${period}". Use format YYYY-MM (e.g., "2025-01")`);
    }
    this._period = period;
  }

  /**
   * Validar si un string tiene formato válido YYYY-MM
   */
  static isValid(period: string): boolean {
    return /^\d{4}-\d{2}$/.test(period);
  }

  /**
   * Factory: crear Period del mes actual
   */
  static now(): Period {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return new Period(`${year}-${month}`);
  }

  /**
   * Factory: crear Period desde una Date
   */
  static fromDate(date: Date): Period {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return new Period(`${year}-${month}`);
  }

  // Getter
  get value(): string {
    return this._period;
  }

  // Extractores
  getYear(): number {
    return parseInt(this._period.split('-')[0], 10);
  }

  getMonth(): number {
    return parseInt(this._period.split('-')[1], 10);
  }

  /**
   * Obtener el período anterior (ej: "2025-01" → "2024-12")
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
   * Obtener el período siguiente (ej: "2025-01" → "2025-02")
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
   * Obtener rango de períodos (ej: últimos 3 meses)
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

  // Conversiones
  toString(): string {
    return this._period;
  }

  toJSON(): string {
    return this._period;
  }

  toDate(): Date {
    // Primer día del mes
    return new Date(`${this._period}-01`);
  }

  // Comparación
  equals(other: Period): boolean {
    return this._period === other.value;
  }

  isAfter(other: Period): boolean {
    return this._period > other.value;
  }

  isBefore(other: Period): boolean {
    return this._period < other.value;
  }

  isSameOrAfter(other: Period): boolean {
    return this._period >= other.value;
  }

  isSameOrBefore(other: Period): boolean {
    return this._period <= other.value;
  }

  /**
   * Saber si es un período válido (no en el futuro, por ejemplo)
   */
  isCurrent(): boolean {
    return this.equals(Period.now());
  }

  isInPast(): boolean {
    return this.isBefore(Period.now());
  }

  isInFuture(): boolean {
    return this.isAfter(Period.now());
  }
}
```

### 1.4 Crear index.ts

**Archivo:** `backend/src/domain/value-objects/index.ts`

```typescript
/**
 * Value Objects del dominio
 * Estos objetos encapsulan validación y lógica de tipos de negocio
 */
export { Money } from './Money';
export { Period } from './Period';
```

---

## ✅ Testing de Value Objects

### 1.5 Crear tests

**Archivo:** `backend/__tests__/domain/value-objects/Money.test.ts`

```typescript
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

    it('should round to 2 decimals', () => {
      const money = new Money(100.555);
      expect(money.value).toBe(100.56);
    });

    it('should throw on invalid input', () => {
      expect(() => new Money('invalid')).toThrow();
    });
  });

  describe('Validation', () => {
    it('should identify positive money', () => {
      const money = new Money(100);
      expect(money.isPositive()).toBe(true);
      expect(money.isNegative()).toBe(false);
    });

    it('should identify zero money', () => {
      const money = Money.zero();
      expect(money.isZero()).toBe(true);
    });
  });

  describe('Operations', () => {
    it('should add money', () => {
      const a = new Money(100);
      const b = new Money(50);
      const result = a.add(b);
      expect(result.value).toBe(150);
    });

    it('should subtract money', () => {
      const a = new Money(100);
      const b = new Money(30);
      const result = a.subtract(b);
      expect(result.value).toBe(70);
    });

    it('should multiply money', () => {
      const money = new Money(100);
      const result = money.multiply(2);
      expect(result.value).toBe(200);
    });
  });

  describe('Comparison', () => {
    it('should compare money values', () => {
      const a = new Money(100);
      const b = new Money(50);
      expect(a.greaterThan(b)).toBe(true);
      expect(b.lessThan(a)).toBe(true);
    });
  });

  describe('Conversion', () => {
    it('should convert to string with 2 decimals', () => {
      const money = new Money(100.1);
      expect(money.toString()).toBe('100.10');
    });

    it('should convert to JSON as number', () => {
      const money = new Money(100);
      expect(JSON.stringify(money)).toBe('100');
    });
  });
});
```

**Archivo:** `backend/__tests__/domain/value-objects/Period.test.ts`

```typescript
import { Period } from '../../../src/domain/value-objects/Period';

describe('Period Value Object', () => {
  describe('Constructor', () => {
    it('should create period with valid format', () => {
      const period = new Period('2025-01');
      expect(period.value).toBe('2025-01');
    });

    it('should throw on invalid format', () => {
      expect(() => new Period('2025-1')).toThrow();
      expect(() => new Period('25-01')).toThrow();
      expect(() => new Period('invalid')).toThrow();
    });
  });

  describe('Factory Methods', () => {
    it('should create current period', () => {
      const now = Period.now();
      const today = new Date();
      const expectedMonth = String(today.getMonth() + 1).padStart(2, '0');
      expect(now.value.startsWith(`${today.getFullYear()}-${expectedMonth}`)).toBe(true);
    });

    it('should create period from date', () => {
      const date = new Date('2025-03-15');
      const period = Period.fromDate(date);
      expect(period.value).toBe('2025-03');
    });
  });

  describe('Extractors', () => {
    it('should extract year and month', () => {
      const period = new Period('2025-06');
      expect(period.getYear()).toBe(2025);
      expect(period.getMonth()).toBe(6);
    });
  });

  describe('Navigation', () => {
    it('should get previous period', () => {
      const period = new Period('2025-01');
      const previous = period.previous();
      expect(previous.value).toBe('2024-12');
    });

    it('should get next period', () => {
      const period = new Period('2025-01');
      const next = period.next();
      expect(next.value).toBe('2025-02');
    });

    it('should generate range of periods', () => {
      const start = new Period('2025-01');
      const end = new Period('2025-03');
      const range = Period.range(start, end);
      expect(range).toHaveLength(3);
      expect(range[0].value).toBe('2025-01');
      expect(range[2].value).toBe('2025-03');
    });
  });

  describe('Comparison', () => {
    it('should compare periods', () => {
      const p1 = new Period('2025-02');
      const p2 = new Period('2025-01');
      expect(p1.isAfter(p2)).toBe(true);
      expect(p2.isBefore(p1)).toBe(true);
    });
  });

  describe('Temporal Checks', () => {
    it('should identify past periods', () => {
      const pastPeriod = new Period('2020-01');
      expect(pastPeriod.isInPast()).toBe(true);
    });

    it('should identify future periods', () => {
      const futurePeriod = new Period('2030-12');
      expect(futurePeriod.isInFuture()).toBe(true);
    });
  });
});
```

---

## 📝 Checklist de Fase 1

### Creación de Archivos
- [ ] `backend/src/domain/value-objects/Money.ts` creado
- [ ] `backend/src/domain/value-objects/Period.ts` creado
- [ ] `backend/src/domain/value-objects/index.ts` creado

### Testing
- [ ] `backend/__tests__/domain/value-objects/Money.test.ts` creado
- [ ] `backend/__tests__/domain/value-objects/Period.test.ts` creado
- [ ] Todos los tests pasan

### Documentación
- [ ] JSDoc en Money.ts
- [ ] JSDoc en Period.ts

### Commits
- [ ] Commit: "feat: Add Money value object with validation and operations"
- [ ] Commit: "feat: Add Period value object with temporal navigation"
- [ ] Commit: "test: Add tests for Money and Period value objects"

---

## 🚀 Siguientes Pasos (Fase 2)

Una vez completada Fase 1:

1. **Verificar que los tests pasen:**
   ```bash
   npm run test
   ```

2. **Verificar que el código existente sigue funcionando:**
   ```bash
   npm run dev
   ```

3. **Hacer commit:**
   ```bash
   git add backend/src/domain/value-objects
   git add backend/__tests__/domain/value-objects
   git commit -m "feat: Implement Value Objects (Money, Period)"
   ```

4. **Comenzar Fase 2: Data Mappers**
   - Ver `REFACTORING_PLAN.md` Sección "FASE 2: Data Mappers"

---

## 💡 Tips para Fase 1

1. **No toques código existente aún:**
   - Solo creas nuevos archivos
   - No refactorizas nada
   - Código actual sigue funcionando

2. **Focaliza en Value Objects:**
   - Son bloques de construcción fundamentales
   - Fáciles de testear
   - Sin dependencias externas

3. **Testing es importante:**
   - Escribe tests mientras codificas
   - Mantendrá los Value Objects puros

4. **Documentación clara:**
   - Estos objetos serán reutilizados en toda la app
   - Buena documentación = fácil mantención

---

**¿Listo para comenzar Fase 1?** 🚀
