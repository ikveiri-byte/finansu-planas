"use client";

import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import {
  fetchTransactionsInRange,
  fetchSavingsGoalsInRange,
  fetchAllTransactions,
} from "@/lib/db";
import { formatEur } from "@/lib/format";
import { MONTH_COLORS } from "@/lib/monthColors";
import { CATEGORIES, type ExpenseCategory } from "@/lib/types";
import { exportTransactionsToCsv } from "@/lib/export";
import CategoryIcon from "./CategoryIcon";

type Period = "month" | "3m" | "6m" | "1y" | "custom";

type Row = {
  year: number;
  month: number;
  income: number;
  expenses: number;
  saved: number;
  goal: number;
};

const today = new Date();

const PERIODS: [Period, string][] = [
  ["month", "Šis mėnuo"],
  ["3m", "3 mėn."],
  ["6m", "6 mėn."],
  ["1y", "Metai"],
  ["custom", "Pasirinkti"],
];

const PERIOD_SUFFIX: Record<Period, string> = {
  month: "šį mėnesį",
  "3m": "per ketvirtį",
  "6m": "per pusmetį",
  "1y": "per metus",
  custom: "per laikotarpį",
};

function monthsBack(n: number) {
  const d = new Date(today.getFullYear(), today.getMonth() - n + 1, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function StatsView() {
  const [period, setPeriod] = useState<Period>("6m");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [catTotals, setCatTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setLoading(true);
      let fromYear: number, fromMonth: number, toYear: number, toMonth: number;

      if (period === "month") {
        fromYear = toYear = today.getFullYear();
        fromMonth = toMonth = today.getMonth() + 1;
      } else if (period === "custom") {
        if (!customFrom || !customTo) {
          setLoading(false);
          return;
        }
        const f = new Date(customFrom);
        const t = new Date(customTo);
        fromYear = f.getFullYear();
        fromMonth = f.getMonth() + 1;
        toYear = t.getFullYear();
        toMonth = t.getMonth() + 1;
      } else {
        const n = period === "3m" ? 3 : period === "6m" ? 6 : 12;
        const start = monthsBack(n);
        fromYear = start.year;
        fromMonth = start.month;
        toYear = today.getFullYear();
        toMonth = today.getMonth() + 1;
      }

      const fromDate = `${fromYear}-${String(fromMonth).padStart(2, "0")}-01`;
      const toDate = new Date(toYear, toMonth, 0).toISOString().slice(0, 10);

      const [txns, goals] = await Promise.all([
        fetchTransactionsInRange(fromDate, toDate),
        fetchSavingsGoalsInRange(fromYear, fromMonth, toYear, toMonth),
      ]);

      const buckets = new Map<
        string,
        { year: number; month: number; income: number; expenses: number }
      >();
      let cursor = fromYear * 12 + (fromMonth - 1);
      const end = toYear * 12 + (toMonth - 1);
      while (cursor <= end) {
        const y = Math.floor(cursor / 12);
        const m = (cursor % 12) + 1;
        buckets.set(`${y}-${m}`, { year: y, month: m, income: 0, expenses: 0 });
        cursor++;
      }

      const cats: Record<string, number> = {};

      for (const t of txns) {
        const b = buckets.get(`${t.year}-${t.month}`);
        if (!b) continue;
        if (t.type === "income") {
          b.income += t.amount;
        } else {
          b.expenses += t.amount;
          if (t.category) cats[t.category] = (cats[t.category] ?? 0) + t.amount;
        }
      }

      const goalMap = new Map(goals.map((g: any) => [`${g.year}-${g.month}`, g.goal_amount]));

      setRows(
        Array.from(buckets.values()).map((b) => ({
          year: b.year,
          month: b.month,
          income: Math.round(b.income * 100) / 100,
          expenses: Math.round(b.expenses * 100) / 100,
          goal: goalMap.get(`${b.year}-${b.month}`) ?? 0,
          saved: Math.round((b.income - b.expenses) * 100) / 100,
        }))
      );
      setCatTotals(cats);
      setLoading(false);
    }
    run();
  }, [period, customFrom, customTo]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          income: acc.income + r.income,
          expenses: acc.expenses + r.expenses,
          saved: acc.saved + r.saved,
        }),
        { income: 0, expenses: 0, saved: 0 }
      ),
    [rows]
  );

  const avgSaved = rows.length > 0 ? totals.saved / rows.length : 0;
  const savedShare =
    totals.income > 0 ? Math.round((totals.saved / totals.income) * 100) : 0;
  const priciest = useMemo(
    () => rows.reduce<Row | null>((best, r) => (!best || r.expenses > best.expenses ? r : best), null),
    [rows]
  );
  const maxIncome = Math.max(...rows.map((r) => Math.max(r.income, r.expenses)), 1);

  const sortedCats = useMemo(
    () =>
      CATEGORIES.map((c) => ({ cat: c as ExpenseCategory, total: catTotals[c] ?? 0 }))
        .filter((c) => c.total > 0)
        .sort((a, b) => b.total - a.total),
    [catTotals]
  );
  const maxCat = sortedCats[0]?.total ?? 1;

  const suffix = PERIOD_SUFFIX[period];

  return (
    <div className="flex flex-col gap-4">
      {/* laikotarpis */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="no-scrollbar app-card flex gap-1.5 overflow-x-auto rounded-[16px] p-1.5">
          {PERIODS.map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setPeriod(val)}
              aria-pressed={period === val}
              className={`app-focusable min-h-[38px] flex-shrink-0 rounded-[12px] px-4 text-[13.5px] ${
                period === val ? "bg-ink font-bold text-card" : "font-medium text-ink-2"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <ExportAllButton />
      </div>

      {period === "custom" && (
        <div className="app-card flex flex-wrap gap-3 rounded-card px-5 py-4">
          <div className="flex-1">
            <label htmlFor="nuo" className="mb-1.5 block text-[12.5px] font-bold text-ink-2">
              Nuo
            </label>
            <input
              id="nuo"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="app-focusable min-h-[44px] w-full rounded-[13px] border border-line bg-sunken-2 px-3 text-[14px] text-ink"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="iki" className="mb-1.5 block text-[12.5px] font-bold text-ink-2">
              Iki
            </label>
            <input
              id="iki"
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="app-focusable min-h-[44px] w-full rounded-[13px] border border-line bg-sunken-2 px-3 text-[14px] text-ink"
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-3">Kraunama…</p>
      ) : rows.length === 0 ? (
        <div className="app-sunken rounded-panel px-5 py-10 text-center">
          <p className="text-[13.5px] text-ink-2">Šiam laikotarpiui duomenų nėra.</p>
        </div>
      ) : (
        <>
          {/* trys skaičiai */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="app-accent flex min-h-[126px] flex-col gap-1.5 rounded-card px-5 py-[18px]">
              <div className="text-[13px] font-bold text-accent-deep">Sutaupyta {suffix}</div>
              <div className="app-num text-[32px] leading-tight">{formatEur(totals.saved)}</div>
              {totals.income > 0 && (
                <div className="text-[12.5px] text-accent-deep">{savedShare} % visų pajamų</div>
              )}
            </div>

            <div className="app-card flex min-h-[126px] flex-col gap-1.5 rounded-card px-5 py-[18px]">
              <div className="text-[13px] font-bold text-ink-2">Vid. santaupos per mėnesį</div>
              <div className="app-num text-[32px] leading-tight">{formatEur(avgSaved)}</div>
            </div>

            <div className="app-card flex min-h-[126px] flex-col gap-1.5 rounded-card px-5 py-[18px]">
              <div className="text-[13px] font-bold text-ink-2">
                Mėnuo, kurį patirta daugiausia išlaidų
              </div>
              <div className="app-display text-[28px] leading-tight">
                {priciest ? MONTH_COLORS[priciest.month].name : "—"}
              </div>
              {priciest && (
                <div className="text-[12.5px] text-ink-3">
                  {formatEur(priciest.expenses)} išlaidų
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] lg:items-start">
            {/* stulpeliai */}
            <div className="app-card rounded-panel px-4 py-5 lg:px-6">
              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="app-display text-[17px] lg:text-[20px]">
                  Likutis iš pajamų atskaičius išlaidas
                </h2>
                <div className="flex-1" />
                <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
                  <span
                    className="block h-[11px] w-[11px] rounded-[4px] bg-saved"
                    aria-hidden="true"
                  />
                  sutaupyta
                </span>
                <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
                  <span
                    className="block h-[11px] w-[11px] rounded-[4px] bg-accent"
                    aria-hidden="true"
                  />
                  išleista
                </span>
              </div>

              <div className="no-scrollbar overflow-x-auto">
                <div
                  className="flex items-end gap-3 lg:gap-6"
                  style={{ height: 300, minWidth: rows.length * 54 }}
                >
                  {rows.map((r) => {
                    const scale = Math.max(r.income, r.expenses) / maxIncome;
                    const colHeight = Math.max(8, scale * 280);
                    const over = r.expenses > r.income;
                    const spentPart = over
                      ? colHeight
                      : r.income > 0
                      ? (r.expenses / r.income) * colHeight
                      : 0;
                    const savedPart = Math.max(0, colHeight - spentPart);
                    return (
                      <div
                        key={`${r.year}-${r.month}`}
                        className="flex min-w-[42px] flex-1 flex-col justify-end overflow-hidden rounded-[16px] bg-paper"
                        style={{ height: colHeight }}
                        title={`${MONTH_COLORS[r.month].name}: ${formatEur(r.saved)}`}
                      >
                        {savedPart > 0 && (
                          <div className="bg-saved" style={{ height: savedPart }} />
                        )}
                        <div
                          style={{
                            height: spentPart,
                            background: over
                              ? "var(--danger)"
                              : MONTH_COLORS[r.month].accent,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <div
                  className="mt-3 flex gap-3 lg:gap-6"
                  style={{ minWidth: rows.length * 54 }}
                >
                  {rows.map((r) => (
                    <div
                      key={`${r.year}-${r.month}-label`}
                      className="flex min-w-[42px] flex-1 flex-col items-center gap-0.5"
                    >
                      <span className="text-[12.5px] font-bold">
                        {MONTH_COLORS[r.month].short}
                      </span>
                      <span
                        className="text-[11.5px]"
                        style={{
                          color: r.saved < 0 ? "var(--danger)" : "var(--ink-3)",
                        }}
                      >
                        {r.saved >= 0 ? "+" : ""}
                        {formatEur(r.saved)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* kategorijos */}
            <div className="app-card rounded-panel px-5 py-5">
              <h2 className="app-display mb-4 text-[17px] lg:text-[20px]">
                Išlaidos {suffix}
              </h2>
              {sortedCats.length === 0 ? (
                <p className="text-[13.5px] text-ink-3">Išlaidų nėra.</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {sortedCats.map(({ cat, total }) => (
                    <div key={cat} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2.5 text-[14px]">
                        <CategoryIcon category={cat} size={16} />
                        <span className="min-w-0 flex-1 truncate font-medium">{cat}</span>
                        <span className="app-num text-[14px]">{formatEur(total)}</span>
                      </div>
                      <div
                        className="h-[9px] overflow-hidden rounded-full"
                        style={{ background: "var(--accent-track)" }}
                      >
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${(total / maxCat) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* lentelė */}
          <div className="app-card rounded-panel px-4 py-5 lg:px-6">
            <h2 className="app-display mb-3 text-[17px] lg:text-[20px]">
              Detali informacija kiekvienam mėnesiui
            </h2>

            <div className="no-scrollbar overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-5 gap-3 border-b border-line-soft px-2 pb-2 text-[12.5px] font-bold text-ink-3">
                  <span>Mėnuo</span>
                  <span className="text-right">Pajamos</span>
                  <span className="text-right">Išlaidos</span>
                  <span className="text-right">Sutaupyta</span>
                  <span className="text-right">Prieš tikslą</span>
                </div>

                {[...rows].reverse().map((r, i) => {
                  const diff = r.saved - r.goal;
                  const isCurrent =
                    r.year === today.getFullYear() && r.month === today.getMonth() + 1;
                  return (
                    <div
                      key={`${r.year}-${r.month}`}
                      className={`grid grid-cols-5 items-center gap-3 rounded-[12px] px-2 py-2 text-[14px] ${
                        isCurrent ? "app-accent-tint font-bold" : i % 2 === 1 ? "bg-sunken-2" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="block h-2.5 w-2.5 flex-shrink-0 rounded-[4px]"
                          style={{ background: MONTH_COLORS[r.month].accent }}
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {MONTH_COLORS[r.month].name}
                          {rows.length > 12 && (
                            <span className="text-ink-3"> ’{String(r.year).slice(2)}</span>
                          )}
                        </span>
                      </span>
                      <span className="text-right">{formatEur(r.income)}</span>
                      <span className="text-right">{formatEur(r.expenses)}</span>
                      <span className="app-num text-right">{formatEur(r.saved)}</span>
                      <span
                        className="text-right font-bold"
                        style={{
                          color: diff < 0 ? "var(--danger)" : "var(--saved-deep)",
                        }}
                      >
                        {r.goal > 0 ? `${diff >= 0 ? "+" : "−"}${formatEur(Math.abs(diff))}` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ExportAllButton() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const all = await fetchAllTransactions();
      exportTransactionsToCsv(all, "biudzetas_visi_duomenys.csv");
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="app-focusable app-card flex min-h-[44px] items-center gap-2 rounded-control px-4 text-[14px] font-bold text-ink disabled:opacity-50"
    >
      <Download size={17} strokeWidth={1.9} aria-hidden="true" />
      {exporting ? "Ruošiama…" : "CSV"}
    </button>
  );
}
