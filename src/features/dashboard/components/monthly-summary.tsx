import type { SummaryMetrics } from "../types";
import { SummaryCard } from "./summary-card";

type MonthlySummaryProps = {
  summary: SummaryMetrics;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function MonthlySummary({ summary }: MonthlySummaryProps) {
  return (
    <>
      <SummaryCard
        label="Total de Gastos"
        value={formatCurrency(summary.totalExpenses)}
      />
      <SummaryCard
        label="Saldo"
        value={formatCurrency(summary.balance)}
        tone={summary.balance < 0 ? "negative" : "default"}
      />
    </>
  );
}
