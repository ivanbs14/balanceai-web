type MetricsDisplayProps = {
  totalIncome: number;
  totalExpense: number;
  totalInvestment: number;
  expensePercentage: number;
  investmentPercentage: number;
  topCategory: string | null;
  topCategoryValue: number | null;
};

const categoryMap: Record<string, string> = {
  HOUSING: "Moradia",
  TRANSPORTION: "Transporte",
  FOOD: "Alimentação",
  ENTERTAINMENT: "Entretenimento",
  HEALTH: "Saúde",
  UTILITY: "Utilidades",
  SALARY: "Salário",
  EDUCATION: "Educação",
  OTHER: "Outros",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function MetricsDisplay({
  totalIncome,
  totalExpense,
  totalInvestment,
  expensePercentage,
  investmentPercentage,
  topCategory,
  topCategoryValue,
}: MetricsDisplayProps) {
  const topCategoryName = topCategory ? categoryMap[topCategory] || topCategory : "N/A";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article className="border border-border bg-surface p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
          Total de Entradas
        </p>
        <p className="text-2xl font-semibold text-primary">
          {formatCurrency(totalIncome)}
        </p>
      </article>

      <article className="border border-border bg-surface p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
          Despesas ({expensePercentage.toFixed(1)}%)
        </p>
        <p className="text-2xl font-semibold text-danger-foreground">
          {formatCurrency(totalExpense)}
        </p>
      </article>

      <article className="border border-border bg-surface p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
          Investimentos ({investmentPercentage.toFixed(1)}%)
        </p>
        <p className="text-2xl font-semibold text-primary">
          {formatCurrency(totalInvestment)}
        </p>
      </article>

      <article className="border border-border bg-surface p-4 sm:col-span-2 lg:col-span-3">
        <p className="font-mono text-xs uppercase tracking-wider text-muted mb-2">
          Categoria de Maior Gasto
        </p>
        <div className="flex items-baseline gap-3">
          <p className="text-xl font-semibold text-primary">{topCategoryName}</p>
          <p className="text-lg text-muted">
            {topCategoryValue !== null ? formatCurrency(topCategoryValue) : "N/A"}
          </p>
        </div>
      </article>
    </div>
  );
}
