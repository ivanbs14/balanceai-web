"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

type DashboardShellProps = {
  monthSelector: ReactNode;
  summaryCards: ReactNode;
  primaryTable: ReactNode;
  secondaryTables: ReactNode;
  sidebar: ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "IA Feedback", href: "/ai-feedback" },
];

export function DashboardShell({
  monthSelector,
  summaryCards,
  primaryTable,
  secondaryTables,
  sidebar,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto w-full max-w-none px-1 py-2.5 sm:max-w-[1440px] sm:px-6 sm:py-4 lg:relative lg:px-10">
          <div className="flex items-center relative z-0">
            <Image
              src="/logonameai.svg"
              alt="Balance-ai"
              width={220}
              height={48}
              className="h-9 sm:h-12 pointer-events-none"
              style={{ width: "auto" }}
              priority
            />
          </div>

          <nav className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[0.88rem] text-foreground sm:mt-4 sm:gap-3 sm:text-[1.1rem] lg:absolute lg:top-1/2 lg:left-1/2 lg:mt-0 lg:w-max lg:-translate-x-1/2 lg:-translate-y-1/2 lg:z-50">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href)}
                  style={{ pointerEvents: 'auto' }}
                  className={
                    isActive
                      ? "border-b-3 border-primary pb-1 font-semibold text-primary sm:border-b-4 sm:pb-2 cursor-pointer bg-transparent border-0 outline-none relative z-50"
                      : "pb-1 sm:pb-2 cursor-pointer hover:text-primary transition-colors bg-transparent border-0 outline-none relative z-50"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-none px-1 pt-4 pb-8 sm:max-w-[1440px] sm:px-6 lg:px-10 lg:pt-5 lg:pb-10">
        <section className="flex flex-col gap-2 sm:gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">{monthSelector}</div>
          <div className="min-w-0 grid grid-cols-2 gap-2 sm:gap-4 xl:min-w-[520px]">
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
