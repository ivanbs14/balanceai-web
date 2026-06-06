"use client";

import { useState } from "react";
import { dashboardMonths, defaultDashboardMonthId } from "../mock-data";
import type {
  BreakdownItem,
  CreditCardItem,
  DashboardMonthData,
  FixedCostItem,
} from "../types";
import { BreakdownListCard } from "./breakdown-list-card";
import { CategoryCard } from "./category-card";
import { DashboardShell } from "./dashboard-shell";
import { LedgerTableCard } from "./ledger-table-card";
import { MonthSelector } from "./month-selector";
import { SummaryCard } from "./summary-card";

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

export function DashboardPage() {
  const [activeMonthId, setActiveMonthId] = useState(defaultDashboardMonthId);
  const activeMonth = getActiveMonth(activeMonthId);

  const monthOptions = dashboardMonths.map((month) => ({
    id: month.id,
    label: month.label,
  }));

  const fixedCostsColumns = [
    { key: "name", header: "Nome", render: (row: FixedCostItem) => row.name },
    {
      key: "type",
      header: "Tipo",
      render: (row: FixedCostItem) => row.paymentType,
    },
    {
      key: "paid",
      header: "Pago?",
      align: "center" as const,
      render: (row: FixedCostItem) => (
        <span className={row.paid ? "text-primary" : "text-muted"}>
          {row.paid ? "■" : "□"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Valor",
      align: "right" as const,
      render: (row: FixedCostItem) => formatCurrency(row.amount),
    },
  ];

  const creditCardColumns = [
    { key: "name", header: "Nome", render: (row: CreditCardItem) => row.name },
    {
      key: "type",
      header: "Tipo",
      render: (row: CreditCardItem) => row.paymentType,
    },
    {
      key: "installment",
      header: "Parc.",
      align: "center" as const,
      render: (row: CreditCardItem) => row.installmentLabel,
    },
    {
      key: "amount",
      header: "Valor",
      align: "right" as const,
      render: (row: CreditCardItem) => formatCurrency(row.amount),
    },
  ];

  return (
    <DashboardShell
      monthSelector={
        <MonthSelector
          months={monthOptions}
          activeMonthId={activeMonth.id}
          onChange={setActiveMonthId}
        />
      }
      summaryCards={
        <>
          <SummaryCard
            label="Total de Gastos"
            value={formatCurrency(activeMonth.summary.totalExpenses)}
          />
          <SummaryCard
            label="Saldo"
            value={formatCurrency(activeMonth.summary.balance)}
            tone={activeMonth.summary.balance < 0 ? "negative" : "default"}
          />
        </>
      }
      primaryTable={
        <LedgerTableCard<FixedCostItem>
          title="Custos Fixos"
          total={formatCurrency(sumAmounts(activeMonth.fixedCosts))}
          rows={activeMonth.fixedCosts}
          columns={fixedCostsColumns}
          addLabel="Adicionar Item"
        />
      }
      secondaryTables={
        <div className="grid gap-6 xl:grid-cols-2">
          <LedgerTableCard<FixedCostItem>
            title="Custos Fixos"
            total={formatCurrency(sumAmounts(activeMonth.fixedCosts))}
            rows={activeMonth.fixedCosts}
            columns={fixedCostsColumns}
            addLabel="Adicionar Item"
          />
          <LedgerTableCard<CreditCardItem>
            title="Cartao de Credito"
            total={formatCurrency(sumAmounts(activeMonth.creditCard))}
            rows={activeMonth.creditCard}
            columns={creditCardColumns}
            addLabel="Adicionar Item"
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
          />
          <BreakdownListCard
            title="Saidas"
            rows={toBreakdownRows(activeMonth.expenses)}
            totalLabel="Total"
            totalValue={formatCurrency(sumAmounts(activeMonth.expenses))}
          />
          <BreakdownListCard
            title="Investimentos"
            rows={toBreakdownRows(activeMonth.investments)}
            totalLabel="Total Aplicado"
            totalValue={formatCurrency(sumAmounts(activeMonth.investments))}
          />
          <CategoryCard items={activeMonth.categories} />
        </>
      }
    />
  );
}
