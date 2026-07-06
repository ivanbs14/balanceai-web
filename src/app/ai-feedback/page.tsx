"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAIFeedback } from "@/features/ai-feedback/hooks/useAIFeedback";
import { MonthSelector } from "@/features/ai-feedback/components/MonthSelector";
import { MetricsDisplay } from "@/features/ai-feedback/components/MetricsDisplay";
import { AIFeedbackCard } from "@/features/ai-feedback/components/AIFeedbackCard";
import { LoadingFeedback } from "@/features/ai-feedback/components/LoadingFeedback";
import { EmptyState } from "@/features/ai-feedback/components/EmptyState";
import { ErrorState } from "@/features/ai-feedback/components/ErrorState";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "IA Feedback", href: "/ai-feedback" },
];

export default function AIFeedbackPage() {
  const pathname = usePathname();
  const router = useRouter();
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
      {/* Header */}
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto w-full max-w-none px-1 py-2.5 sm:max-w-[1440px] sm:px-6 sm:py-4 lg:relative lg:px-10">
          <div className="flex items-center">
            <Image
              src="/logonameai.svg"
              alt="Balance-ai"
              width={220}
              height={48}
              className="h-9 sm:h-12"
              style={{ width: "auto" }}
              priority
            />
          </div>

          <nav className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[0.88rem] text-foreground sm:mt-4 sm:gap-3 sm:text-[1.1rem] lg:absolute lg:top-1/2 lg:left-1/2 lg:mt-0 lg:w-max lg:-translate-x-1/2 lg:-translate-y-1/2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={
                    isActive
                      ? "border-b-3 border-primary pb-1 font-semibold text-primary sm:border-b-4 sm:pb-2 cursor-pointer bg-transparent border-0 outline-none"
                      : "pb-1 sm:pb-2 cursor-pointer hover:text-primary transition-colors bg-transparent border-0 outline-none"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

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
