"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Transaction, ExpenseCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatEur, formatShortDate } from "@/lib/format";
import CategoryIcon from "./CategoryIcon";
import CategoryModal from "./CategoryModal";

type Props = {
  transactions: Transaction[]; // tik type === 'expense'
  year: number;
  month: number;
  onChanged: () => void;
};

export default function CategoryBreakdown({ transactions, year, month, onChanged }: Props) {
  const [openCategory, setOpenCategory] = useState<ExpenseCategory | null>(null);

  const groups = CATEGORIES.map((cat) => {
    const items = transactions.filter((t) => t.category === cat);
    return {
      cat,
      items,
      fixedItems: items.filter((t) => t.is_fixed),
      varItems: items.filter((t) => !t.is_fixed),
      total: items.reduce((s, t) => s + t.amount, 0),
    };
  })
    .filter((g) => g.items.length > 0)
    .sort((a, b) => b.total - a.total);

  if (groups.length === 0) {
    return (
      <div className="app-sunken rounded-panel px-5 py-8 text-center">
        <p className="mx-auto max-w-[280px] text-[13.5px] leading-relaxed text-ink-2">
          Šį mėnesį išlaidų dar nėra. Pradėk nuo pirmo pirkinio.
        </p>
      </div>
    );
  }

  const grandTotal = groups.reduce((s, g) => s + g.total, 0);
  const max = groups[0].total || 1;
  const count = transactions.length;

  return (
    <div className="app-card rounded-panel px-3 py-3 lg:px-6 lg:py-5">
      <div className="mb-3 flex items-baseline gap-3 px-2 lg:px-0">
        <h2 className="app-display text-[17px] lg:text-[20px]">Kur nuėjo</h2>
        <span className="text-[13px] text-ink-3">
          {groups.length} kategorijos · {count} įrašų
        </span>
        <div className="flex-1" />
        <span className="app-num text-[15px] lg:text-[17px]">{formatEur(grandTotal)}</span>
      </div>

      <div className="flex flex-col">
        {groups.map((g, index) => {
          const share = grandTotal > 0 ? (g.total / grandTotal) * 100 : 0;
          const barWidth = (g.total / max) * 100;
          const leading = index === 0;

          return (
            <div
              key={g.cat}
              className={index > 0 ? "border-t border-line-soft" : undefined}
            >
              <div className="flex items-center gap-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setOpenCategory(g.cat)}
                  className="app-focusable flex min-h-[52px] min-w-0 flex-1 items-center gap-3 rounded-control px-2 text-left hover:bg-sunken"
                >
                  <span
                    className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[13px]"
                    style={{
                      background: leading ? "var(--accent-tint)" : "var(--sunken)",
                    }}
                  >
                    <CategoryIcon category={g.cat} size={18} />
                  </span>

                  <span className="min-w-0 flex-1 lg:flex lg:items-center lg:gap-4">
                    <span className="block truncate text-[14.5px] font-semibold lg:w-[150px] lg:flex-shrink-0 lg:font-medium">
                      {g.cat}
                    </span>
                    <span className="mt-1.5 block h-[9px] overflow-hidden rounded-full lg:mt-0 lg:h-[10px] lg:flex-1"
                      style={{ background: "var(--accent-track)" }}
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          background: leading ? "var(--accent)" : "var(--accent-bar)",
                        }}
                      />
                    </span>
                  </span>

                  <span className="hidden w-[52px] flex-shrink-0 text-right text-[13px] text-ink-3 lg:block">
                    {share.toFixed(1)} %
                  </span>
                  <span className="app-num w-[92px] flex-shrink-0 text-right text-[17px] lg:w-[104px] lg:text-[19px]">
                    {formatEur(g.total)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpenCategory(g.cat)}
                  aria-label={`Pridėti į kategoriją ${g.cat}`}
                  className="app-focusable flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[12px] bg-sunken text-ink-2"
                >
                  <Plus size={15} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>

              {/* didžiausia kategorija išskleista */}
              {leading && (
                <div className="flex flex-col gap-2 px-2 pb-3 pl-[52px]">
                  {g.fixedItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {g.fixedItems.map((it) => (
                        <span
                          key={it.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-[12px]"
                        >
                          <span className="truncate">{it.description}</span>
                          <span className="app-num text-ink-2">{formatEur(it.amount)}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {g.varItems.length > 0 && (
                    <div className="grid gap-x-8 gap-y-1 lg:grid-cols-2">
                      {g.varItems.slice(0, 4).map((it) => (
                        <div key={it.id} className="flex items-center gap-2.5 text-[13.5px]">
                          <span className="w-[42px] flex-shrink-0 text-ink-3">
                            {formatShortDate(it.txn_date)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-ink-2">
                            {it.description}
                          </span>
                          <span className="app-num text-[13.5px]">{formatEur(it.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {g.varItems.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setOpenCategory(g.cat)}
                      className="app-focusable self-start text-[12.5px] font-bold text-accent-deep"
                    >
                      Dar {g.varItems.length - 4}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
