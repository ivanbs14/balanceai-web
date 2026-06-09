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
  const selectedMonthId = activeMonthId ?? sortedMonths[0]?.id ?? "";

  return (
    <div className="flex flex-row flex-wrap items-start gap-x-4 gap-y-1 sm:flex-col sm:gap-3 lg:flex-row lg:items-start lg:gap-4">
      <div className="flex items-center gap-0.5 sm:gap-2 lg:flex-shrink-0">
        <label htmlFor="dashboard-year-select" className="text-[0.62rem] font-semibold uppercase tracking-[0.06em] text-primary sm:text-xs sm:tracking-[0.12em]">
          Ano: 
        </label>
        <select
          id="dashboard-year-select"
          value={activeYear}
          onChange={(event) => onYearChange(Number(event.target.value))}
          className="min-w-14 rounded-md border border-border bg-surface px-1 py-0.5 text-[0.72rem] font-semibold text-primary outline-none transition focus:border-primary sm:min-w-24 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-0.5 sm:gap-2 lg:flex-shrink-0">
        <label htmlFor="dashboard-month-select" className="text-[0.62rem] font-semibold uppercase tracking-[0.06em] text-primary sm:text-xs sm:tracking-[0.12em]">
          Mes:
        </label>
        <select
          id="dashboard-month-select"
          value={selectedMonthId}
          onChange={(event) => onMonthChange(event.target.value as MonthId)}
          className="min-w-20 rounded-md border border-border bg-surface px-1 py-0.5 text-[0.72rem] font-semibold text-primary outline-none transition focus:border-primary sm:min-w-32 sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm"
        >
          {sortedMonths.map((month) => (
            <option key={month.id} value={month.id} disabled={month.disabled}>
              {month.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
