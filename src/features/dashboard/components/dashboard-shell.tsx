import type { ReactNode } from "react";
import { Bell, CalendarDays, CircleUserRound } from "lucide-react";

type DashboardShellProps = {
  monthSelector: ReactNode;
  summaryCards: ReactNode;
  primaryTable: ReactNode;
  secondaryTables: ReactNode;
  sidebar: ReactNode;
};

const navItems = [
  "Dashboard",
  "Custos Fixos",
  "Cartao",
  "Investimentos",
  "Categorias",
];

export function DashboardShell({
  monthSelector,
  summaryCards,
  primaryTable,
  secondaryTables,
  sidebar,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-[#fff7f8]/95">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="text-[1.7rem] font-semibold tracking-tight text-primary sm:text-[2rem]">
            Controle Financeiro
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-[1rem] text-foreground sm:text-[1.1rem]">
            {navItems.map((item, index) => (
              <span
                key={item}
                className={
                  index === 0
                    ? "border-b-4 border-primary pb-2 font-semibold text-primary"
                    : "pb-2"
                }
              >
                {item}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-2xl bg-primary px-3.5 py-2 text-xs font-semibold text-white sm:px-4 sm:py-2.5 sm:text-sm"
            >
              + Novo Lancamento
            </button>
            <div className="hidden items-center gap-2 text-primary lg:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-soft">
                <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-soft">
                <Bell className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-soft">
                <CircleUserRound className="h-4 w-4" strokeWidth={1.8} />
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 pt-4 pb-8 lg:px-10 lg:pt-5 lg:pb-10">
        <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>{monthSelector}</div>
          <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[520px]">
            {summaryCards}
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
          <div className="space-y-6">
            {primaryTable}
            {secondaryTables}
          </div>
          <aside className="space-y-6">{sidebar}</aside>
        </section>
      </div>
    </main>
  );
}
