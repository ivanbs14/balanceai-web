"use client";

import { useState } from "react";
import type { CategorySpendItem } from "../types";

type CategoryCardProps = {
  items: CategorySpendItem[];
};

function truncateForMobile(value: string, maxLength = 12) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}

export function CategoryCard({ items }: CategoryCardProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const totalAmount = items.reduce((total, item) => total + item.amount, 0);
  const activeCategoryId = items.some((item) => item.id === selectedCategoryId)
    ? selectedCategoryId
    : (items[0]?.id ?? "");

  return (
    <article className="border border-border bg-surface p-3.5 sm:p-5">
      <h2 className="text-[0.98rem] font-semibold tracking-tight text-primary sm:text-[1.25rem]">
        Gastos por Categoria
      </h2>

      <div className="mt-3.5 space-y-3.5 sm:mt-6 sm:space-y-5">
        {items.map((item) => {
          const percentage = totalAmount === 0 ? 0 : Math.round((item.amount / totalAmount) * 100);
          const isActive = item.id === activeCategoryId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedCategoryId(item.id)}
              aria-pressed={isActive}
              className="block w-full text-left"
            >
              <div className="flex items-center justify-between gap-3 text-[0.8rem] sm:gap-4 sm:text-[0.92rem]">
                <span
                  className={[
                    "uppercase tracking-[0.05em]",
                    isActive ? "text-primary" : "",
                  ].join(" ")}
                >
                  <span className="sm:hidden" title={item.label}>
                    {truncateForMobile(item.label)}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
                <span className={isActive ? "text-primary" : ""}>{percentage}%</span>
              </div>

              <div className="mt-1.5 h-2.5 w-full rounded-full bg-primary-soft sm:mt-2 sm:h-3">
                <div
                  className={`h-2.5 rounded-full sm:h-3 ${item.colorClassName}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}
