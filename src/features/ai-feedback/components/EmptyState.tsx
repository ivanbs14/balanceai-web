type EmptyStateProps = {
  onGenerate: () => void;
  generating: boolean;
};

export function EmptyState({ onGenerate, generating }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-dashed border-border bg-surface/50 py-16">
      <div className="text-center">
        <p className="text-lg font-medium text-primary mb-2">
          Nenhum feedback gerado ainda
        </p>
        <p className="text-sm text-muted mb-6">
          Gere sua primeira análise financeira com IA para este mês
        </p>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={generating}
        className="border border-primary bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {generating ? "Gerando..." : "Gerar Análise"}
      </button>
    </div>
  );
}
