"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import {
  createTransation,
  type ApiTransationCategory,
  type ApiTransationPaymentMethod,
} from "../api";

type AddIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  fallbackMonthId: string | null;
  onCreated: () => void;
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

function normalizeAmountInput(value: string) {
  const sanitized = value.replace(/\s/g, "");

  if (!sanitized) {
    return null;
  }

  const normalized = sanitized.replace(/\./g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed.toFixed(2);
}

function resolveDate(value: string, fallbackMonthId: string | null) {
  if (value) {
    return value;
  }

  if (fallbackMonthId) {
    return `${fallbackMonthId}-01`;
  }

  return new Date().toISOString().slice(0, 10);
}

function mapIncomeMethodToApi(method: string): ApiTransationPaymentMethod {
  switch (method) {
    case "Pix":
      return "PIX";
    case "Transferencia":
      return "Bank_Transfer";
    case "Deposito":
      return "CASH";
    case "Dinheiro":
      return "CASH";
    default:
      return "OTHER";
  }
}

function mapIncomeCategoryToApi(category: string): ApiTransationCategory {
  switch (category) {
    case "Salario":
      return "SALARY";
    default:
      return "OTHER";
  }
}

export function AddIncomeModal({
  isOpen,
  onClose,
  userId,
  fallbackMonthId,
  onCreated,
}: AddIncomeModalProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState<IncomeFormState>(() =>
    createInitialFormState(),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setErrorMessage(null);
      setIsSubmitting(false);
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
          onSubmit={async (event) => {
            event.preventDefault();

            const amount = normalizeAmountInput(formState.amount);
            const name = formState.name.trim();

            if (!name) {
              setErrorMessage("Informe o nome do lancamento.");
              return;
            }

            if (!amount) {
              setErrorMessage("Informe um valor valido maior que zero.");
              return;
            }

            setIsSubmitting(true);
            setErrorMessage(null);

            try {
              await createTransation({
                userId,
                name,
                type: "DEPOSIT",
                amount,
                category: mapIncomeCategoryToApi(formState.category),
                paymentMethod: mapIncomeMethodToApi(formState.method),
                installments: 1,
                Date: resolveDate(formState.date, fallbackMonthId),
              });

              onCreated();
              onClose();
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Nao foi possivel salvar o lancamento.",
              );
            } finally {
              setIsSubmitting(false);
            }
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

          {errorMessage ? (
            <div className="rounded-[0.5rem] border border-[#efc2d4] bg-[#fff5f8] px-4 py-3 text-sm text-[#9a3b65]">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-14 rounded-[0.5rem] border border-[#da4f8a] bg-white px-4 text-[1rem] font-semibold text-primary transition hover:bg-[#fff3f7]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-14 rounded-[0.5rem] bg-primary px-4 text-[1rem] font-semibold text-white transition hover:bg-primary-strong"
            >
              {isSubmitting ? "Salvando..." : "Salvar Lancamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
