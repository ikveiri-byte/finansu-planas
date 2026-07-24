"use client";

import { useState } from "react";
import { CATEGORIES, type ExpenseCategory, type Transaction } from "@/lib/types";
import { addExpense, addIncome, deleteTransaction, restoreTransaction } from "@/lib/db";
import { useUndoRedo } from "@/lib/undoRedo";

type Props = {
  open: boolean;
  onClose: () => void;
  year: number;
  month: number;
  accent: string;
  light: string;
  initialType?: "income" | "expense";
  onSaved: (txn: Transaction) => void;
};

export default function TransactionFormModal({ open, onClose, year, month, accent, light, initialType, onSaved }: Props) {
  const { pushAction } = useUndoRedo();
  const [type, setType] = useState<"income" | "expense" | null>(initialType ?? null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Maistas");
  const [amount, setAmount] = useState("");
  const [isFixed, setIsFixed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);

  if (!open) return null;

  function reset() {
    setType(initialType ?? null);
    setDescription("");
    setCategory("Maistas");
    setAmount("");
    setIsFixed(false);
    setCatOpen(false);
  }

  async function handleSave() {
    const amt = parseFloat(amount.replace(",", "."));
    if (!description.trim() || isNaN(amt) || amt <= 0 || !type) return;
    setSaving(true);
    setError(null);
    const txn_date = new Date().toISOString().slice(0, 10);
    try {
      const withTimeout = <T,>(p: Promise<T>) =>
        Promise.race([
          p,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("Užklausa užtruko per ilgai. Patikrink interneto ryšį ir bandyk dar kartą.")), 12000)
          ),
        ]);

      let created: Transaction;
      if (type === "income") {
        created = await withTimeout(addIncome({ description: description.trim(), amount: amt, year, month, txn_date }));
      } else {
        created = await withTimeout(
          addExpense({
            description: description.trim(),
            category,
            amount: amt,
            year,
            month,
            txn_date,
            isFixed,
          })
        );
      }
      pushAction({
        label: `Pridėta: ${description.trim()}`,
        undo: async () => deleteTransaction(created),
        redo: async () => restoreTransaction(created),
      });
      onSaved(created);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepavyko išsaugoti. Bandyk dar kartą.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = { border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[500px] overflow-y-auto"
        style={{ borderRadius: "20px 20px 0 0", padding: "20px 20px 36px", maxHeight: "85vh" }}
      >
        <div className="w-9 h-1 bg-[#e5e7eb] rounded-full mx-auto mb-3.5" />
        <div className="flex justify-between items-center mb-3.5">
          <span className="text-[17px] font-bold text-[#111]">
            {!type ? "Ką pridėsi?" : type === "income" ? "Nauja pajama" : "Nauja išlaida"}
          </span>
          <button onClick={onClose} aria-label="Uždaryti" className="w-[30px] h-[30px] rounded-full bg-[#f3f4f6] flex items-center justify-center text-sm">
            ✕
          </button>
        </div>

        {!type ? (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setType("income")} className="rounded-2xl border border-[#e5e7eb] py-6 text-center" style={{ color: "#374151" }}>
              <div className="text-2xl mb-1">💰</div>
              Pajamos
            </button>
            <button onClick={() => setType("expense")} className="rounded-2xl border border-[#e5e7eb] py-6 text-center" style={{ color: "#374151" }}>
              <div className="text-2xl mb-1">🧾</div>
              Išlaidos
            </button>
          </div>
        ) : (
          <>
            <label className="block text-xs text-muted mb-1">{type === "income" ? "Pajamų pobūdis" : "Išlaidos pobūdis"}</label>
            <input
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "income" ? "pvz. Atlyginimas" : "pvz. Lidl"}
              className="w-full mb-3"
              style={inputStyle}
            />

            {type === "expense" && (
              <>
                <label className="block text-xs text-muted mb-1">Kategorija</label>
                <div className="relative mb-3">
                  <button
                    type="button"
                    onClick={() => setCatOpen((v) => !v)}
                    className="w-full flex items-center justify-between bg-white text-left"
                    style={inputStyle}
                  >
                    <span>{category}</span>
                    <span style={{ transform: catOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▾</span>
                  </button>
                  {catOpen && (
                    <div
                      className="absolute left-0 right-0 mt-1 bg-white rounded-[10px] overflow-y-auto z-10"
                      style={{ border: "1.5px solid #e5e7eb", maxHeight: 220, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                    >
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCategory(c);
                            setCatOpen(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm"
                          style={{ background: c === category ? "#f3f4f6" : "#fff" }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <label className="block text-xs text-muted mb-1">Suma (€)</label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full mb-3"
              style={inputStyle}
            />

            {type === "expense" && (
              <label
                className="flex items-center gap-2 mb-5 px-3 py-2.5 text-sm rounded-xl cursor-pointer"
                style={{ border: `1.5px solid ${isFixed ? accent : "#e5e7eb"}` }}
              >
                <span
                  className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center flex-shrink-0"
                  style={{ border: `2px solid ${isFixed ? accent : "#d1d5db"}`, background: isFixed ? accent : "#fff" }}
                >
                  {isFixed && <span className="text-white text-[11px] font-bold">✓</span>}
                </span>
                <input type="checkbox" checked={isFixed} onChange={(e) => setIsFixed(e.target.checked)} className="hidden" />
                <span style={{ color: isFixed ? accent : "#6b7280", fontWeight: isFixed ? 600 : 400 }}>Fiksuotos išlaidos</span>
              </label>
            )}

            {error && (
              <p className="text-sm mb-3" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (initialType) onClose();
                  else setType(null);
                }}
                className="flex-1 rounded-xl border border-[#e5e7eb] py-2.5 text-[#374151]"
              >
                Atgal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl text-white font-semibold py-2.5 disabled:opacity-50"
                style={{ background: accent }}
              >
                {saving ? "Saugoma…" : "Pridėti"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
