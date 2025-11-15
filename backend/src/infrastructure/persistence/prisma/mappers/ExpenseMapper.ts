import { Expense as ExpenseEntity, PaymentMethod as PrismaPaymentMethod } from '@prisma/client';
import { Expense, PaymentMethod } from '../../../../domain/entities/Expense';
import { Money } from '../../../../domain/value-objects/Money';

/**
 * ExpenseMapper
 *
 * Responsable de convertir entre:
 * - Prisma Expense (modelo de BD con Decimal y PaymentMethod enum)
 * - Domain Expense (entidad de dominio con tipos puros)
 *
 * VENTAJAS:
 * - Aísla Prisma del resto de la aplicación
 * - Conversiones centralizadas de Decimal → Money
 * - Conversiones de enums normalizadas
 * - Fácil agregar validaciones o transformaciones
 */
export class ExpenseMapper {
  /**
   * Convertir Prisma PaymentMethod → Domain PaymentMethod
   */
  private static paymentMethodToDomain(
    prismaMethod: PrismaPaymentMethod
  ): PaymentMethod {
    // Los enum values son iguales en Prisma y Domain
    return prismaMethod as PaymentMethod;
  }

  /**
   * Convertir Domain PaymentMethod → Prisma PaymentMethod
   */
  private static paymentMethodToPersistence(
    domainMethod: PaymentMethod
  ): PrismaPaymentMethod {
    // Los enum values son iguales
    return domainMethod as PrismaPaymentMethod;
  }

  /**
   * Convertir Prisma Expense → Domain Expense
   * Transforma tipos Prisma (Decimal, etc) → tipos de dominio (Money)
   */
  static toDomain(prismaExpense: ExpenseEntity): Expense {
    return {
      id: prismaExpense.id,
      date: prismaExpense.date,
      description: prismaExpense.description,
      categoryId: prismaExpense.categoryId,
      provisionId: prismaExpense.provisionId || undefined,
      amount: Money.fromDecimal(prismaExpense.amount).value,
      paymentMethod: this.paymentMethodToDomain(prismaExpense.paymentMethod),
      createdAt: prismaExpense.createdAt,
      updatedAt: prismaExpense.updatedAt,
    };
  }

  /**
   * Convertir array de Prisma Expenses → array de Domain Expenses
   */
  static toDomainArray(prismaExpenses: ExpenseEntity[]): Expense[] {
    return prismaExpenses.map(expense => this.toDomain(expense));
  }

  /**
   * Convertir Domain Expense → Prisma Expense
   * Útil cuando necesitas crear/actualizar en BD
   */
  static toPersistence(
    expense: Expense
  ): Omit<ExpenseEntity, 'createdAt' | 'updatedAt'> {
    return {
      id: expense.id,
      date: expense.date,
      description: expense.description,
      categoryId: expense.categoryId,
      provisionId: expense.provisionId || null,
      amount: expense.amount as any, // Prisma manejará la conversión a Decimal
      paymentMethod: this.paymentMethodToPersistence(expense.paymentMethod),
    };
  }

  /**
   * Obtener el monto como objeto value object Money
   * Útil para operaciones aritméticas o comparaciones
   */
  static getAmount(prismaExpense: ExpenseEntity): Money {
    return Money.fromDecimal(prismaExpense.amount);
  }

  /**
   * Verificar si el gasto es negativo (es un gasto, no un ingreso)
   */
  static isExpense(expense: Expense | ExpenseEntity): boolean {
    let amount: Money;

    // Detectar si es Prisma (tiene toNumber method) o Domain
    if (typeof (expense as any).amount === 'object' && (expense as any).amount?.toNumber) {
      // Es Prisma Expense
      amount = Money.fromDecimal((expense as any).amount);
    } else {
      // Es Domain Expense
      amount = new Money((expense as Expense).amount);
    }

    return amount.isNegative() || amount.isZero();
  }
}
