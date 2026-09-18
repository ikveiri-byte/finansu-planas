"use client";

import { useEffect, useState } from "react";
import { CalendarClock, PauseCircle } from "lucide-react";
import type { FixedExpense } from "@/lib/types";
import { fetchFixedExpenses, updateFixedExpenseRange, stopFixedExpense } from "@/lib/db";
import { formatEur } from "@/lib/format";
import { MONTH_COLORS } from "@/lib/monthColors";
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
    return (
      fx.end_year > today.getFullYear() ||
      (fx.end_year === today.getFullYear() && (fx.end_month ?? 12) >= today.getMonth() + 1)
    );
  }

  if (loading) {
    return <p className="py-10 text-center text-sm text-ink-3">Kraunama…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="app-sunken rounded-panel px-6 py-12 text-center">
        <p className="mx-auto max-w-[320px] text-[14px] leading-relaxed text-ink-2">
          Fiksuotų išlaidų dar nėra. Pridėk jas pažymėdama varnelę, kai įrašai išlaidą.
        </p>
      </div>
    );
  }

  const activeTotal = items
    .filter(isActive)
    .reduce((s, fx) => s + fx.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="app-accent flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-card px-5 py-[18px]">
        <span className="text-[13px] font-bold text-accent-deep">Kas mėnesį kartojasi</span>
        <div className="flex-1" />
        <span className="app-num text-[28px]">{formatEur(activeTotal)}</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {items.map((fx) => {
          const active = isActive(fx);
          return (
            <div
              key={fx.id}
              className={`rounded-panel px-5 py-[18px] ${active ? "app-card" : "app-sunken"}`}
            >
              <div className="mb-3 flex items-start gap-3">
                <span
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[15px]"
                  style={{ background: active ? "var(--accent-tint)" : "var(--line-soft)" }}
                >
                  <CategoryIcon category={fx.category} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{fx.description}</p>
                  <p className="truncate text-[12.5px] text-ink-3">{fx.category}</p>
                </div>
                <span className="app-num flex-shrink-0 text-[19px]">{formatEur(fx.amount)}</span>
              </div>

              {editingId !== fx.id && (
                <p className="mb-3.5 text-[12.5px] text-ink-3">
                  Nuo {MONTH_COLORS[fx.start_month].name.toLowerCase()} {fx.start_year}
                  {fx.end_year
                    ? ` iki ${MONTH_COLORS[fx.end_month ?? 12].name.toLowerCase()} ${fx.end_year}`
                    : active
                    ? " · tebevyksta"
                    : ""}
                </p>
              )}

              {editingId === fx.id ? (
                <RangeEditor
                  fx={fx}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => {
                    setEditingId(null);
                    load();
                  }}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(fx.id)}
                    className="app-focusable flex min-h-[44px] items-center gap-2 rounded-control bg-ink px-4 text-[13.5px] font-bold text-card"
                  >
                    <CalendarClock size={16} strokeWidth={1.9} aria-hidden="true" />
                    Koreguoti trukmę
                  </button>
                  {active && (
                    <button
                      type="button"
                      onClick={() =>
                        stopFixedExpense(fx.id, today.getFullYear(), today.getMonth() + 1).then(
                          load
                        )
                      }
                      className="app-focusable flex min-h-[44px] items-center gap-2 rounded-control border border-line px-4 text-[13.5px] font-bold text-ink-2"
                    >
                      <PauseCircle size={16} strokeWidth={1.9} aria-hidden="true" />
                      Sustabdyti nuo šio mėn.
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RangeEditor({
  fx,
  onCancel,
  onSaved,
}: {
  fx: FixedExpense;
  onCancel: () => void;
  onSaved: () => void;
}) {
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

  const field =
    "app-focusable min-h-[44px] w-full rounded-[13px] border border-line bg-sunken-2 px-3 text-[14px] text-ink";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-[12.5px] font-bold text-ink-2">Nuo</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
            className={field}
            min={1}
            max={12}
            aria-label="Pradžios mėnuo"
          />
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className={field}
            aria-label="Pradžios metai"
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[12.5px] font-bold text-ink-2">Iki</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="—"
            className={field}
            min={1}
            max={12}
            aria-label="Pabaigos mėnuo"
          />
          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="be pabaigos"
            className={field}
            aria-label="Pabaigos metai"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="app-focusable min-h-[44px] flex-1 rounded-control border border-line text-[14px] font-bold text-ink-2"
        >
          Atšaukti
        </button>
        <button
          type="button"
          onClick={save}
          className="app-focusable min-h-[44px] flex-1 rounded-control bg-ink text-[14px] font-bold text-card"
        >
          Išsaugoti
        </button>
      </div>
    </div>
  );
}
