type SummaryCardProps = {
  label: string;
  value: string;
  tone?: "default" | "negative";
};

export function SummaryCard({
  label,
  value,
  tone = "default",
}: SummaryCardProps) {
  return (
    <article className="border border-border bg-surface px-3 py-2.5 sm:px-3.5 sm:py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[0.48rem] uppercase tracking-[0.12em] text-muted sm:text-[0.56rem]">
          {label}
        </p>
        <p
          className={[
            "text-[0.96rem] font-semibold tracking-tight sm:text-[1.15rem]",
            tone === "negative" ? "text-danger-foreground" : "text-primary",
          ].join(" ")}
        >
          {value}
        </p>
      </div>
    </article>
  );
}
