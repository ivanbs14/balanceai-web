"use client";

import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";

type DashboardShellProps = {
  monthSelector: ReactNode;
  summaryCards: ReactNode;
  primaryTable: ReactNode;
  secondaryTables: ReactNode;
  sidebar: ReactNode;
};

export function DashboardShell({
  monthSelector,
  summaryCards,
  primaryTable,
  secondaryTables,
  sidebar,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen">
      <AppHeader />

      <div className="mx-auto w-full max-w-none px-1 pt-4 pb-8 sm:max-w-[1440px] sm:px-6 lg:px-10 lg:pt-5 lg:pb-10">
        <section className="flex flex-col gap-3 sm:gap-4">
          <div className="min-w-0">{monthSelector}</div>
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
            {summaryCards}
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:mt-8 sm:gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
          <div className="min-w-0 space-y-3 sm:space-y-6">
            {primaryTable}
            {secondaryTables}
          </div>
          <aside className="min-w-0 space-y-3 sm:space-y-6">{sidebar}</aside>
        </section>
      </div>
    </main>
  );
}
