export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  OTHER = 'OTHER'
}

export interface Expense {
  id: string;
  date: Date;
  description: string;
  categoryId: string;
  provisionId?: string;
  amount: number; // Always negative
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseDTO {
  date: Date;
  description: string;
  categoryId: string;
  provisionId?: string;
  amount: number;
  paymentMethod?: PaymentMethod;
}

export interface UpdateExpenseDTO {
  date?: Date;
  description?: string;
  categoryId?: string;
  provisionId?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
}
