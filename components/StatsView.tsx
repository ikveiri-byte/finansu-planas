"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, CreditCard, PiggyBank, Download } from "lucide-react";
import { fetchTransactionsInRange, fetchSavingsGoalsInRange, fetchAllTransactions } from "@/lib/db";
import { formatEur } from "@/lib/format";
import { MONTH_COLORS } from "@/lib/monthColors";
import { exportTransactionsToCsv } from "@/lib/export";
import CardWaves from "./CardWaves";

type Period = "month" | "3m" | "6m" | "1y" | "custom";

const today = new Date();

function monthsBack(n: number) {
  const d = new Date(today.getFullYear(), today.getMonth() - n + 1, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function StatsView() {
  const [period, setPeriod] = useState<Period>("3m");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [rows, setRows] = useState<{ label: string; year: number; month: number; income: number; expenses: number; saved: number; goal: number }[]>([]);
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

      const buckets = new Map<string, { year: number; month: number; income: number; expenses: number }>();
      let cursor = fromYear * 12 + (fromMonth - 1);
      const end = toYear * 12 + (toMonth - 1);
      while (cursor <= end) {
        const y = Math.floor(cursor / 12);
        const m = (cursor % 12) + 1;
        buckets.set(`${y}-${m}`, { year: y, month: m, income: 0, expenses: 0 });
        cursor++;
      }
      for (const t of txns) {
        const key = `${t.year}-${t.month}`;
        const b = buckets.get(key);
        if (!b) continue;
        if (t.type === "income") b.income += t.amount;
        else b.expenses += t.amount;
      }

      const goalMap = new Map(goals.map((g: any) => [`${g.year}-${g.month}`, g.goal_amount]));

      const result = Array.from(buckets.values()).map((b) => ({
        label: `${MONTH_COLORS[b.month].name.slice(0, 3)} ${String(b.year).slice(2)}`,
        year: b.year,
        month: b.month,
        income: Math.round(b.income * 100) / 100,
        expenses: Math.round(b.expenses * 100) / 100,
        goal: goalMap.get(`${b.year}-${b.month}`) ?? 0,
        saved: Math.round((b.income - b.expenses) * 100) / 100,
      }));

      setRows(result);
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

  return (
    <div>
      <h1 className="text-[26px] font-bold mb-3.5" style={{ color: "var(--text)" }}>Statistika</h1>

      <div className="flex gap-1.5 mb-3.5 overflow-x-auto no-scrollbar pb-0.5">
        {([
          ["month", "Mėnuo"],
          ["3m", "3 mėn"],
          ["6m", "6 mėn"],
          ["1y", "1 metai"],
          ["custom", "Kita"],
        ] as [Period, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className="flex-shrink-0 rounded-full text-[13px] font-medium app-focusable"
            style={{
              padding: "9px 15px",
              minHeight: 44,
              background: period === val ? "linear-gradient(135deg, var(--blue-700), var(--blue-500))" : "var(--surface-strong)",
              color: period === val ? "#fff" : "var(--text-secondary)",
              border: period === val ? "none" : "1.5px solid var(--line)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="flex gap-2 mb-3.5">
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Nuo</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="w-full rounded-control px-2.5 py-2 text-sm bg-surface-strong"
              style={{ border: "1.5px solid var(--line)", minHeight: 44, color: "var(--text)" }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: "var(--muted)" }}>Iki</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="w-full rounded-control px-2.5 py-2 text-sm bg-surface-strong"
              style={{ border: "1.5px solid var(--line)", minHeight: 44, color: "var(--text)" }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm py-10" style={{ color: "var(--muted)" }}>Kraunama…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3.5">
            <div className="app-hero relative overflow-hidden rounded-card text-center" style={{ padding: "14px 8px" }}>
              <CardWaves opacity={0.14} />
              <div className="relative z-10">
                <TrendingUp size={18} strokeWidth={1.8} className="mx-auto mb-1" aria-hidden="true" style={{ color: "rgba(255,255,255,.85)" }} />
                <p className="text-[9px] uppercase mb-0.5" style={{ color: "rgba(255,255,255,.7)" }}>Pajamos</p>
                <p className="app-numeric text-sm font-bold text-white">{formatEur(totals.income)}</p>
              </div>
            </div>
            <div className="app-surface rounded-card text-center" style={{ padding: "14px 8px" }}>
              <CreditCard size={18} strokeWidth={1.8} className="mx-auto mb-1" aria-hidden="true" style={{ color: "var(--muted)" }} />
              <p className="text-[9px] uppercase mb-0.5" style={{ color: "var(--muted)" }}>Išlaidos</p>
              <p className="app-numeric text-sm font-bold" style={{ color: "var(--danger)" }}>{formatEur(totals.expenses)}</p>
            </div>
            <div className="rounded-card text-center" style={{ padding: "14px 8px", background: "var(--line-soft)" }}>
              <PiggyBank size={18} strokeWidth={1.8} className="mx-auto mb-1" aria-hidden="true" style={{ color: "var(--navy-800)", opacity: 0.8 }} />
              <p className="text-[9px] uppercase mb-0.5" style={{ color: "var(--navy-800)", opacity: 0.7 }}>Sutaupyta</p>
              <p className="app-numeric text-sm font-bold" style={{ color: totals.saved < 0 ? "var(--danger)" : "var(--navy-800)" }}>{formatEur(totals.saved)}</p>
            </div>
          </div>

          <div className="app-surface rounded-card mb-3.5" style={{ padding: "16px 4px 8px" }}>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-sm font-bold" style={{ color: "var(--text)" }}>Pajamos ir išlaidos</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span className="flex items-center gap-1">
                  <span className="inline-block rounded-sm" style={{ width: 10, height: 10, background: "var(--blue-500)" }} aria-hidden="true" />
                  Pajamos
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block rounded-sm" style={{ width: 10, height: 10, background: "#fde3e7" }} aria-hidden="true" />
                  Išlaidos
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rows} barGap={3} margin={{ top: 8, right: 6, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--line-soft)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}`} />
                <Tooltip formatter={(v: number) => formatEur(v)} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "var(--shadow-card)" }} />
                <Bar dataKey="income" name="Pajamos" fill="var(--blue-500)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Išlaidos" fill="#fde3e7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="app-surface rounded-card overflow-hidden mb-3.5">
            <p className="text-sm font-bold px-3.5 pt-3.5 pb-2" style={{ color: "var(--text)" }}>Pagal mėnesius</p>
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] px-3.5 py-2.5" style={{ background: "var(--line-soft)" }}>
              {["Mėnuo", "Paj.", "Išl.", "Sut."].map((h) => (
                <div key={h} className="text-[10px] font-bold uppercase" style={{ color: "var(--navy-800)" }}>{h}</div>
              ))}
            </div>
            {[...rows].reverse().map((m, i) => (
              <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] px-3.5 py-2.5 border-t" style={{ borderColor: "var(--line-soft)" }}>
                <div className="text-xs font-medium" style={{ color: "var(--text)" }}>{m.label}</div>
                <div className="app-numeric text-xs font-medium" style={{ color: "#0e8a4a" }}>{formatEur(m.income)}</div>
                <div className="app-numeric text-xs font-medium" style={{ color: "var(--danger)" }}>{formatEur(m.expenses)}</div>
                <div className="app-numeric text-xs font-bold" style={{ color: m.saved < 0 ? "var(--danger)" : "var(--navy-800)" }}>{formatEur(m.saved)}</div>
              </div>
            ))}
          </div>

          <ExportAllButton />
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
      onClick={handleExport}
      disabled={exporting}
      className="w-full flex items-center justify-center gap-2 text-sm font-medium rounded-control app-surface disabled:opacity-50 app-focusable"
      style={{ minHeight: 48, color: "var(--blue-700)" }}
    >
      <Download size={17} strokeWidth={1.8} aria-hidden="true" />
      {exporting ? "Ruošiama…" : "Eksportuoti visus duomenis"}
    </button>
  );
}
