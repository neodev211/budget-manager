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
