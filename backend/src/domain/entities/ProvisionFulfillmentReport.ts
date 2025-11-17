export interface ProvisionMetrics {
  categoryId: string;
  categoryName: string;
  totalProvisioned: number;
  openAmount: number;
  closedAmount: number;
  fulfillmentRate: number; // Percentage
  averageProvisionAmount: number;
  totalCount: number;
  openCount: number;
  closedCount: number;
}

export interface ProvisionItemDetail {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'OPEN' | 'CLOSED';
  categoryName: string;
  createdAt: string;
}

export interface ProvisionFulfillmentReport {
  period: string;

  // Overall metrics
  totalProvisioned: number;
  totalOpen: number;
  totalClosed: number;
  overallFulfillmentRate: number; // Percentage

  // Category-wise metrics
  categoryMetrics: ProvisionMetrics[];

  // Breakdown by status
  statusBreakdown: {
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }[];

  // Detailed provisions
  openProvisions: ProvisionItemDetail[];
  closedProvisions: ProvisionItemDetail[];

  // Overdue analysis
  overdueCount: number;
  overdueAmount: number;
  upcomingCount: number; // Due within 7 days

  // Summary
  createdAt: string;
}
