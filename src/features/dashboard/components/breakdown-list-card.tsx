import { Plus } from "lucide-react";

type BreakdownListCardProps = {
  title: string;
  rows: Array<{ id: string; label: string; amount: string }>;
  totalLabel: string;
  totalValue: string;
  tone: "income" | "expense" | "investment";
  onAddClick?: () => void;
  addButtonLabel?: string;
  addButtonVariant?: "default" | "ghost";
};

const toneStyles = {
  income: {
    title: "text-primary",
    accent: "text-primary",
    chip: "bg-primary-soft text-primary",
  },
  expense: {
    title: "text-[#8a486f]",
    accent: "text-[#8a486f]",
    chip: "bg-[#ffe4ef] text-[#8a486f]",
  },
  investment: {
    title: "text-[#625b60]",
    accent: "text-[#625b60]",
    chip: "bg-[#efe7ec] text-[#625b60]",
  },
} as const;

export function BreakdownListCard({
  title,
  rows,
  totalLabel,
  totalValue,
  tone,
  onAddClick,
  addButtonLabel,
  addButtonVariant = "default",
}: BreakdownListCardProps) {
  const styles = toneStyles[tone];

  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h2
          className={[
            "text-[1.15rem] font-semibold tracking-tight sm:text-[1.25rem]",
            styles.title,
          ].join(" ")}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {onAddClick ? (
            <button
              type="button"
              onClick={onAddClick}
              aria-label={addButtonLabel ?? `Adicionar item em ${title}`}
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-full text-primary transition",
                addButtonVariant === "ghost"
                  ? "border border-transparent bg-transparent hover:bg-green-100 hover:text-green-700"
                  : "border border-border bg-surface-soft hover:border-border-strong hover:bg-primary hover:text-white",
              ].join(" ")}
            >
              <Plus size={18} strokeWidth={2.4} />
            </button>
          ) : null}
          <span
            className={[
              "rounded-full px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em]",
              styles.chip,
            ].join(" ")}
          >
            {rows.length} itens
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-0">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 border-b border-border py-3 text-[0.9rem] sm:text-[0.92rem]"
          >
            <span>{row.label}</span>
            <span className={["font-medium", styles.accent].join(" ")}>
              {row.amount}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-[0.88rem] font-semibold sm:text-[0.95rem]">
        <span className={["uppercase", styles.accent].join(" ")}>
          {totalLabel}
        </span>
        <span className={styles.accent}>{totalValue}</span>
      </div>
    </article>
  );
}
