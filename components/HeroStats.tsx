"use client";

import { useState } from "react";
import { formatEur } from "@/lib/format";
import { upsertSavingsGoal } from "@/lib/db";

type Props = {
  totalIncome: number;
  totalExpenses: number;
  savingsGoal: number;
  year: number;
  month: number;
  accent: string;
  dark: string;
  light: string;
  onGoalChanged: (goal: number) => void;
};

export default function HeroStats({
  totalIncome,
  totalExpenses,
  savingsGoal,
  year,
  month,
  accent,
  dark,
  light,
  onGoalChanged,
}: Props) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(savingsGoal || ""));
  const sutaupyta = totalIncome - totalExpenses;
  const balansas = sutaupyta - savingsGoal;

  async function saveGoal() {
    const val = parseFloat(goalInput.replace(",", ".")) || 0;
    await upsertSavingsGoal(year, month, val);
    onGoalChanged(val);
    setEditingGoal(false);
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-3.5">
      <div className="rounded-2xl px-4 py-3.5" style={{ background: `linear-gradient(135deg, ${accent}, ${dark})` }}>
        <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,.7)" }}>
          Balansas
        </p>
        <p className="text-2xl font-bold" style={{ color: balansas < 0 ? "#fca5a5" : "#fff" }}>
          {formatEur(balansas)}
        </p>
      </div>

      <div className="rounded-2xl bg-white px-4 py-3.5">
        <p className="text-[10px] uppercase tracking-wider mb-0.5 text-muted">Pajamos</p>
        <p className="text-xl font-bold" style={{ color: accent }}>
          {formatEur(totalIncome)}
        </p>
      </div>

      <button
        onClick={() => setEditingGoal(true)}
        className="text-left rounded-2xl bg-white px-4 py-3.5"
      >
        <p className="text-[10px] uppercase tracking-wider mb-0.5 text-muted">Santaupų tikslas ✏️</p>
        {editingGoal ? (
          <input
            autoFocus
            inputMode="decimal"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onBlur={saveGoal}
            onKeyDown={(e) => e.key === "Enter" && saveGoal()}
            className="w-full text-xl font-bold bg-transparent outline-none"
            style={{ color: accent }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="text-xl font-bold" style={{ color: accent }}>
            {formatEur(savingsGoal)}
          </p>
        )}
      </button>

      <div className="rounded-2xl px-4 py-3.5" style={{ background: light }}>
        <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: dark, opacity: 0.7 }}>
          Sutaupyta
        </p>
        <p className="text-xl font-bold" style={{ color: sutaupyta < 0 ? "#dc2626" : dark }}>
          {formatEur(sutaupyta)}
        </p>
      </div>
    </div>
  );
}
