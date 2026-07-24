"use client";

import { useState } from "react";
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

type Props = {
  year: number;
  month: number;
  debts: Debt[];
  purchases: PlannedPurchase[];
  accent: string;
  light: string;
  onChanged: () => void;
};

export default function DebtsAndPurchases({ year, month, debts, purchases, accent, light, onChanged }: Props) {
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

  const inputStyle = { border: `1.5px solid ${light}`, borderRadius: 10, padding: "9px 12px", fontSize: 14, outline: "none" } as const;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="rounded-2xl bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🛍️</span>
          <span className="text-[15px] font-bold text-[#111]">Norimi pirkiniai</span>
        </div>
        <div className="flex gap-2 mb-3">
          <input
            value={newPurchaseName}
            onChange={(e) => setNewPurchaseName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPurchase()}
            placeholder="Pridėti pirkinį..."
            className="flex-1 min-w-0"
            style={inputStyle}
          />
          <input
            value={newPurchaseAmount}
            onChange={(e) => setNewPurchaseAmount(e.target.value)}
            placeholder="€"
            inputMode="decimal"
            className="w-16"
            style={inputStyle}
          />
          <button onClick={handleAddPurchase} style={{ background: accent }} className="text-white rounded-xl px-4 text-lg">
            +
          </button>
        </div>
        {purchases.length === 0 && <div className="text-[13px] text-muted text-center py-1">Sąrašas tuščias</div>}
        {purchases.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5 py-2 border-t border-[#f9fafb]" style={{ opacity: p.is_purchased ? 0.45 : 1 }}>
            <button
              onClick={() => togglePurchaseDone(p.id, !p.is_purchased).then(onChanged)}
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px]"
              style={{ border: `2px solid ${p.is_purchased ? accent : "#d1d5db"}`, background: p.is_purchased ? accent : "#fff" }}
            >
              {p.is_purchased ? "✓" : ""}
            </button>
            <span className="flex-1 text-sm text-[#374151]" style={{ textDecoration: p.is_purchased ? "line-through" : "none" }}>
              {p.description}
            </span>
            {p.amount != null && <span className="text-sm font-medium text-[#374151]">{formatEur(p.amount)}</span>}
            <button onClick={() => deletePlannedPurchase(p.id).then(onChanged)} className="text-[#d1d5db] px-0.5">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">💸</span>
          <span className="text-[15px] font-bold text-[#111]">Skolos man</span>
        </div>
        <div className="text-xs text-muted mb-3">Kiti man skolingi</div>
        <div className="flex flex-col gap-2 mb-3">
          <input
            value={newDebtName}
            onChange={(e) => setNewDebtName(e.target.value)}
            placeholder="Kas skolingas"
            style={inputStyle}
          />
          <div className="flex gap-2">
            <input
              value={newDebtAmount}
              onChange={(e) => setNewDebtAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDebt()}
              placeholder="Suma €"
              inputMode="decimal"
              className="flex-1"
              style={inputStyle}
            />
            <button
              onClick={handleAddDebt}
              style={{ background: accent }}
              className="text-white rounded-xl px-4 font-semibold text-[15px]"
            >
              +
            </button>
          </div>
        </div>
        {debts.length === 0 && <div className="text-[13px] text-muted text-center py-1">Nėra įrašų</div>}
        {debts.map((d) => (
          <div key={d.id} className="flex items-center gap-2.5 py-2 border-t border-[#f9fafb]" style={{ opacity: d.is_settled ? 0.4 : 1 }}>
            <button
              onClick={() => toggleDebtSettled(d.id, !d.is_settled).then(onChanged)}
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px]"
              style={{ border: `2px solid ${d.is_settled ? accent : "#d1d5db"}`, background: d.is_settled ? accent : "#fff" }}
            >
              {d.is_settled ? "✓" : ""}
            </button>
            <div className="flex-1">
              <div className="text-sm font-medium text-[#374151]" style={{ textDecoration: d.is_settled ? "line-through" : "none" }}>
                {d.person_name}
              </div>
              <div className="text-xs font-semibold" style={{ color: accent }}>
                {formatEur(d.amount)}
              </div>
            </div>
            <button onClick={() => deleteDebt(d.id).then(onChanged)} className="text-[#d1d5db]">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
