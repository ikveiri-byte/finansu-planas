"use client";

import { CircleDollarSign, X } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatEur } from "@/lib/format";
import { deleteTransaction, restoreTransaction } from "@/lib/db";
import { useUndoRedo } from "@/lib/undoRedo";

type Props = {
  income: Transaction[];
  onChanged: () => void;
};

export default function IncomeChips({ income, onChanged }: Props) {
  const { pushAction } = useUndoRedo();
  if (income.length === 0) return null;
  const total = income.reduce((s, t) => s + t.amount, 0);

  async function handleDelete(t: Transaction) {
    await deleteTransaction(t);
    pushAction({
      label: `Ištrinta: ${t.description}`,
      undo: async () => restoreTransaction(t),
      redo: async () => deleteTransaction(t),
    });
    onChanged();
  }

  return (
    <div className="app-surface rounded-card px-4 py-3.5 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5" style={{ color: "var(--text)" }}>
          <CircleDollarSign size={16} strokeWidth={1.8} aria-hidden="true" />
          <span className="text-xs font-bold">Pajamų šaltiniai</span>
        </div>
        <span className="app-numeric text-xs font-bold" style={{ color: "var(--blue-700)" }}>
          {formatEur(total)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {income.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: "var(--line-soft)" }}
          >
            <span className="text-xs font-medium capitalize" style={{ color: "var(--text)" }}>
              {t.description}
            </span>
            <span className="app-numeric text-xs font-bold" style={{ color: "var(--navy-800)" }}>
              {formatEur(t.amount)}
            </span>
            <button
              onClick={() => handleDelete(t)}
              aria-label={`Ištrinti pajamą ${t.description}`}
              className="flex items-center justify-center app-focusable"
              style={{ width: 20, height: 20, borderRadius: 999, color: "var(--muted)" }}
            >
              <X size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
