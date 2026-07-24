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
import { fetchTransactionsInRange, fetchSavingsGoalsInRange, fetchAllTransactions } from "@/lib/db";
import { formatEur } from "@/lib/format";
import { MONTH_COLORS } from "@/lib/monthColors";
import { exportTransactionsToCsv } from "@/lib/export";
import { useMonth } from "@/lib/monthContext";

type Period = "month" | "3m" | "6m" | "1y" | "custom";

const today = new Date();

function monthsBack(n: number) {
  const d = new Date(today.getFullYear(), today.getMonth() - n + 1, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function StatsView() {
  const { palette } = useMonth();
  const { accent, dark, light } = palette;
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
            className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium"
            style={{ background: period === val ? accent : "#fff", color: period === val ? "#fff" : "#374151" }}
          >
            {label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="flex gap-2 mb-3.5">
          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="flex-1 rounded-lg border border-[#e5e7eb] px-2 py-1.5 text-sm bg-white" />
          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="flex-1 rounded-lg border border-[#e5e7eb] px-2 py-1.5 text-sm bg-white" />
        </div>
      )}

      {loading ? (
        <p className="text-center text-muted py-10">Kraunama…</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3.5">
            <div className="rounded-2xl text-center py-3 px-2.5" style={{ background: `linear-gradient(135deg, ${accent}, ${dark})` }}>
              <p className="text-[9px] uppercase mb-0.5" style={{ color: "rgba(255,255,255,.7)" }}>Pajamos</p>
              <p className="text-sm font-bold text-white">{Math.round(totals.income)}€</p>
            </div>
            <div className="rounded-2xl text-center py-3 px-2.5 bg-white">
              <p className="text-[9px] uppercase mb-0.5 text-muted">Išlaidos</p>
              <p className="text-sm font-bold" style={{ color: "#dc2626" }}>{Math.round(totals.expenses)}€</p>
            </div>
            <div className="rounded-2xl text-center py-3 px-2.5" style={{ background: light }}>
              <p className="text-[9px] uppercase mb-0.5" style={{ color: dark, opacity: 0.7 }}>Sutaupyta</p>
              <p className="text-sm font-bold" style={{ color: totals.saved < 0 ? "#dc2626" : dark }}>{Math.round(totals.saved)}€</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl mb-3.5" style={{ padding: "14px 4px 6px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={rows} barGap={3} margin={{ top: 0, right: 6, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}`} />
                <Tooltip formatter={(v: number) => formatEur(v)} contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="income" name="Pajamos" fill={accent} radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="expenses" name="Išlaidos" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden mb-3.5">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] px-3.5 py-2.5" style={{ background: light }}>
              {["Mėnuo", "Paj.", "Išl.", "Sut."].map((h) => (
                <div key={h} className="text-[10px] font-bold uppercase" style={{ color: dark }}>{h}</div>
              ))}
            </div>
            {[...rows].reverse().map((m, i) => (
              <div key={i} className="grid grid-cols-[1.4fr_1fr_1fr_1fr] px-3.5 py-2 border-t border-[#f9fafb]">
                <div className="text-xs font-medium">{m.label}</div>
                <div className="text-xs font-medium" style={{ color: "#16a34a" }}>{Math.round(m.income)}€</div>
                <div className="text-xs font-medium" style={{ color: "#dc2626" }}>{Math.round(m.expenses)}€</div>
                <div className="text-xs font-bold" style={{ color: m.saved < 0 ? "#dc2626" : dark }}>{Math.round(m.saved)}€</div>
              </div>
            ))}
          </div>

          <ExportAllButton accent={accent} />
        </>
      )}
    </div>
  );
}

function ExportAllButton({ accent }: { accent: string }) {
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
      className="w-full text-sm px-3 py-2.5 rounded-xl bg-white font-medium disabled:opacity-50"
      style={{ color: accent }}
    >
      {exporting ? "Ruošiama…" : "⬇ Eksportuoti visus duomenis"}
    </button>
  );
}
