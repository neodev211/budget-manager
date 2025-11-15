export interface Category {
  id: string;
  name: string;
  period: string; // Format: "2025-10"
  monthlyBudget: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  name: string;
  period: string;
  monthlyBudget: number;
  notes?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  period?: string;
  monthlyBudget?: number;
  notes?: string;
}
