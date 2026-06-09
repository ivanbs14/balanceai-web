"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { createCard } from "../api";

type AddCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onCreated: (cardName: string) => void;
};

type CardFormState = {
  name: string;
  invoiceDate: string;
  invoicePayment: string;
  limitBalance: string;
};

function createInitialFormState(): CardFormState {
  return {
    name: "",
    invoiceDate: "",
    invoicePayment: "",
    limitBalance: "",
  };
}

type FieldLabelProps = {
  children: string;
};

function FieldLabel({ children }: FieldLabelProps) {
  return (
    <label className="mb-1.5 block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary sm:mb-2 sm:text-[0.78rem] sm:tracking-[0.24em]">
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
        "relative rounded-[0.55rem] border border-border bg-surface-soft shadow-[0_0_0_1px_rgba(250,204,21,0.08)]",
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

export function AddCardModal({
  isOpen,
  onClose,
  userId,
  onCreated,
}: AddCardModalProps) {
  const [formState, setFormState] = useState<CardFormState>(() =>
    createInitialFormState(),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay px-4 py-8 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[650px] overflow-hidden rounded-[1rem] border-2 border-ring bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.38)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-card-modal-title"
      >
        <div className="flex items-center justify-between bg-ring px-3 py-3 text-white sm:px-6 sm:py-5">
          <h2
            id="add-card-modal-title"
            className="text-[1.25rem] font-semibold tracking-tight sm:text-[2.1rem]"
          >
            Novo Cartao
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/12 sm:h-10 sm:w-10"
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        <form
          className="space-y-3.5 px-3 py-3.5 sm:space-y-7 sm:px-8 sm:py-9"
          onSubmit={async (event) => {
            event.preventDefault();

            const name = formState.name.trim();
            const limitBalance = normalizeAmountInput(formState.limitBalance);

            if (!name) {
              setErrorMessage("Informe o nome do cartao.");
              return;
            }

            if (!formState.invoiceDate) {
              setErrorMessage("Informe a data de fechamento da fatura.");
              return;
            }

            if (!formState.invoicePayment) {
              setErrorMessage("Informe a data de pagamento da fatura.");
              return;
            }

            if (!limitBalance) {
              setErrorMessage("Informe um limite valido maior que zero.");
              return;
            }

            setIsSubmitting(true);
            setErrorMessage(null);

            try {
              await createCard({
                name,
                invoiceDate: formState.invoiceDate,
                invoicePayment: formState.invoicePayment,
                limitBalance,
                userId,
              });

              onCreated(name);
              onClose();
            } catch (error) {
              setErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Nao foi possivel cadastrar o cartao.",
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div>
            <FieldLabel>Nome do cartao</FieldLabel>
            <FieldShell>
              <input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ex: Nubank, Inter..."
                className="h-9 w-full rounded-[0.55rem] border-0 bg-transparent px-2 text-[0.74rem] text-foreground outline-none placeholder:text-muted/70 sm:h-14 sm:px-4 sm:text-[1.05rem]"
              />
            </FieldShell>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-5">
            <div>
              <FieldLabel>Fechamento da fatura</FieldLabel>
              <FieldShell>
                <input
                  value={formState.invoiceDate}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      invoiceDate: event.target.value,
                    }))
                  }
                  type="date"
                  lang="pt-BR"
                  className="h-9 w-full rounded-[0.55rem] border-0 bg-transparent px-2 text-[0.74rem] text-foreground outline-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                />
              </FieldShell>
            </div>

            <div>
              <FieldLabel>Pagamento da fatura</FieldLabel>
              <FieldShell>
                <input
                  value={formState.invoicePayment}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      invoicePayment: event.target.value,
                    }))
                  }
                  type="date"
                  lang="pt-BR"
                  className="h-9 w-full rounded-[0.55rem] border-0 bg-transparent px-2 text-[0.74rem] text-foreground outline-none sm:h-14 sm:px-4 sm:text-[1.05rem]"
                />
              </FieldShell>
            </div>
          </div>

          <div>
            <FieldLabel>Limite</FieldLabel>
            <FieldShell className="flex items-center">
              <span className="pl-2 text-[0.74rem] font-medium text-muted sm:pl-4 sm:text-[1.05rem]">
                R$
              </span>
              <input
                value={formState.limitBalance}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    limitBalance: event.target.value,
                  }))
                }
                placeholder="0,00"
                inputMode="decimal"
                className="h-9 w-full rounded-[0.55rem] border-0 bg-transparent px-1.5 pr-2 text-[0.74rem] text-foreground outline-none placeholder:text-muted/70 sm:h-14 sm:pr-4 sm:text-[1.05rem]"
              />
            </FieldShell>
          </div>

          {errorMessage ? (
            <div className="rounded-[0.5rem] border border-border bg-danger-soft px-2.5 py-2 text-[0.78rem] text-danger-foreground sm:px-4 sm:py-3 sm:text-sm">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-2 pt-0.5 sm:grid-cols-2 sm:gap-4 sm:pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 rounded-[0.5rem] border border-border-strong bg-surface-soft px-2.5 text-[0.88rem] font-semibold text-primary transition hover:bg-primary-soft sm:h-14 sm:px-4 sm:text-[1rem]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-[0.5rem] bg-ring px-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-primary-strong sm:h-14 sm:px-4 sm:text-[1rem]"
            >
              {isSubmitting ? "Salvando..." : "Salvar Cartao"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
