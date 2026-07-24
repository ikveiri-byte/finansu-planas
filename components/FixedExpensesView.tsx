"use client";

import { useEffect, useState } from "react";
import { CalendarClock, PauseCircle, CalendarCheck } from "lucide-react";
import type { FixedExpense } from "@/lib/types";
import { fetchFixedExpenses, updateFixedExpenseRange, stopFixedExpense } from "@/lib/db";
import { formatEur } from "@/lib/format";
import { MONTH_COLORS } from "@/lib/monthColors";
import CardWaves from "./CardWaves";
import CategoryIcon from "./CategoryIcon";

const today = new Date();

export default function FixedExpensesView() {
  const [items, setItems] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setItems(await fetchFixedExpenses());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function isActive(fx: FixedExpense) {
    if (fx.end_year == null) return true;
    return fx.end_year > today.getFullYear() || (fx.end_year === today.getFullYear() && (fx.end_month ?? 12) >= today.getMonth() + 1);
  }

  if (loading) return <p className="text-center text-sm py-10" style={{ color: "var(--muted)" }}>Kraunama…</p>;

  if (items.length === 0) {
    return (
      <div className="app-hero relative overflow-hidden rounded-panel flex flex-col items-center justify-center text-center" style={{ minHeight: 420, padding: 32 }}>
        <CardWaves opacity={0.16} />
        <div className="relative z-10 flex flex-col items-center">
          <span
            className="flex items-center justify-center rounded-card mb-5"
            style={{ width: 72, height: 72, background: "rgba(255,255,255,0.12)" }}
          >
            <CalendarCheck size={32} strokeWidth={1.6} color="#fff" aria-hidden="true" />
          </span>
          <p className="text-[15px]" style={{ color: "rgba(255,255,255,.9)", maxWidth: 260 }}>
            Fiksuotų išlaidų dar nėra. Pridėk jas pažymėdama varnelę pridedant išlaidą.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((fx) => (
        <div key={fx.id} className="app-hero relative overflow-hidden rounded-card p-4">
          <CardWaves opacity={0.14} />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="flex items-center justify-center flex-shrink-0 rounded-card"
                  style={{ width: 44, height: 44, background: "rgba(255,255,255,0.12)" }}
                >
                  <CategoryIcon category={fx.category} size={21} color="#ffffff" />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{fx.description}</p>
                  <p className="text-xs truncate" style={{ color: "rgba(255,255,255,.65)" }}>{fx.category}</p>
                </div>
              </div>
              <span className="app-numeric font-bold text-white flex-shrink-0" style={{ fontSize: 18 }}>
                {formatEur(fx.amount)}
              </span>
            </div>

            {editingId !== fx.id && (
              <p className="text-xs mb-3.5" style={{ color: "rgba(255,255,255,.65)" }}>
                Nuo {MONTH_COLORS[fx.start_month].name} {fx.start_year}
                {fx.end_year
                  ? ` iki ${MONTH_COLORS[fx.end_month ?? 12].name} ${fx.end_year}`
                  : isActive(fx)
                  ? " · tebevyksta"
                  : ""}
              </p>
            )}

            {editingId === fx.id ? (
              <RangeEditor fx={fx} onCancel={() => setEditingId(null)} onSaved={() => { setEditingId(null); load(); }} />
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEditingId(fx.id)}
                  className="flex items-center gap-1.5 text-sm font-medium rounded-control text-white app-focusable"
                  style={{ padding: "10px 16px", minHeight: 44, background: "linear-gradient(135deg, var(--blue-600), var(--cyan-400))" }}
                >
                  <CalendarClock size={16} strokeWidth={1.8} aria-hidden="true" />
                  Koreguoti trukmę
                </button>
                {isActive(fx) && (
                  <button
                    onClick={() => stopFixedExpense(fx.id, today.getFullYear(), today.getMonth() + 1).then(load)}
                    className="flex items-center gap-1.5 text-sm font-medium rounded-control text-white app-focusable"
                    style={{ padding: "10px 16px", minHeight: 44, border: "1.5px solid rgba(255,255,255,.35)" }}
                  >
                    <PauseCircle size={16} strokeWidth={1.8} aria-hidden="true" />
                    Sustabdyti nuo šio mėn.
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RangeEditor({ fx, onCancel, onSaved }: { fx: FixedExpense; onCancel: () => void; onSaved: () => void }) {
  const [startYear, setStartYear] = useState(fx.start_year);
  const [startMonth, setStartMonth] = useState(fx.start_month);
  const [endYear, setEndYear] = useState<number | "">(fx.end_year ?? "");
  const [endMonth, setEndMonth] = useState<number | "">(fx.end_month ?? "");

  async function save() {
    await updateFixedExpenseRange(fx.id, {
      start_year: startYear,
      start_month: startMonth,
      end_year: endYear === "" ? null : endYear,
      end_month: endMonth === "" ? null : (endMonth as number),
    });
    onSaved();
  }

  const inputStyle = {
    border: "1.5px solid rgba(255,255,255,.25)",
    borderRadius: "var(--radius-control)",
    padding: "10px 12px",
    background: "rgba(255,255,255,.08)",
    color: "#fff",
    minHeight: 44,
  } as const;

  return (
    <div className="space-y-3 text-sm relative z-10">
      <div>
        <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,.65)" }}>Nuo</p>
        <div className="flex gap-2">
          <input type="number" value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))} className="w-full" style={inputStyle} min={1} max={12} aria-label="Pradžios mėnuo" />
          <input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="w-full" style={inputStyle} aria-label="Pradžios metai" />
        </div>
      </div>
      <div>
        <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,.65)" }}>Iki</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="—"
            className="w-full placeholder:text-white/40"
            style={inputStyle}
            min={1}
            max={12}
            aria-label="Pabaigos mėnuo"
          />
          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="be pabaigos"
            className="w-full placeholder:text-white/40"
            style={inputStyle}
            aria-label="Pabaigos metai"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 rounded-control text-white app-focusable"
          style={{ border: "1.5px solid rgba(255,255,255,.35)", minHeight: 44 }}
        >
          Atšaukti
        </button>
        <button
          onClick={save}
          className="flex-1 rounded-control text-white font-semibold app-focusable"
          style={{ background: "linear-gradient(135deg, var(--blue-600), var(--cyan-400))", minHeight: 44 }}
        >
          Išsaugoti
        </button>
      </div>
    </div>
  );
}
