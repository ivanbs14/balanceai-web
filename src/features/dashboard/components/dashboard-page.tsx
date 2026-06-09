"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Bolt,
  CreditCard,
  FunnelPlus,
  Landmark,
  LocateFixed,
  QrCode,
  Ticket,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  deleteTransation,
  getDashboardApiPayload,
  updateTransationPaymentStatus,
} from "../api";
import {
  createEmptyDashboardViewModel,
  mapDashboardViewModel,
} from "../mappers";
import type {
  BreakdownItem,
  CreditCardItem,
  DashboardViewModel,
  MonthlyExpenseItem,
  MonthId,
} from "../types";
import { BreakdownListCard } from "./breakdown-list-card";
import { AccordionCard } from "./accordion-card";
import { AddCardModal } from "./add-card-modal";
import { AddIncomeModal } from "./add-income-modal";
import { AddInvestmentModal } from "./add-investment-modal";
import { AddMonthlyExpenseModal } from "./add-monthly-expense-modal";
import { CategoryCard } from "./category-card";
import { DeleteTransactionModal } from "./delete-transaction-modal";
import { DashboardShell } from "./dashboard-shell";
import { LedgerTableCard } from "./ledger-table-card";
import { MonthlySummary } from "./monthly-summary";
import { MonthSelector } from "./month-selector";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatCurrencyWithoutSymbol(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function sumAmounts<T extends { amount: number }>(items: T[]) {
  return items.reduce((total, item) => total + item.amount, 0);
}

function getCurrentMonthId() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");

  return `${now.getFullYear()}-${month}`;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function buildMonthId(year: number, monthNumber: number) {
  return `${year}-${`${monthNumber}`.padStart(2, "0")}`;
}

function getYearFromMonthId(monthId: MonthId) {
  return Number.parseInt(monthId.slice(0, 4), 10);
}

function toBreakdownRows(items: BreakdownItem[]) {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    amount: formatCurrency(item.amount),
  }));
}

function formatMonthLabel(monthId: MonthId, includeYear = true) {
  const [year, month] = monthId.split("-");
  const parsedYear = Number.parseInt(year, 10);
  const parsedMonth = Number.parseInt(month, 10) - 1;

  if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMonth)) {
    return monthId;
  }

  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(new Date(parsedYear, parsedMonth, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildYearRange(centerYear: number, yearsBefore = 2, yearsAfter = 3) {
  return Array.from(
    { length: yearsBefore + yearsAfter + 1 },
    (_, index) => centerYear - yearsBefore + index,
  );
}

function getMonthNumberFromMonthId(monthId: MonthId) {
  return Number.parseInt(monthId.slice(5, 7), 10);
}

function resolveMonthIdForYear(params: {
  year: number;
  preferredMonthId: MonthId | null;
  fallbackMonthId: MonthId;
}) {
  const { year, preferredMonthId, fallbackMonthId } = params;
  const preferredMonthNumber = preferredMonthId
    ? getMonthNumberFromMonthId(preferredMonthId)
    : getMonthNumberFromMonthId(fallbackMonthId);

  return buildMonthId(year, preferredMonthNumber);
}

function buildMonthOptionsForYear(year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const monthId = buildMonthId(year, index + 1);

    return {
      id: monthId,
      label: formatMonthLabel(monthId, false),
      disabled: false,
    };
  });
}

type DashboardPageProps = {
  userId: string;
};

type FixedFilter = "all" | "fixed" | "not-fixed";

type PendingDeleteTransaction = {
  id: string;
  label: string;
  isInstallmentPurchase: boolean;
};

export function DashboardPage({ userId }: DashboardPageProps) {
  const currentMonthId = useMemo(() => getCurrentMonthId(), []);
  const currentYear = useMemo(() => getCurrentYear(), []);
  const initialMonthId = useMemo(() => currentMonthId, [currentMonthId]);
  const yearOptions = useMemo(() => buildYearRange(currentYear), [currentYear]);
  const [activeYear, setActiveYear] = useState<number>(
    initialMonthId ? getYearFromMonthId(initialMonthId) : currentYear,
  );
  const [activeMonthId, setActiveMonthId] = useState<MonthId | null>(initialMonthId);
  const monthOptions = useMemo(() => buildMonthOptionsForYear(activeYear), [activeYear]);
  const [dashboardData, setDashboardData] = useState<DashboardViewModel>(() =>
    createEmptyDashboardViewModel(initialMonthId ?? buildMonthId(currentYear, 1)),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [fixedFilter, setFixedFilter] = useState<FixedFilter>("all");
  const [updatingTransactionIds, setUpdatingTransactionIds] = useState<string[]>([]);
  const [deletingTransactionIds, setDeletingTransactionIds] = useState<string[]>([]);
  const [pendingDeleteTransaction, setPendingDeleteTransaction] =
    useState<PendingDeleteTransaction | null>(null);
  const [cardSuccessMessage, setCardSuccessMessage] = useState<string | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [isAddInvestmentModalOpen, setIsAddInvestmentModalOpen] = useState(false);
  const [isAddMonthlyExpenseModalOpen, setIsAddMonthlyExpenseModalOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (!activeMonthId) {
      return;
    }

    let isMounted = true;

    getDashboardApiPayload(userId, activeMonthId)
      .then((payload) => {
        if (!isMounted) {
          return;
        }

        setDashboardData(
          mapDashboardViewModel({
            monthId: activeMonthId,
            summary: payload.summary,
            fixedCosts: payload.fixedCosts,
            transactions: payload.transactions,
            creditCard: payload.creditCard,
          }),
        );
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setDashboardData(createEmptyDashboardViewModel(activeMonthId));
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os dados do dashboard.",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeMonthId, reloadToken, userId]);

  function handleMonthChange(monthId: MonthId) {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveYear(getYearFromMonthId(monthId));
    setActiveMonthId(monthId);
    setFixedFilter("all");
  }

  function handleYearChange(year: number) {
    const preferredMonthId = year === currentYear ? currentMonthId : activeMonthId;
    const nextMonthId = resolveMonthIdForYear({
      year,
      preferredMonthId,
      fallbackMonthId: currentMonthId,
    });

    setActiveYear(year);
    setActiveMonthId(nextMonthId);
    setErrorMessage(null);
    setFixedFilter("all");
    setIsLoading(true);
  }

  const monthlyExpenses = dashboardData.monthlyExpenses;
  const monthlyExpensesCountLabel =
    monthlyExpenses.length === 1 ? "1 ITEM" : `${monthlyExpenses.length} ITENS`;
  const creditCardCountLabel =
    dashboardData.creditCard.length === 1
      ? "1 ITEM"
      : `${dashboardData.creditCard.length} ITENS`;
  const filteredMonthlyExpenses = monthlyExpenses.filter((item) => {
    if (fixedFilter === "fixed") {
      return item.isFixed;
    }

    if (fixedFilter === "not-fixed") {
      return !item.isFixed;
    }

    return true;
  });
  const hasDashboardData =
    monthlyExpenses.length > 0 ||
    dashboardData.creditCard.length > 0 ||
    dashboardData.income.length > 0 ||
    dashboardData.expenses.length > 0 ||
    dashboardData.investments.length > 0 ||
    dashboardData.categories.length > 0 ||
    dashboardData.summary.totalExpenses !== 0 ||
    dashboardData.summary.balance !== 0;

  function handleFixedFilterToggle() {
    setFixedFilter((current) => {
      if (current === "all") {
        return "fixed";
      }

      if (current === "fixed") {
        return "not-fixed";
      }

      return "all";
    });
  }

  const fixedHeaderIcon =
    fixedFilter === "fixed" ? (
      <LocateFixed size={14} strokeWidth={2.2} aria-hidden />
    ) : fixedFilter === "not-fixed" ? (
      <Bolt size={14} strokeWidth={2.2} aria-hidden />
    ) : (
      <FunnelPlus size={14} strokeWidth={2.2} aria-hidden />
    );

  function renderMobilePaymentTypeIcon(paymentType: string) {
    const iconProps = { size: 15, strokeWidth: 2.1, "aria-hidden": true as const };

    switch (paymentType) {
      case "Cartao de Credito":
      case "Credito":
        return <CreditCard {...iconProps} />;
      case "Debito":
        return <Wallet {...iconProps} />;
      case "Pix":
        return <QrCode {...iconProps} />;
      case "Boleto":
        return <Ticket {...iconProps} />;
      case "Dinheiro":
        return <BadgeDollarSign {...iconProps} />;
      case "Transferencia":
        return <Landmark {...iconProps} />;
      default:
        return <Wallet {...iconProps} />;
    }
  }

  const monthlyExpensesColumns = [
    {
      key: "name",
      header: "Nome",
      width: isMobileViewport ? "minmax(96px, 1.65fr)" : undefined,
      render: (row: MonthlyExpenseItem) => row.name,
    },
    {
      key: "category",
      header: "Categoria",
      width: isMobileViewport ? "minmax(72px, 0.85fr)" : undefined,
      render: (row: MonthlyExpenseItem) => row.category,
    },
    {
      key: "type",
      header: "Tipo",
      width: isMobileViewport ? "40px" : undefined,
      render: (row: MonthlyExpenseItem) =>
        isMobileViewport ? (
          <span
            className="inline-flex items-center justify-center"
            aria-label={row.paymentType}
            title={row.paymentType}
          >
            {renderMobilePaymentTypeIcon(row.paymentType)}
          </span>
        ) : row.paymentType,
    },
    {
      key: "fixed",
      header: (
        <button
          type="button"
          onClick={handleFixedFilterToggle}
          className="inline-flex items-center justify-center gap-1.5"
          aria-label="Alternar filtro da coluna Fixos"
          title="Clique para alternar: Fixos, Nao fixos e Todos"
        >
          <span className="hidden sm:inline">Fixos</span>
          {fixedHeaderIcon}
        </button>
      ),
      align: "center" as const,
      width: isMobileViewport ? "40px" : "92px",
      render: (row: MonthlyExpenseItem) =>
        isMobileViewport ? (
          <span
            className="inline-flex items-center justify-center"
            aria-label={row.isFixed ? "Fixo" : "Nao fixo"}
            title={row.isFixed ? "Fixo" : "Nao fixo"}
          >
            {row.isFixed ? (
              <LocateFixed size={15} strokeWidth={2.1} aria-hidden />
            ) : (
              <Bolt size={15} strokeWidth={2.1} aria-hidden />
            )}
          </span>
        ) : (
          (row.isFixed ? "Sim" : "Nao")
        ),
    },
    {
      key: "amount",
      header: "Valor",
      align: "right" as const,
      width: isMobileViewport ? "minmax(78px, 0.9fr)" : undefined,
      render: (row: MonthlyExpenseItem) =>
        isMobileViewport
          ? formatCurrencyWithoutSymbol(row.amount)
          : formatCurrency(row.amount),
    },
    {
      key: "paid",
      header: "Pago",
      align: "center" as const,
      width: isMobileViewport ? "48px" : "76px",
      render: (row: MonthlyExpenseItem) => {
        const isUpdating = updatingTransactionIds.includes(row.id);

        return (
          <label className="inline-flex items-center justify-center">
            <input
              type="checkbox"
              checked={row.paymentStatus === "paid"}
              onChange={() => {
                void handleMonthlyExpensePaymentToggle(row);
              }}
              disabled={isUpdating}
              aria-label={`Marcar ${row.name} como pago`}
              className="h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
            />
          </label>
        );
      },
    },
    {
      key: "actions",
      header: "Acoes",
      align: "center" as const,
      width: isMobileViewport ? "40px" : "84px",
      render: (row: MonthlyExpenseItem) => {
        const isDeleting = deletingTransactionIds.includes(row.id);

        return (
          <button
            type="button"
            onClick={() => {
              void handleDeleteMonthlyExpense(row);
            }}
            disabled={isDeleting}
            aria-label={`Deletar ${row.name}`}
            title="Deletar transacao"
            className="inline-flex items-center justify-center text-primary transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} strokeWidth={2} aria-hidden />
          </button>
        );
      },
    },
  ];
  const visibleMonthlyExpensesColumns = isMobileViewport
    ? monthlyExpensesColumns.filter((column) => column.key !== "category")
    : monthlyExpensesColumns;

  const creditCardColumns = [
    {
      key: "name",
      header: "Nome",
      render: (row: CreditCardItem) => row.description,
    },
    {
      key: "type",
      header: "Tipo",
      render: (row: CreditCardItem) => row.cardName,
    },
    {
      key: "installment",
      header: "Parc.",
      align: "center" as const,
      render: (row: CreditCardItem) => {
        const isInstallmentPurchase = row.installmentTotal > 1;

        return (
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em]",
              isInstallmentPurchase
                ? "bg-primary-soft text-primary"
                : "bg-surface-soft text-muted",
            ].join(" ")}
          >
            {row.installmentCurrent}/{row.installmentTotal}
          </span>
        );
      },
    },
    {
      key: "amount",
      header: "Valor",
      align: "right" as const,
      render: (row: CreditCardItem) =>
        isMobileViewport
          ? formatCurrencyWithoutSymbol(row.amount)
          : formatCurrency(row.amount),
    },
    {
      key: "actions",
      header: "Acoes",
      align: "center" as const,
      width: isMobileViewport ? "56px" : "84px",
      render: (row: CreditCardItem) => {
        const isDeleting = deletingTransactionIds.includes(row.id);

        return (
          <button
            type="button"
            onClick={() => {
              void handleDeleteCreditCardExpense(row);
            }}
            disabled={isDeleting}
            aria-label={`Deletar ${row.description}`}
            title="Deletar transacao"
            className="inline-flex items-center justify-center text-primary transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} strokeWidth={2} aria-hidden />
          </button>
        );
      },
    },
  ];

  function handleRetryLoad() {
    if (!activeMonthId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setReloadToken((current) => current + 1);
  }

  async function handleMonthlyExpensePaymentToggle(row: MonthlyExpenseItem) {
    const nextStatus = row.paymentStatus === "paid" ? "PENDING" : "PAID";

    setUpdatingTransactionIds((current) => [...current, row.id]);

    try {
      await updateTransationPaymentStatus({
        transationId: row.id,
        paymentStatus: nextStatus,
      });

      setReloadToken((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar o status de pagamento.",
      );
    } finally {
      setUpdatingTransactionIds((current) => current.filter((id) => id !== row.id));
    }
  }

  async function deleteTransactionWithConfirmation(params: {
    transactionId: string;
    label: string;
    isInstallmentPurchase: boolean;
  }) {
    setPendingDeleteTransaction({
      id: params.transactionId,
      label: params.label,
      isInstallmentPurchase: params.isInstallmentPurchase,
    });
  }

  async function handleConfirmDeleteTransaction() {
    if (!pendingDeleteTransaction) {
      return;
    }

    setDeletingTransactionIds((current) => [...current, pendingDeleteTransaction.id]);
    setErrorMessage(null);

    try {
      await deleteTransation({ transationId: pendingDeleteTransaction.id });
      setPendingDeleteTransaction(null);
      setIsLoading(true);
      setReloadToken((current) => current + 1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel deletar a transacao.",
      );
    } finally {
      setDeletingTransactionIds((current) =>
        current.filter((id) => id !== pendingDeleteTransaction.id),
      );
    }
  }

  async function handleDeleteMonthlyExpense(row: MonthlyExpenseItem) {
    await deleteTransactionWithConfirmation({
      transactionId: row.id,
      label: row.name,
      isInstallmentPurchase: row.isCreditCardInstallmentPurchase,
    });
  }

  async function handleDeleteCreditCardExpense(row: CreditCardItem) {
    await deleteTransactionWithConfirmation({
      transactionId: row.id,
      label: row.description,
      isInstallmentPurchase: row.canDeletePendingInstallments,
    });
  }

  const activePeriodLabel = activeMonthId
    ? formatMonthLabel(activeMonthId)
    : `o ano de ${activeYear}`;

  const monthSelector = (
    <MonthSelector
      years={yearOptions}
      activeYear={activeYear}
      months={monthOptions}
      activeMonthId={activeMonthId}
      onYearChange={handleYearChange}
      onMonthChange={handleMonthChange}
    />
  );

  const summaryCards = <MonthlySummary summary={dashboardData.summary} />;

  const dashboardFeedback = (
    <>
      {isLoading ? (
        <div className="border border-border bg-surface p-4 text-sm text-muted">
          Carregando dados de {activePeriodLabel}...
        </div>
      ) : null}
      {errorMessage ? (
        <div className="flex flex-col gap-3 border border-border bg-surface p-4 text-sm text-[#8a486f] sm:flex-row sm:items-center sm:justify-between">
          <p>Nao foi possivel atualizar o dashboard: {errorMessage}</p>
          <button
            type="button"
            onClick={handleRetryLoad}
            className="inline-flex items-center justify-center border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-primary hover:text-white"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}
      {cardSuccessMessage ? (
        <div className="border border-[#efc2d4] bg-[#fff5f8] p-4 text-sm text-[#8a486f]">
          {cardSuccessMessage}
        </div>
      ) : null}
      {!isLoading && !errorMessage && !activeMonthId ? (
        <div className="border border-border bg-surface p-4 text-sm text-muted">
          Nenhum mes disponivel para o ano de {activeYear}.
        </div>
      ) : null}
      {!isLoading && !errorMessage && activeMonthId && !hasDashboardData ? (
        <div className="border border-border bg-surface p-4 text-sm text-muted">
          Nenhum dado encontrado para {activePeriodLabel}.
        </div>
      ) : null}
    </>
  );

  const monthlyExpensesSection = (
    <AccordionCard
      title="Gastos do Mês"
      titleBadge={monthlyExpensesCountLabel}
      total={formatCurrency(sumAmounts(filteredMonthlyExpenses))}
      showPlusBeforeTotal
      onPlusClick={() => setIsAddMonthlyExpenseModalOpen(true)}
      defaultOpen
      compact
      flushHorizontalPadding
      minimalHorizontalPaddingOnMobile
    >
      <LedgerTableCard<MonthlyExpenseItem>
        title="Gastos do Mês"
        total={formatCurrency(sumAmounts(filteredMonthlyExpenses))}
        rows={filteredMonthlyExpenses}
        columns={visibleMonthlyExpensesColumns}
        hideHeader
        embedded
        compact
        flushHorizontalPadding
        borderlessOnMobile
      />
    </AccordionCard>
  );

  const creditCardSection = (
    <AccordionCard
      title="Cartão de Crédito"
      titleBadge={creditCardCountLabel}
      titleActionLabel="Cadastrar cartao"
      onTitleActionClick={() => {
        setCardSuccessMessage(null);
        setIsAddCardModalOpen(true);
      }}
      total={formatCurrency(sumAmounts(dashboardData.creditCard))}
      compact
      flushHorizontalPadding
      minimalHorizontalPaddingOnMobile
    >
      <LedgerTableCard<CreditCardItem>
        title="Cartão de Crédito"
        total={formatCurrency(sumAmounts(dashboardData.creditCard))}
        rows={dashboardData.creditCard}
        columns={creditCardColumns}
        hideHeader
        embedded
        compact
        flushHorizontalPadding
        borderlessOnMobile
      />
    </AccordionCard>
  );

  const sidebar = (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-0">
        <BreakdownListCard
          title="Entradas"
          rows={toBreakdownRows(dashboardData.income)}
          totalLabel="Total"
          totalValue={formatCurrency(sumAmounts(dashboardData.income))}
          tone="income"
          onAddClick={() => setIsAddIncomeModalOpen(true)}
          addButtonLabel="Adicionar entrada"
          addButtonVariant="ghost"
        />
        <BreakdownListCard
          title="Saidas"
          rows={toBreakdownRows(dashboardData.expenses)}
          totalLabel="Total"
          totalValue={formatCurrency(sumAmounts(dashboardData.expenses))}
          tone="expense"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:gap-0">
        <BreakdownListCard
          title="Investimentos"
          rows={toBreakdownRows(dashboardData.investments)}
          totalLabel="Total Aplicado"
          mobileTotalLabel="Total"
          totalValue={formatCurrency(sumAmounts(dashboardData.investments))}
          tone="investment"
          onAddClick={() => setIsAddInvestmentModalOpen(true)}
          addButtonLabel="Adicionar investimento"
          addButtonVariant="ghost"
          hideItemsSuffixOnMobile
        />
        <CategoryCard items={dashboardData.categories} />
      </div>
    </>
  );

  return (
    <>
      <DeleteTransactionModal
        isOpen={pendingDeleteTransaction !== null}
        isSubmitting={
          pendingDeleteTransaction
            ? deletingTransactionIds.includes(pendingDeleteTransaction.id)
            : false
        }
        transactionLabel={pendingDeleteTransaction?.label ?? ""}
        isInstallmentPurchase={
          pendingDeleteTransaction?.isInstallmentPurchase ?? false
        }
        onClose={() => setPendingDeleteTransaction(null)}
        onConfirm={() => {
          void handleConfirmDeleteTransaction();
        }}
      />
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        userId={userId}
        onCreated={(cardName) => {
          setCardSuccessMessage(`Cartao ${cardName} cadastrado com sucesso.`);
        }}
      />
      <AddMonthlyExpenseModal
        isOpen={isAddMonthlyExpenseModalOpen}
        onClose={() => setIsAddMonthlyExpenseModalOpen(false)}
        userId={userId}
        fallbackMonthId={activeMonthId}
        onCreated={() => {
          setIsLoading(true);
          setErrorMessage(null);
          setReloadToken((current) => current + 1);
        }}
      />
      <AddIncomeModal
        isOpen={isAddIncomeModalOpen}
        onClose={() => setIsAddIncomeModalOpen(false)}
        userId={userId}
        fallbackMonthId={activeMonthId}
        onCreated={() => {
          setIsLoading(true);
          setErrorMessage(null);
          setReloadToken((current) => current + 1);
        }}
      />
      <AddInvestmentModal
        isOpen={isAddInvestmentModalOpen}
        onClose={() => setIsAddInvestmentModalOpen(false)}
        userId={userId}
        fallbackMonthId={activeMonthId}
        onCreated={() => {
          setIsLoading(true);
          setErrorMessage(null);
          setReloadToken((current) => current + 1);
        }}
      />
      <DashboardShell
        monthSelector={monthSelector}
        summaryCards={summaryCards}
        primaryTable={null}
        secondaryTables={
          <div className="flex flex-col gap-2 sm:gap-6">
            {dashboardFeedback}
            {monthlyExpensesSection}
            {creditCardSection}
          </div>
        }
        sidebar={sidebar}
      />
    </>
  );
}
