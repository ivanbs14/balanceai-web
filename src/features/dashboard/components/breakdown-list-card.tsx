import type { ReactNode } from "react";
import { Plus } from "lucide-react";

type BreakdownListCardProps = {
  title: string;
  rows: Array<{ id: string; label: string; amount: string }>;
  totalLabel: string;
  mobileTotalLabel?: string;
  totalValue: string;
  tone: "income" | "expense" | "investment";
  onAddClick?: () => void;
  addButtonLabel?: string;
  addButtonVariant?: "default" | "ghost";
  onHeaderActionClick?: () => void;
  headerActionLabel?: string;
  headerActionIcon?: ReactNode;
  hideItemsSuffixOnMobile?: boolean;
};

const toneStyles = {
  income: {
    title: "text-primary",
    accent: "text-primary",
    chip: "bg-primary-soft text-primary",
    icon: "text-primary",
  },
  expense: {
    title: "text-danger-foreground",
    accent: "text-danger-foreground",
    chip: "bg-danger-soft text-danger-foreground",
    icon: "text-danger-foreground",
  },
  investment: {
    title: "text-chart-2",
    accent: "text-chart-2",
    chip: "bg-chart-2/15 text-chart-2",
    icon: "text-chart-2",
  },
} as const;

function truncateForMobile(value: string, maxLength = 12) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

export function BreakdownListCard({
  title,
  rows,
  totalLabel,
  mobileTotalLabel,
  totalValue,
  tone,
  onAddClick,
  addButtonLabel,
  addButtonVariant = "default",
  onHeaderActionClick,
  headerActionLabel,
  headerActionIcon,
  hideItemsSuffixOnMobile = false,
}: BreakdownListCardProps) {
  const styles = toneStyles[tone];

  return (
    <article className="border border-border bg-surface p-3.5 sm:p-5">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <h2
          className={[
            "text-[0.98rem] font-semibold tracking-tight sm:text-[1.25rem]",
            styles.title,
          ].join(" ")}
        >
          {title}
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onHeaderActionClick ? (
            <button
              type="button"
              onClick={onHeaderActionClick}
              aria-label={headerActionLabel ?? `Ver detalhes de ${title}`}
              title={headerActionLabel ?? `Ver detalhes de ${title}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-transparent text-primary transition hover:bg-primary-soft hover:text-primary-strong sm:h-9 sm:w-9"
            >
              {headerActionIcon}
            </button>
          ) : null}
          {onAddClick ? (
            <button
              type="button"
              onClick={onAddClick}
              aria-label={addButtonLabel ?? `Adicionar item em ${title}`}
              className={[
                "inline-flex h-7 w-7 items-center justify-center rounded-full transition sm:h-9 sm:w-9",
                styles.icon,
                addButtonVariant === "ghost"
                  ? "border border-transparent bg-transparent hover:bg-primary-soft hover:text-primary-strong"
                  : "border border-border bg-surface-soft hover:border-border-strong hover:bg-primary hover:text-white",
              ].join(" ")}
            >
              <Plus size={15} strokeWidth={2.4} />
            </button>
          ) : null}
          <span
            className={[
              "rounded-full px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] sm:px-3 sm:py-1 sm:text-[0.6rem] sm:tracking-[0.16em]",
              styles.chip,
            ].join(" ")}
          >
            <span className="sm:hidden">
              {hideItemsSuffixOnMobile ? rows.length : `${rows.length} itens`}
            </span>
            <span className="hidden sm:inline">{rows.length} itens</span>
          </span>
        </div>
      </div>

      <div className="mt-2.5 space-y-0 sm:mt-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 border-b border-border py-2 text-[0.8rem] sm:gap-4 sm:py-3 sm:text-[0.92rem]"
          >
            <span>
              <span className="sm:hidden" title={row.label}>
                {truncateForMobile(row.label)}
              </span>
              <span className="hidden sm:inline">{row.label}</span>
            </span>
            <span className={["font-medium", styles.accent].join(" ")}>
              {row.amount}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-3 text-[0.8rem] font-semibold sm:mt-5 sm:gap-4 sm:text-[0.95rem]">
        <span className={["uppercase", styles.accent].join(" ")}>
          <span className="sm:hidden">{mobileTotalLabel ?? totalLabel}</span>
          <span className="hidden sm:inline">{totalLabel}</span>
        </span>
        <span className={styles.accent}>{totalValue}</span>
      </div>
    </article>
  );
}
