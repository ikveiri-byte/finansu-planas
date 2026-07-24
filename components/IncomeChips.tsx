"use client";

import type { Transaction } from "@/lib/types";
import { formatEur } from "@/lib/format";
import { deleteTransaction, restoreTransaction } from "@/lib/db";
import { useUndoRedo } from "@/lib/undoRedo";

type Props = {
  income: Transaction[];
  accent: string;
  dark: string;
  light: string;
  onChanged: () => void;
};

export default function IncomeChips({ income, accent, dark, light, onChanged }: Props) {
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
    <div className="rounded-2xl bg-white px-3.5 py-3 mb-3.5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[15px]">💰</span>
          <span className="text-xs font-bold text-[#374151]">Pajamų šaltiniai</span>
        </div>
        <span className="text-xs font-bold" style={{ color: accent }}>
          {formatEur(total)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {income.map((t) => (
          <div key={t.id} className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: light }}>
            <span className="text-xs font-medium text-[#374151] capitalize">{t.description}</span>
            <span className="text-xs font-bold" style={{ color: dark }}>
              {formatEur(t.amount)}
            </span>
            <button onClick={() => handleDelete(t)} aria-label="Ištrinti" className="text-[#d1d5db] text-xs leading-none">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
