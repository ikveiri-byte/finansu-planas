"use client";

import { useState } from "react";
import { Plus, X, CircleAlert } from "lucide-react";
import type { ExpenseCategory, Transaction } from "@/lib/types";
import { formatEur, formatShortDate } from "@/lib/format";
import { addExpense, deleteTransaction, restoreTransaction } from "@/lib/db";
import { useUndoRedo } from "@/lib/undoRedo";
import CategoryIcon from "./CategoryIcon";

type Props = {
  category: ExpenseCategory;
  transactions: Transaction[];
  year: number;
  month: number;
  onClose: () => void;
  onChanged: () => void;
};

export default function CategoryModal({ category, transactions, year, month, onClose, onChanged }: Props) {
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

  const inputStyle = {
    border: "1.5px solid var(--line)",
    borderRadius: "var(--radius-control)",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    minHeight: 48,
    color: "var(--text)",
    background: "var(--surface-strong)",
  } as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(5, 22, 60, 0.55)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[500px] overflow-y-auto bg-surface-strong"
        style={{
          borderRadius: "var(--radius-panel) var(--radius-panel) 0 0",
          padding: "20px 20px calc(28px + env(safe-area-inset-bottom))",
          maxHeight: "88vh",
        }}
      >
        <div className="w-9 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--line)" }} />
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span
              className="flex items-center justify-center flex-shrink-0 rounded-full"
              style={{ width: 34, height: 34, background: "var(--line-soft)", color: "var(--blue-700)" }}
            >
              <CategoryIcon category={category} size={18} />
            </span>
            <span className="text-[18px] font-bold" style={{ color: "var(--text)" }}>{category}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Uždaryti"
            className="rounded-full flex items-center justify-center app-focusable"
            style={{ width: 34, height: 34, background: "var(--line-soft)", color: "var(--navy-900)" }}
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
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
            aria-label="Naujo įrašo pavadinimas"
          />
          <input
            placeholder="€"
            inputMode="decimal"
            value={newAmt}
            onChange={(e) => setNewAmt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && handleAdd()}
            className="w-[76px] text-right app-numeric"
            style={inputStyle}
            aria-label="Suma"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            aria-label="Pridėti įrašą"
            className="text-white rounded-control flex items-center justify-center disabled:opacity-50 app-focusable flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--blue-700), var(--blue-500))", width: 48, height: 48 }}
          >
            <Plus size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <p className="flex items-start gap-1.5 text-sm mb-3 rounded-control px-3 py-2.5" style={{ color: "var(--danger)", background: "var(--danger-soft)" }}>
            <CircleAlert size={16} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="flex justify-between items-baseline mb-3">
          <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>Iš viso</span>
          <span className="app-numeric text-base font-bold" style={{ color: "var(--blue-700)" }}>{formatEur(total)}</span>
        </div>

        <ul className="flex flex-col gap-2">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-control"
              style={{ background: "var(--line-soft)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text)" }}>{t.description}</p>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="text-xs" style={{ color: "var(--muted)" }}>{formatShortDate(t.txn_date)}</span>
                <span className="app-numeric text-sm font-bold" style={{ color: "var(--navy-800)" }}>{formatEur(t.amount)}</span>
                <button
                  onClick={() => handleDelete(t)}
                  aria-label={`Ištrinti ${t.description}`}
                  className="rounded-full flex items-center justify-center app-focusable"
                  style={{ width: 26, height: 26, background: "var(--surface-strong)", color: "var(--muted)" }}
                >
                  <X size={13} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
          {transactions.length === 0 && <p className="text-sm py-4" style={{ color: "var(--muted)" }}>Šią kategoriją dar tuščia.</p>}
        </ul>
      </div>
    </div>
  );
}
