export function LoadingFeedback() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      <p className="text-sm text-muted">Gerando análise financeira...</p>
      <p className="text-xs text-muted">Isso pode levar alguns segundos</p>
    </div>
  );
}
