"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CircleDollarSign, ReceiptText } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { useMonth } from "@/lib/monthContext";
import {
  fetchMonthTransactions,
  fetchSavingsGoal,
  ensureFixedExpenseInstances,
} from "@/lib/db";
import HeroStats from "./HeroStats";
import IncomeChips from "./IncomeChips";
import CategoryBreakdown from "./CategoryBreakdown";
import TransactionFormModal from "./TransactionFormModal";
import { formatEur } from "@/lib/format";

export default function MonthView() {
  const { year, month, next, prev } = useMonth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState<"income" | "expense" | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const load = useCallback(async (y: number, m: number) => {
    setLoading(true);
    await ensureFixedExpenseInstances(y, m);
    const [txns, goal] = await Promise.all([fetchMonthTransactions(y, m), fetchSavingsGoal(y, m)]);
    setTransactions(txns);
    setSavingsGoal(goal?.goal_amount ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(year, month);
  }, [year, month, load]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // only treat as a month-swipe if the gesture is clearly horizontal —
    // otherwise normal vertical scrolling would accidentally flip months
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 2) {
      deltaX < 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  const expenses = transactions.filter((t) => t.type === "expense");
  const income = transactions.filter((t) => t.type === "income");
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);

  if (loading) return <p className="text-center text-sm py-10" style={{ color: "var(--muted)" }}>Kraunama…</p>;

  return (
    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <HeroStats
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        savingsGoal={savingsGoal}
        year={year}
        month={month}
        onGoalChanged={setSavingsGoal}
      />

      <IncomeChips income={income} onChanged={() => load(year, month)} />

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setAddModal("income")}
          className="flex-1 rounded-control app-surface app-focusable flex items-center justify-center gap-1.5"
          style={{ minHeight: 48, fontSize: 14, fontWeight: 500, color: "var(--text)" }}
        >
          <CircleDollarSign size={17} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--blue-700)" }} />
          Pajamos
        </button>
        <button
          onClick={() => setAddModal("expense")}
          className="flex-1 rounded-control app-surface app-focusable flex items-center justify-center gap-1.5"
          style={{ minHeight: 48, fontSize: 14, fontWeight: 500, color: "var(--text)" }}
        >
          <ReceiptText size={17} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--blue-700)" }} />
          Išlaidos
        </button>
      </div>

      <div className="app-numeric text-[11px] font-bold uppercase tracking-wider mb-2 pl-0.5" style={{ color: "var(--muted)" }}>
        Išlaidos — {formatEur(totalExpenses)}
      </div>
      <CategoryBreakdown transactions={expenses} year={year} month={month} onChanged={() => load(year, month)} />

      <TransactionFormModal
        open={addModal !== null}
        onClose={() => setAddModal(null)}
        initialType={addModal ?? undefined}
        year={year}
        month={month}
        onSaved={() => load(year, month)}
      />
    </div>
  );
}
