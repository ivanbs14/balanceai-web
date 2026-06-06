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
        <h2 className="text-[1.35rem] font-semibold tracking-tight text-primary sm:text-[1.45rem]">
          {title}
        </h2>
        <span className="text-3xl leading-none text-muted sm:text-4xl">+</span>
      </div>

      <div className="mt-4 space-y-0">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm sm:text-[0.95rem]"
          >
            <span>{row.label}</span>
            <span className="font-medium">{row.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-base font-semibold sm:text-lg">
        <span className="uppercase text-primary">{totalLabel}</span>
        <span className="text-primary">{totalValue}</span>
      </div>
    </article>
  );
}
