type BreakdownListCardProps = {
  title: string;
  rows: Array<{ id: string; label: string; amount: string }>;
  totalLabel: string;
  totalValue: string;
  tone: "income" | "expense" | "investment";
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
}: BreakdownListCardProps) {
  const styles = toneStyles[tone];

  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h2
          className={[
            "text-[1.35rem] font-semibold tracking-tight sm:text-[1.45rem]",
            styles.title,
          ].join(" ")}
        >
          {title}
        </h2>
        <span
          className={[
            "rounded-full px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em]",
            styles.chip,
          ].join(" ")}
        >
          {rows.length} itens
        </span>
      </div>

      <div className="mt-4 space-y-0">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm sm:text-[0.95rem]"
          >
            <span>{row.label}</span>
            <span className={["font-medium", styles.accent].join(" ")}>
              {row.amount}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-base font-semibold sm:text-lg">
        <span className={["uppercase", styles.accent].join(" ")}>
          {totalLabel}
        </span>
        <span className={styles.accent}>{totalValue}</span>
      </div>
    </article>
  );
}
