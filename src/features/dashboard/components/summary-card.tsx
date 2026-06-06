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
    <article className="border border-border bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
        {label}
      </p>
      <p
        className={[
          "mt-3 text-4xl font-semibold tracking-tight",
          tone === "negative" ? "text-[#c11b16]" : "text-primary",
        ].join(" ")}
      >
        {value}
      </p>
    </article>
  );
}
