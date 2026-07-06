export interface AIFeedbackResponse {
  id: string;
  userId: string;
  competence: string;
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  expensePercentage: number;
  investmentPercentage: number;
  topCategory: string | null;
  topCategoryValue: number | null;
  analysis: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIFeedbackMetrics {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  expensePercentage: number;
  investmentPercentage: number;
  topCategory: string | null;
  topCategoryValue: number | null;
}
