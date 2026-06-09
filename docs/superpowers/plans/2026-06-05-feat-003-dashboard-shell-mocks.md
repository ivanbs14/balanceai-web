# FEAT-003 Dashboard Shell e Mocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the base monthly finance dashboard page in `balance-web` with a single typed local mock source, month switching, and visual placeholder blocks aligned to the approved design.

**Architecture:** Keep the App Router entrypoint small by delegating the interactive dashboard to a client component under `src/features/dashboard/components/`. Centralize all mock contracts and datasets in `src/features/dashboard/`, then feed every visual block from a single selected `DashboardMonthData` object so month changes propagate through props only.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, `next/font/google`

---

## File Map

- Create: `src/features/dashboard/types.ts`
- Create: `src/features/dashboard/mock-data.ts`
- Create: `src/features/dashboard/components/dashboard-page.tsx`
- Create: `src/features/dashboard/components/dashboard-shell.tsx`
- Create: `src/features/dashboard/components/month-selector.tsx`
- Create: `src/features/dashboard/components/summary-card.tsx`
- Create: `src/features/dashboard/components/ledger-table-card.tsx`
- Create: `src/features/dashboard/components/breakdown-list-card.tsx`
- Create: `src/features/dashboard/components/category-card.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: `../balance-doc/features/ready/FEAT-003-dashboard-shell-e-mocks.md`

### Task 1: Set the dashboard theme baseline

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace the default fonts and metadata in `src/app/layout.tsx`**

Replace the file with:

```tsx
import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Controle Financeiro",
  description: "Dashboard mensal com dados mockados para controle financeiro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${hankenGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `src/app/globals.css` with the ledger theme tokens**

Replace the file with:

```css
@import "tailwindcss";

:root {
  --background: #fff8f7;
  --foreground: #3f0018;
  --surface: #ffffff;
  --surface-soft: #fff0f1;
  --surface-strong: #ffe1e5;
  --border: #f3bfd0;
  --border-strong: #db2777;
  --primary: #b7005e;
  --primary-strong: #93004a;
  --primary-soft: #ffd9e2;
  --muted: #7a4b5f;
  --mono: #7b294c;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-soft: var(--surface-soft);
  --color-surface-strong: var(--surface-strong);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-primary: var(--primary);
  --color-primary-strong: var(--primary-strong);
  --color-primary-soft: var(--primary-soft);
  --color-muted: var(--muted);
  --color-mono: var(--mono);
  --font-sans: var(--font-hanken-grotesk);
  --font-mono: var(--font-jetbrains-mono);
}

* {
  box-sizing: border-box;
}

html {
  background: var(--background);
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(255, 216, 234, 0.5), transparent 28%),
    linear-gradient(180deg, #fff8f7 0%, #fff3f4 100%);
  color: var(--foreground);
  font-family: var(--font-hanken-grotesk), sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select {
  font: inherit;
}
```

- [ ] **Step 3: Run lint on the touched app shell files**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npx eslint src/app/layout.tsx src/app/globals.css
```

Expected: command exits with code `0`.

- [ ] **Step 4: Commit the theme baseline**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add dashboard theme baseline"
```

Expected: one commit containing only the baseline styling changes.

### Task 2: Define the dashboard contract and mock dataset

**Files:**
- Create: `src/features/dashboard/types.ts`
- Create: `src/features/dashboard/mock-data.ts`

- [ ] **Step 1: Create `src/features/dashboard/types.ts`**

Create the file with:

```ts
export type MonthId = string;

export type CurrencyAmount = number;

export type SummaryMetrics = {
  totalExpenses: CurrencyAmount;
  balance: CurrencyAmount;
};

export type FixedCostItem = {
  id: string;
  name: string;
  paymentType: string;
  paid: boolean;
  amount: CurrencyAmount;
};

export type CreditCardItem = {
  id: string;
  name: string;
  paymentType: string;
  installmentLabel: string;
  amount: CurrencyAmount;
};

export type BreakdownItem = {
  id: string;
  label: string;
  amount: CurrencyAmount;
};

export type CategorySpendItem = {
  id: string;
  label: string;
  percentage: number;
  colorClassName: string;
};

export type DashboardMonthData = {
  id: MonthId;
  label: string;
  summary: SummaryMetrics;
  fixedCosts: FixedCostItem[];
  creditCard: CreditCardItem[];
  income: BreakdownItem[];
  expenses: BreakdownItem[];
  investments: BreakdownItem[];
  categories: CategorySpendItem[];
};
```

- [ ] **Step 2: Create `src/features/dashboard/mock-data.ts`**

Create the file with:

```ts
import type { DashboardMonthData } from "./types";

export const dashboardMonths: DashboardMonthData[] = [
  {
    id: "2026-01",
    label: "Janeiro",
    summary: {
      totalExpenses: 6968.54,
      balance: -23.54,
    },
    fixedCosts: [
      { id: "rent", name: "Aluguel", paymentType: "Debito", paid: true, amount: 3200 },
      { id: "condo", name: "Condominio", paymentType: "Debito", paid: true, amount: 850 },
      { id: "energy", name: "Energia", paymentType: "Debito", paid: false, amount: 245.68 },
    ],
    creditCard: [
      { id: "market", name: "Supermercado", paymentType: "Debito", installmentLabel: "1/1", amount: 840.3 },
      { id: "prime", name: "Amazon Prime", paymentType: "Debito", installmentLabel: "1/1", amount: 14.9 },
    ],
    income: [
      { id: "salary", label: "Salario Mensal", amount: 6500 },
      { id: "extra", label: "Renda Extra", amount: 445 },
    ],
    expenses: [
      { id: "debit", label: "Debito", amount: 4504.51 },
      { id: "nubank", label: "Nubank", amount: 770.3 },
      { id: "inter", label: "Inter", amount: 1093.73 },
      { id: "travel", label: "Viagem", amount: 600 },
    ],
    investments: [
      { id: "emergency", label: "Reserva de Emergencia", amount: 500 },
      { id: "ipca", label: "Renda Fixa IPCA+", amount: 200 },
    ],
    categories: [
      { id: "food", label: "Alimentacao", percentage: 45, colorClassName: "bg-[#cf0b74]" },
      { id: "housing", label: "Moradia", percentage: 30, colorClassName: "bg-[#8d4d76]" },
      { id: "other", label: "Outros", percentage: 25, colorClassName: "bg-[#9e7b88]" },
    ],
  },
  {
    id: "2026-02",
    label: "Fevereiro",
    summary: {
      totalExpenses: 5824.2,
      balance: 1120.8,
    },
    fixedCosts: [
      { id: "rent", name: "Aluguel", paymentType: "Debito", paid: true, amount: 3200 },
      { id: "condo", name: "Condominio", paymentType: "Debito", paid: true, amount: 850 },
      { id: "internet", name: "Internet", paymentType: "Debito", paid: true, amount: 139.9 },
    ],
    creditCard: [
      { id: "course", name: "Curso UX", paymentType: "Credito", installmentLabel: "2/6", amount: 199.9 },
      { id: "pharmacy", name: "Farmacia", paymentType: "Credito", installmentLabel: "1/1", amount: 84.4 },
      { id: "streaming", name: "Streaming", paymentType: "Credito", installmentLabel: "1/1", amount: 39.9 },
    ],
    income: [
      { id: "salary", label: "Salario Mensal", amount: 6500 },
      { id: "bonus", label: "Bonus", amount: 445 },
    ],
    expenses: [
      { id: "debit", label: "Debito", amount: 3610.2 },
      { id: "card", label: "Cartao", amount: 1240.6 },
      { id: "health", label: "Saude", amount: 350 },
      { id: "transport", label: "Transporte", amount: 623.4 },
    ],
    investments: [
      { id: "emergency", label: "Reserva de Emergencia", amount: 700 },
      { id: "cdb", label: "CDB Pos-fixado", amount: 600 },
    ],
    categories: [
      { id: "housing", label: "Moradia", percentage: 38, colorClassName: "bg-[#cf0b74]" },
      { id: "mobility", label: "Transporte", percentage: 22, colorClassName: "bg-[#8d4d76]" },
      { id: "health", label: "Saude", percentage: 18, colorClassName: "bg-[#9e7b88]" },
      { id: "other", label: "Outros", percentage: 22, colorClassName: "bg-[#c796ad]" },
    ],
  },
];

export const defaultDashboardMonthId = dashboardMonths[0]?.id ?? "";
```

- [ ] **Step 3: Run TypeScript and lint checks for the new domain files**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npx eslint src/features/dashboard/types.ts src/features/dashboard/mock-data.ts
npx tsc --noEmit
```

Expected:
- ESLint exits with code `0`
- TypeScript exits with code `0`

- [ ] **Step 4: Commit the typed mocks**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add src/features/dashboard/types.ts src/features/dashboard/mock-data.ts
git commit -m "feat: add dashboard mock contracts"
```

Expected: one commit with the dashboard types and month dataset.

### Task 3: Build the reusable dashboard UI primitives

**Files:**
- Create: `src/features/dashboard/components/month-selector.tsx`
- Create: `src/features/dashboard/components/summary-card.tsx`
- Create: `src/features/dashboard/components/ledger-table-card.tsx`
- Create: `src/features/dashboard/components/breakdown-list-card.tsx`
- Create: `src/features/dashboard/components/category-card.tsx`

- [ ] **Step 1: Create `src/features/dashboard/components/month-selector.tsx`**

Create the file with:

```tsx
import type { MonthId } from "../types";

type MonthSelectorProps = {
  months: Array<{ id: MonthId; label: string }>;
  activeMonthId: MonthId;
  onChange: (monthId: MonthId) => void;
};

export function MonthSelector({
  months,
  activeMonthId,
  onChange,
}: MonthSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {months.map((month) => {
        const isActive = month.id === activeMonthId;

        return (
          <button
            key={month.id}
            type="button"
            onClick={() => onChange(month.id)}
            className={[
              "min-w-32 rounded-2xl border px-6 py-3 text-lg font-semibold transition-colors",
              isActive
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface text-primary hover:border-primary/70",
            ].join(" ")}
          >
            {month.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/features/dashboard/components/summary-card.tsx`**

Create the file with:

```tsx
type SummaryCardProps = {
  label: string;
  value: string;
  tone?: "default" | "negative";
};

export function SummaryCard({
  label,
  value,
  tone = "default",
}: SummaryCardProps) {
  return (
    <article className="border border-border bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted">
        {label}
      </p>
      <p
        className={[
          "mt-3 text-4xl font-semibold tracking-tight",
          tone === "negative" ? "text-[#c11b16]" : "text-primary",
        ].join(" ")}
      >
        {value}
      </p>
    </article>
  );
}
```

- [ ] **Step 3: Create `src/features/dashboard/components/ledger-table-card.tsx`**

Create the file with:

```tsx
type LedgerColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  render: (row: T) => React.ReactNode;
};

type LedgerTableCardProps<T> = {
  title: string;
  total: string;
  rows: T[];
  columns: Array<LedgerColumn<T>>;
  addLabel: string;
};

export function LedgerTableCard<T>({
  title,
  total,
  rows,
  columns,
  addLabel,
}: LedgerTableCardProps<T>) {
  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[2rem] font-semibold tracking-tight text-primary">
          {title}
        </h2>
        <p className="pt-2 text-3xl font-semibold text-foreground">{total}</p>
      </div>

      <div className="mt-5 overflow-hidden border border-border">
        <div className="grid bg-surface-soft" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((column) => (
            <div
              key={column.key}
              className={[
                "border-b border-border px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] text-primary",
                column.align === "right"
                  ? "text-right"
                  : column.align === "center"
                    ? "text-center"
                    : "text-left",
              ].join(" ")}
            >
              {column.header}
            </div>
          ))}
        </div>

        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid border-b border-border last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className={[
                  "px-4 py-4 text-lg text-foreground",
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left",
                ].join(" ")}
              >
                {column.render(row)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-3 border border-dashed border-border px-4 py-4 text-2xl text-muted"
      >
        <span className="text-4xl leading-none">+</span>
        <span>{addLabel}</span>
      </button>
    </article>
  );
}
```

- [ ] **Step 4: Create `src/features/dashboard/components/breakdown-list-card.tsx`**

Create the file with:

```tsx
type BreakdownListCardProps = {
  title: string;
  rows: Array<{ id: string; label: string; amount: string }>;
  totalLabel: string;
  totalValue: string;
};

export function BreakdownListCard({
  title,
  rows,
  totalLabel,
  totalValue,
}: BreakdownListCardProps) {
  return (
    <article className="border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[2rem] font-semibold tracking-tight text-primary">
          {title}
        </h2>
        <span className="text-5xl leading-none text-muted">+</span>
      </div>

      <div className="mt-4 space-y-0">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 border-b border-border py-3 text-lg"
          >
            <span>{row.label}</span>
            <span className="font-medium">{row.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 text-xl font-semibold">
        <span className="uppercase text-primary">{totalLabel}</span>
        <span className="text-primary">{totalValue}</span>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Create `src/features/dashboard/components/category-card.tsx`**

Create the file with:

```tsx
type CategoryCardProps = {
  items: Array<{
    id: string;
    label: string;
    percentage: number;
    colorClassName: string;
  }>;
};

export function CategoryCard({ items }: CategoryCardProps) {
  return (
    <article className="border border-border bg-surface p-5">
      <h2 className="text-[2rem] font-semibold tracking-tight text-primary">
        Gastos por Categoria
      </h2>

      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between gap-4 text-lg">
              <span className="uppercase tracking-[0.06em]">{item.label}</span>
              <span>{item.percentage}%</span>
            </div>

            <div className="mt-2 h-3 w-full rounded-full bg-primary-soft">
              <div
                className={`h-3 rounded-full ${item.colorClassName}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
```

- [ ] **Step 6: Run lint on the reusable components**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npx eslint src/features/dashboard/components/month-selector.tsx src/features/dashboard/components/summary-card.tsx src/features/dashboard/components/ledger-table-card.tsx src/features/dashboard/components/breakdown-list-card.tsx src/features/dashboard/components/category-card.tsx
```

Expected: command exits with code `0`.

- [ ] **Step 7: Commit the reusable primitives**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add src/features/dashboard/components/month-selector.tsx src/features/dashboard/components/summary-card.tsx src/features/dashboard/components/ledger-table-card.tsx src/features/dashboard/components/breakdown-list-card.tsx src/features/dashboard/components/category-card.tsx
git commit -m "feat: add dashboard shell primitives"
```

Expected: one commit containing only the reusable dashboard blocks.

### Task 4: Compose the interactive dashboard page

**Files:**
- Create: `src/features/dashboard/components/dashboard-shell.tsx`
- Create: `src/features/dashboard/components/dashboard-page.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create `src/features/dashboard/components/dashboard-shell.tsx`**

Create the file with:

```tsx
type DashboardShellProps = {
  monthSelector: React.ReactNode;
  summaryCards: React.ReactNode;
  primaryTable: React.ReactNode;
  secondaryTables: React.ReactNode;
  sidebar: React.ReactNode;
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
                className={index === 0 ? "border-b-4 border-primary pb-2 font-semibold text-primary" : "pb-2"}
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
              <span className="rounded-full border border-border px-3 py-2">Cal</span>
              <span className="rounded-full border border-border px-3 py-2">Not</span>
              <span className="rounded-full border border-border px-3 py-2">Usr</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-10 lg:py-10">
        <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>{monthSelector}</div>
          <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[520px]">{summaryCards}</div>
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
```

- [ ] **Step 2: Create `src/features/dashboard/components/dashboard-page.tsx`**

Create the file with:

```tsx
"use client";

import { useState } from "react";
import { dashboardMonths, defaultDashboardMonthId } from "../mock-data";
import type {
  BreakdownItem,
  CreditCardItem,
  DashboardMonthData,
  FixedCostItem,
} from "../types";
import { BreakdownListCard } from "./breakdown-list-card";
import { CategoryCard } from "./category-card";
import { DashboardShell } from "./dashboard-shell";
import { LedgerTableCard } from "./ledger-table-card";
import { MonthSelector } from "./month-selector";
import { SummaryCard } from "./summary-card";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function sumAmounts<T extends { amount: number }>(items: T[]) {
  return items.reduce((total, item) => total + item.amount, 0);
}

function getActiveMonth(monthId: string): DashboardMonthData {
  return (
    dashboardMonths.find((month) => month.id === monthId) ??
    dashboardMonths[0] ?? {
      id: "",
      label: "",
      summary: { totalExpenses: 0, balance: 0 },
      fixedCosts: [],
      creditCard: [],
      income: [],
      expenses: [],
      investments: [],
      categories: [],
    }
  );
}

export function DashboardPage() {
  const [activeMonthId, setActiveMonthId] = useState(defaultDashboardMonthId);
  const activeMonth = getActiveMonth(activeMonthId);

  const monthOptions = dashboardMonths.map((month) => ({
    id: month.id,
    label: month.label,
  }));

  return (
    <DashboardShell
      monthSelector={
        <MonthSelector
          months={monthOptions}
          activeMonthId={activeMonth.id}
          onChange={setActiveMonthId}
        />
      }
      summaryCards={
        <>
          <SummaryCard
            label="Total de Gastos"
            value={formatCurrency(activeMonth.summary.totalExpenses)}
          />
          <SummaryCard
            label="Saldo"
            value={formatCurrency(activeMonth.summary.balance)}
            tone={activeMonth.summary.balance < 0 ? "negative" : "default"}
          />
        </>
      }
      primaryTable={
        <LedgerTableCard<FixedCostItem>
          title="Custos Fixos"
          total={formatCurrency(sumAmounts(activeMonth.fixedCosts))}
          rows={activeMonth.fixedCosts}
          addLabel="Adicionar Item"
          columns={[
            { key: "name", header: "Nome", render: (row) => row.name },
            { key: "type", header: "Tipo", render: (row) => row.paymentType },
            {
              key: "paid",
              header: "Pago?",
              align: "center",
              render: (row) => (
                <span className={row.paid ? "text-primary" : "text-muted"}>
                  {row.paid ? "■" : "□"}
                </span>
              ),
            },
            {
              key: "amount",
              header: "Valor",
              align: "right",
              render: (row) => formatCurrency(row.amount),
            },
          ]}
        />
      }
      secondaryTables={
        <div className="grid gap-6 xl:grid-cols-2">
          <LedgerTableCard<FixedCostItem>
            title="Custos Fixos"
            total={formatCurrency(sumAmounts(activeMonth.fixedCosts))}
            rows={activeMonth.fixedCosts}
            addLabel="Adicionar Item"
            columns={[
              { key: "name", header: "Nome", render: (row) => row.name },
              { key: "type", header: "Tipo", render: (row) => row.paymentType },
              {
                key: "paid",
                header: "Pago?",
                align: "center",
                render: (row) => (
                  <span className={row.paid ? "text-primary" : "text-muted"}>
                    {row.paid ? "■" : "□"}
                  </span>
                ),
              },
              {
                key: "amount",
                header: "Valor",
                align: "right",
                render: (row) => formatCurrency(row.amount),
              },
            ]}
          />

          <LedgerTableCard<CreditCardItem>
            title="Cartao de Credito"
            total={formatCurrency(sumAmounts(activeMonth.creditCard))}
            rows={activeMonth.creditCard}
            addLabel="Adicionar Item"
            columns={[
              { key: "name", header: "Nome", render: (row) => row.name },
              { key: "type", header: "Tipo", render: (row) => row.paymentType },
              {
                key: "installment",
                header: "Parc.",
                align: "center",
                render: (row) => row.installmentLabel,
              },
              {
                key: "amount",
                header: "Valor",
                align: "right",
                render: (row) => formatCurrency(row.amount),
              },
            ]}
          />
        </div>
      }
      sidebar={
        <>
          <BreakdownListCard
            title="Entradas"
            rows={activeMonth.income.map((item) => ({
              id: item.id,
              label: item.label,
              amount: formatCurrency(item.amount),
            }))}
            totalLabel="Total"
            totalValue={formatCurrency(sumAmounts(activeMonth.income))}
          />
          <BreakdownListCard
            title="Saidas"
            rows={activeMonth.expenses.map((item) => ({
              id: item.id,
              label: item.label,
              amount: formatCurrency(item.amount),
            }))}
            totalLabel="Total"
            totalValue={formatCurrency(sumAmounts(activeMonth.expenses))}
          />
          <BreakdownListCard
            title="Investimentos"
            rows={activeMonth.investments.map((item) => ({
              id: item.id,
              label: item.label,
              amount: formatCurrency(item.amount),
            }))}
            totalLabel="Total Aplicado"
            totalValue={formatCurrency(sumAmounts(activeMonth.investments))}
          />
          <CategoryCard items={activeMonth.categories} />
        </>
      }
    />
  );
}
```

- [ ] **Step 3: Replace `src/app/page.tsx` with the dashboard entrypoint**

Replace the file with:

```tsx
import { DashboardPage } from "@/features/dashboard/components/dashboard-page";

export default function Home() {
  return <DashboardPage />;
}
```

- [ ] **Step 4: Run full validation for the composed page**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npx eslint src/app/page.tsx src/features/dashboard/components/dashboard-shell.tsx src/features/dashboard/components/dashboard-page.tsx
npx tsc --noEmit
npm run build
```

Expected:
- ESLint exits with code `0`
- TypeScript exits with code `0`
- Next build exits with code `0`

- [ ] **Step 5: Commit the composed dashboard page**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git add src/app/page.tsx src/features/dashboard/components/dashboard-shell.tsx src/features/dashboard/components/dashboard-page.tsx
git commit -m "feat: compose dashboard shell from mocks"
```

Expected: one commit with the route and final feature composition.

### Task 5: Record delivery notes and run final QA

**Files:**
- Modify: `../balance-doc/features/ready/FEAT-003-dashboard-shell-e-mocks.md`

- [ ] **Step 1: Update the feature doc checklist and summary**

Edit `../balance-doc/features/ready/FEAT-003-dashboard-shell-e-mocks.md` to:

- mark the technical checklist items as completed;
- mark the QA checklist items completed only after verification runs succeed;
- fill `Resumo final da entrega` with a short summary covering:
  - dashboard shell implemented in `balance-web`;
  - local typed mocks with two competencies;
  - month switch propagating across all blocks;
  - placeholder blocks ready for follow-up subfeatures.

Use this summary text:

```md
Pagina base da dashboard implementada no `balance-web` com layout inspirado na referencia `Petal Ledger`, troca local entre duas competencias mockadas e contrato TypeScript centralizado para resumo, custos fixos, cartao, blocos financeiros e categorias. Todos os blocos da tela consomem uma unica fonte local de mocks, deixando a fundacao pronta para as subfeatures visuais seguintes sem depender de API.
```

- [ ] **Step 2: Run the final project checks**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npm run lint
npm run build
```

Expected:
- both commands exit with code `0`

- [ ] **Step 3: Manually verify month switching**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
npm run dev
```

Then open `http://localhost:3000` and verify:

- the page renders the dashboard instead of the Next starter template;
- clicking `Janeiro` and `Fevereiro` changes KPIs, tables, side lists, and categories together;
- the top navigation remains visual only;
- the layout remains readable on desktop width and on a narrow responsive viewport.

Expected: all four checks pass.

- [ ] **Step 4: Commit the delivery notes**

Run:

```bash
cd /Users/ivanbarbosa/Desktop/shelf/balance2/balance-web
git status --short
```

Expected:
- the web repository is clean, or only contains intended `balance-web` changes already committed in earlier tasks;
- the `balance-doc/features/ready/FEAT-003-dashboard-shell-e-mocks.md` edit remains local in the parent workspace and must be called out in the final handoff because the workspace root is not a Git repository.
