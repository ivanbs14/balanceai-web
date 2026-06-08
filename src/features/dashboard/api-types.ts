export type ApiNumericValue = number | string | null;

export type ApiSummaryResponse = {
  totalValues?: {
    totalExpenses?: ApiNumericValue;
    totalInvestments?: ApiNumericValue;
    totalDeposits?: ApiNumericValue;
    balance?: ApiNumericValue;
  };
  topCategories?: Array<{
    category?: string;
    percent?: number;
    value?: ApiNumericValue;
  }>;
};

export type ApiFixedCostItem = {
  id: string;
  userId: string;
  name: string;
  defaultAmount: ApiNumericValue;
  recurrence: string;
  paymentType?: "MONTHLY" | "BIMONTHLY" | "QUARTERLY" | "YEARLY";
  category?: "FIXED_COST";
  dueDay: number;
  isActive: boolean;
  monthly?: {
    id: string | null;
    competence: string;
    status: "PAID" | "PENDING";
    amount: ApiNumericValue;
    paidAt: string | null;
  };
};

export type ApiFixedCostsResponse = {
  data?: ApiFixedCostItem[];
};

export type ApiTransaction = {
  id: string;
  name: string;
  type: "DEPOSIT" | "EXPENSE" | "INVESTMENT";
  amount: ApiNumericValue;
  isFixed?: boolean | null;
  category: string;
  paymentMethod: string;
  paymentStatus?: "PAID" | "PENDING";
  paidAt?: string | null;
  installments?: number | null;
  installmentInfo?: string | null;
  nameCard?: string | null;
  cardId?: string | null;
  Date: string;
};

export type ApiTransactionsResponse = {
  transactions?: ApiTransaction[];
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
};

export type ApiCardAggregateResponse = {
  topCredcards?: Array<{
    card: string;
    valorTotalMes: ApiNumericValue;
    valorTotalTodosMesesRestantes: ApiNumericValue;
    valorParceladoMes: ApiNumericValue;
  }>;
};

export type ApiDashboardMonthlyResponse = {
  summary: ApiSummaryResponse;
  fixedCosts: ApiFixedCostsResponse;
  transactions: ApiTransaction[];
  creditCard: ApiCardAggregateResponse;
};
