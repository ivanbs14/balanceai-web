import type {
  ApiCardAggregateResponse,
  ApiFixedCostsResponse,
  ApiNumericValue,
  ApiSummaryResponse,
  ApiTransaction,
} from "./api-types";
import type {
  BreakdownItem,
  CardSpendItem,
  CategorySpendItem,
  CreditCardItem,
  DashboardViewModel,
  FixedCostItem,
  MonthlyExpenseItem,
} from "./types";

const categoryColorClasses = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
] as const;

const paymentMethodLabels: Record<string, string> = {
  CREDIT_CARD: "Cartao de Credito",
  DEBIT_CARD: "Debito",
  Bank_Transfer: "Transferencia",
  BANK_SLIP: "Boleto",
  CASH: "Dinheiro",
  PIX: "Pix",
  OTHER: "Outro",
};

const fixedCostPaymentTypeLabels: Record<string, string> = {
  MONTHLY: "Recorrente mensal",
  BIMONTHLY: "Recorrente bimestral",
  QUARTERLY: "Recorrente trimestral",
  YEARLY: "Recorrente anual",
};

const categoryLabels: Record<string, string> = {
  FIXED_COST: "Custo Fixo",
  HOUSING: "Moradia",
  TRANSPORTION: "Transporte",
  FOOD: "Alimentacao",
  ENTERTAINMENT: "Entretenimento",
  HEALTH: "Saude",
  UTILITY: "Contas",
  SALARY: "Salario",
  EDUCATION: "Educacao",
  OTHER: "Outros",
};

function toNumber(value: ApiNumericValue): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toPaymentMethodLabel(method: string) {
  return paymentMethodLabels[method] ?? method.replaceAll("_", " ");
}

function toCategoryLabel(category: string) {
  return categoryLabels[category] ?? category.replaceAll("_", " ");
}

function toFixedCostPaymentTypeLabel(paymentType: string) {
  return (
    fixedCostPaymentTypeLabels[paymentType] ?? paymentType.replaceAll("_", " ")
  );
}

function groupAmounts(items: Array<{ id: string; label: string; amount: number }>): BreakdownItem[] {
  const grouped = new Map<string, BreakdownItem>();

  for (const item of items) {
    const previous = grouped.get(item.label);

    if (previous) {
      previous.amount += item.amount;
      continue;
    }

    grouped.set(item.label, {
      id: item.id,
      label: item.label,
      amount: item.amount,
    });
  }

  return Array.from(grouped.values()).sort((left, right) => right.amount - left.amount);
}

function parseInstallmentInfo(
  installmentInfo: string | null | undefined,
  fallbackInstallments: number | null | undefined,
) {
  if (installmentInfo) {
    const match = installmentInfo.match(/^(\d+)\/(\d+)$/);

    if (match) {
      return {
        installmentCurrent: Number.parseInt(match[1], 10),
        installmentTotal: Number.parseInt(match[2], 10),
      };
    }
  }

  const total = fallbackInstallments && fallbackInstallments > 1 ? fallbackInstallments : 1;

  return {
    installmentCurrent: 1,
    installmentTotal: total,
  };
}

function mapFixedCosts(fixedCostsResponse: ApiFixedCostsResponse): FixedCostItem[] {
  return (fixedCostsResponse.data ?? []).map((fixedCost) => ({
    id: fixedCost.id,
    name: fixedCost.name,
    paymentType: toFixedCostPaymentTypeLabel(
      fixedCost.paymentType ?? fixedCost.recurrence,
    ),
    category: toCategoryLabel(fixedCost.category ?? "FIXED_COST"),
    dueDay: fixedCost.dueDay,
    status: fixedCost.monthly?.status === "PAID" ? "paid" : "pending",
    amount: toNumber(fixedCost.monthly?.amount ?? fixedCost.defaultAmount),
  }));
}

function mapMonthlyExpenses(transactions: ApiTransaction[]): MonthlyExpenseItem[] {
  return transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .map((transaction) => ({
      id: transaction.id,
      name: transaction.name,
      category: toCategoryLabel(transaction.category),
      isFixed: Boolean(transaction.isFixed),
      paymentType: toPaymentMethodLabel(transaction.paymentMethod),
      paymentStatus:
        transaction.paymentStatus === "PAID"
          ? ("paid" as const)
          : ("pending" as const),
      isCreditCardInstallmentPurchase:
        transaction.paymentMethod === "CREDIT_CARD" &&
        Number(transaction.installments ?? 0) > 1,
      amount: toNumber(transaction.amount),
    }))
    .sort((left, right) => right.amount - left.amount);
}

function mapCreditCardItems(
  transactions: ApiTransaction[],
  creditCardResponse: ApiCardAggregateResponse,
  statementMonthLabel: string,
): CreditCardItem[] {
  const transactionRows = transactions
    .filter(
      (transaction) =>
        transaction.type === "EXPENSE" && transaction.paymentMethod === "CREDIT_CARD",
    )
    .map((transaction) => {
      const installment = parseInstallmentInfo(
        transaction.installmentInfo,
        transaction.installments,
      );

      return {
        id: transaction.id,
        cardName: transaction.nameCard || "Cartao",
        description: transaction.name,
        statementMonthLabel,
        installmentCurrent: installment.installmentCurrent,
        installmentTotal: installment.installmentTotal,
        canDeletePendingInstallments:
          transaction.paymentMethod === "CREDIT_CARD" &&
          Number(transaction.installments ?? 0) > 1,
        amount: toNumber(transaction.amount),
      };
    })
    .sort((left, right) => right.amount - left.amount);

  if (transactionRows.length > 0) {
    return transactionRows;
  }

  return (creditCardResponse.topCredcards ?? []).map((card) => ({
    id: `${card.card}-${statementMonthLabel}`,
    cardName: card.card,
    description: "Total da fatura",
    statementMonthLabel,
    installmentCurrent: 1,
    installmentTotal: 1,
    canDeletePendingInstallments: false,
    amount: toNumber(card.valorTotalMes),
  }));
}

function mapIncomeBreakdown(transactions: ApiTransaction[]): BreakdownItem[] {
  return groupAmounts(
    transactions
      .filter((transaction) => transaction.type === "DEPOSIT")
      .map((transaction) => ({
        id: transaction.id,
        label: transaction.name,
        amount: toNumber(transaction.amount),
      })),
  );
}

function mapExpenseBreakdown(transactions: ApiTransaction[]): BreakdownItem[] {
  return groupAmounts(
    transactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .map((transaction) => ({
        id: transaction.id,
        label: toPaymentMethodLabel(transaction.paymentMethod),
        amount: toNumber(transaction.amount),
      })),
  );
}

function mapInvestmentBreakdown(transactions: ApiTransaction[]): BreakdownItem[] {
  return groupAmounts(
    transactions
      .filter((transaction) => transaction.type === "INVESTMENT")
      .map((transaction) => ({
        id: transaction.id,
        label: transaction.name,
        amount: toNumber(transaction.amount),
      })),
  );
}

function mapCardSpending(creditCardResponse: ApiCardAggregateResponse): CardSpendItem[] {
  return (creditCardResponse.topCredcards ?? []).map((card, index) => ({
    id: `${card.card ?? "cartao"}-${index}`,
    label: card.card?.trim() || "Cartao",
    monthAmount: toNumber(card.valorTotalMes),
    totalAmount:
      toNumber(card.valorTotalMes) + toNumber(card.valorTotalTodosMesesRestantes),
    colorClassName: categoryColorClasses[index % categoryColorClasses.length],
  }));
}

function mapCategories(summary: ApiSummaryResponse): CategorySpendItem[] {
  return (summary.topCategories ?? []).map((category, index) => ({
    id: `${category.category ?? "categoria"}-${index}`,
    label: toCategoryLabel(category.category ?? "Outros"),
    amount: toNumber(category.value ?? null),
    colorClassName: categoryColorClasses[index % categoryColorClasses.length],
  }));
}

function toMonthLabel(monthId: string) {
  const [year, month] = monthId.split("-");
  const parsedYear = Number.parseInt(year, 10);
  const parsedMonth = Number.parseInt(month, 10) - 1;

  if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMonth)) {
    return monthId;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(parsedYear, parsedMonth, 1));
}

export function createEmptyDashboardViewModel(monthId: string): DashboardViewModel {
  return {
    monthId,
    monthLabel: toMonthLabel(monthId),
    summary: {
      totalExpenses: 0,
      balance: 0,
    },
    fixedCosts: [],
    monthlyExpenses: [],
    creditCard: [],
    income: [],
    expenses: [],
    investments: [],
    cardSpending: [],
    categories: [],
  };
}

export function mapDashboardViewModel(params: {
  monthId: string;
  summary: ApiSummaryResponse;
  fixedCosts: ApiFixedCostsResponse;
  transactions: ApiTransaction[];
  creditCard: ApiCardAggregateResponse;
}): DashboardViewModel {
  const { monthId, summary, fixedCosts, transactions, creditCard } = params;
  const statementMonthLabel = toMonthLabel(monthId);

  return {
    monthId,
    monthLabel: statementMonthLabel,
    summary: {
      totalExpenses: toNumber(summary.totalValues?.totalExpenses ?? null),
      balance: toNumber(summary.totalValues?.balance ?? null),
    },
    fixedCosts: mapFixedCosts(fixedCosts),
    monthlyExpenses: mapMonthlyExpenses(transactions),
    creditCard: mapCreditCardItems(transactions, creditCard, statementMonthLabel),
    income: mapIncomeBreakdown(transactions),
    expenses: mapExpenseBreakdown(transactions),
    investments: mapInvestmentBreakdown(transactions),
    cardSpending: mapCardSpending(creditCard),
    categories: mapCategories(summary),
  };
}
