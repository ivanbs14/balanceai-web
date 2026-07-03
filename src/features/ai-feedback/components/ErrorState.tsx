type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 border border-danger bg-danger/10 py-12">
      <div className="text-center">
        <p className="text-lg font-medium text-danger-foreground mb-2">
          Erro ao processar solicitação
        </p>
        <p className="text-sm text-muted mb-6">{message}</p>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="border border-primary bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Tentar Novamente
        </button>
      )}
    </div>
  );
}
