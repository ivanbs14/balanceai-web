"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

type DeleteTransactionModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  transactionLabel: string;
  isInstallmentPurchase: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteTransactionModal({
  isOpen,
  isSubmitting,
  transactionLabel,
  isInstallmentPurchase,
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#79435d]/24 px-4 py-8 backdrop-blur-[3px]"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="w-full max-w-[560px] overflow-hidden rounded-[1rem] border-2 border-[#d42f7a] bg-white shadow-[0_30px_80px_rgba(93,23,54,0.18)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-transaction-modal-title"
      >
        <div className="flex items-center justify-between bg-primary px-5 py-5 text-white sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/12">
              <AlertTriangle size={22} strokeWidth={2.2} aria-hidden />
            </span>
            <h2
              id="delete-transaction-modal-title"
              className="text-[1.45rem] font-semibold tracking-tight sm:text-[1.6rem]"
            >
              Confirmar exclusao
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={26} strokeWidth={2.2} />
          </button>
        </div>

        <div className="space-y-5 px-7 py-8 sm:px-8 sm:py-9">
          <div className="rounded-[0.8rem] border border-[#f0cade] bg-[#fff7fb] px-4 py-4 text-sm leading-6 text-[#6f4256] sm:text-[0.98rem]">
            <p className="font-semibold text-[#7f1f4d]">{transactionLabel}</p>
            <p className="mt-2">
              {isInstallmentPurchase
                ? "As parcelas ja pagas serao mantidas no historico. Apenas as parcelas em aberto serao deletadas."
                : "Esta transacao sera deletada permanentemente."}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-[0.7rem] border border-[#e8bfd4] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#8a486f] transition hover:bg-[#fff5fa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-[0.7rem] bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={16} strokeWidth={2.1} aria-hidden />
              <span>{isSubmitting ? "Deletando..." : "Deletar"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
