import { Category as CategoryEntity } from '@prisma/client';
import { Category } from '../../../../domain/entities/Category';
import { Money } from '../../../../domain/value-objects/Money';
import { Period } from '../../../../domain/value-objects/Period';

/**
 * CategoryMapper
 *
 * Responsable de convertir entre:
 * - Prisma Category (modelo de BD con Decimal)
 * - Domain Category (entidad de dominio con tipos puros)
 *
 * VENTAJAS:
 * - Aísla Prisma del resto de la aplicación
 * - Conversiones centralizadas de Decimal → Money
 * - Fácil agregar nuevas transformaciones
 * - Testeable sin BD
 */
export class CategoryMapper {
  /**
   * Convertir Prisma Category → Domain Category
   * Transforma tipos Prisma (Decimal, etc) → tipos de dominio (Money, Period)
   */
  static toDomain(prismaCategory: CategoryEntity): Category {
    return {
      id: prismaCategory.id,
      name: prismaCategory.name,
      period: prismaCategory.period,
      monthlyBudget: Money.fromDecimal(prismaCategory.monthlyBudget).value,
      notes: prismaCategory.notes || undefined,
      createdAt: prismaCategory.createdAt,
      updatedAt: prismaCategory.updatedAt,
    };
  }

  /**
   * Convertir array de Prisma Categories → array de Domain Categories
   */
  static toDomainArray(prismaCategories: CategoryEntity[]): Category[] {
    return prismaCategories.map(cat => this.toDomain(cat));
  }

  /**
   * Convertir Domain Category → Prisma Category
   * Útil cuando necesitas crear/actualizar en BD
   * Nota: Retorna un objeto compatible con Prisma (convierte Money → Decimal)
   */
  static toPersistence(
    category: Category
  ): Omit<CategoryEntity, 'createdAt' | 'updatedAt'> {
    return {
      id: category.id,
      name: category.name,
      period: category.period,
      monthlyBudget: category.monthlyBudget as any, // Prisma manejará la conversión a Decimal
      notes: category.notes || null,
    };
  }

  /**
   * Obtener el Period como objeto value object
   * Útil para lógica que necesita Period validado
   */
  static getPeriod(prismaCategory: CategoryEntity): Period {
    return new Period(prismaCategory.period);
  }

  /**
   * Obtener el Money como objeto value object
   * Útil para operaciones aritméticas en dinero
   */
  static getMonthlyBudget(prismaCategory: CategoryEntity): Money {
    return Money.fromDecimal(prismaCategory.monthlyBudget);
  }
}
