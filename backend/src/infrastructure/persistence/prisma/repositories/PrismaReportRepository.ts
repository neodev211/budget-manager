import { IReportRepository } from '../../../../domain/repositories/IReportRepository';
import { ExecutiveSummary } from '../../../../domain/entities/ExecutiveSummary';
import prisma from '../../../database/prisma';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * PrismaReportRepository
 *
 * Prisma implementation of IReportRepository interface.
 * Generates executive summaries and reports from aggregated data.
 */
export class PrismaReportRepository implements IReportRepository {
  private toNumber(decimal: Decimal | null): number {
    if (!decimal) return 0;
    return typeof decimal.toNumber === 'function' ? decimal.toNumber() : Number(decimal);
  }

  async getExecutiveSummary(period?: string): Promise<ExecutiveSummary[]> {
    // ✅ OPTIMIZED: Single query with pre-loaded relations instead of N+1 queries
    const categories = await prisma.category.findMany({
      where: period ? { period } : undefined,
      include: {
        expenses: {
          select: { amount: true },
        },
        provisions: {
          where: { status: 'OPEN' },
          select: { amount: true },
        },
      },
    });

    // Process in-memory (fast computation)
    const summaries: ExecutiveSummary[] = categories.map((category) => {
      // Sum expenses for this category
      const monthlySpent = Math.abs(
        category.expenses.reduce((sum, expense) => {
          return sum + this.toNumber(expense.amount);
        }, 0)
      );

      // Sum open provisions for this category
      const monthlyOpenProvisions = Math.abs(
        category.provisions.reduce((sum, provision) => {
          return sum + this.toNumber(provision.amount);
        }, 0)
      );

      const monthlyBudget = this.toNumber(category.monthlyBudget);
      const monthlyAvailable = monthlyBudget - monthlySpent - monthlyOpenProvisions;

      return {
        categoryId: category.id,
        categoryName: category.name,
        period: category.period,
        monthlyBudget,
        monthlySpent,
        monthlyOpenProvisions,
        monthlyAvailable,
        // Semester calculations
        semesterBudget: monthlyBudget * 6,
        semesterSpent: monthlySpent * 6,
        semesterGrossAvailable: (monthlyBudget - monthlySpent) * 6,
        semesterProvision: monthlyOpenProvisions * 6,
        semesterRealAvailable: monthlyAvailable * 6,
      };
    });

    return summaries;
  }

  async getExecutiveSummaryByCategory(categoryId: string): Promise<ExecutiveSummary> {
    // ✅ OPTIMIZED: Single query with pre-loaded relations instead of 3 queries
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        expenses: {
          select: { amount: true },
        },
        provisions: {
          where: { status: 'OPEN' },
          select: { amount: true },
        },
      },
    });

    if (!category) {
      throw new Error(`Category with id "${categoryId}" not found`);
    }

    // Process in-memory (fast computation)
    const monthlySpent = Math.abs(
      category.expenses.reduce((sum, expense) => {
        return sum + this.toNumber(expense.amount);
      }, 0)
    );

    const monthlyOpenProvisions = Math.abs(
      category.provisions.reduce((sum, provision) => {
        return sum + this.toNumber(provision.amount);
      }, 0)
    );

    const monthlyBudget = this.toNumber(category.monthlyBudget);
    const monthlyAvailable = monthlyBudget - monthlySpent - monthlyOpenProvisions;

    return {
      categoryId: category.id,
      categoryName: category.name,
      period: category.period,
      monthlyBudget,
      monthlySpent,
      monthlyOpenProvisions,
      monthlyAvailable,
      // Semester calculations
      semesterBudget: monthlyBudget * 6,
      semesterSpent: monthlySpent * 6,
      semesterGrossAvailable: (monthlyBudget - monthlySpent) * 6,
      semesterProvision: monthlyOpenProvisions * 6,
      semesterRealAvailable: monthlyAvailable * 6,
    };
  }
}
