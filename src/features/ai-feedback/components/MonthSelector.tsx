"use client";

import { useState } from "react";

type MonthSelectorProps = {
  onMonthChange: (month: string) => void;
  disabled?: boolean;
};

export function MonthSelector({ onMonthChange, disabled }: MonthSelectorProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate options for last 12 months
  const monthOptions: { value: string; label: string }[] = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const value = `${year}-${month.toString().padStart(2, "0")}`;
    const label = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    
    monthOptions.push({ value, label });
  }

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const handleChange = (value: string) => {
    setSelectedMonth(value);
    onMonthChange(value);
  };

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="month-select"
        className="font-mono text-xs uppercase tracking-wider text-muted"
      >
        Selecione o Mês
      </label>
      <select
        id="month-select"
        value={selectedMonth}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="border border-border bg-surface px-3 py-2 text-sm capitalize text-foreground disabled:opacity-50"
      >
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
