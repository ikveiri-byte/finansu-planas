"use client";

import { useState } from "react";
import { CircleDollarSign, ReceiptText, Check, ChevronDown, CircleAlert, X } from "lucide-react";
import { CATEGORIES, type ExpenseCategory, type Transaction } from "@/lib/types";
import { addExpense, addIncome, deleteTransaction, restoreTransaction } from "@/lib/db";
import { useUndoRedo } from "@/lib/undoRedo";
import CategoryIcon from "./CategoryIcon";

type Props = {
  open: boolean;
  onClose: () => void;
  year: number;
  month: number;
  initialType?: "income" | "expense";
  onSaved: (txn: Transaction) => void;
};

export default function TransactionFormModal({ open, onClose, year, month, initialType, onSaved }: Props) {
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

  const inputStyle = {
    border: "1.5px solid var(--line)",
    borderRadius: "var(--radius-control)",
    padding: "12px 14px",
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
          <span className="text-[18px] font-bold" style={{ color: "var(--text)" }}>
            {!type ? "Ką pridėsi?" : type === "income" ? "Nauja pajama" : "Nauja išlaida"}
          </span>
          <button
            onClick={onClose}
            aria-label="Uždaryti"
            className="rounded-full flex items-center justify-center app-focusable"
            style={{ width: 34, height: 34, background: "var(--line-soft)", color: "var(--navy-900)" }}
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {!type ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType("income")}
              className="rounded-card app-focusable"
              style={{ border: "1.5px solid var(--line)", padding: "26px 0", textAlign: "center", color: "var(--text)", minHeight: 48 }}
            >
              <CircleDollarSign size={28} strokeWidth={1.8} className="mx-auto mb-2" aria-hidden="true" style={{ color: "var(--blue-700)" }} />
              Pajamos
            </button>
            <button
              onClick={() => setType("expense")}
              className="rounded-card app-focusable"
              style={{ border: "1.5px solid var(--line)", padding: "26px 0", textAlign: "center", color: "var(--text)", minHeight: 48 }}
            >
              <ReceiptText size={28} strokeWidth={1.8} className="mx-auto mb-2" aria-hidden="true" style={{ color: "var(--blue-700)" }} />
              Išlaidos
            </button>
          </div>
        ) : (
          <>
            <label className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>
              {type === "income" ? "Pajamų pobūdis" : "Išlaidos pobūdis"}
            </label>
            <input
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "income" ? "pvz. Atlyginimas" : "pvz. Lidl"}
              className="w-full mb-3.5"
              style={inputStyle}
            />

            {type === "expense" && (
              <>
                <label className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>Kategorija</label>
                <div className="relative mb-3.5">
                  <button
                    type="button"
                    onClick={() => setCatOpen((v) => !v)}
                    className="w-full flex items-center justify-between text-left app-focusable"
                    style={inputStyle}
                  >
                    <span className="flex items-center gap-2">
                      <CategoryIcon category={category} size={17} className="flex-shrink-0" color="var(--blue-700)" />
                      {category}
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      style={{ color: "var(--muted)", transform: catOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}
                    />
                  </button>
                  {catOpen && (
                    <div
                      className="absolute left-0 right-0 mt-1.5 overflow-y-auto z-10 bg-surface-strong"
                      style={{ border: "1.5px solid var(--line)", borderRadius: "var(--radius-control)", maxHeight: 260, boxShadow: "var(--shadow-card)" }}
                    >
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCategory(c);
                            setCatOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-3 text-sm flex items-center gap-2 app-focusable"
                          style={{ background: c === category ? "var(--line-soft)" : "transparent", minHeight: 44, color: "var(--text)" }}
                        >
                          <CategoryIcon category={c} size={16} color="var(--blue-700)" />
                          {c}
                          {c === category && <Check size={15} strokeWidth={2} className="ml-auto" aria-hidden="true" style={{ color: "var(--blue-700)" }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <label className="block text-xs mb-1.5" style={{ color: "var(--muted)" }}>Suma (€)</label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full mb-3.5 app-numeric"
              style={inputStyle}
            />

            {type === "expense" && (
              <label
                className="flex items-center gap-2.5 mb-5 px-3.5 py-3 text-sm rounded-control cursor-pointer app-focusable"
                style={{ border: `1.5px solid ${isFixed ? "var(--blue-600)" : "var(--line)"}`, minHeight: 48 }}
              >
                <span
                  className="rounded-[6px] flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    border: `2px solid ${isFixed ? "var(--blue-600)" : "var(--line)"}`,
                    background: isFixed ? "var(--blue-600)" : "var(--surface-strong)",
                  }}
                >
                  {isFixed && <Check size={13} strokeWidth={3} color="#fff" aria-hidden="true" />}
                </span>
                <input type="checkbox" checked={isFixed} onChange={(e) => setIsFixed(e.target.checked)} className="hidden" />
                <span style={{ color: isFixed ? "var(--navy-900)" : "var(--text-secondary)", fontWeight: isFixed ? 600 : 400 }}>
                  Fiksuotos išlaidos
                </span>
              </label>
            )}

            {error && (
              <p className="flex items-start gap-1.5 text-sm mb-3 rounded-control px-3 py-2.5" style={{ color: "var(--danger)", background: "var(--danger-soft)" }}>
                <CircleAlert size={16} strokeWidth={1.8} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (initialType) onClose();
                  else setType(null);
                }}
                className="flex-1 rounded-control app-focusable"
                style={{ border: "1.5px solid var(--line)", color: "var(--text)", minHeight: 48, fontSize: 14, fontWeight: 500 }}
              >
                Atgal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-control text-white font-semibold disabled:opacity-50 app-focusable"
                style={{ background: "linear-gradient(135deg, var(--blue-700), var(--blue-500))", minHeight: 48, fontSize: 14 }}
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
