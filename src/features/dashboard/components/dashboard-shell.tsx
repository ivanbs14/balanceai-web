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
        <div className="mx-auto max-w-[1440px] px-6 py-4 lg:relative lg:px-10">
          <div className="text-[1.7rem] font-semibold tracking-tight text-primary sm:text-[2rem]">
            Controle Financeiro
          </div>

          <nav className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[1rem] text-foreground sm:text-[1.1rem] lg:absolute lg:top-1/2 lg:left-1/2 lg:mt-0 lg:w-max lg:-translate-x-1/2 lg:-translate-y-1/2">
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
