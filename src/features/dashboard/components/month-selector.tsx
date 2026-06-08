import type { MonthId } from "../types";

type MonthSelectorProps = {
  years: number[];
  activeYear: number;
  months: Array<{ id: MonthId; label: string; disabled: boolean }>;
  activeMonthId: MonthId | null;
  onYearChange: (year: number) => void;
  onMonthChange: (monthId: MonthId) => void;
};

export function MonthSelector({
  years,
  activeYear,
  months,
  activeMonthId,
  onYearChange,
  onMonthChange,
}: MonthSelectorProps) {
  const sortedMonths = [...months].sort((left, right) =>
    left.id.localeCompare(right.id, "pt-BR", { numeric: true }),
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
      <div className="flex items-center gap-2 lg:flex-shrink-0">
        <label htmlFor="dashboard-year-select" className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Ano: 
        </label>
        <select
          id="dashboard-year-select"
          value={activeYear}
          onChange={(event) => onYearChange(Number(event.target.value))}
          className="min-w-24 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-primary"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {sortedMonths.map((month) => {
          const isActive = month.id === activeMonthId;
          const isDisabled = month.disabled;

          return (
            <button
              key={month.id}
              type="button"
              onClick={() => onMonthChange(month.id)}
              disabled={isDisabled}
              aria-pressed={isActive}
              className={[
                "min-w-20 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                isActive
                  ? "border-primary bg-primary text-white"
                  : isDisabled
                    ? "cursor-not-allowed border-border/70 bg-surface/60 text-muted"
                    : "border-border bg-surface text-primary hover:border-primary/70",
              ].join(" ")}
            >
              {month.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
