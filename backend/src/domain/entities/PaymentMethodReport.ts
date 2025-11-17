export interface PaymentMethodData {
  paymentMethod: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  averageTransaction: number;
  categoryBreakdown: {
    categoryName: string;
    amount: number;
  }[];
}

export interface PaymentMethodReport {
  period: string;

  // Summary
  totalSpent: number;
  totalTransactions: number;

  // Payment Methods breakdown
  paymentMethods: PaymentMethodData[];

  // Top payment methods
  topPaymentMethods: {
    paymentMethod: string;
    amount: number;
    percentage: number;
  }[];

  // Most used categories per payment method
  paymentMethodToCategory: {
    paymentMethod: string;
    topCategory: string;
    amount: number;
  }[];

  // Summary
  createdAt: string;
}
