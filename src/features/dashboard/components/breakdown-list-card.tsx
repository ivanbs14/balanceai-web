type BreakdownListCardProps = {
  title: string;
  rows: Array<{ id: string; label: string; amount: string }>;
  totalLabel: string;
  totalValue: string;
};

export function BreakdownListCard({
  title,
  rows,
  totalLabel,
  totalValue,
}: BreakdownListCardProps) {
  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[2rem] font-semibold tracking-tight text-primary">
          {title}
        </h2>
        <span className="text-5xl leading-none text-muted">+</span>
      </div>

      <div className="mt-4 space-y-0">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 border-b border-border py-3 text-lg"
          >
            <span>{row.label}</span>
            <span className="font-medium">{row.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-xl font-semibold">
        <span className="uppercase text-primary">{totalLabel}</span>
        <span className="text-primary">{totalValue}</span>
      </div>
    </article>
  );
}
