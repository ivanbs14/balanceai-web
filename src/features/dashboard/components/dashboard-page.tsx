"use client";

import { useEffect, useMemo, useState } from "react";
import { Bolt, FunnelPlus, LocateFixed } from "lucide-react";
import {
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
import { CategoryCard } from "./category-card";
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

  const monthlyExpensesColumns = [
    { key: "name", header: "Nome", render: (row: MonthlyExpenseItem) => row.name },
    {
      key: "category",
      header: "Categoria",
      render: (row: MonthlyExpenseItem) => row.category,
    },
    {
      key: "type",
      header: "Tipo",
      render: (row: MonthlyExpenseItem) => row.paymentType,
    },
    {
      key: "fixed",
      header: (
        <button
          type="button"
          onClick={handleFixedFilterToggle}
          className="inline-flex items-center gap-1.5"
          aria-label="Alternar filtro da coluna Fixos"
          title="Clique para alternar: Fixos, Nao fixos e Todos"
        >
          <span>Fixos</span>
          {fixedHeaderIcon}
        </button>
      ),
      align: "center" as const,
      render: (row: MonthlyExpenseItem) => (row.isFixed ? "Sim" : "Nao"),
    },
    {
      key: "amount",
      header: "Valor",
      align: "right" as const,
      render: (row: MonthlyExpenseItem) => formatCurrency(row.amount),
    },
    {
      key: "paid",
      header: "Pago",
      align: "center" as const,
      width: "76px",
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
  ];

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
      render: (row: CreditCardItem) => formatCurrency(row.amount),
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

  const activePeriodLabel = activeMonthId
    ? formatMonthLabel(activeMonthId)
    : `o ano de ${activeYear}`;

  return (
    <DashboardShell
      monthSelector={
        <MonthSelector
          years={yearOptions}
          activeYear={activeYear}
          months={monthOptions}
          activeMonthId={activeMonthId}
          onYearChange={handleYearChange}
          onMonthChange={handleMonthChange}
        />
      }
      summaryCards={<MonthlySummary summary={dashboardData.summary} />}
      primaryTable={null}
      secondaryTables={
        <>
          {isLoading ? (
            <div className="mb-4 border border-border bg-surface p-4 text-sm text-muted">
              Carregando dados de {activePeriodLabel}...
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mb-4 flex flex-col gap-3 border border-border bg-surface p-4 text-sm text-[#8a486f] sm:flex-row sm:items-center sm:justify-between">
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
          {!isLoading && !errorMessage && !activeMonthId ? (
            <div className="mb-4 border border-border bg-surface p-4 text-sm text-muted">
              Nenhum mes disponivel para o ano de {activeYear}.
            </div>
          ) : null}
          {!isLoading && !errorMessage && activeMonthId && !hasDashboardData ? (
            <div className="mb-4 border border-border bg-surface p-4 text-sm text-muted">
              Nenhum dado encontrado para {activePeriodLabel}.
            </div>
          ) : null}
          <div className="flex flex-col gap-6">
            <AccordionCard
              title="Gastos do Mês"
              total={formatCurrency(sumAmounts(filteredMonthlyExpenses))}
              showPlusBeforeTotal
              defaultOpen
            >
              <LedgerTableCard<MonthlyExpenseItem>
                title="Gastos do Mês"
                total={formatCurrency(sumAmounts(filteredMonthlyExpenses))}
                rows={filteredMonthlyExpenses}
                columns={monthlyExpensesColumns}
                hideHeader
                embedded
              />
            </AccordionCard>
            <AccordionCard
              title="Cartão de Crédito"
              total={formatCurrency(sumAmounts(dashboardData.creditCard))}
            >
              <LedgerTableCard<CreditCardItem>
                title="Cartão de Crédito"
                total={formatCurrency(sumAmounts(dashboardData.creditCard))}
                rows={dashboardData.creditCard}
                columns={creditCardColumns}
                hideHeader
                embedded
              />
            </AccordionCard>
          </div>
        </>
      }
      sidebar={
        <>
          <BreakdownListCard
            title="Entradas"
            rows={toBreakdownRows(dashboardData.income)}
            totalLabel="Total"
            totalValue={formatCurrency(sumAmounts(dashboardData.income))}
            tone="income"
          />
          <BreakdownListCard
            title="Saidas"
            rows={toBreakdownRows(dashboardData.expenses)}
            totalLabel="Total"
            totalValue={formatCurrency(sumAmounts(dashboardData.expenses))}
            tone="expense"
          />
          <BreakdownListCard
            title="Investimentos"
            rows={toBreakdownRows(dashboardData.investments)}
            totalLabel="Total Aplicado"
            totalValue={formatCurrency(sumAmounts(dashboardData.investments))}
            tone="investment"
          />
          <CategoryCard items={dashboardData.categories} />
        </>
      }
    />
  );
}
