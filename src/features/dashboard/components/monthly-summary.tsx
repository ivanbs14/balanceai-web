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
        label="Despesas pagas"
        value={formatCurrency(summary.totalExpenses)}
      />
      <SummaryCard
        label="Despesas previstas"
        value={formatCurrency(summary.forecastExpenses)}
      />
      <SummaryCard
        label="Saldo disponível"
        value={formatCurrency(summary.balance)}
        tone={summary.balance < 0 ? "negative" : "default"}
      />
      <SummaryCard
        label="Posição investida"
        value={formatCurrency(summary.investedPosition)}
        tone={summary.investedPosition < 0 ? "negative" : "default"}
      />
    </>
  );
}
