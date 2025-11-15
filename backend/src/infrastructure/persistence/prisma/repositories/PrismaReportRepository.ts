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
    // Get all categories for the period
    const categories = period
      ? await prisma.category.findMany({ where: { period } })
      : await prisma.category.findMany();

    // For each category, aggregate expenses and provisions
    const summaries: ExecutiveSummary[] = [];

    for (const category of categories) {
      // Sum expenses for this category
      const expenseResult = await prisma.expense.aggregate({
        where: { categoryId: category.id },
        _sum: { amount: true },
      });

      const monthlySpent = Math.abs(this.toNumber(expenseResult._sum.amount));

      // Sum open provisions for this category
      const provisionResult = await prisma.provision.aggregate({
        where: {
          categoryId: category.id,
          status: 'OPEN',
        },
        _sum: { amount: true },
      });

      const monthlyOpenProvisions = Math.abs(this.toNumber(provisionResult._sum.amount));
      const monthlyBudget = this.toNumber(category.monthlyBudget);
      const monthlyAvailable = monthlyBudget - monthlySpent - monthlyOpenProvisions;

      const summary: ExecutiveSummary = {
        categoryId: category.id,
        categoryName: category.name,
        period: category.period,
        monthlyBudget,
        monthlySpent,
        monthlyOpenProvisions,
        monthlyAvailable,
        // Semester calculations (placeholder - can be enhanced later)
        semesterBudget: monthlyBudget * 6,
        semesterSpent: monthlySpent * 6,
        semesterGrossAvailable: (monthlyBudget - monthlySpent) * 6,
        semesterProvision: monthlyOpenProvisions * 6,
        semesterRealAvailable: monthlyAvailable * 6,
      };

      summaries.push(summary);
    }

    return summaries;
  }

  async getExecutiveSummaryByCategory(categoryId: string): Promise<ExecutiveSummary> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error(`Category with id "${categoryId}" not found`);
    }

    // Sum expenses for this category
    const expenseResult = await prisma.expense.aggregate({
      where: { categoryId },
      _sum: { amount: true },
    });

    const monthlySpent = Math.abs(this.toNumber(expenseResult._sum.amount));

    // Sum open provisions for this category
    const provisionResult = await prisma.provision.aggregate({
      where: {
        categoryId,
        status: 'OPEN',
      },
      _sum: { amount: true },
    });

    const monthlyOpenProvisions = Math.abs(this.toNumber(provisionResult._sum.amount));
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
      // Semester calculations (placeholder - can be enhanced later)
      semesterBudget: monthlyBudget * 6,
      semesterSpent: monthlySpent * 6,
      semesterGrossAvailable: (monthlyBudget - monthlySpent) * 6,
      semesterProvision: monthlyOpenProvisions * 6,
      semesterRealAvailable: monthlyAvailable * 6,
    };
  }
}
