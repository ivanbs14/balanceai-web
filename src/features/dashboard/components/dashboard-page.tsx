"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getDashboardApiPayload,
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

function toBreakdownRows(items: BreakdownItem[]) {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    amount: formatCurrency(item.amount),
  }));
}

function formatMonthLabel(monthId: MonthId) {
  const [year, month] = monthId.split("-");
  const parsedYear = Number.parseInt(year, 10);
  const parsedMonth = Number.parseInt(month, 10) - 1;

  if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMonth)) {
    return monthId;
  }

  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(parsedYear, parsedMonth, 1));

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function buildRecentMonthOptions(monthCount: number) {
  const base = new Date();

  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(base.getFullYear(), base.getMonth() - index, 1);
    const monthId = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;

    return {
      id: monthId,
      label: formatMonthLabel(monthId),
    };
  });
}

type DashboardPageProps = {
  userId: string;
};

export function DashboardPage({ userId }: DashboardPageProps) {
  const monthOptions = useMemo(() => buildRecentMonthOptions(8), []);
  const [activeMonthId, setActiveMonthId] = useState<MonthId>(
    monthOptions[0]?.id ?? getCurrentMonthId(),
  );
  const [dashboardData, setDashboardData] = useState<DashboardViewModel>(() =>
    createEmptyDashboardViewModel(monthOptions[0]?.id ?? getCurrentMonthId()),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
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
    setActiveMonthId(monthId);
  }

  const monthlyExpenses = dashboardData.monthlyExpenses;
  const hasDashboardData =
    monthlyExpenses.length > 0 ||
    dashboardData.creditCard.length > 0 ||
    dashboardData.income.length > 0 ||
    dashboardData.expenses.length > 0 ||
    dashboardData.investments.length > 0 ||
    dashboardData.categories.length > 0 ||
    dashboardData.summary.totalExpenses !== 0 ||
    dashboardData.summary.balance !== 0;

  const monthlyExpensesColumns = [
    { key: "name", header: "Nome", render: (row: MonthlyExpenseItem) => row.name },
    {
      key: "type",
      header: "Tipo",
      render: (row: MonthlyExpenseItem) => row.paymentType,
    },
    {
      key: "amount",
      header: "Valor",
      align: "right" as const,
      render: (row: MonthlyExpenseItem) => formatCurrency(row.amount),
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
    setIsLoading(true);
    setErrorMessage(null);
    setReloadToken((current) => current + 1);
  }

  return (
    <DashboardShell
      monthSelector={
        <MonthSelector
          months={monthOptions}
          activeMonthId={activeMonthId}
          onChange={handleMonthChange}
        />
      }
      summaryCards={<MonthlySummary summary={dashboardData.summary} />}
      primaryTable={null}
      secondaryTables={
        <>
          {isLoading ? (
            <div className="mb-4 border border-border bg-surface p-4 text-sm text-muted">
              Carregando dados de {formatMonthLabel(activeMonthId)}...
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
          {!isLoading && !errorMessage && !hasDashboardData ? (
            <div className="mb-4 border border-border bg-surface p-4 text-sm text-muted">
              Nenhum dado encontrado para {formatMonthLabel(activeMonthId)}.
            </div>
          ) : null}
          <div className="flex flex-col gap-6">
            <AccordionCard
              title="Gastos do Mês"
              total={formatCurrency(sumAmounts(monthlyExpenses))}
              showPlusBeforeTotal
              defaultOpen
            >
              <LedgerTableCard<MonthlyExpenseItem>
                title="Gastos do Mês"
                total={formatCurrency(sumAmounts(monthlyExpenses))}
                rows={monthlyExpenses}
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
