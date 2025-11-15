import { IReportRepository } from '../../domain/repositories/IReportRepository';
import { ExecutiveSummary } from '../../domain/entities/ExecutiveSummary';
import prisma from '../database/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export class ReportRepository implements IReportRepository {
  private toNumber(decimal: Decimal | null): number {
    return decimal ? decimal.toNumber() : 0;
  }

  async getExecutiveSummary(period?: string): Promise<ExecutiveSummary[]> {
    const categories = await prisma.category.findMany({
      where: period ? { period } : undefined,
      include: {
        provisions: true,
        expenses: true,
      },
    });

    const summaries: ExecutiveSummary[] = [];

    for (const category of categories) {
      const summary = await this.calculateSummaryForCategory(category.id);
      summaries.push(summary);
    }

    return summaries;
  }

  async getExecutiveSummaryByCategory(categoryId: string): Promise<ExecutiveSummary> {
    return this.calculateSummaryForCategory(categoryId);
  }

  private async calculateSummaryForCategory(categoryId: string): Promise<ExecutiveSummary> {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        provisions: true,
        expenses: true,
      },
    });

    if (!category) {
      throw new Error(`Category with id ${categoryId} not found`);
    }

    // Calculate monthly spent
    const monthlySpentResult = await prisma.expense.aggregate({
      where: { categoryId },
      _sum: { amount: true },
    });
    const monthlySpent = this.toNumber(monthlySpentResult._sum.amount);

    // Calculate open provisions
    const openProvisionsResult = await prisma.provision.aggregate({
      where: {
        categoryId,
        status: 'OPEN',
      },
      _sum: { amount: true },
    });
    const monthlyOpenProvisions = this.toNumber(openProvisionsResult._sum.amount);

    // Monthly calculations
    const monthlyBudget = this.toNumber(category.monthlyBudget);
    const monthlyAvailable = monthlyBudget + monthlySpent + monthlyOpenProvisions;

    // Semester calculations (6 months)
    const semesterBudget = monthlyBudget * 6;
    const semesterSpent = monthlySpent;
    const semesterGrossAvailable = semesterBudget + semesterSpent;
    const semesterProvision = monthlyOpenProvisions;
    const semesterRealAvailable = semesterGrossAvailable + semesterProvision;

    return {
      categoryId: category.id,
      categoryName: category.name,
      period: category.period,
      monthlyBudget,
      monthlySpent,
      monthlyOpenProvisions,
      monthlyAvailable,
      semesterBudget,
      semesterSpent,
      semesterGrossAvailable,
      semesterProvision,
      semesterRealAvailable,
    };
  }
}
