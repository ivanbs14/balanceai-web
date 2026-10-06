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
  IncomeTransactionItem,
  InstallmentGroupEditAnchor,
  MonthlyExpenseItem,
} from "./types";
import { civilDateFromApi } from "../../shared/civil-date";

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

const fixedCostRecurrenceValues = new Set([
  "MONTHLY",
  "BIMONTHLY",
  "QUARTERLY",
  "YEARLY",
]);

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

function isFixedCostRecurrenceValue(value: string | null | undefined): value is keyof typeof fixedCostPaymentTypeLabels {
  return value ? fixedCostRecurrenceValues.has(value) : false;
}

function resolveFixedCostDisplayPaymentType(params: {
  paymentMethod?: string | null;
  paymentType?: string | null;
}) {
  const { paymentMethod, paymentType } = params;

  if (paymentMethod) {
    return toPaymentMethodLabel(paymentMethod);
  }

  if (paymentType && !isFixedCostRecurrenceValue(paymentType)) {
    return toPaymentMethodLabel(paymentType);
  }

  return "Recorrente";
}

function resolveFixedCostRecurrenceLabel(params: {
  recurrence?: string | null;
  paymentType?: string | null;
}) {
  const { recurrence, paymentType } = params;

  if (isFixedCostRecurrenceValue(recurrence)) {
    return toFixedCostPaymentTypeLabel(recurrence);
  }

  if (isFixedCostRecurrenceValue(paymentType)) {
    return toFixedCostPaymentTypeLabel(paymentType);
  }

  return null;
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

function buildInstallmentGroupEditAnchor(
  transaction: ApiTransaction,
): InstallmentGroupEditAnchor | null {
  const installments = Number(transaction.installments ?? 0);

  if (
    !transaction.installmentGroupId ||
    installments <= 1 ||
    (transaction.paymentMethod !== "CREDIT_CARD" && transaction.paymentMethod !== "PIX")
  ) {
    return null;
  }

  return { transactionId: transaction.id };
}

function mapTransactionMonthlyExpenses(transactions: ApiTransaction[], fixedCostsResponse: ApiFixedCostsResponse): MonthlyExpenseItem[] {
  const linked = new Map((fixedCostsResponse.data ?? [])
    .filter((fixedCost) => fixedCost.monthly?.transactionId)
    .map((fixedCost) => [fixedCost.monthly!.transactionId!, fixedCost]));
  return transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .map((transaction) => {
      const installmentGroupEdit = buildInstallmentGroupEditAnchor(transaction);

      return {
        id: transaction.id,
        sourceType: "transaction" as const,
        sourceId: transaction.id,
        accountingSource: linked.has(transaction.id) ? `Transação vinculada a ${linked.get(transaction.id)!.name}` : "Transação",
        linkedFixedCostId: linked.get(transaction.id)?.id,
        name: transaction.name,
        category: toCategoryLabel(transaction.category),
        isFixed: Boolean(transaction.isFixed),
        paymentType: toPaymentMethodLabel(transaction.paymentMethod),
        recurrenceLabel: null,
        dueDay: null,
        paymentStatus:
          transaction.paymentStatus === "PAID"
            ? ("paid" as const)
            : ("pending" as const),
        competence: transaction.Date.slice(0, 7),
        isInstallmentGroupTransaction: installmentGroupEdit !== null,
        canEditSimpleTransaction:
          installmentGroupEdit === null && transaction.paymentStatus !== "PAID",
        canManageRecurring: false,
        installmentGroupEdit,
        recurringEdit: null,
        amount: toNumber(transaction.amount),
      } satisfies MonthlyExpenseItem;
    });
}

function mapFixedCostMonthlyExpenses(
  fixedCostsResponse: ApiFixedCostsResponse,
): MonthlyExpenseItem[] {
  return (fixedCostsResponse.data ?? []).filter((fixedCost) => !fixedCost.monthly?.transactionId).map((fixedCost) => ({
    id: `fixed-cost:${fixedCost.id}:${fixedCost.monthly?.competence ?? fixedCost.startDate.slice(0, 7)}`,
    sourceType: "fixed-cost" as const,
    sourceId: fixedCost.id,
    accountingSource: "Custo fixo previsto",
    name: fixedCost.name,
    category: toCategoryLabel(fixedCost.category ?? "FIXED_COST"),
    isFixed: true,
    paymentType: resolveFixedCostDisplayPaymentType({
      paymentMethod: fixedCost.paymentMethod,
      paymentType: fixedCost.paymentType,
    }),
    recurrenceLabel: resolveFixedCostRecurrenceLabel({
      recurrence: fixedCost.recurrence,
      paymentType: fixedCost.paymentType,
    }),
    dueDay: fixedCost.monthly?.dueDate ? Number(fixedCost.monthly.dueDate.slice(8, 10)) : fixedCost.dueDay,
    paymentStatus: fixedCost.monthly?.status === "PAID" ? "paid" : "pending",
    competence: fixedCost.monthly?.competence ?? fixedCost.startDate.slice(0, 7),
    isInstallmentGroupTransaction: false,
    canEditSimpleTransaction: false,
    canManageRecurring: true,
    installmentGroupEdit: null,
    recurringEdit: {
      fixedCostId: fixedCost.id,
      name: fixedCost.name,
      amount: toNumber(fixedCost.monthly?.amount ?? fixedCost.defaultAmount),
      dueDay: fixedCost.dueDay,
      competence: fixedCost.monthly?.competence ?? fixedCost.startDate.slice(0, 7),
      paymentStatus: fixedCost.monthly?.status === "PAID" ? "paid" : "pending",
      category: fixedCost.category ?? "OTHER",
      paymentMethod: fixedCost.paymentMethod ?? fixedCost.paymentType ?? "OTHER",
      isActive: fixedCost.isActive,
    },
    amount: toNumber(fixedCost.monthly?.amount ?? fixedCost.defaultAmount),
  }));
}

function mapMonthlyExpenses(
  transactions: ApiTransaction[],
  fixedCostsResponse: ApiFixedCostsResponse,
): MonthlyExpenseItem[] {
  return [
    ...mapTransactionMonthlyExpenses(transactions, fixedCostsResponse),
    ...mapFixedCostMonthlyExpenses(fixedCostsResponse),
  ].sort((left, right) => right.amount - left.amount);
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
      const installmentGroupEdit = buildInstallmentGroupEditAnchor(transaction);

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
        installmentGroupEdit,
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
    installmentGroupEdit: null,
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

function mapIncomeTransactions(transactions: ApiTransaction[]): IncomeTransactionItem[] {
  return transactions
    .filter((transaction) => transaction.type === "DEPOSIT")
    .map((transaction) => {
      return {
        id: transaction.id,
        name: transaction.name,
        date: civilDateFromApi(transaction.Date),
        paymentMethod: toPaymentMethodLabel(transaction.paymentMethod),
        amount: toNumber(transaction.amount),
      };
    })
    .sort((left, right) => right.date.localeCompare(left.date));
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
    totalAmount: toNumber(card.valorTotalTodosMesesRestantes),
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
      forecastExpenses: 0,
      investedPosition: 0,
      balance: 0,
    },
    monthlyExpenses: [],
    creditCard: [],
    income: [],
    incomeTransactions: [],
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
      forecastExpenses: toNumber(summary.totalValues?.forecastExpenses ?? null),
      investedPosition: toNumber(summary.totalValues?.investedPosition ?? summary.totalValues?.totalInvestments ?? null),
      balance: toNumber(summary.totalValues?.balance ?? null),
    },
    monthlyExpenses: mapMonthlyExpenses(transactions, fixedCosts),
    creditCard: mapCreditCardItems(transactions, creditCard, statementMonthLabel),
    income: mapIncomeBreakdown(transactions),
    incomeTransactions: mapIncomeTransactions(transactions),
    expenses: mapExpenseBreakdown(transactions),
    investments: mapInvestmentBreakdown(transactions),
    cardSpending: mapCardSpending(creditCard),
    categories: mapCategories(summary),
  };
}
