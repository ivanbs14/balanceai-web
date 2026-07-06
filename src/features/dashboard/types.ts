export type MonthId = string;

export type CurrencyAmount = number;

export type FixedCostStatus = "paid" | "pending";
export type InstallmentGroupPaymentMethod = "CREDIT_CARD" | "PIX";

export type InstallmentGroupEditSeed = {
  transactionId: string;
  name: string;
  totalAmount: CurrencyAmount;
  startDate: string;
  installments: number;
  paymentMethod: InstallmentGroupPaymentMethod;
  cardId: string | null;
  cardName: string | null;
};

export type SummaryMetrics = {
  totalExpenses: CurrencyAmount;
  balance: CurrencyAmount;
};

export type FixedCostItem = {
  id: string;
  name: string;
  paymentType: string;
  category: string;
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
  canDeletePendingInstallments: boolean;
  installmentGroupEdit: InstallmentGroupEditSeed | null;
  amount: CurrencyAmount;
};

export type MonthlyExpenseItem = {
  id: string;
  name: string;
  category: string;
  isFixed: boolean;
  paymentType: string;
  paymentStatus: FixedCostStatus;
  isInstallmentGroupTransaction: boolean;
  canEditSimpleTransaction: boolean;
  installmentGroupEdit: InstallmentGroupEditSeed | null;
  amount: CurrencyAmount;
};

export type BreakdownItem = {
  id: string;
  label: string;
  amount: CurrencyAmount;
};

export type IncomeTransactionItem = {
  id: string;
  name: string;
  date: string;
  paymentMethod: string;
  amount: CurrencyAmount;
};

export type CategorySpendItem = {
  id: string;
  label: string;
  amount: CurrencyAmount;
  colorClassName: string;
};

export type CardSpendItem = {
  id: string;
  label: string;
  monthAmount: CurrencyAmount;
  totalAmount: CurrencyAmount;
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
  cardSpending: CardSpendItem[];
  categories: CategorySpendItem[];
};

export type DashboardViewModel = {
  monthId: MonthId;
  monthLabel: string;
  summary: SummaryMetrics;
  fixedCosts: FixedCostItem[];
  monthlyExpenses: MonthlyExpenseItem[];
  creditCard: CreditCardItem[];
  income: BreakdownItem[];
  incomeTransactions: IncomeTransactionItem[];
  expenses: BreakdownItem[];
  investments: BreakdownItem[];
  cardSpending: CardSpendItem[];
  categories: CategorySpendItem[];
};
