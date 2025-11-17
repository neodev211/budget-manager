import { IReportRepository } from '../../../../domain/repositories/IReportRepository';
import { ExecutiveSummary } from '../../../../domain/entities/ExecutiveSummary';
import { CategoryDetailReport } from '../../../../domain/entities/CategoryDetailReport';
import { PeriodComparisonReport } from '../../../../domain/entities/PeriodComparisonReport';
import { PaymentMethodReport } from '../../../../domain/entities/PaymentMethodReport';
import { ProvisionFulfillmentReport } from '../../../../domain/entities/ProvisionFulfillmentReport';
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

  async getCategoryDetailReport(categoryId: string, period: string): Promise<CategoryDetailReport> {
    // ✅ OPTIMIZED: Single query with all relations pre-loaded
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        expenses: {
          select: {
            id: true,
            description: true,
            amount: true,
            paymentMethod: true,
            date: true,
          },
        },
        provisions: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error(`Category with id "${categoryId}" not found`);
    }

    // Filter expenses by period
    const filteredExpenses = category.expenses.filter(exp => {
      const expPeriod = exp.date.toISOString().substring(0, 7);
      return expPeriod === period;
    });

    // Calculate metrics in-memory
    const totalExpenses = Math.abs(
      filteredExpenses.reduce((sum, exp) => sum + this.toNumber(exp.amount), 0)
    );
    const totalProvisions = Math.abs(
      category.provisions.reduce((sum, prov) => sum + this.toNumber(prov.amount), 0)
    );

    const openProvisionsCount = category.provisions.filter((p: any) => p.status === 'OPEN').length;
    const closedProvisionsCount = category.provisions.filter((p: any) => p.status === 'CLOSED').length;

    const monthlyBudget = this.toNumber(category.monthlyBudget);
    const totalUsed = totalExpenses + totalProvisions;
    const availableBudget = monthlyBudget - totalUsed;
    const budgetUtilization = monthlyBudget > 0 ? (totalUsed / monthlyBudget) * 100 : 0;

    // Get top expenses
    const topExpenses = filteredExpenses
      .sort((a, b) => this.toNumber(b.amount) - this.toNumber(a.amount))
      .slice(0, 5)
      .map(exp => ({
        description: exp.description,
        amount: Math.abs(this.toNumber(exp.amount)),
        paymentMethod: exp.paymentMethod,
      }));

    const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;
    const provisionFulfillmentRate = category.provisions.length > 0
      ? (closedProvisionsCount / category.provisions.length) * 100
      : 0;

    return {
      categoryId: category.id,
      categoryName: category.name,
      period,
      monthlyBudget,
      totalExpenses,
      totalProvisions,
      totalUsed,
      availableBudget,
      budgetUtilization,
      expenses: filteredExpenses.map(exp => ({
        id: exp.id,
        description: exp.description,
        amount: Math.abs(this.toNumber(exp.amount)),
        paymentMethod: exp.paymentMethod,
        date: exp.date.toISOString(),
      })),
      topExpenses,
      expenseCount: filteredExpenses.length,
      averageExpense,
      totalOpenProvisions: openProvisionsCount,
      totalClosedProvisions: closedProvisionsCount,
      provisionFulfillmentRate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getPeriodComparisonReport(periods: string[]): Promise<PeriodComparisonReport> {
    // ✅ OPTIMIZED: Single query for all categories across all periods
    const categories = await prisma.category.findMany({
      where: { period: { in: periods } },
      include: {
        expenses: {
          select: { amount: true, date: true },
        },
        provisions: {
          select: { amount: true, status: true },
        },
      },
    });

    // Group by period and calculate metrics
    const periodMap = new Map<string, any[]>();
    categories.forEach(cat => {
      if (!periodMap.has(cat.period)) {
        periodMap.set(cat.period, []);
      }
      periodMap.get(cat.period)!.push(cat);
    });

    // Calculate period-level metrics
    const periodMetrics: any[] = [];
    let totalBudget = 0;
    let totalSpent = 0;
    let totalProvisionsOpen = 0;

    for (const period of periods) {
      const catsInPeriod = periodMap.get(period) || [];
      let periodBudget = 0;
      let periodSpent = 0;
      let periodProvisions = 0;

      catsInPeriod.forEach((cat: any) => {
        periodBudget += this.toNumber(cat.monthlyBudget);
        periodSpent += Math.abs(
          cat.expenses.reduce((sum: number, exp: any) => sum + this.toNumber(exp.amount), 0)
        );
        periodProvisions += Math.abs(
          cat.provisions
            .filter((p: any) => p.status === 'OPEN')
            .reduce((sum: number, prov: any) => sum + this.toNumber(prov.amount), 0)
        );
      });

      const budgetUtilization = periodBudget > 0 ? (periodSpent / periodBudget) * 100 : 0;

      periodMetrics.push({
        period,
        monthlyBudget: periodBudget,
        totalSpent: periodSpent,
        openProvisions: periodProvisions,
        availableBudget: periodBudget - periodSpent - periodProvisions,
        budgetUtilization,
      });

      totalBudget += periodBudget;
      totalSpent += periodSpent;
      totalProvisionsOpen += periodProvisions;
    }

    // Calculate category-wise comparison
    const categoryMap = new Map<string, any>();
    categories.forEach(cat => {
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, { id: cat.id, name: cat.name, periods: [] });
      }

      const spent = Math.abs(
        cat.expenses.reduce((sum, exp) => sum + this.toNumber(exp.amount), 0)
      );
      const provisioned = Math.abs(
        cat.provisions
          .filter((p: any) => p.status === 'OPEN')
          .reduce((sum, prov) => sum + this.toNumber(prov.amount), 0)
      );

      const budget = this.toNumber(cat.monthlyBudget);
      categoryMap.get(cat.id).periods.push({
        period: cat.period,
        monthlyBudget: budget,
        totalSpent: spent,
        openProvisions: provisioned,
        availableBudget: budget - spent - provisioned,
        budgetUtilization: budget > 0 ? (spent / budget) * 100 : 0,
      });
    });

    const categoryComparisons = Array.from(categoryMap.values())
      .filter(cat => cat.periods.length >= 2)
      .map(cat => {
        const firstBudget = cat.periods[0]?.monthlyBudget || 0;
        const lastBudget = cat.periods[cat.periods.length - 1]?.monthlyBudget || 0;
        const budgetTrend = firstBudget > 0 ? ((lastBudget - firstBudget) / firstBudget) * 100 : 0;

        const firstSpent = cat.periods[0]?.totalSpent || 0;
        const lastSpent = cat.periods[cat.periods.length - 1]?.totalSpent || 0;
        const spendingTrend = firstSpent > 0 ? ((lastSpent - firstSpent) / firstSpent) * 100 : 0;

        return {
          categoryId: cat.id,
          categoryName: cat.name,
          periods: cat.periods,
          budgetTrend,
          spendingTrend,
        };
      });

    const averageUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      periods,
      totalBudget,
      totalSpent,
      totalProvisionsOpen,
      totalAvailable: totalBudget - totalSpent - totalProvisionsOpen,
      averageUtilization,
      categoryComparisons,
      budgetEvolution: periodMetrics.map(p => p.monthlyBudget),
      spendingEvolution: periodMetrics.map(p => p.totalSpent),
      provisionEvolution: periodMetrics.map(p => p.openProvisions),
      createdAt: new Date().toISOString(),
    };
  }

  async getPaymentMethodReport(period: string): Promise<PaymentMethodReport> {
    // ✅ OPTIMIZED: Single query to get all expenses in period
    const categories = await prisma.category.findMany({
      where: { period },
      include: {
        expenses: {
          select: {
            amount: true,
            paymentMethod: true,
          },
        },
      },
    });

    // Aggregate by payment method in-memory
    const paymentMethodMap = new Map<string, any>();
    let totalSpent = 0;
    let totalTransactions = 0;

    categories.forEach(cat => {
      cat.expenses.forEach(exp => {
        const amount = Math.abs(this.toNumber(exp.amount));
        totalSpent += amount;
        totalTransactions += 1;

        if (!paymentMethodMap.has(exp.paymentMethod)) {
          paymentMethodMap.set(exp.paymentMethod, {
            paymentMethod: exp.paymentMethod,
            totalAmount: 0,
            transactionCount: 0,
            categoryBreakdown: new Map<string, number>(),
          });
        }

        const pm = paymentMethodMap.get(exp.paymentMethod);
        pm.totalAmount += amount;
        pm.transactionCount += 1;

        const catName = cat.name;
        pm.categoryBreakdown.set(
          catName,
          (pm.categoryBreakdown.get(catName) || 0) + amount
        );
      });
    });

    // Convert to final format
    const paymentMethods = Array.from(paymentMethodMap.values()).map((pm: any) => ({
      paymentMethod: pm.paymentMethod,
      totalAmount: pm.totalAmount,
      transactionCount: pm.transactionCount,
      percentage: totalSpent > 0 ? (pm.totalAmount / totalSpent) * 100 : 0,
      averageTransaction: pm.transactionCount > 0 ? pm.totalAmount / pm.transactionCount : 0,
      categoryBreakdown: Array.from(pm.categoryBreakdown.entries()).map(([catName, amount]: any) => ({
        categoryName: catName as string,
        amount: amount as number,
      })),
    }));

    // Sort by amount descending for top payment methods
    const topPaymentMethods = [...paymentMethods]
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 5)
      .map((pm: any) => ({
        paymentMethod: pm.paymentMethod,
        amount: pm.totalAmount,
        percentage: pm.percentage,
      }));

    // Most used categories per payment method
    const paymentMethodToCategory = paymentMethods.map((pm: any) => {
      const topCat = pm.categoryBreakdown.sort((a: any, b: any) => b.amount - a.amount)[0];
      return {
        paymentMethod: pm.paymentMethod,
        topCategory: topCat?.categoryName || 'Unknown',
        amount: topCat?.amount || 0,
      };
    });

    return {
      period,
      totalSpent,
      totalTransactions,
      paymentMethods,
      topPaymentMethods,
      paymentMethodToCategory,
      createdAt: new Date().toISOString(),
    };
  }

  async getProvisionFulfillmentReport(period: string): Promise<ProvisionFulfillmentReport> {
    // ✅ OPTIMIZED: Single query to get all provisions in period with category data
    const categories = await prisma.category.findMany({
      where: { period },
      include: {
        provisions: {
          select: {
            id: true,
            item: true,
            amount: true,
            dueDate: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate metrics in-memory
    const categoryMetrics: any[] = [];
    let totalProvisioned = 0;
    let totalOpen = 0;
    let totalClosed = 0;
    let overdueCount = 0;
    let overdueAmount = 0;
    let upcomingCount = 0;

    const allOpenProvisions: any[] = [];
    const allClosedProvisions: any[] = [];

    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    categories.forEach(cat => {
      let catTotal = 0;
      let catOpen = 0;
      let catClosed = 0;

      cat.provisions.forEach(prov => {
        const amount = Math.abs(this.toNumber(prov.amount));
        catTotal += amount;
        totalProvisioned += amount;

        const provisionDate = new Date(prov.dueDate);

        if (prov.status === 'OPEN') {
          catOpen += 1;
          totalOpen += 1;

          if (provisionDate < today) {
            overdueCount += 1;
            overdueAmount += amount;
          } else if (provisionDate <= sevenDaysFromNow) {
            upcomingCount += 1;
          }

          allOpenProvisions.push({
            id: prov.id,
            description: prov.item,
            amount,
            dueDate: prov.dueDate,
            status: 'OPEN',
            categoryName: cat.name,
            createdAt: prov.createdAt.toISOString(),
          });
        } else {
          catClosed += 1;
          totalClosed += 1;

          allClosedProvisions.push({
            id: prov.id,
            description: prov.item,
            amount,
            dueDate: prov.dueDate,
            status: 'CLOSED',
            categoryName: cat.name,
            createdAt: prov.createdAt.toISOString(),
          });
        }
      });

      if (cat.provisions.length > 0) {
        categoryMetrics.push({
          categoryId: cat.id,
          categoryName: cat.name,
          totalProvisioned: catTotal,
          openAmount: allOpenProvisions
            .filter(p => p.categoryName === cat.name)
            .reduce((sum, p) => sum + p.amount, 0),
          closedAmount: allClosedProvisions
            .filter(p => p.categoryName === cat.name)
            .reduce((sum, p) => sum + p.amount, 0),
          fulfillmentRate: cat.provisions.length > 0 ? (catClosed / cat.provisions.length) * 100 : 0,
          averageProvisionAmount: cat.provisions.length > 0 ? catTotal / cat.provisions.length : 0,
          totalCount: cat.provisions.length,
          openCount: catOpen,
          closedCount: catClosed,
        });
      }
    });

    const overallFulfillmentRate = (totalOpen + totalClosed) > 0
      ? (totalClosed / (totalOpen + totalClosed)) * 100
      : 0;

    const statusBreakdown = [
      {
        status: 'OPEN',
        count: totalOpen,
        amount: allOpenProvisions.reduce((sum, p) => sum + p.amount, 0),
        percentage: (totalOpen + totalClosed) > 0 ? (totalOpen / (totalOpen + totalClosed)) * 100 : 0,
      },
      {
        status: 'CLOSED',
        count: totalClosed,
        amount: allClosedProvisions.reduce((sum, p) => sum + p.amount, 0),
        percentage: (totalOpen + totalClosed) > 0 ? (totalClosed / (totalOpen + totalClosed)) * 100 : 0,
      },
    ];

    return {
      period,
      totalProvisioned,
      totalOpen,
      totalClosed,
      overallFulfillmentRate,
      categoryMetrics,
      statusBreakdown,
      openProvisions: allOpenProvisions.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
      closedProvisions: allClosedProvisions,
      overdueCount,
      overdueAmount,
      upcomingCount,
      createdAt: new Date().toISOString(),
    };
  }
}
