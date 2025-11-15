export enum ProvisionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export interface Provision {
  id: string;
  item: string;
  categoryId: string;
  amount: number; // Always negative
  usedAmount?: number; // Calculated from associated expenses (always negative)
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
