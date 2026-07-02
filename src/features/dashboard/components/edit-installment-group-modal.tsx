"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Pencil, X } from "lucide-react";
import {
  getCardsByUserId,
  type ApiInstallmentGroupPaymentMethod,
} from "../api";
import type { ApiCardItem } from "../api-types";
import type { InstallmentGroupEditSeed } from "../types";

type EditInstallmentGroupModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  userId: string;
  group: InstallmentGroupEditSeed | null;
  onClose: () => void;
  onConfirm: (payload: {
    transationId: string;
    name: string;
    amount: string;
    Date: string;
    installments: number;
    paymentMethod: ApiInstallmentGroupPaymentMethod;
    cardId?: string;
  }) => void;
};

type FormState = {
  name: string;
  amount: string;
  Date: string;
  installments: string;
  paymentMethod: ApiInstallmentGroupPaymentMethod;
  cardId: string;
};

const paymentMethodOptions: Array<{
  value: ApiInstallmentGroupPaymentMethod;
  label: string;
}> = [
  { value: "PIX", label: "Pix" },
  { value: "CREDIT_CARD", label: "Cartao de Credito" },
];

function createEmptyFormState(): FormState {
  return {
    name: "",
    amount: "",
    Date: "",
    installments: "2",
    paymentMethod: "PIX",
    cardId: "",
  };
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

function formatAmountInput(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function resolveInitialFormState(group: InstallmentGroupEditSeed): FormState {
  return {
    name: group.name,
    amount: formatAmountInput(group.totalAmount),
    Date: group.startDate,
    installments: `${group.installments}`,
    paymentMethod: group.paymentMethod,
    cardId: group.cardId ?? "",
  };
}

export function EditInstallmentGroupModal({
  isOpen,
  isSubmitting,
  userId,
  group,
  onClose,
  onConfirm,
}: EditInstallmentGroupModalProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState<FormState>(() => createEmptyFormState());
  const [cards, setCards] = useState<ApiCardItem[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [cardsErrorMessage, setCardsErrorMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isCreditCard = formState.paymentMethod === "CREDIT_CARD";

  useEffect(() => {
    if (!isOpen || !group) {
      setFormState(createEmptyFormState());
      setCards([]);
      setIsLoadingCards(false);
      setCardsErrorMessage(null);
      setErrorMessage(null);
      return;
    }

    setFormState(resolveInitialFormState(group));
    setErrorMessage(null);
  }, [group, isOpen]);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;
    setIsLoadingCards(true);
    setCardsErrorMessage(null);

    getCardsByUserId(userId)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const nextCards = response.data ?? [];
        setCards(nextCards);
        setFormState((current) => ({
          ...current,
          cardId:
            current.cardId && nextCards.some((card) => card.id === current.cardId)
              ? current.cardId
              : nextCards[0]?.id ?? "",
        }));
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setCards([]);
        setCardsErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os cartoes.",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCards(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId]);

  if (!isOpen || !group) {
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
        className="w-full max-w-[620px] overflow-hidden rounded-[1rem] border-2 border-ring bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.38)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-installment-group-modal-title"
      >
        <div className="flex items-center justify-between bg-ring px-3 py-3 text-white sm:px-6 sm:py-5">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 sm:h-11 sm:w-11">
              <Pencil size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <div>
              <h2
                id="edit-installment-group-modal-title"
                className="text-[1rem] font-semibold tracking-tight sm:text-[1.6rem]"
              >
                Editar grupo parcelado
              </h2>
              <p className="mt-0.5 text-[0.72rem] uppercase tracking-[0.16em] text-white/78 sm:text-[0.8rem]">
                Atualiza todas as parcelas, inclusive as pagas
              </p>
            </div>
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
            const amount = normalizeAmountInput(formState.amount);
            const installments = Number.parseInt(formState.installments, 10);

            if (!name) {
              setErrorMessage("Informe o nome da compra.");
              return;
            }

            if (!amount) {
              setErrorMessage("Informe um valor total valido maior que zero.");
              return;
            }

            if (!formState.Date) {
              setErrorMessage("Informe a data inicial da compra.");
              return;
            }

            if (!Number.isFinite(installments) || installments < 2) {
              setErrorMessage("Informe uma quantidade de parcelas maior ou igual a 2.");
              return;
            }

            if (isCreditCard && !formState.cardId) {
              setErrorMessage("Selecione o cartao para compras no credito.");
              return;
            }

            setErrorMessage(null);
            onConfirm({
              transationId: group.transactionId,
              name,
              amount,
              Date: formState.Date,
              installments,
              paymentMethod: formState.paymentMethod,
              ...(isCreditCard ? { cardId: formState.cardId } : {}),
            });
          }}
        >
          <div className="rounded-[0.8rem] border border-border bg-primary-soft/50 px-4 py-3 text-sm text-primary-strong">
            Esta alteracao recalcula o grupo inteiro a partir da data inicial informada.
          </div>

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
              placeholder="Ex.: Notebook"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[0.78rem] sm:tracking-[0.24em]">
                Valor total
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
                Parcelas
              </label>
              <input
                type="number"
                min={2}
                step={1}
                value={formState.installments}
                onChange={(event) => {
                  setFormState((current) => ({
                    ...current,
                    installments: event.target.value,
                  }));
                }}
                disabled={isSubmitting}
                className="w-full rounded-[0.55rem] border border-border bg-surface-soft px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:text-base"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[0.78rem] sm:tracking-[0.24em]">
                Data inicial
              </label>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={formState.Date}
                  onChange={(event) => {
                    setFormState((current) => ({ ...current, Date: event.target.value }));
                  }}
                  disabled={isSubmitting}
                  className="w-full appearance-none rounded-[0.55rem] border border-border bg-surface-soft px-3 py-2.5 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = dateInputRef.current;

                    if (!input || isSubmitting) {
                      return;
                    }

                    input.focus();

                    if ("showPicker" in HTMLInputElement.prototype) {
                      input.showPicker();
                    }
                  }}
                  disabled={isSubmitting}
                  aria-label="Abrir seletor de data"
                  className="absolute inset-y-0 right-0 inline-flex items-center justify-center px-3 text-primary transition hover:text-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CalendarDays size={18} strokeWidth={2.1} aria-hidden />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[0.78rem] sm:tracking-[0.24em]">
                Metodo de pagamento
              </label>
              <div className="relative">
                <select
                  value={formState.paymentMethod}
                  onChange={(event) => {
                    const nextMethod = event.target
                      .value as ApiInstallmentGroupPaymentMethod;

                    setFormState((current) => ({
                      ...current,
                      paymentMethod: nextMethod,
                      cardId:
                        nextMethod === "CREDIT_CARD"
                          ? current.cardId || cards[0]?.id || ""
                          : "",
                    }));
                  }}
                  disabled={isSubmitting}
                  className="w-full appearance-none rounded-[0.55rem] border border-border bg-surface-soft px-3 py-2.5 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
                >
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 inline-flex items-center justify-center px-3 text-primary">
                  <ChevronDown size={18} strokeWidth={2.1} aria-hidden />
                </span>
              </div>
            </div>
          </div>

          {isCreditCard ? (
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary sm:text-[0.78rem] sm:tracking-[0.24em]">
                Cartao
              </label>
              <div className="relative">
                <select
                  value={formState.cardId}
                  onChange={(event) => {
                    setFormState((current) => ({ ...current, cardId: event.target.value }));
                  }}
                  disabled={isSubmitting || isLoadingCards || cards.length === 0}
                  className="w-full appearance-none rounded-[0.55rem] border border-border bg-surface-soft px-3 py-2.5 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-3 sm:pr-12 sm:text-base"
                >
                  {cards.length === 0 ? (
                    <option value="">
                      {isLoadingCards ? "Carregando cartoes..." : "Nenhum cartao disponivel"}
                    </option>
                  ) : null}
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 inline-flex items-center justify-center px-3 text-primary">
                  <ChevronDown size={18} strokeWidth={2.1} aria-hidden />
                </span>
              </div>
              {cardsErrorMessage ? (
                <p className="text-sm text-danger-foreground">{cardsErrorMessage}</p>
              ) : null}
            </div>
          ) : null}

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
              disabled={isSubmitting || (isCreditCard && cards.length === 0)}
              className="inline-flex items-center justify-center gap-1 rounded-[0.7rem] bg-ring px-3 py-2 text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.16em]"
            >
              <Pencil size={14} strokeWidth={2.1} aria-hidden />
              <span>{isSubmitting ? "Salvando..." : "Salvar grupo"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
