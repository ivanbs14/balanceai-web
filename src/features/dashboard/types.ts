export type MonthId = string;

export type CurrencyAmount = number;

export type FixedCostStatus = "paid" | "pending";

export type SummaryMetrics = {
  totalExpenses: CurrencyAmount;
  balance: CurrencyAmount;
};

export type FixedCostItem = {
  id: string;
  name: string;
  paymentType: string;
  dueDay: number;
  status: FixedCostStatus;
  amount: CurrencyAmount;
};

export type CreditCardItem = {
  id: string;
  cardName: string;
  description: string;
  statementMonthLabel: string;
  installmentCurrent: number;
  installmentTotal: number;
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
  amount: CurrencyAmount;
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
