"use client";

import { useEffect } from "react";
import { Pencil, ReceiptText, X } from "lucide-react";
import type { ApiTransaction } from "../api-types";

type CardOpenTransactionsModalProps = {
  isOpen: boolean;
  cardName: string;
  transactions: ApiTransaction[];
  isLoading: boolean;
  errorMessage: string | null;
  editingTransactionIds: string[];
  onEditInstallmentGroup: (transaction: ApiTransaction) => void;
  onClose: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function parseAmount(value: ApiTransaction["amount"]) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : 0;

  return Number.isFinite(parsed) ? parsed : 0;
}

export function CardOpenTransactionsModal({
  isOpen,
  cardName,
  transactions,
  isLoading,
  errorMessage,
  editingTransactionIds,
  onEditInstallmentGroup,
  onClose,
}: CardOpenTransactionsModalProps) {
  useEffect(() => {
    if (!isOpen) {
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

  const totalAmount = transactions.reduce(
    (total, transaction) => total + parseAmount(transaction.amount),
    0,
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay px-4 py-8 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-[1rem] border-2 border-ring bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.38)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-open-transactions-modal-title"
      >
        <div className="flex items-center justify-between bg-ring px-3 py-3 text-white sm:px-6 sm:py-5">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 sm:h-11 sm:w-11">
              <ReceiptText size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <div>
              <h2
                id="card-open-transactions-modal-title"
                className="text-[1rem] font-semibold tracking-tight sm:text-[1.55rem]"
              >
                Transacoes abertas
              </h2>
              <p className="mt-0.5 text-[0.74rem] uppercase tracking-[0.18em] text-white/78 sm:text-[0.8rem]">
                {cardName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/12 sm:h-10 sm:w-10"
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        <div className="bg-[#efe5d1] px-3 py-3.5 sm:px-5 sm:py-5">
          <div className="mx-auto max-h-[70vh] overflow-y-auto border border-[#3c332b]/16 bg-[#fffaf1] px-4 py-4 text-[#2e241d] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:px-6 sm:py-6">
            <div className="border-b border-dashed border-[#3c332b]/30 pb-3 text-center font-mono">
              <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#6a5648]">
                Fatura em aberto
              </p>
              <p className="mt-1 text-[1.1rem] font-bold uppercase tracking-[0.08em]">
                {cardName}
              </p>
            </div>

            {isLoading ? (
              <div className="py-10 text-center font-mono text-[0.9rem] uppercase tracking-[0.18em] text-[#6a5648]">
                Carregando...
              </div>
            ) : errorMessage ? (
              <div className="py-8 text-center font-mono text-[0.92rem] leading-6 text-[#7a3128]">
                {errorMessage}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-10 text-center font-mono text-[0.9rem] uppercase tracking-[0.14em] text-[#6a5648]">
                Nenhuma transacao aberta neste cartao.
              </div>
            ) : (
              <>
                <div className="space-y-3 py-4 font-mono sm:space-y-3.5">
                  {transactions.map((transaction) => {
                    const amount = parseAmount(transaction.amount);
                    const installmentLabel = transaction.installmentInfo
                      ? `Parcela ${transaction.installmentInfo}`
                      : "Compra avulsa";
                    const canEditInstallmentGroup =
                      Boolean(transaction.installmentGroupId) &&
                      Number(transaction.installments ?? 0) > 1;
                    const isEditing = editingTransactionIds.includes(transaction.id);

                    return (
                      <div
                        key={transaction.id}
                        className="border-b border-dashed border-[#3c332b]/18 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between gap-4 text-[0.92rem] sm:text-[1.02rem]">
                          <p className="max-w-[60%] font-bold uppercase leading-5 tracking-[0.04em]">
                            {transaction.name}
                          </p>
                          <div className="flex items-center gap-3">
                            {canEditInstallmentGroup ? (
                              <button
                                type="button"
                                onClick={() => {
                                  onEditInstallmentGroup(transaction);
                                }}
                                disabled={isEditing}
                                aria-label={`Editar grupo parcelado de ${transaction.name}`}
                                title="Editar grupo parcelado"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#2e241d] transition hover:bg-[#e8dcc2] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Pencil size={16} strokeWidth={2} aria-hidden />
                              </button>
                            ) : null}
                            <p className="shrink-0 font-bold tabular-nums">
                              {formatCurrency(amount)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-4 text-[0.69rem] uppercase tracking-[0.12em] text-[#6a5648] sm:text-[0.76rem]">
                          <span>{installmentLabel}</span>
                          <span>{formatDate(transaction.Date)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-2 border-dashed border-[#2e241d]/35 pt-4 font-mono">
                  <div className="flex items-center justify-between text-[1rem] font-bold uppercase tracking-[0.08em] sm:text-[1.15rem]">
                    <span>Total</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <p className="mt-1 text-right text-[0.68rem] uppercase tracking-[0.16em] text-[#6a5648] sm:text-[0.74rem]">
                    {transactions.length} item(ns) em aberto
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
