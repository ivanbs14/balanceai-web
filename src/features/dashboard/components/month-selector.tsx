import type { MonthId } from "../types";

type MonthSelectorProps = {
  months: Array<{ id: MonthId; label: string }>;
  activeMonthId: MonthId;
  onChange: (monthId: MonthId) => void;
};

export function MonthSelector({
  months,
  activeMonthId,
  onChange,
}: MonthSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {months.map((month) => {
        const isActive = month.id === activeMonthId;

        return (
          <button
            key={month.id}
            type="button"
            onClick={() => onChange(month.id)}
            className={[
              "min-w-24 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors sm:text-base",
              isActive
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-primary hover:border-primary/70",
            ].join(" ")}
          >
            {month.label}
          </button>
        );
      })}
    </div>
  );
}
