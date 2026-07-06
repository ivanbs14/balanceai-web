"use client";

import { useEffect } from "react";
import { List, Pencil, Trash2, X } from "lucide-react";
import type { IncomeTransactionItem } from "../types";

type IncomeTransactionsModalProps = {
  isOpen: boolean;
  monthLabel: string;
  transactions: IncomeTransactionItem[];
  editingTransactionIds: string[];
  deletingTransactionIds: string[];
  onEdit: (transaction: IncomeTransactionItem) => void;
  onDelete: (transaction: IncomeTransactionItem) => void;
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

export function IncomeTransactionsModal({
  isOpen,
  monthLabel,
  transactions,
  editingTransactionIds,
  deletingTransactionIds,
  onEdit,
  onDelete,
  onClose,
}: IncomeTransactionsModalProps) {
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

  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-overlay px-4 py-8 backdrop-blur-[3px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[960px] overflow-hidden rounded-[1rem] border-2 border-ring bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.38)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="income-transactions-modal-title"
      >
        <div className="flex items-center justify-between bg-ring px-3 py-3 text-white sm:px-6 sm:py-5">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 sm:h-11 sm:w-11">
              <List size={18} strokeWidth={2.2} aria-hidden />
            </span>
            <div>
              <h2
                id="income-transactions-modal-title"
                className="text-[1rem] font-semibold tracking-tight sm:text-[1.55rem]"
              >
                Entradas do mes
              </h2>
              <p className="mt-0.5 text-[0.74rem] uppercase tracking-[0.18em] text-white/78 sm:text-[0.8rem]">
                {monthLabel}
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

        <div className="px-3 py-3.5 sm:px-6 sm:py-6">
          {transactions.length === 0 ? (
            <div className="rounded-[0.8rem] border border-dashed border-border bg-surface-soft px-4 py-10 text-center text-sm text-muted">
              Nenhuma entrada encontrada para {monthLabel}.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-[0.8rem] border border-border">
                <div
                  className="grid min-w-[720px] bg-surface-soft font-mono text-[0.65rem] uppercase tracking-[0.18em] text-primary"
                  style={{ gridTemplateColumns: "minmax(180px, 1.7fr) 108px 148px 120px 112px" }}
                >
                  <div className="border-b border-border px-4 py-3">Nome</div>
                  <div className="border-b border-border px-4 py-3">Data</div>
                  <div className="border-b border-border px-4 py-3">Metodo</div>
                  <div className="border-b border-border px-4 py-3 text-right">Valor</div>
                  <div className="border-b border-border px-4 py-3 text-center">Acoes</div>
                </div>

                {transactions.map((transaction) => {
                  const isEditing = editingTransactionIds.includes(transaction.id);
                  const isDeleting = deletingTransactionIds.includes(transaction.id);

                  return (
                    <div
                      key={transaction.id}
                      className="grid min-w-[720px] border-b border-border last:border-b-0"
                      style={{ gridTemplateColumns: "minmax(180px, 1.7fr) 108px 148px 120px 112px" }}
                    >
                      <div className="px-4 py-3 text-sm text-foreground">{transaction.name}</div>
                      <div className="px-4 py-3 text-sm text-foreground">
                        {formatDate(transaction.date)}
                      </div>
                      <div className="px-4 py-3 text-sm text-foreground">
                        {transaction.paymentMethod}
                      </div>
                      <div className="px-4 py-3 text-right text-sm font-medium text-primary">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="px-4 py-3">
                        <div className="inline-flex w-full items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onEdit(transaction);
                            }}
                            disabled={isEditing || isDeleting}
                            aria-label={`Editar ${transaction.name}`}
                            title="Editar transacao"
                            className="inline-flex items-center justify-center text-primary transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Pencil size={16} strokeWidth={2} aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDelete(transaction);
                            }}
                            disabled={isEditing || isDeleting}
                            aria-label={`Deletar ${transaction.name}`}
                            title="Deletar transacao"
                            className="inline-flex items-center justify-center text-primary transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 size={16} strokeWidth={2} aria-hidden />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-col gap-2 rounded-[0.8rem] border border-border bg-surface-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                    Total de entradas
                  </p>
                  <p className="mt-1 text-[1rem] font-semibold text-primary sm:text-[1.1rem]">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-muted">
                  {transactions.length} item(ns)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
