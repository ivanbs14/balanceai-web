"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { useAIFeedback } from "@/features/ai-feedback/hooks/useAIFeedback";
import { MonthSelector } from "@/features/ai-feedback/components/MonthSelector";
import { MetricsDisplay } from "@/features/ai-feedback/components/MetricsDisplay";
import { AIFeedbackCard } from "@/features/ai-feedback/components/AIFeedbackCard";
import { LoadingFeedback } from "@/features/ai-feedback/components/LoadingFeedback";
import { EmptyState } from "@/features/ai-feedback/components/EmptyState";
import { ErrorState } from "@/features/ai-feedback/components/ErrorState";

export default function AIFeedbackPage() {
  const { feedback, loading, error, generating, fetchFeedback, generate, reset } = useAIFeedback();
  
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    if (selectedMonth) {
      fetchFeedback(selectedMonth);
    }
  }, [selectedMonth, fetchFeedback]);

  const handleMonthChange = (month: string) => {
    reset();
    setSelectedMonth(month);
  };

  const handleGenerate = () => {
    generate(selectedMonth);
  };

  return (
    <main className="min-h-screen">
      <AppHeader />

      {/* Content */}
      <div className="mx-auto w-full max-w-none px-1 pt-4 pb-8 sm:max-w-[1440px] sm:px-6 lg:px-10 lg:pt-5 lg:pb-10">
        {/* Page Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Feedback Financeiro com IA
          </h1>
          <p className="text-sm text-muted sm:text-base">
            Análise inteligente das suas transações mensais powered by Google Gemini
          </p>
        </header>

        {/* Month Selector */}
        <div className="mb-6">
          <MonthSelector
            onMonthChange={handleMonthChange}
            disabled={loading || generating}
          />
        </div>

        {/* Loading State */}
        {(loading || generating) && <LoadingFeedback />}

        {/* Error State */}
        {!loading && !generating && error && (
          <ErrorState message={error} onRetry={() => fetchFeedback(selectedMonth)} />
        )}

        {/* Empty State */}
        {!loading && !generating && !error && !feedback && (
          <EmptyState onGenerate={handleGenerate} generating={generating} />
        )}

        {/* Feedback Content */}
        {!loading && !generating && !error && feedback && (
          <div className="space-y-6">
            {/* Metrics */}
            <section>
              <h2 className="mb-4 text-xl font-semibold text-primary">
                Resumo do Período
              </h2>
              <MetricsDisplay
                totalIncome={feedback.totalIncome}
                totalExpense={feedback.totalExpense}
                totalInvestment={feedback.totalInvestment}
                expensePercentage={feedback.expensePercentage}
                investmentPercentage={feedback.investmentPercentage}
                topCategory={feedback.topCategory}
                topCategoryValue={feedback.topCategoryValue}
              />
            </section>

            {/* AI Analysis */}
            <section>
              <AIFeedbackCard
                analysis={feedback.analysis}
                model={feedback.model}
                createdAt={feedback.createdAt}
              />
            </section>

            {/* Regenerate Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="border border-primary bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {generating ? "Gerando..." : "Gerar Nova Análise"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
