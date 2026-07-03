type AIFeedbackCardProps = {
  analysis: string;
  model: string;
  createdAt: string;
};

export function AIFeedbackCard({ analysis, model, createdAt }: AIFeedbackCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">Análise Financeira</h2>
        <p className="font-mono text-xs text-muted">
          {model} • {formattedDate}
        </p>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {analysis}
        </p>
      </div>
    </article>
  );
}
