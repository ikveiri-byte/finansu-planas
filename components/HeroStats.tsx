"use client";

import { useState } from "react";
import { Pencil, WalletCards, Target, PiggyBank, TrendingUp } from "lucide-react";
import { formatEur } from "@/lib/format";
import { upsertSavingsGoal } from "@/lib/db";
import CardWaves from "./CardWaves";

type Props = {
  totalIncome: number;
  totalExpenses: number;
  savingsGoal: number;
  year: number;
  month: number;
  onGoalChanged: (goal: number) => void;
};

export default function HeroStats({ totalIncome, totalExpenses, savingsGoal, year, month, onGoalChanged }: Props) {
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
    <div className="grid grid-cols-2 gap-2.5 mb-4">
      <div className="app-hero relative overflow-hidden rounded-card px-4 py-4">
        <CardWaves className="z-0" opacity={0.16} />
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 mb-1.5" style={{ color: "rgba(255,255,255,.75)" }}>
            <WalletCards size={16} strokeWidth={1.8} aria-hidden="true" />
            <p className="text-[10px] uppercase tracking-wider">Balansas</p>
          </div>
          <p className="app-numeric text-[26px] font-bold" style={{ color: balansas < 0 ? "#ffb4bf" : "#ffffff" }}>
            {formatEur(balansas)}
          </p>
        </div>
      </div>

      <div className="app-surface rounded-card px-4 py-4">
        <div className="flex items-center gap-1.5 mb-1.5" style={{ color: "var(--muted)" }}>
          <TrendingUp size={16} strokeWidth={1.8} aria-hidden="true" />
          <p className="text-[10px] uppercase tracking-wider">Pajamos</p>
        </div>
        <p className="app-numeric text-xl font-bold" style={{ color: "var(--blue-700)" }}>
          {formatEur(totalIncome)}
        </p>
      </div>

      <button onClick={() => setEditingGoal(true)} className="text-left app-surface rounded-card px-4 py-4 app-focusable">
        <div className="flex items-center gap-1.5 mb-1.5" style={{ color: "var(--muted)" }}>
          <Target size={16} strokeWidth={1.8} aria-hidden="true" />
          <p className="text-[10px] uppercase tracking-wider">Santaupų tikslas</p>
          <Pencil size={12} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--muted)" }} />
        </div>
        {editingGoal ? (
          <input
            autoFocus
            inputMode="decimal"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onBlur={saveGoal}
            onKeyDown={(e) => e.key === "Enter" && saveGoal()}
            aria-label="Santaupų tikslo suma"
            className="app-numeric w-full text-xl font-bold bg-transparent outline-none"
            style={{ color: "var(--blue-700)" }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="app-numeric text-xl font-bold" style={{ color: "var(--blue-700)" }}>
            {formatEur(savingsGoal)}
          </p>
        )}
      </button>

      <div className="rounded-card px-4 py-4" style={{ background: "var(--line-soft)" }}>
        <div className="flex items-center gap-1.5 mb-1.5" style={{ color: "var(--navy-800)", opacity: 0.75 }}>
          <PiggyBank size={16} strokeWidth={1.8} aria-hidden="true" />
          <p className="text-[10px] uppercase tracking-wider">Sutaupyta</p>
        </div>
        <p className="app-numeric text-xl font-bold" style={{ color: sutaupyta < 0 ? "var(--danger)" : "var(--navy-800)" }}>
          {formatEur(sutaupyta)}
        </p>
      </div>
    </div>
  );
}
