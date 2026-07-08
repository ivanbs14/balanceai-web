"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

type DeleteTransactionModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  transactionLabel: string;
  title?: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteTransactionModal({
  isOpen,
  isSubmitting,
  transactionLabel,
  title = "Confirmar exclusao",
  description,
  confirmLabel = "Deletar",
  onClose,
  onConfirm,
}: DeleteTransactionModalProps) {
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

  if (!isOpen) {
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
        aria-labelledby="delete-transaction-modal-title"
      >
        <div className="flex items-center justify-between bg-ring px-3 py-3 text-white sm:px-6 sm:py-5">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 sm:h-11 sm:w-11">
              <AlertTriangle size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <h2
              id="delete-transaction-modal-title"
              className="text-[1rem] font-semibold tracking-tight sm:text-[1.6rem]"
            >
              {title}
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

        <div className="space-y-3 px-3 py-3.5 sm:space-y-5 sm:px-8 sm:py-9">
          <div className="rounded-[0.8rem] border border-border bg-surface-soft px-2.5 py-2.5 text-[0.8rem] leading-4.5 text-muted sm:px-4 sm:py-4 sm:text-[0.98rem] sm:leading-6">
            <p className="font-semibold text-foreground">{transactionLabel}</p>
            <p className="mt-1 sm:mt-2">{description}</p>
          </div>

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
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1 rounded-[0.7rem] bg-ring px-3 py-2 text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.16em]"
            >
              <Trash2 size={14} strokeWidth={2.1} aria-hidden />
              <span>{isSubmitting ? "Confirmando..." : confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
