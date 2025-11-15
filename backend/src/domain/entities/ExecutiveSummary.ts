export interface ExecutiveSummary {
  categoryId: string;
  categoryName: string;
  period: string;

  // Monthly calculations
  monthlyBudget: number;
  monthlySpent: number;
  monthlyOpenProvisions: number;
  monthlyAvailable: number;

  // Semester calculations
  semesterBudget: number;
  semesterSpent: number;
  semesterGrossAvailable: number;
  semesterProvision: number;
  semesterRealAvailable: number;
}
