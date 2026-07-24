"use client";

import { useEffect, useState } from "react";
import type { FixedExpense } from "@/lib/types";
import { fetchFixedExpenses, updateFixedExpenseRange, stopFixedExpense } from "@/lib/db";
import { formatEur } from "@/lib/format";
import { MONTH_COLORS } from "@/lib/monthColors";
import { useMonth } from "@/lib/monthContext";

const today = new Date();

export default function FixedExpensesView() {
  const { palette } = useMonth();
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

  if (loading) return <p className="text-center text-muted py-10">Kraunama…</p>;

  return (
    <div>
      {items.length === 0 ? (
        <p className="text-muted text-sm">Fiksuotų išlaidų dar nėra. Pridėk jas pažymėdama varnelę pridedant išlaidą.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((fx) => (
            <div key={fx.id} className="bg-white rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-[#111]">{fx.description}</p>
                  <p className="text-xs text-muted">{fx.category}</p>
                </div>
                <span className="font-bold" style={{ color: palette.accent }}>{formatEur(fx.amount)}</span>
              </div>
              <p className="text-xs text-muted mb-3">
                Nuo {MONTH_COLORS[fx.start_month].name} {fx.start_year}
                {fx.end_year
                  ? ` iki ${MONTH_COLORS[fx.end_month ?? 12].name} ${fx.end_year}`
                  : isActive(fx)
                  ? " · tebevyksta"
                  : ""}
              </p>

              {editingId === fx.id ? (
                <RangeEditor fx={fx} accent={palette.accent} onCancel={() => setEditingId(null)} onSaved={() => { setEditingId(null); load(); }} />
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(fx.id)} className="text-sm px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#374151]">
                    Koreguoti trukmę
                  </button>
                  {isActive(fx) && (
                    <button
                      onClick={() => stopFixedExpense(fx.id, today.getFullYear(), today.getMonth() + 1).then(load)}
                      className="text-sm px-3 py-1.5 rounded-lg border border-[#e5e7eb]"
                      style={{ color: "#dc2626" }}
                    >
                      Sustabdyti nuo šio mėn.
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeEditor({ fx, accent, onCancel, onSaved }: { fx: FixedExpense; accent: string; onCancel: () => void; onSaved: () => void }) {
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

  const inputStyle = { border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "6px 8px" } as const;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-10 text-muted">Nuo</span>
        <input type="number" value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))} className="w-16" style={inputStyle} min={1} max={12} />
        <input type="number" value={startYear} onChange={(e) => setStartYear(Number(e.target.value))} className="w-20" style={inputStyle} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-10 text-muted">Iki</span>
        <input
          type="number"
          value={endMonth}
          onChange={(e) => setEndMonth(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="—"
          className="w-16"
          style={inputStyle}
          min={1}
          max={12}
        />
        <input
          type="number"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="be pabaigos"
          className="w-24"
          style={inputStyle}
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 rounded-lg border border-[#e5e7eb] py-1.5">
          Atšaukti
        </button>
        <button onClick={save} className="flex-1 rounded-lg text-white py-1.5" style={{ background: accent }}>
          Išsaugoti
        </button>
      </div>
    </div>
  );
}
