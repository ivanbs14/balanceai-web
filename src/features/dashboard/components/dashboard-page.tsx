"use client";

import { useState } from "react";
import { dashboardMonths, defaultDashboardMonthId } from "../mock-data";
import type {
  BreakdownItem,
  CreditCardItem,
  DashboardMonthData,
  FixedCostStatus,
  MonthId,
} from "../types";
import { BreakdownListCard } from "./breakdown-list-card";
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

function getActiveMonth(monthId: string): DashboardMonthData {
  const fallbackMonth: DashboardMonthData = {
    id: "",
    label: "",
    summary: { totalExpenses: 0, balance: 0 },
    fixedCosts: [],
    creditCard: [],
    income: [],
    expenses: [],
    investments: [],
    categories: [],
  };

  return (
    dashboardMonths.find((month) => month.id === monthId) ??
    dashboardMonths[0] ??
    fallbackMonth
  );
}

function toBreakdownRows(items: BreakdownItem[]) {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    amount: formatCurrency(item.amount),
  }));
}

function toggleFixedCostStatus(status: FixedCostStatus): FixedCostStatus {
  return status === "paid" ? "pending" : "paid";
}

export function DashboardPage() {
  const [activeMonthId, setActiveMonthId] = useState(defaultDashboardMonthId);
  const [fixedCostStatusOverrides, setFixedCostStatusOverrides] = useState<
    Partial<Record<MonthId, Record<string, FixedCostStatus>>>
  >({});
  const [monthlyExpenseStatusOverrides, setMonthlyExpenseStatusOverrides] = useState<
    Partial<Record<MonthId, Record<string, FixedCostStatus>>>
  >({});
  const activeMonth = getActiveMonth(activeMonthId);

  const monthOptions = dashboardMonths.map((month) => ({
    id: month.id,
    label: month.label,
  }));

  const fixedCosts = activeMonth.fixedCosts.map((item) => {
    const monthOverrides = fixedCostStatusOverrides[activeMonth.id] ?? {};

    return {
      ...item,
      status: monthOverrides[item.id] ?? item.status,
    };
  });

  const monthlyExpenses = activeMonth.fixedCosts.map((item) => {
    const monthOverrides = monthlyExpenseStatusOverrides[activeMonth.id] ?? {};

    return {
      ...item,
      status: monthOverrides[item.id] ?? item.status,
    };
  });

  const fixedCostsColumns = [
    { key: "name", header: "Nome", render: (row: (typeof fixedCosts)[number]) => row.name },
    {
      key: "type",
      header: "Tipo",
      render: (row: (typeof fixedCosts)[number]) => row.paymentType,
    },
    {
      key: "category",
      header: "Categoria",
      render: (row: (typeof fixedCosts)[number]) => row.category,
    },
    {
      key: "paid",
      header: "Pago?",
      align: "center" as const,
      render: (row: (typeof fixedCosts)[number]) => {
        const isPaid = row.status === "paid";

        return (
          <button
            type="button"
            onClick={() => handleToggleFixedCost(row.id)}
            className="inline-flex items-center justify-center text-base transition-colors hover:text-primary"
            aria-pressed={isPaid}
            aria-label={isPaid ? "Marcar como pendente" : "Marcar como pago"}
          >
            <span className={isPaid ? "text-primary" : "text-muted"}>
              {isPaid ? "■" : "□"}
            </span>
          </button>
        );
      },
    },
    {
      key: "amount",
      header: "Valor",
      align: "right" as const,
      render: (row: (typeof fixedCosts)[number]) => formatCurrency(row.amount),
    },
  ];

  const monthlyExpensesColumns = [
    { key: "name", header: "Nome", render: (row: (typeof monthlyExpenses)[number]) => row.name },
    {
      key: "type",
      header: "Tipo",
      render: (row: (typeof monthlyExpenses)[number]) => row.paymentType,
    },
    {
      key: "amount",
      header: "Valor",
      align: "right" as const,
      render: (row: (typeof monthlyExpenses)[number]) => formatCurrency(row.amount),
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

  function handleToggleFixedCost(itemId: string) {
    setFixedCostStatusOverrides((current) => {
      const monthOverrides = current[activeMonth.id] ?? {};
      const baseItem = activeMonth.fixedCosts.find((item) => item.id === itemId);

      if (!baseItem) {
        return current;
      }

      return {
        ...current,
        [activeMonth.id]: {
          ...monthOverrides,
          [itemId]: toggleFixedCostStatus(monthOverrides[itemId] ?? baseItem.status),
        },
      };
    });
  }

  return (
    <DashboardShell
      monthSelector={
        <MonthSelector
          months={monthOptions}
          activeMonthId={activeMonth.id}
          onChange={setActiveMonthId}
        />
      }
      summaryCards={<MonthlySummary summary={activeMonth.summary} />}
      primaryTable={
        <LedgerTableCard<(typeof fixedCosts)[number]>
          title="Custos Fixos"
          total={formatCurrency(sumAmounts(fixedCosts))}
          rows={fixedCosts}
          columns={fixedCostsColumns}
          addLabel="Adicionar Item"
        />
      }
      secondaryTables={
        <div className="grid gap-6 xl:grid-cols-2">
          <LedgerTableCard<(typeof fixedCosts)[number]>
            title="Gastos do Mês"
            total={formatCurrency(sumAmounts(monthlyExpenses))}
            rows={monthlyExpenses}
            columns={monthlyExpensesColumns}
            addLabel="Adicionar Item"
          />
          <LedgerTableCard<CreditCardItem>
            title="Cartão de Crédito"
            total={formatCurrency(sumAmounts(activeMonth.creditCard))}
            rows={activeMonth.creditCard}
            columns={creditCardColumns}
          />
        </div>
      }
      sidebar={
        <>
          <BreakdownListCard
            title="Entradas"
            rows={toBreakdownRows(activeMonth.income)}
            totalLabel="Total"
            totalValue={formatCurrency(sumAmounts(activeMonth.income))}
            tone="income"
          />
          <BreakdownListCard
            title="Saidas"
            rows={toBreakdownRows(activeMonth.expenses)}
            totalLabel="Total"
            totalValue={formatCurrency(sumAmounts(activeMonth.expenses))}
            tone="expense"
          />
          <BreakdownListCard
            title="Investimentos"
            rows={toBreakdownRows(activeMonth.investments)}
            totalLabel="Total Aplicado"
            totalValue={formatCurrency(sumAmounts(activeMonth.investments))}
            tone="investment"
          />
          <CategoryCard items={activeMonth.categories} />
        </>
      }
    />
  );
}
