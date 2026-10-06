"use client";

import { useState } from "react";
import { linkFixedCostMonthly } from "../api";
import type { MonthlyExpenseItem } from "../types";

type Props = {
  fixedCost: MonthlyExpenseItem;
  candidates: MonthlyExpenseItem[];
  onClose: () => void;
  onLinked: () => void;
};

export function LinkFixedCostModal({ fixedCost, candidates, onClose, onLinked }: Props) {
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" role="presentation" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-surface p-6 text-foreground shadow-xl" role="dialog" aria-modal="true" aria-labelledby="link-fixed-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="link-fixed-title" className="text-xl font-semibold">Vincular pagamento de {fixedCost.name}</h2>
        <p className="mt-2 text-sm text-muted">Escolha uma despesa desta competência que representa o mesmo pagamento. Depois do vínculo, só a transação entra nos totais.</p>
        <label className="mt-5 block text-sm font-medium" htmlFor="link-transaction">Transação</label>
        <select id="link-transaction" className="mt-2 w-full rounded-lg border border-ring bg-surface p-3" value={transactionId} onChange={(event) => setTransactionId(event.target.value)}>
          <option value="">Selecione a transação</option>
          {candidates.map((candidate) => <option key={candidate.id} value={candidate.sourceId}>{candidate.name} · R$ {candidate.amount.toFixed(2)}</option>)}
        </select>
        {error ? <p role="alert" className="mt-3 text-sm text-danger-foreground">{error}</p> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-ring px-4 py-2">Cancelar</button>
          <button type="button" disabled={!transactionId || saving} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50" onClick={async () => {
            setSaving(true);
            setError(null);
            try {
              await linkFixedCostMonthly({ fixedCostId: fixedCost.sourceId, monthId: fixedCost.competence!, transactionId });
              onLinked();
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Não foi possível vincular.");
            } finally {
              setSaving(false);
            }
          }}>Vincular</button>
        </div>
      </div>
    </div>
  );
}
