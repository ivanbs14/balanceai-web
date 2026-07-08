"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import type { RecurringFixedCostEditSeed } from "../types";

type EditRecurringFixedCostModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  fixedCost: RecurringFixedCostEditSeed | null;
  onClose: () => void;
  onConfirm: (payload: {
    fixedCostId: string;
    name: string;
    defaultAmount: string;
    dueDay: number;
    competence: string | null;
    paymentStatus: "paid" | "pending";
    deactivateRecurring: boolean;
  }) => void;
};

type FormState = {
  name: string;
  amount: string;
  dueDay: string;
  deactivateRecurring: boolean;
};

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

function formatAmountInput(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function EditRecurringFixedCostModal({
  isOpen,
  isSubmitting,
  fixedCost,
  onClose,
  onConfirm,
}: EditRecurringFixedCostModalProps) {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    amount: "",
    dueDay: "",
    deactivateRecurring: false,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !fixedCost) {
      setFormState({
        name: "",
        amount: "",
        dueDay: "",
        deactivateRecurring: false,
      });
      setErrorMessage(null);
      return;
    }

    setFormState({
      name: fixedCost.name,
      amount: formatAmountInput(fixedCost.amount),
      dueDay: fixedCost.dueDay ? String(fixedCost.dueDay) : "",
      deactivateRecurring: false,
    });
    setErrorMessage(null);
  }, [fixedCost, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !fixedCost) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay px-4 py-8 backdrop-blur-[3px]"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-[1rem] border-2 border-ring bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.38)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-recurring-fixed-cost-modal-title"
      >
        <div className="flex items-center justify-between bg-ring px-3 py-3 text-white sm:px-6 sm:py-5">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 sm:h-11 sm:w-11">
              <Pencil size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <h2
              id="edit-recurring-fixed-cost-modal-title"
              className="text-[1rem] font-semibold tracking-tight sm:text-[1.6rem]"
            >
              Editar recorrencia
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            disabled={isSubmitting}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        <form
          className="space-y-4 px-3 py-3.5 sm:space-y-6 sm:px-8 sm:py-9"
          onSubmit={(event) => {
            event.preventDefault();

            const name = formState.name.trim();
            const defaultAmount = normalizeAmountInput(formState.amount);
            const dueDay = Number.parseInt(formState.dueDay, 10);

            if (!name) {
              setErrorMessage("Informe o nome da recorrencia.");
              return;
            }

            if (!defaultAmount) {
              setErrorMessage("Informe um valor valido maior que zero.");
              return;
            }

            if (!Number.isFinite(dueDay) || dueDay < 1 || dueDay > 31) {
              setErrorMessage("Informe um dia de vencimento entre 1 e 31.");
              return;
            }

            setErrorMessage(null);
            onConfirm({
              fixedCostId: fixedCost.fixedCostId,
              name,
              defaultAmount,
              dueDay,
              competence: fixedCost.competence,
              paymentStatus: fixedCost.paymentStatus,
              deactivateRecurring: formState.deactivateRecurring,
            });
          }}
        >
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[0.78rem] sm:tracking-[0.24em]">
              Nome
            </label>
            <input
              type="text"
              value={formState.name}
              onChange={(event) => {
                setFormState((current) => ({ ...current, name: event.target.value }));
              }}
              disabled={isSubmitting}
              className="w-full rounded-[0.55rem] border border-border bg-surface-soft px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:text-base"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[0.78rem] sm:tracking-[0.24em]">
              Valor
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={formState.amount}
              onChange={(event) => {
                setFormState((current) => ({ ...current, amount: event.target.value }));
              }}
              disabled={isSubmitting}
              className="w-full rounded-[0.55rem] border border-border bg-surface-soft px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:text-base"
              placeholder="0,00"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[0.78rem] sm:tracking-[0.24em]">
              Dia de vencimento
            </label>
            <input
              type="number"
              min={1}
              max={31}
              value={formState.dueDay}
              onChange={(event) => {
                setFormState((current) => ({ ...current, dueDay: event.target.value }));
              }}
              disabled={isSubmitting}
              className="w-full rounded-[0.55rem] border border-border bg-surface-soft px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:text-base"
            />
          </div>

          <label className="flex items-start gap-3 rounded-[0.75rem] border border-border bg-surface-soft px-3 py-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={formState.deactivateRecurring}
              onChange={(event) => {
                setFormState((current) => ({
                  ...current,
                  deactivateRecurring: event.target.checked,
                }));
              }}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
            />
            <span>
              Desativar recorrencia e manter apenas as competencias anteriores ja pagas.
            </span>
          </label>

          {errorMessage ? (
            <div className="rounded-[0.7rem] border border-ring/25 bg-danger-soft px-3 py-2 text-sm text-danger-foreground">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-[0.7rem] border border-border px-3 py-2 text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.16em]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1 rounded-[0.7rem] bg-ring px-3 py-2 text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.16em]"
            >
              <Pencil size={14} strokeWidth={2.1} aria-hidden />
              <span>{isSubmitting ? "Salvando..." : "Salvar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
