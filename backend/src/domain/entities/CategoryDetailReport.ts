export interface ExpenseBreakdown {
  id: string;
  description: string;
  amount: number;
  paymentMethod: string;
  date: string;
}

export interface TopExpense {
  description: string;
  amount: number;
  paymentMethod: string;
}

export interface CategoryDetailReport {
  categoryId: string;
  categoryName: string;
  period: string;

  // Budget vs Actual
  monthlyBudget: number;
  totalExpenses: number;
  totalProvisions: number;
  totalUsed: number;
  availableBudget: number;
  budgetUtilization: number; // Percentage

  // Expense Breakdown
  expenses: ExpenseBreakdown[];
  topExpenses: TopExpense[];
  expenseCount: number;
  averageExpense: number;

  // Provisions
  totalOpenProvisions: number;
  totalClosedProvisions: number;
  provisionFulfillmentRate: number; // Percentage

  // Summary
  createdAt: string;
  updatedAt: string;
}
