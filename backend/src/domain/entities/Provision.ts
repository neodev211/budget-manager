export enum ProvisionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface Provision {
  id: string;
  item: string;
  categoryId: string;
  amount: number; // Always negative (provisioned budget is stored as negative)
  usedAmount: number; // ✅ MATERIALIZED: Sum of linked expenses, cached in DB (always positive - absolute value)
  dueDate: Date;
  status: ProvisionStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProvisionDTO {
  item: string;
  categoryId: string;
  amount: number;
  dueDate: Date;
  notes?: string;
}

export interface UpdateProvisionDTO {
  item?: string;
  amount?: number;
  dueDate?: Date;
  status?: ProvisionStatus;
  notes?: string;
}
