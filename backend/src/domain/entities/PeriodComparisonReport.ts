export interface PeriodData {
  period: string;
  monthlyBudget: number;
  totalSpent: number;
  openProvisions: number;
  availableBudget: number;
  budgetUtilization: number; // Percentage
}

export interface CategoryTrendData {
  categoryId: string;
  categoryName: string;
  periods: PeriodData[];
  budgetTrend: number; // Percentage change
  spendingTrend: number; // Percentage change
}

export interface PeriodComparisonReport {
  periods: string[];

  // Overall metrics
  totalBudget: number;
  totalSpent: number;
  totalProvisionsOpen: number;
  totalAvailable: number;
  averageUtilization: number; // Percentage

  // Category-wise comparison
  categoryComparisons: CategoryTrendData[];

  // Trends
  budgetEvolution: number[]; // Array of budgets per period
  spendingEvolution: number[]; // Array of spending per period
  provisionEvolution: number[]; // Array of open provisions per period

  // Summary
  createdAt: string;
}
