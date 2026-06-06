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
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted sm:text-[0.7rem]">
        {label}
      </p>
      <p
        className={[
          "mt-3 text-[1.6rem] font-semibold tracking-tight sm:text-[1.8rem]",
          tone === "negative" ? "text-[#c11b16]" : "text-primary",
        ].join(" ")}
      >
        {value}
      </p>
    </article>
  );
}
