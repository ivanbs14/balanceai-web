"use client";

import { useState } from "react";
import { GalleryHorizontalEnd, SquareDashed } from "lucide-react";
import type { CardSpendItem } from "../types";

type CardSpendCardProps = {
  items: CardSpendItem[];
  onItemClick?: (item: CardSpendItem) => void;
};

type CardSpendMode = "total" | "month";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function truncateForMobile(value: string, maxLength = 12) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

export function CardSpendCard({ items, onItemClick }: CardSpendCardProps) {
  const [mode, setMode] = useState<CardSpendMode>("month");
  const isTotalMode = mode === "total";
  const itemsWithDisplayAmount = items.map((item) => ({
    ...item,
    displayAmount: isTotalMode ? item.totalAmount : item.monthAmount,
  }));
  const totalAmount = itemsWithDisplayAmount.reduce(
    (total, item) => total + item.displayAmount,
    0,
  );

  return (
    <article className="border border-border bg-surface p-3.5 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[0.98rem] font-semibold tracking-tight text-white sm:text-[1.25rem]">
          Gastos por Cartões
        </h2>
        <button
          type="button"
          aria-label={
            isTotalMode
              ? "Exibindo total consolidado por cartão. Clique para mostrar o total do mês selecionado."
              : "Exibindo total do mês selecionado. Clique para mostrar o total consolidado por cartão."
          }
          title={
            isTotalMode
              ? "Mostrar total do mês selecionado"
              : "Mostrar total consolidado por cartão"
          }
          onClick={() => {
            setMode((currentMode) =>
              currentMode === "total" ? "month" : "total",
            );
          }}
          className="inline-flex h-8 w-8 items-center justify-center text-primary transition hover:text-primary/80"
        >
          {isTotalMode ? (
            <GalleryHorizontalEnd className="h-4 w-4" aria-hidden="true" />
          ) : (
            <SquareDashed className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="mt-3.5 space-y-3.5 sm:mt-6 sm:space-y-5">
        {itemsWithDisplayAmount.map((item) => {
          const percentage =
            totalAmount === 0
              ? 0
              : Math.round((item.displayAmount / totalAmount) * 100);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick?.(item)}
              className="block w-full rounded-[0.8rem] px-2 py-2 text-left transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <div className="flex items-center justify-between gap-3 text-[0.8rem] sm:gap-4 sm:text-[0.92rem]">
                <span className="uppercase tracking-[0.05em] text-white/88">
                  <span className="sm:hidden" title={item.label}>
                    {truncateForMobile(item.label)}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
                <span className="text-right text-white/88">
                  {formatCurrency(item.displayAmount)}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-3 sm:mt-2 sm:gap-4">
                <div className="h-2.5 flex-1 rounded-full bg-primary-soft sm:h-3">
                  <div
                    className={`h-2.5 rounded-full sm:h-3 ${item.colorClassName}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-11 shrink-0 text-right text-[0.8rem] text-white/72 sm:text-[0.92rem]">
                  {percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}
