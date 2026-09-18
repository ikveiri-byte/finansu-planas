"use client";

import { useState } from "react";
import { CircleAlert, Plus, X } from "lucide-react";
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

const FIELD =
  "app-focusable min-h-[48px] rounded-control border border-line bg-sunken-2 px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-3";

export default function CategoryModal({
  category,
  transactions,
  year,
  month,
  onClose,
  onChanged,
}: Props) {
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
          setTimeout(
            () => reject(new Error("Užklausa užtruko per ilgai. Patikrink interneto ryšį.")),
            12000
          )
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center lg:items-center lg:p-6"
      style={{ background: "rgba(43, 37, 32, 0.45)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={category}
        className="max-h-[88vh] w-full max-w-[500px] overflow-y-auto rounded-t-panel bg-card px-5 lg:max-w-[600px] lg:rounded-panel"
        style={{ paddingTop: 20, paddingBottom: "calc(28px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line lg:hidden" />

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="app-accent-tint flex h-9 w-9 items-center justify-center rounded-[12px]">
              <CategoryIcon category={category} size={18} />
            </span>
            <h2 className="app-display text-[19px]">{category}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti"
            className="app-focusable flex h-9 w-9 items-center justify-center rounded-[12px] bg-sunken text-ink-2"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            placeholder="Pavadinimas"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newAmt && handleAdd()}
            aria-label="Naujo įrašo pavadinimas"
            className={`${FIELD} min-w-0 flex-1`}
          />
          <input
            placeholder="€"
            inputMode="decimal"
            value={newAmt}
            onChange={(e) => setNewAmt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && handleAdd()}
            aria-label="Suma"
            className={`${FIELD} app-num w-[84px] text-right`}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving}
            aria-label="Pridėti įrašą"
            className="app-focusable flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-control bg-ink text-card disabled:opacity-50"
          >
            <Plus size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <p
            className="mb-3 flex items-start gap-2 rounded-control px-3 py-2.5 text-[13.5px]"
            style={{ color: "var(--danger)", background: "var(--danger-soft)" }}
          >
            <CircleAlert
              size={16}
              strokeWidth={1.9}
              className="mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            {error}
          </p>
        )}

        <div className="mb-3 flex items-baseline justify-between border-b border-line-soft pb-2">
          <span className="text-[13px] font-bold text-ink-2">Iš viso</span>
          <span className="app-num text-[18px]">{formatEur(total)}</span>
        </div>

        {transactions.length === 0 ? (
          <p className="py-6 text-center text-[13.5px] text-ink-3">
            Šioje kategorijoje dar nieko nėra.
          </p>
        ) : (
          <ul className="flex flex-col">
            {transactions.map((t, i) => (
              <li
                key={t.id}
                className={`flex items-center gap-3 py-2.5 ${
                  i > 0 ? "border-t border-line-soft" : ""
                }`}
              >
                <span className="w-[42px] flex-shrink-0 text-[12.5px] text-ink-3">
                  {formatShortDate(t.txn_date)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14.5px]">{t.description}</span>
                {t.is_fixed && (
                  <span className="app-accent-tint flex-shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold text-accent-deep">
                    kartojasi
                  </span>
                )}
                <span className="app-num text-[15px]">{formatEur(t.amount)}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(t)}
                  aria-label={`Ištrinti ${t.description}`}
                  className="app-focusable flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-3 hover:bg-sunken"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
