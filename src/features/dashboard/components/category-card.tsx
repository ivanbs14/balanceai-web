"use client";

import { useState } from "react";
import type { CategorySpendItem } from "../types";

type CategoryCardProps = {
  items: CategorySpendItem[];
};

export function CategoryCard({ items }: CategoryCardProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const totalAmount = items.reduce((total, item) => total + item.amount, 0);
  const activeCategoryId = items.some((item) => item.id === selectedCategoryId)
    ? selectedCategoryId
    : (items[0]?.id ?? "");

  return (
    <article className="border border-border bg-surface p-5">
      <h2 className="text-[1.35rem] font-semibold tracking-tight text-primary sm:text-[1.45rem]">
        Gastos por Categoria
      </h2>

      <div className="mt-6 space-y-5">
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
              <div className="flex items-center justify-between gap-4 text-sm sm:text-[0.95rem]">
                <span
                  className={[
                    "uppercase tracking-[0.06em]",
                    isActive ? "text-primary" : "",
                  ].join(" ")}
                >
                  {item.label}
                </span>
                <span className={isActive ? "text-primary" : ""}>{percentage}%</span>
              </div>

              <div className="mt-2 h-3 w-full rounded-full bg-primary-soft">
                <div
                  className={`h-3 rounded-full ${item.colorClassName}`}
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
