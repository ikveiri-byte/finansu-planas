"use client";

import { useState } from "react";
import type { ExpenseCategory, Transaction } from "@/lib/types";
import { formatEur, formatShortDate } from "@/lib/format";
import { addExpense, deleteTransaction, restoreTransaction } from "@/lib/db";
import { useUndoRedo } from "@/lib/undoRedo";

type Props = {
  category: ExpenseCategory;
  transactions: Transaction[];
  accent: string;
  light: string;
  year: number;
  month: number;
  onClose: () => void;
  onChanged: () => void;
};

export default function CategoryModal({ category, transactions, accent, light, year, month, onClose, onChanged }: Props) {
  const { pushAction } = useUndoRedo();
  const [newName, setNewName] = useState("");
  const [newAmt, setNewAmt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = transactions.reduce((s, t) => s + t.amount, 0);

  async function handleAdd() {
    const amt = parseFloat(newAmt.replace(",", "."));
    if (!newName.trim() || isNaN(amt) || amt <= 0) return;
    setSaving(true);
    setError(null);
    try {
      const created = await Promise.race([
        addExpense({
          description: newName.trim(),
          category,
          amount: amt,
          year,
          month,
          txn_date: new Date().toISOString().slice(0, 10),
          isFixed: false,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Užklausa užtruko per ilgai. Patikrink interneto ryšį.")), 12000)
        ),
      ]);
      pushAction({
        label: `Pridėta: ${newName.trim()}`,
        undo: async () => deleteTransaction(created),
        redo: async () => restoreTransaction(created),
      });
      setNewName("");
      setNewAmt("");
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepavyko išsaugoti. Bandyk dar kartą.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: Transaction) {
    await deleteTransaction(t);
    pushAction({
      label: `Ištrinta: ${t.description}`,
      undo: async () => restoreTransaction(t),
      redo: async () => deleteTransaction(t),
    });
    onChanged();
  }

  const inputStyle = { border: `1.5px solid ${light}`, borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none" } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[500px] overflow-y-auto"
        style={{ borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", maxHeight: "85vh" }}
      >
        <div className="w-9 h-1 bg-[#e5e7eb] rounded-full mx-auto mb-3.5" />
        <div className="flex justify-between items-center mb-3.5">
          <span className="text-[17px] font-bold text-[#111]">{category}</span>
          <button
            onClick={onClose}
            aria-label="Uždaryti"
            className="w-[30px] h-[30px] rounded-full bg-[#f3f4f6] flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            placeholder="Pavadinimas"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newAmt && handleAdd()}
            className="flex-1 min-w-0"
            style={inputStyle}
          />
          <input
            placeholder="€"
            inputMode="decimal"
            value={newAmt}
            onChange={(e) => setNewAmt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && handleAdd()}
            className="w-[72px] text-right"
            style={inputStyle}
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="text-white rounded-xl px-3.5 text-lg disabled:opacity-50"
            style={{ background: accent }}
          >
            +
          </button>
        </div>

        {error && (
          <p className="text-sm mb-3" style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        <div className="flex justify-between items-baseline mb-3">
          <span className="text-sm text-muted">Iš viso</span>
          <span className="text-base font-bold" style={{ color: accent }}>{formatEur(total)}</span>
        </div>

        <ul>
          {transactions.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2 border-t border-[#f9fafb] first:border-0">
              <div>
                <p className="text-sm text-[#374151]">{t.description}</p>
                <p className="text-xs text-muted">{formatShortDate(t.txn_date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#374151]">{formatEur(t.amount)}</span>
                <button onClick={() => handleDelete(t)} aria-label="Ištrinti" className="text-[#d1d5db] text-base">
                  ✕
                </button>
              </div>
            </li>
          ))}
          {transactions.length === 0 && <p className="text-muted text-sm py-4">Šią kategoriją dar tuščia.</p>}
        </ul>
      </div>
    </div>
  );
}
