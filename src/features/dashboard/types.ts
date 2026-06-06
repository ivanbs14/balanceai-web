export type MonthId = string;

export type CurrencyAmount = number;

export type SummaryMetrics = {
  totalExpenses: CurrencyAmount;
  balance: CurrencyAmount;
};

export type FixedCostItem = {
  id: string;
  name: string;
  paymentType: string;
  paid: boolean;
  amount: CurrencyAmount;
};

export type CreditCardItem = {
  id: string;
  name: string;
  paymentType: string;
  installmentLabel: string;
  amount: CurrencyAmount;
};

export type BreakdownItem = {
  id: string;
  label: string;
  amount: CurrencyAmount;
};

export type CategorySpendItem = {
  id: string;
  label: string;
  percentage: number;
  colorClassName: string;
};

export type DashboardMonthData = {
  id: MonthId;
  label: string;
  summary: SummaryMetrics;
  fixedCosts: FixedCostItem[];
  creditCard: CreditCardItem[];
  income: BreakdownItem[];
  expenses: BreakdownItem[];
  investments: BreakdownItem[];
  categories: CategorySpendItem[];
};
