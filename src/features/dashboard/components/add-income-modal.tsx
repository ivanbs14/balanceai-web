"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";

type AddIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const incomeMethodOptions = ["Pix", "Transferencia", "Deposito", "Dinheiro"];
const incomeCategoryOptions = ["Salario", "Freela", "Bonus", "Outros"];
const installmentOptions = ["1/1", "1/2", "1/3", "1/6", "1/12"];

type IncomeFormState = {
  name: string;
  method: string;
  category: string;
  installments: string;
  amount: string;
  date: string;
};

function createInitialFormState(): IncomeFormState {
  return {
    name: "",
    method: incomeMethodOptions[0],
    category: incomeCategoryOptions[0],
    installments: installmentOptions[0],
    amount: "",
    date: "",
  };
}

type FieldLabelProps = {
  children: string;
};

function FieldLabel({ children }: FieldLabelProps) {
  return (
    <label className="mb-2 block font-mono text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-[#d4417f]">
      {children}
    </label>
  );
}

type FieldShellProps = {
  children: ReactNode;
  className?: string;
};

function FieldShell({ children, className }: FieldShellProps) {
  return (
    <div
      className={[
        "relative rounded-[0.55rem] border border-[#f0cade] bg-white shadow-[0_0_0_1px_rgba(183,0,94,0.02)]",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState<IncomeFormState>(() =>
    createInitialFormState(),
  );

  function handleDateIconClick() {
    const input = dateInputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    if ("showPicker" in HTMLInputElement.prototype) {
      input.showPicker();
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setFormState(createInitialFormState());
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#79435d]/24 px-4 py-8 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[650px] overflow-hidden rounded-[1rem] border-2 border-[#d42f7a] bg-white shadow-[0_30px_80px_rgba(93,23,54,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-income-modal-title"
      >
        <div className="flex items-center justify-between bg-primary px-5 py-5 text-white sm:px-6">
          <h2
            id="add-income-modal-title"
            className="text-[1.95rem] font-semibold tracking-tight sm:text-[2.1rem]"
          >
            Novo Lancamento
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/12"
          >
            <X size={28} strokeWidth={2.2} />
          </button>
        </div>

        <form
          className="space-y-7 px-7 py-8 sm:px-8 sm:py-9"
          onSubmit={(event) => {
            event.preventDefault();
            onClose();
          }}
        >
          <div>
            <FieldLabel>Nome do lancamento</FieldLabel>
            <FieldShell>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ex: Salario, Freela..."
                className="h-14 w-full rounded-[0.55rem] border-0 bg-transparent px-4 text-[1rem] text-foreground outline-none placeholder:text-[#8b8b98] sm:text-[1.05rem]"
              />
            </FieldShell>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Metodo de recebimento</FieldLabel>
              <FieldShell>
                <select
                  value={formState.method}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      method: event.target.value,
                    }))
                  }
                  className="h-14 w-full appearance-none rounded-[0.55rem] border-0 bg-transparent px-4 pr-12 text-[1rem] text-foreground outline-none sm:text-[1.05rem]"
                >
                  {incomeMethodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  size={20}
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
                />
              </FieldShell>
            </div>

            <div>
              <FieldLabel>Categoria</FieldLabel>
              <FieldShell>
                <select
                  value={formState.category}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="h-14 w-full appearance-none rounded-[0.55rem] border-0 bg-transparent px-4 pr-12 text-[1rem] text-foreground outline-none sm:text-[1.05rem]"
                >
                  {incomeCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  size={20}
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
                />
              </FieldShell>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <FieldLabel>Parcelas</FieldLabel>
              <FieldShell>
                <select
                  value={formState.installments}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      installments: event.target.value,
                    }))
                  }
                  className="h-14 w-full appearance-none rounded-[0.55rem] border-0 bg-transparent px-4 pr-12 text-[1rem] text-foreground outline-none sm:text-[1.05rem]"
                >
                  {installmentOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  size={20}
                  className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
                />
              </FieldShell>
            </div>

            <div>
              <FieldLabel>Valor</FieldLabel>
              <FieldShell className="flex items-center">
                <span className="pl-4 text-[1rem] font-medium text-muted sm:text-[1.05rem]">
                  R$
                </span>
                <input
                  value={formState.amount}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder="0,00"
                  inputMode="decimal"
                  className="h-14 w-full rounded-[0.55rem] border-0 bg-transparent px-2 pr-4 text-[1rem] text-foreground outline-none placeholder:text-[#8b8b98] sm:text-[1.05rem]"
                />
              </FieldShell>
            </div>

            <div>
              <FieldLabel>Data</FieldLabel>
              <FieldShell>
                <input
                  ref={dateInputRef}
                  value={formState.date}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  type="date"
                  lang="pt-BR"
                  aria-label="Selecionar data"
                  className="absolute inset-0 h-full w-full opacity-0"
                />
                <input
                  type="text"
                  readOnly
                  value={formState.date ? formState.date.split("-").reverse().join("/") : ""}
                  placeholder="dd/mm/aaaa"
                  className="h-14 w-full rounded-[0.55rem] border-0 bg-transparent px-4 pr-11 text-[1rem] text-foreground outline-none placeholder:text-[#8b8b98] sm:text-[1.05rem]"
                />
                <button
                  type="button"
                  onClick={handleDateIconClick}
                  aria-label="Abrir calendario"
                  className="absolute top-1/2 right-3 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition hover:bg-surface-soft"
                >
                  <CalendarDays aria-hidden size={18} />
                </button>
              </FieldShell>
            </div>
          </div>

          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="h-14 rounded-[0.5rem] border border-[#da4f8a] bg-white px-4 text-[1rem] font-semibold text-primary transition hover:bg-[#fff3f7]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-14 rounded-[0.5rem] bg-primary px-4 text-[1rem] font-semibold text-white transition hover:bg-primary-strong"
            >
              Salvar Lancamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
