// Domain Types
export interface Category {
  id: string;
  name: string;
  period: string;
  monthlyBudget: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  period: string;
  monthlyBudget: number;
  notes?: string;
}

export enum ProvisionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface Provision {
  id: string;
  item: string;
  categoryId: string;
  amount: number;
  usedAmount?: number;
  dueDate: string;
  status: ProvisionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProvisionDTO {
  item: string;
  categoryId: string;
  amount: number;
  dueDate: string;
  notes?: string;
}

export interface UpdateProvisionDTO {
  item?: string;
  amount?: number;
  dueDate?: string;
  status?: ProvisionStatus;
  notes?: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  OTHER = 'OTHER'
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  categoryId: string;
  provisionId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDTO {
  date: string;
  description: string;
  categoryId: string;
  provisionId?: string;
  amount: number;
  paymentMethod?: PaymentMethod;
}

export interface ExecutiveSummary {
  categoryId: string;
  categoryName: string;
  period: string;
  monthlyBudget: number;
  monthlySpent: number;
  monthlyOpenProvisions: number;
  monthlyAvailable: number;
  semesterBudget: number;
  semesterSpent: number;
  semesterGrossAvailable: number;
  semesterProvision: number;
  semesterRealAvailable: number;
}

// Report Types
export interface CategoryDetailReport {
  categoryId: string;
  categoryName: string;
  period: string;
  monthlyBudget: number;
  totalExpenses: number;
  totalProvisions: number;
  totalUsed: number;
  availableBudget: number;
  budgetUtilization: number;
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    paymentMethod: string;
    date: string;
  }>;
  topExpenses: Array<{
    description: string;
    amount: number;
    paymentMethod: string;
  }>;
  expenseCount: number;
  averageExpense: number;
  totalOpenProvisions: number;
  totalClosedProvisions: number;
  provisionFulfillmentRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodData {
  period: string;
  monthlyBudget: number;
  totalSpent: number;
  openProvisions: number;
  availableBudget: number;
  budgetUtilization: number;
}

export interface CategoryTrendData {
  categoryId: string;
  categoryName: string;
  periods: PeriodData[];
  budgetTrend: number;
  spendingTrend: number;
}

export interface PeriodComparisonReport {
  periods: string[];
  totalBudget: number;
  totalSpent: number;
  totalProvisionsOpen: number;
  totalAvailable: number;
  averageUtilization: number;
  categoryComparisons: CategoryTrendData[];
  budgetEvolution: number[];
  spendingEvolution: number[];
  provisionEvolution: number[];
  createdAt: string;
}

export interface PaymentMethodData {
  paymentMethod: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  averageTransaction: number;
  categoryBreakdown: Array<{
    categoryName: string;
    amount: number;
  }>;
}

export interface PaymentMethodReport {
  period: string;
  totalSpent: number;
  totalTransactions: number;
  paymentMethods: PaymentMethodData[];
  topPaymentMethods: Array<{
    paymentMethod: string;
    amount: number;
    percentage: number;
  }>;
  paymentMethodToCategory: Array<{
    paymentMethod: string;
    topCategory: string;
    amount: number;
  }>;
  createdAt: string;
}

export interface ProvisionMetrics {
  categoryId: string;
  categoryName: string;
  totalProvisioned: number;
  openAmount: number;
  closedAmount: number;
  fulfillmentRate: number;
  averageProvisionAmount: number;
  totalCount: number;
  openCount: number;
  closedCount: number;
}

export interface ProvisionFulfillmentReport {
  period: string;
  totalProvisioned: number;
  totalOpen: number;
  totalClosed: number;
  overallFulfillmentRate: number;
  categoryMetrics: ProvisionMetrics[];
  statusBreakdown: Array<{
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  openProvisions: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    categoryName: string;
    createdAt: string;
  }>;
  closedProvisions: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    categoryName: string;
    createdAt: string;
  }>;
  overdueCount: number;
  overdueAmount: number;
  upcomingCount: number;
  createdAt: string;
}
