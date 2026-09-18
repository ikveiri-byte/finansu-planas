"use client";

import { useState } from "react";
import { Check, ChevronDown, CircleAlert, CircleDollarSign, ReceiptText, X } from "lucide-react";
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

const FIELD =
  "app-focusable w-full min-h-[48px] rounded-control border border-line bg-sunken-2 px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-3";

export default function TransactionFormModal({
  open,
  onClose,
  year,
  month,
  initialType,
  onSaved,
}: Props) {
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
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Užklausa užtruko per ilgai. Patikrink interneto ryšį ir bandyk dar kartą."
                  )
                ),
              12000
            )
          ),
        ]);

      let created: Transaction;
      if (type === "income") {
        created = await withTimeout(
          addIncome({ description: description.trim(), amount: amt, year, month, txn_date })
        );
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
        aria-label={!type ? "Naujas įrašas" : type === "income" ? "Nauja pajama" : "Nauja išlaida"}
        className="max-h-[88vh] w-full max-w-[500px] overflow-y-auto rounded-t-panel bg-card px-5 lg:max-w-[560px] lg:rounded-panel"
        style={{ paddingTop: 20, paddingBottom: "calc(28px + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-line lg:hidden" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="app-display text-[19px]">
            {!type ? "Ką pridėsi?" : type === "income" ? "Nauja pajama" : "Nauja išlaida"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Uždaryti"
            className="app-focusable flex h-9 w-9 items-center justify-center rounded-[12px] bg-sunken text-ink-2"
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {!type ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("income")}
              className="app-focusable rounded-card border border-line py-7 text-center text-[14.5px] font-medium text-ink hover:bg-sunken"
            >
              <CircleDollarSign
                size={26}
                strokeWidth={1.8}
                className="mx-auto mb-2 text-ink-2"
                aria-hidden="true"
              />
              Pajamos
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className="app-focusable rounded-card border border-line py-7 text-center text-[14.5px] font-medium text-ink hover:bg-sunken"
            >
              <ReceiptText
                size={26}
                strokeWidth={1.8}
                className="mx-auto mb-2 text-ink-2"
                aria-hidden="true"
              />
              Išlaidos
            </button>
          </div>
        ) : (
          <>
            <label htmlFor="apibudinimas" className="mb-1.5 block text-[12.5px] font-bold text-ink-2">
              {type === "income" ? "Pajamų pobūdis" : "Išlaidos pobūdis"}
            </label>
            <input
              id="apibudinimas"
              autoFocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "income" ? "pvz. Atlyginimas" : "pvz. Lidl"}
              className={`${FIELD} mb-3.5`}
            />

            {type === "expense" && (
              <>
                <span className="mb-1.5 block text-[12.5px] font-bold text-ink-2">Kategorija</span>
                <div className="relative mb-3.5">
                  <button
                    type="button"
                    onClick={() => setCatOpen((v) => !v)}
                    aria-expanded={catOpen}
                    className={`${FIELD} flex items-center justify-between text-left`}
                  >
                    <span className="flex items-center gap-2.5">
                      <CategoryIcon category={category} size={17} />
                      {category}
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="text-ink-3"
                      style={{
                        transform: catOpen ? "rotate(180deg)" : "none",
                        transition: "transform .15s",
                      }}
                    />
                  </button>

                  {catOpen && (
                    <div className="absolute left-0 right-0 z-10 mt-1.5 max-h-[260px] overflow-y-auto rounded-control border border-line bg-card">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCategory(c);
                            setCatOpen(false);
                          }}
                          className="app-focusable flex min-h-[44px] w-full items-center gap-2.5 px-3.5 py-3 text-left text-[14px] text-ink"
                          style={{
                            background: c === category ? "var(--accent-tint)" : "transparent",
                          }}
                        >
                          <CategoryIcon category={c} size={16} />
                          {c}
                          {c === category && (
                            <Check
                              size={15}
                              strokeWidth={2.4}
                              className="ml-auto text-accent-deep"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <label htmlFor="suma" className="mb-1.5 block text-[12.5px] font-bold text-ink-2">
              Suma (€)
            </label>
            <input
              id="suma"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className={`${FIELD} app-num mb-3.5 text-[18px]`}
            />

            {type === "expense" && (
              <label
                className="mb-5 flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-control px-3.5 py-3 text-[14px]"
                style={{
                  border: `1px solid ${isFixed ? "var(--saved)" : "var(--line)"}`,
                  background: isFixed ? "rgba(107, 127, 58, 0.08)" : "transparent",
                }}
              >
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px] border-2"
                  style={{
                    borderColor: isFixed ? "var(--saved)" : "var(--line-dashed)",
                    background: isFixed ? "var(--saved)" : "transparent",
                  }}
                >
                  {isFixed && (
                    <Check size={13} strokeWidth={3} color="#fcfaf5" aria-hidden="true" />
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                  className="sr-only"
                />
                <span className={isFixed ? "font-bold text-ink" : "text-ink-2"}>
                  Kartojasi kas mėnesį
                </span>
              </label>
            )}

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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (initialType) onClose();
                  else setType(null);
                }}
                className="app-focusable min-h-[48px] flex-1 rounded-control border border-line text-[14px] font-bold text-ink-2"
              >
                Atgal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="app-focusable min-h-[48px] flex-1 rounded-control bg-ink text-[14px] font-bold text-card disabled:opacity-50"
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
