"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
    const [txns, goal] = await Promise.all([
      fetchMonthTransactions(y, m),
      fetchSavingsGoal(y, m),
    ]);
    setTransactions(txns);
    setSavingsGoal(goal?.goal_amount ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(year, month);
  }, [year, month, load]);

  // Įrašius per antraštės mygtuką — persikrauname
  useEffect(() => {
    const handler = () => load(year, month);
    window.addEventListener("finansai:changed", handler);
    return () => window.removeEventListener("finansai:changed", handler);
  }, [year, month, load]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
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

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-ink-3">Kraunama…</p>
    );
  }

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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] lg:items-start">
        {/* kairė: išlaidos */}
        <div className="order-2 lg:order-1">
          <CategoryBreakdown
            transactions={expenses}
            year={year}
            month={month}
            onChanged={() => load(year, month)}
          />
        </div>

        {/* dešinė: pajamos ir greiti veiksmai */}
        <div className="order-1 flex flex-col gap-4 lg:order-2">
          <IncomeChips
            income={income}
            onChanged={() => load(year, month)}
            onAdd={() => setAddModal("income")}
          />

          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setAddModal("income")}
              className="app-focusable app-card flex min-h-[48px] items-center justify-center gap-2 rounded-control text-[14px] font-medium"
            >
              <CircleDollarSign size={17} strokeWidth={1.8} aria-hidden="true" />
              Pajamos
            </button>
            <button
              type="button"
              onClick={() => setAddModal("expense")}
              className="app-focusable app-card flex min-h-[48px] items-center justify-center gap-2 rounded-control text-[14px] font-medium"
            >
              <ReceiptText size={17} strokeWidth={1.8} aria-hidden="true" />
              Išlaidos
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAddModal("expense")}
            className="app-focusable app-dashed hidden min-h-[46px] rounded-control text-[13.5px] font-bold lg:block"
          >
            Pridėti išlaidas
          </button>
        </div>
      </div>

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
