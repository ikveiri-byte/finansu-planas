"use client";

import { useState } from "react";
import { ShoppingBag, HandCoins, Plus, X, Check } from "lucide-react";
import type { Debt, PlannedPurchase } from "@/lib/types";
import { formatEur } from "@/lib/format";
import {
  addDebt,
  addPlannedPurchase,
  deleteDebt,
  deletePlannedPurchase,
  togglePurchaseDone,
  toggleDebtSettled,
} from "@/lib/db";
import CardWaves from "./CardWaves";

type Props = {
  year: number;
  month: number;
  debts: Debt[];
  purchases: PlannedPurchase[];
  onChanged: () => void;
};

export default function DebtsAndPurchases({ year, month, debts, purchases, onChanged }: Props) {
  const [newDebtName, setNewDebtName] = useState("");
  const [newDebtAmount, setNewDebtAmount] = useState("");
  const [newPurchaseName, setNewPurchaseName] = useState("");
  const [newPurchaseAmount, setNewPurchaseAmount] = useState("");

  async function handleAddDebt() {
    const amt = parseFloat(newDebtAmount.replace(",", "."));
    if (!newDebtName.trim() || isNaN(amt)) return;
    await addDebt({ person_name: newDebtName.trim(), amount: amt, year, month });
    setNewDebtName("");
    setNewDebtAmount("");
    onChanged();
  }

  async function handleAddPurchase() {
    if (!newPurchaseName.trim()) return;
    const amt = newPurchaseAmount ? parseFloat(newPurchaseAmount.replace(",", ".")) : null;
    await addPlannedPurchase({ description: newPurchaseName.trim(), amount: amt, year, month });
    setNewPurchaseName("");
    setNewPurchaseAmount("");
    onChanged();
  }

  const darkInputStyle = {
    border: "1.5px solid rgba(255,255,255,0.25)",
    borderRadius: "var(--radius-control)",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    minHeight: 48,
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
  } as const;

  const lightInputStyle = {
    border: "1.5px solid var(--line)",
    borderRadius: "var(--radius-control)",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    minHeight: 48,
    background: "var(--surface-strong)",
    color: "var(--text)",
  } as const;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="app-hero relative overflow-hidden rounded-card p-4">
        <CardWaves opacity={0.14} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag size={20} strokeWidth={1.8} aria-hidden="true" style={{ color: "#fff" }} />
            <span className="text-[15px] font-bold text-white">Norimi pirkiniai</span>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={newPurchaseName}
              onChange={(e) => setNewPurchaseName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPurchase()}
              placeholder="Pridėti pirkinį..."
              className="flex-1 min-w-0 placeholder:text-white/50"
              style={darkInputStyle}
            />
            <input
              value={newPurchaseAmount}
              onChange={(e) => setNewPurchaseAmount(e.target.value)}
              placeholder="€"
              inputMode="decimal"
              className="w-16 placeholder:text-white/50 app-numeric"
              style={darkInputStyle}
            />
            <button
              onClick={handleAddPurchase}
              aria-label="Pridėti pirkinį"
              className="rounded-control flex items-center justify-center flex-shrink-0 app-focusable"
              style={{ background: "linear-gradient(135deg, var(--blue-600), var(--cyan-400))", width: 48, height: 48 }}
            >
              <Plus size={20} strokeWidth={2.2} color="#fff" aria-hidden="true" />
            </button>
          </div>
          {purchases.length === 0 && (
            <div
              className="text-[13px] text-center py-6 rounded-control"
              style={{ color: "rgba(255,255,255,.65)", border: "1px dashed rgba(255,255,255,.25)" }}
            >
              Sąrašas tuščias
            </div>
          )}
          {purchases.map((p) => (
            <div key={p.id} className="flex items-center gap-2.5 py-2.5 border-t" style={{ borderColor: "rgba(255,255,255,.12)", opacity: p.is_purchased ? 0.5 : 1 }}>
              <button
                onClick={() => togglePurchaseDone(p.id, !p.is_purchased).then(onChanged)}
                aria-label={p.is_purchased ? `Pažymėti ${p.description} kaip neatliktą` : `Pažymėti ${p.description} kaip pirktą`}
                className="rounded-full flex items-center justify-center flex-shrink-0 app-focusable"
                style={{
                  width: 24,
                  height: 24,
                  border: `2px solid ${p.is_purchased ? "var(--cyan-400)" : "rgba(255,255,255,.4)"}`,
                  background: p.is_purchased ? "var(--cyan-400)" : "transparent",
                }}
              >
                {p.is_purchased && <Check size={13} strokeWidth={3} color="#062b78" aria-hidden="true" />}
              </button>
              <span className="flex-1 text-sm text-white truncate" style={{ textDecoration: p.is_purchased ? "line-through" : "none" }}>
                {p.description}
              </span>
              {p.amount != null && (
                <span className="app-numeric text-sm font-medium text-white">{formatEur(p.amount)}</span>
              )}
              <button
                onClick={() => deletePlannedPurchase(p.id).then(onChanged)}
                aria-label={`Ištrinti ${p.description}`}
                className="flex items-center justify-center app-focusable"
                style={{ width: 26, height: 26, color: "rgba(255,255,255,.55)" }}
              >
                <X size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="app-surface rounded-card p-4">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="flex items-center justify-center flex-shrink-0 rounded-full"
            style={{ width: 34, height: 34, background: "var(--line-soft)", color: "var(--blue-700)" }}
          >
            <HandCoins size={18} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-bold" style={{ color: "var(--text)" }}>Skolos man</span>
        </div>
        <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>Kiti man skolingi</div>
        <div className="flex flex-col gap-2 mb-3">
          <input
            value={newDebtName}
            onChange={(e) => setNewDebtName(e.target.value)}
            placeholder="Kas skolingas"
            style={lightInputStyle}
          />
          <div className="flex gap-2">
            <input
              value={newDebtAmount}
              onChange={(e) => setNewDebtAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDebt()}
              placeholder="Suma €"
              inputMode="decimal"
              className="flex-1 app-numeric"
              style={lightInputStyle}
            />
            <button
              onClick={handleAddDebt}
              aria-label="Pridėti skolą"
              className="rounded-control flex items-center justify-center flex-shrink-0 app-focusable"
              style={{ background: "linear-gradient(135deg, var(--blue-700), var(--blue-500))", width: 48, height: 48 }}
            >
              <Plus size={20} strokeWidth={2.2} color="#fff" aria-hidden="true" />
            </button>
          </div>
        </div>
        {debts.length === 0 && (
          <div
            className="text-[13px] text-center py-6 rounded-control"
            style={{ color: "var(--muted)", border: "1px dashed var(--line)" }}
          >
            Nėra įrašų
          </div>
        )}
        {debts.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5 py-2.5 border-t" style={{ borderColor: "var(--line-soft)", opacity: d.is_settled ? 0.45 : 1 }}>
            <button
              onClick={() => toggleDebtSettled(d.id, !d.is_settled).then(onChanged)}
              aria-label={d.is_settled ? `Pažymėti ${d.person_name} kaip neapmokėtą` : `Pažymėti ${d.person_name} kaip apmokėtą`}
              className="rounded-full flex items-center justify-center flex-shrink-0 app-focusable"
              style={{
                width: 24,
                height: 24,
                border: `2px solid ${d.is_settled ? "var(--blue-600)" : "var(--line)"}`,
                background: d.is_settled ? "var(--blue-600)" : "var(--surface-strong)",
              }}
            >
              {d.is_settled && <Check size={13} strokeWidth={3} color="#fff" aria-hidden="true" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--text)", textDecoration: d.is_settled ? "line-through" : "none" }}>
                {d.person_name}
              </div>
              <div className="app-numeric text-xs font-semibold" style={{ color: "var(--blue-700)" }}>
                {formatEur(d.amount)}
              </div>
            </div>
            <button
              onClick={() => deleteDebt(d.id).then(onChanged)}
              aria-label={`Ištrinti skolą: ${d.person_name}`}
              className="flex items-center justify-center app-focusable"
              style={{ width: 26, height: 26, color: "var(--muted)" }}
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
