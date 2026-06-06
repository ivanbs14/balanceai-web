import type { ReactNode } from "react";

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
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-6 px-6 py-5 lg:px-10">
          <div className="text-5xl font-semibold tracking-tight text-primary">
            Controle Financeiro
          </div>

          <nav className="flex flex-wrap items-center gap-7 text-[1.85rem] text-foreground">
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

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-white"
            >
              + Novo Lancamento
            </button>
            <div className="hidden items-center gap-3 text-xs font-mono uppercase tracking-[0.18em] text-primary lg:flex">
              <span className="rounded-full border border-border px-3 py-2">
                Cal
              </span>
              <span className="rounded-full border border-border px-3 py-2">
                Not
              </span>
              <span className="rounded-full border border-border px-3 py-2">
                Usr
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
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
