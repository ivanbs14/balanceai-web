# Dashboard Layout Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persisted dashboard layout toggle beside the authenticated user name and support switching between the current responsive dashboard and a fixed ledger-style dashboard with horizontal scrolling.

**Architecture:** Keep layout preference state in `AuthenticatedHome`, persist it with `localStorage`, and pass a typed `layoutMode` prop into `DashboardPage`. Preserve the current responsive shell as the default path, add a dedicated fixed shell component for the reference layout, and keep the existing data-fetching, filters, tables, modals, and actions untouched.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, `lucide-react`

---

## File Map

- Create: `src/features/dashboard/layout-mode.ts`
- Create: `src/features/dashboard/components/dashboard-shell-fixed-ledger.tsx`
- Modify: `src/features/auth/components/authenticated-home.tsx`
- Modify: `src/features/dashboard/components/dashboard-page.tsx`
- Modify: `src/features/dashboard/components/dashboard-shell.tsx`
- Modify: `src/features/dashboard/components/month-selector.tsx`

### Task 1: Add the shared dashboard layout mode contract

**Files:**
- Create: `src/features/dashboard/layout-mode.ts`

- [ ] **Step 1: Create `src/features/dashboard/layout-mode.ts`**

Create the file with:

```ts
export type DashboardLayoutMode = "padrao" | "grade-fixa";

export const DASHBOARD_LAYOUT_STORAGE_KEY = "balance.dashboard.layout";

export function isDashboardLayoutMode(value: string): value is DashboardLayoutMode {
  return value === "padrao" || value === "grade-fixa";
}

export function getNextDashboardLayoutMode(
  currentMode: DashboardLayoutMode,
): DashboardLayoutMode {
  return currentMode === "padrao" ? "grade-fixa" : "padrao";
}

export function getDashboardLayoutLabel(mode: DashboardLayoutMode) {
  return mode === "padrao" ? "Layout atual" : "Grade fixa";
}
```

- [ ] **Step 2: Lint the new shared contract**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npx eslint src/features/dashboard/layout-mode.ts
```

Expected: command exits with code `0`.

- [ ] **Step 3: Commit the shared contract**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add src/features/dashboard/layout-mode.ts
git commit -m "feat: add dashboard layout mode contract"
```

Expected: one commit containing only the shared layout mode file.

### Task 2: Persist the layout toggle in the authenticated header

**Files:**
- Modify: `src/features/auth/components/authenticated-home.tsx`

- [ ] **Step 1: Replace `src/features/auth/components/authenticated-home.tsx` with the persisted toggle version**

Replace the file with:

```tsx
"use client";

import { startTransition, useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";
import {
  DASHBOARD_LAYOUT_STORAGE_KEY,
  getDashboardLayoutLabel,
  getNextDashboardLayoutMode,
  isDashboardLayoutMode,
  type DashboardLayoutMode,
} from "@/features/dashboard/layout-mode";
import { getGoogleLoginUrl, getSession, login, logout } from "../api";
import { AuthUser } from "../types";
import { LoginForm } from "./login-form";

const AUTH_ERROR_MAP: Record<string, string> = {
  google_state_invalid: "Nao foi possivel validar o login com Google.",
  google_login_failed: "Nao foi possivel concluir o login com Google.",
};

export function AuthenticatedHome() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<DashboardLayoutMode>("padrao");
  const authErrorMessage =
    typeof window === "undefined"
      ? null
      : AUTH_ERROR_MAP[
          new URLSearchParams(window.location.search).get("auth_error") ?? ""
        ] ?? null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");

    if (authError && AUTH_ERROR_MAP[authError]) {
      params.delete("auth_error");
      const nextQuery = params.toString();
      const nextUrl = nextQuery
        ? `${window.location.pathname}?${nextQuery}`
        : window.location.pathname;
      window.history.replaceState({}, "", nextUrl);
    }

    try {
      const savedLayoutMode = window.localStorage.getItem(
        DASHBOARD_LAYOUT_STORAGE_KEY,
      );

      if (savedLayoutMode && isDashboardLayoutMode(savedLayoutMode)) {
        setLayoutMode(savedLayoutMode);
      }
    } catch {
      setLayoutMode("padrao");
    }

    let isMounted = true;

    startTransition(() => {
      getSession()
        .then((session) => {
          if (!isMounted) {
            return;
          }

          setUser(session?.user ?? null);
          setErrorMessage(null);
        })
        .catch(() => {
          if (!isMounted) {
            return;
          }

          setUser(null);
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLayoutToggle() {
    setLayoutMode((currentMode) => {
      const nextMode = getNextDashboardLayoutMode(currentMode);

      try {
        window.localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, nextMode);
      } catch {}

      return nextMode;
    });
  }

  async function handleLogin(email: string, password: string) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await login(email, password);
      setUser(session.user);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel entrar",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await logout();
      setUser(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel sair",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    window.location.assign(getGoogleLoginUrl());
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7f8_0%,#f6e5ec_100%)] px-6 text-primary">
        <p className="font-mono text-sm uppercase tracking-[0.2em]">
          Carregando sessao...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <LoginForm
        errorMessage={errorMessage ?? authErrorMessage}
        isSubmitting={isSubmitting}
        onGoogleLogin={handleGoogleLogin}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-1/2 z-20 w-full max-w-[1440px] -translate-x-1/2 px-6 lg:px-10">
        <div className="flex justify-end gap-3">
          <div className="hidden h-10 items-center border border-border bg-surface px-5 text-sm text-primary sm:inline-flex">
            {user.name}
          </div>
          <button
            type="button"
            onClick={handleLayoutToggle}
            aria-pressed={layoutMode === "grade-fixa"}
            className="inline-flex h-10 items-center gap-2 border border-border bg-surface px-4 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white"
          >
            <LayoutGrid size={16} strokeWidth={2.2} />
            {getDashboardLayoutLabel(layoutMode)}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center border border-primary bg-surface px-5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
      <DashboardPage userId={user.id} layoutMode={layoutMode} />
    </div>
  );
}
```

- [ ] **Step 2: Lint the authenticated header after adding the toggle**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npx eslint src/features/auth/components/authenticated-home.tsx src/features/dashboard/layout-mode.ts
```

Expected: command exits with code `0`.

- [ ] **Step 3: Commit the persisted toggle header**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add src/features/auth/components/authenticated-home.tsx src/features/dashboard/layout-mode.ts
git commit -m "feat: persist dashboard layout toggle"
```

Expected: one commit containing the header toggle and `localStorage` persistence.

If `src/features/dashboard/layout-mode.ts` was already committed in Task 1 and has no new changes, stage only:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add src/features/auth/components/authenticated-home.tsx
git commit -m "feat: persist dashboard layout toggle"
```

### Task 3: Add the fixed ledger shell and branch the dashboard page

**Files:**
- Create: `src/features/dashboard/components/dashboard-shell-fixed-ledger.tsx`
- Modify: `src/features/dashboard/components/dashboard-page.tsx`
- Modify: `src/features/dashboard/components/dashboard-shell.tsx`

- [ ] **Step 1: Create `src/features/dashboard/components/dashboard-shell-fixed-ledger.tsx`**

Create the file with:

```tsx
import type { ReactNode } from "react";

type DashboardShellFixedLedgerProps = {
  monthSelector: ReactNode;
  summaryCards: ReactNode;
  primaryTable: ReactNode;
  secondaryTables: ReactNode;
  sidebar: ReactNode;
};

const navItems = ["Dashboard"];

export function DashboardShellFixedLedger({
  monthSelector,
  summaryCards,
  primaryTable,
  secondaryTables,
  sidebar,
}: DashboardShellFixedLedgerProps) {
  return (
    <main className="min-h-screen overflow-x-auto">
      <div className="min-w-[1680px]">
        <header className="border-b border-border bg-[#fff7f8]/95">
          <div className="mx-auto max-w-[1760px] px-6 py-4 lg:relative lg:px-10">
            <div className="text-[1.7rem] font-semibold tracking-tight text-primary sm:text-[2rem]">
              Controle Financeiro
            </div>

            <nav className="mt-4 flex items-center justify-center gap-3 text-[1rem] text-foreground sm:text-[1.1rem] lg:absolute lg:top-1/2 lg:left-1/2 lg:mt-0 lg:w-max lg:-translate-x-1/2 lg:-translate-y-1/2">
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

        <div className="mx-auto max-w-[1760px] px-6 pt-4 pb-8 lg:px-10 lg:pt-5 lg:pb-10">
          <section className="grid grid-cols-[minmax(0,1fr)_680px] items-start gap-8">
            <div>{monthSelector}</div>
            <div className="grid grid-cols-2 gap-4">{summaryCards}</div>
          </section>

          <section className="mt-8 grid grid-cols-[minmax(0,1.75fr)_320px] gap-6">
            <div className="grid grid-cols-[0.92fr_1.08fr] gap-6">
              <div>{secondaryTables}</div>
              <div>{primaryTable}</div>
            </div>
            <aside className="space-y-5">{sidebar}</aside>
          </section>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update `src/features/dashboard/components/dashboard-page.tsx` to accept `layoutMode` and branch shells**

Apply these edits:

1. Add the new imports near the top of the file:

```tsx
import type { DashboardLayoutMode } from "../layout-mode";
import { DashboardShellFixedLedger } from "./dashboard-shell-fixed-ledger";
```

2. Replace the props type with:

```tsx
type DashboardPageProps = {
  userId: string;
  layoutMode: DashboardLayoutMode;
};
```

3. Replace the component signature with:

```tsx
export function DashboardPage({ userId, layoutMode }: DashboardPageProps) {
```

4. Near the return section, create the shell props object before returning JSX:

```tsx
  const shellProps = {
    monthSelector: (
      <MonthSelector
        years={yearOptions}
        activeYear={activeYear}
        months={monthOptions}
        activeMonthId={activeMonthId}
        onYearChange={handleYearChange}
        onMonthChange={handleMonthChange}
        fixedLayout={layoutMode === "grade-fixa"}
      />
    ),
    summaryCards: <MonthlySummary summary={dashboardData.summary} />,
    primaryTable: (
      <LedgerTableCard
        title="Gastos do Mes"
        total={formatCurrency(sumAmounts(monthlyExpenses))}
        rows={filteredMonthlyExpenses}
        columns={monthlyExpensesColumns}
      />
    ),
    secondaryTables: (
      <AccordionCard
        title="Cartao de Credito"
        countLabel={creditCardCountLabel}
        addLabel="Cadastrar cartao"
        onAddClick={() => setIsAddCardModalOpen(true)}
        isEmpty={dashboardData.creditCard.length === 0}
        emptyMessage="Nenhum cartao encontrado para este mes."
      >
        <LedgerTableCard
          title="Cartao de Credito"
          total={formatCurrency(sumAmounts(dashboardData.creditCard))}
          rows={dashboardData.creditCard}
          columns={creditCardColumns}
          hideHeader
          embedded
        />
      </AccordionCard>
    ),
    sidebar: (
      <>
        <BreakdownListCard
          title="Entradas"
          rows={toBreakdownRows(dashboardData.income)}
          totalLabel="Total"
          totalValue={formatCurrency(sumAmounts(dashboardData.income))}
          tone="income"
          onAddClick={() => setIsAddIncomeModalOpen(true)}
        />
        <BreakdownListCard
          title="Saidas"
          rows={toBreakdownRows(dashboardData.expenses)}
          totalLabel="Total"
          totalValue={formatCurrency(sumAmounts(dashboardData.expenses))}
          tone="expense"
        />
        <BreakdownListCard
          title="Investimentos"
          rows={toBreakdownRows(dashboardData.investments)}
          totalLabel="Total aplicado"
          totalValue={formatCurrency(sumAmounts(dashboardData.investments))}
          tone="investment"
          onAddClick={() => setIsAddInvestmentModalOpen(true)}
        />
        <CategoryCard items={dashboardData.categories} />
      </>
    ),
  };
```

5. Replace the current shell JSX with:

```tsx
      {layoutMode === "grade-fixa" ? (
        <DashboardShellFixedLedger {...shellProps} />
      ) : (
        <DashboardShell {...shellProps} />
      )}
```

- [ ] **Step 3: Widen the current shell container so the fixed header controls align with the new toggle**

In `src/features/dashboard/components/dashboard-shell.tsx`, replace both `max-w-[1440px]` occurrences with `max-w-[1760px]`.

Use these exact replacements:

```tsx
        <div className="mx-auto max-w-[1760px] px-6 py-4 lg:relative lg:px-10">
```

and

```tsx
      <div className="mx-auto max-w-[1760px] px-6 pt-4 pb-8 lg:px-10 lg:pt-5 lg:pb-10">
```

- [ ] **Step 4: Lint the dashboard shell changes**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npx eslint \
  src/features/dashboard/components/dashboard-page.tsx \
  src/features/dashboard/components/dashboard-shell.tsx \
  src/features/dashboard/components/dashboard-shell-fixed-ledger.tsx
```

Expected: command exits with code `0`.

- [ ] **Step 5: Commit the fixed shell branch**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add \
  src/features/dashboard/components/dashboard-page.tsx \
  src/features/dashboard/components/dashboard-shell.tsx \
  src/features/dashboard/components/dashboard-shell-fixed-ledger.tsx
git commit -m "feat: add fixed ledger dashboard shell"
```

Expected: one commit containing the new shell and the shell branching logic.

### Task 4: Tune the month selector for the fixed layout and verify end-to-end behavior

**Files:**
- Modify: `src/features/dashboard/components/month-selector.tsx`

- [ ] **Step 1: Update `src/features/dashboard/components/month-selector.tsx` to support the fixed layout**

Replace the file with:

```tsx
import type { MonthId } from "../types";

type MonthSelectorProps = {
  years: number[];
  activeYear: number;
  months: Array<{ id: MonthId; label: string; disabled: boolean }>;
  activeMonthId: MonthId | null;
  onYearChange: (year: number) => void;
  onMonthChange: (monthId: MonthId) => void;
  fixedLayout?: boolean;
};

export function MonthSelector({
  years,
  activeYear,
  months,
  activeMonthId,
  onYearChange,
  onMonthChange,
  fixedLayout = false,
}: MonthSelectorProps) {
  const sortedMonths = [...months].sort((left, right) =>
    left.id.localeCompare(right.id, "pt-BR", { numeric: true }),
  );

  return (
    <div
      className={[
        "flex gap-3",
        fixedLayout
          ? "flex-col items-start"
          : "flex-col lg:flex-row lg:items-start lg:gap-4",
      ].join(" ")}
    >
      <div className="flex items-center gap-2 lg:flex-shrink-0">
        <label
          htmlFor="dashboard-year-select"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-primary"
        >
          Ano:
        </label>
        <select
          id="dashboard-year-select"
          value={activeYear}
          onChange={(event) => onYearChange(Number(event.target.value))}
          className="min-w-24 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-primary outline-none transition focus:border-primary"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className={fixedLayout ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
        {sortedMonths.map((month) => {
          const isActive = month.id === activeMonthId;
          const isDisabled = month.disabled;

          return (
            <button
              key={month.id}
              type="button"
              onClick={() => onMonthChange(month.id)}
              disabled={isDisabled}
              aria-pressed={isActive}
              className={[
                "min-w-20 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                isActive
                  ? "border-primary bg-primary text-white"
                  : isDisabled
                    ? "cursor-not-allowed border-border/70 bg-surface/60 text-muted"
                    : "border-border bg-surface text-primary hover:border-primary/70",
              ].join(" ")}
            >
              {month.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run lint and a production build for the full feature path**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npx eslint \
  src/features/auth/components/authenticated-home.tsx \
  src/features/dashboard/layout-mode.ts \
  src/features/dashboard/components/month-selector.tsx \
  src/features/dashboard/components/dashboard-page.tsx \
  src/features/dashboard/components/dashboard-shell.tsx \
  src/features/dashboard/components/dashboard-shell-fixed-ledger.tsx
npm run build
```

Expected:

- `eslint` exits with code `0`;
- `next build` exits with code `0`.

- [ ] **Step 3: Perform the required manual verification**

Run the local app:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npm run dev
```

Verify this checklist manually in the browser:

```text
1. Login and confirm the user name still renders in the top-right area.
2. Click the new layout button and confirm the label switches between "Layout atual" and "Grade fixa".
3. Refresh the page and confirm the last selected layout is restored.
4. In "Layout atual", confirm the dashboard still responds normally to reduced width.
5. In "Grade fixa", reduce the viewport and confirm the page keeps the fixed arrangement and exposes horizontal scrolling.
6. Change year and month in both modes and confirm the data reloads as before.
7. Open at least one existing modal and confirm it still overlays correctly in both modes.
```

- [ ] **Step 4: Commit the selector tuning and final verification changes**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add \
  src/features/dashboard/components/month-selector.tsx
git commit -m "refactor: tune selector for fixed dashboard layout"
```

Expected: one commit containing only the month selector tuning that remained after verification.

## Self-Review

### Spec coverage

- Toggle beside the authenticated user name: covered in Task 2.
- Persist the choice locally: covered in Task 2.
- Preserve current responsive dashboard as default mode: covered in Task 2 and Task 3.
- Add dedicated fixed ledger layout: covered in Task 3.
- Keep fixed arrangement and horizontal scrolling in narrow viewports: covered in Task 3 and Task 4.
- Keep existing filters, data, tables, and modals working: covered in Task 3 and manual verification in Task 4.

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation markers remain.
- Every command uses exact repository paths.
- Every changed file has concrete replacement content or exact edit instructions.

### Type consistency

- `DashboardLayoutMode` is defined once in `src/features/dashboard/layout-mode.ts`.
- `AuthenticatedHome` and `DashboardPage` both use the same shared type.
- The fixed shell branch uses the same existing dashboard content props as the current shell.
