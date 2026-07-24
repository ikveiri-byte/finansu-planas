"use client";

import { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import type { Transaction, ExpenseCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatEur, formatShortDate } from "@/lib/format";
import CategoryIcon from "./CategoryIcon";
import CategoryModal from "./CategoryModal";

type Props = {
  transactions: Transaction[]; // only type === 'expense'
  year: number;
  month: number;
  onChanged: () => void;
};

export default function CategoryBreakdown({ transactions, year, month, onChanged }: Props) {
  const [openCategory, setOpenCategory] = useState<ExpenseCategory | null>(null);

  const byCategory = CATEGORIES.map((cat) => {
    const items = transactions.filter((t) => t.category === cat);
    const fixedItems = items.filter((t) => t.is_fixed);
    const varItems = items.filter((t) => !t.is_fixed);
    const total = items.reduce((s, t) => s + t.amount, 0);
    return { cat, items, fixedItems, varItems, total };
  }).filter((g) => g.items.length > 0);

  if (byCategory.length === 0) {
    return <p className="text-sm text-center py-6" style={{ color: "var(--muted)" }}>Šį mėnesį išlaidų dar nėra.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {byCategory.map(({ cat, items, fixedItems, varItems, total }) => (
        <div key={cat} className="app-surface rounded-card overflow-hidden">
          <div
            className="px-4 pt-3.5 pb-3 cursor-pointer border-b"
            style={{ borderColor: "var(--line-soft)" }}
            onClick={() => setOpenCategory(cat)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="flex items-center justify-center flex-shrink-0 rounded-full"
                  style={{ width: 34, height: 34, background: "var(--line-soft)", color: "var(--blue-700)" }}
                >
                  <CategoryIcon category={cat} size={18} />
                </span>
                <span className="text-[13.5px] font-semibold truncate" style={{ color: "var(--text)" }}>
                  {cat}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="app-numeric text-base font-bold" style={{ color: "var(--text)" }}>
                  {formatEur(total)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCategory(cat);
                  }}
                  aria-label={`Pridėti į ${cat}`}
                  className="rounded-full flex items-center justify-center flex-shrink-0 app-focusable"
                  style={{ width: 30, height: 30, background: "var(--line-soft)", color: "var(--blue-700)" }}
                >
                  <Plus size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {fixedItems.length > 0 && (
            <div className="px-3 pt-2 pb-2 flex flex-wrap gap-1.5" style={{ background: "var(--surface)" }}>
              {fixedItems.map((it) => (
                <div
                  key={it.id}
                  onClick={() => setOpenCategory(cat)}
                  className="rounded-full px-2.5 py-1 text-[11px] flex items-center gap-1.5 cursor-pointer bg-surface-strong"
                  style={{ border: "1px solid var(--line)", color: "var(--text)" }}
                >
                  <CalendarClock size={11} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--blue-600)" }} />
                  <span className="font-medium truncate max-w-[110px]">{it.description}</span>
                  <span className="app-numeric" style={{ color: "var(--muted)" }}>{formatEur(it.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {varItems.length > 0 && (
            <div className="px-4 pt-2 pb-2.5">
              {varItems.slice(0, 3).map((it) => (
                <div key={it.id} className="flex justify-between gap-2 text-xs py-0.5">
                  <span className="truncate" style={{ color: "var(--text-secondary)" }}>
                    <span className="mr-1" style={{ color: "var(--muted)" }}>{formatShortDate(it.txn_date)}</span>
                    {it.description}
                  </span>
                  <span className="app-numeric font-medium flex-shrink-0" style={{ color: "var(--text)" }}>
                    {formatEur(it.amount)}
                  </span>
                </div>
              ))}
              {varItems.length > 3 && (
                <button
                  onClick={() => setOpenCategory(cat)}
                  className="text-[11px] mt-0.5 font-medium app-focusable"
                  style={{ color: "var(--blue-700)" }}
                >
                  +{varItems.length - 3} daugiau...
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {openCategory && (
        <CategoryModal
          category={openCategory}
          transactions={transactions.filter((t) => t.category === openCategory)}
          year={year}
          month={month}
          onClose={() => setOpenCategory(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}
