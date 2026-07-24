"use client";

import { useState } from "react";
import type { Transaction, ExpenseCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { CAT_ICON } from "@/lib/categoryIcons";
import { formatEur, formatShortDate } from "@/lib/format";
import CategoryModal from "./CategoryModal";

type Props = {
  transactions: Transaction[]; // only type === 'expense'
  accent: string;
  light: string;
  year: number;
  month: number;
  onChanged: () => void;
};

export default function CategoryBreakdown({ transactions, accent, light, year, month, onChanged }: Props) {
  const [openCategory, setOpenCategory] = useState<ExpenseCategory | null>(null);

  const byCategory = CATEGORIES.map((cat) => {
    const items = transactions.filter((t) => t.category === cat);
    const fixedItems = items.filter((t) => t.is_fixed);
    const varItems = items.filter((t) => !t.is_fixed);
    const total = items.reduce((s, t) => s + t.amount, 0);
    return { cat, items, fixedItems, varItems, total };
  }).filter((g) => g.items.length > 0);

  if (byCategory.length === 0) {
    return <p className="text-muted text-sm text-center py-6">Šį mėnesį išlaidų dar nėra.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {byCategory.map(({ cat, items, fixedItems, varItems, total }) => (
        <div key={cat} className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <div className="px-3.5 pt-3 pb-2.5 cursor-pointer" style={{ borderBottom: `1.5px solid ${light}` }} onClick={() => setOpenCategory(cat)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{CAT_ICON[cat]}</span>
                <span className="text-[13px] font-semibold text-[#374151]">{cat}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#111]">{formatEur(total)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCategory(cat);
                  }}
                  className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                  style={{ background: light, color: accent }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {fixedItems.length > 0 && (
            <div className="px-3 pt-1.5 pb-2 flex flex-wrap gap-1.5" style={{ background: `${light}66` }}>
              {fixedItems.map((it) => (
                <div
                  key={it.id}
                  onClick={() => setOpenCategory(cat)}
                  className="bg-white rounded-full px-2.5 py-1 text-[11px] text-[#374151] flex items-center gap-1.5 cursor-pointer"
                  style={{ border: `1px solid ${accent}44` }}
                >
                  <span style={{ color: accent, fontSize: 8 }}>⬤</span>
                  <span className="font-medium">{it.description}</span>
                  <span className="text-muted">{formatEur(it.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {varItems.length > 0 && (
            <div className="px-3.5 pt-1.5 pb-2">
              {varItems.slice(0, 3).map((it) => (
                <div key={it.id} className="flex justify-between text-xs text-[#6b7280] py-0.5">
                  <span>
                    <span className="text-[#d1d5db] mr-1">{formatShortDate(it.txn_date)}</span>
                    {it.description}
                  </span>
                  <span className="font-medium text-[#374151]">{formatEur(it.amount)}</span>
                </div>
              ))}
              {varItems.length > 3 && (
                <button onClick={() => setOpenCategory(cat)} className="text-[11px] mt-0.5" style={{ color: accent }}>
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
          accent={accent}
          light={light}
          year={year}
          month={month}
          onClose={() => setOpenCategory(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}
