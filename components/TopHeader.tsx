"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Redo2, Undo2 } from "lucide-react";
import { useMonth } from "@/lib/monthContext";
import { useUndoRedo } from "@/lib/undoRedo";
import { MONTH_COLORS, MONTH_LIST } from "@/lib/monthColors";
import TransactionFormModal from "./TransactionFormModal";

export default function TopHeader() {
  const pathname = usePathname();
  const { year, month, next, prev, goTo } = useMonth();
  const { undo, redo, canUndo, canRedo, lastLabel } = useUndoRedo();
  const [addOpen, setAddOpen] = useState(false);

  const showMonth =
    pathname?.startsWith("/menuo") || pathname?.startsWith("/pirkiniai-skolos");

  const iconBtn =
    "app-focusable flex h-11 w-11 items-center justify-center rounded-control border border-line bg-card text-ink-2 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="border-b border-line bg-card lg:sticky lg:top-0 lg:z-40">
      <div className="mx-auto w-full max-w-app px-3.5 py-3 lg:px-10 lg:py-5">
        <div className="flex flex-col gap-3.5">
          {/* eilutė: mėnuo + veiksmai */}
          <div className="flex items-center gap-2 lg:gap-4">
            {showMonth && (
              <button
                type="button"
                onClick={prev}
                aria-label="Ankstesnis mėnuo"
                className={`${iconBtn} lg:hidden`}
              >
                <ChevronLeft size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            )}

            <h1 className="app-display flex flex-1 items-baseline justify-center gap-2 text-[20px] lg:flex-none lg:justify-start lg:text-[36px]">
              {showMonth ? (
                <>
                  <span>{MONTH_COLORS[month].name}</span>
                  <span className="font-medium text-ink-3 lg:text-[26px]">{year}</span>
                </>
              ) : pathname?.startsWith("/statistika") ? (
                "Statistika"
              ) : (
                "Fiksuotos išlaidos"
              )}
            </h1>

            <div className="hidden flex-1 lg:block" />

            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              aria-label={canUndo ? `Atšaukti: ${lastLabel}` : "Atšaukti (nėra ką atšaukti)"}
              title={canUndo ? `Atšaukti: ${lastLabel}` : undefined}
              className={iconBtn}
            >
              <Undo2 size={18} strokeWidth={1.9} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Pakartoti veiksmą"
              className={`${iconBtn} hidden lg:flex`}
            >
              <Redo2 size={18} strokeWidth={1.9} aria-hidden="true" />
            </button>

            {showMonth && (
              <button
                type="button"
                onClick={next}
                aria-label="Kitas mėnuo"
                className={`${iconBtn} lg:hidden`}
              >
                <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="app-focusable hidden min-h-[44px] items-center gap-2 rounded-control bg-ink px-5 text-[14.5px] font-bold text-card lg:flex"
            >
              <Plus size={17} strokeWidth={2.2} aria-hidden="true" />
              Naujas įrašas
            </button>
          </div>

          {/* metų juosta — tik plačiame ekrane */}
          {showMonth && (
            <div className="hidden grid-cols-12 gap-1.5 lg:grid">
              {MONTH_LIST.map((m) => {
                const active = m === month;
                const future =
                  year > new Date().getFullYear() ||
                  (year === new Date().getFullYear() && m > new Date().getMonth() + 1);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => goTo(year, m)}
                    aria-current={active ? "true" : undefined}
                    aria-label={`${MONTH_COLORS[m].name} ${year}`}
                    className={`app-focusable min-h-[40px] rounded-[12px] text-[13px] ${
                      active
                        ? "bg-accent font-bold text-ink"
                        : future
                        ? "border border-dashed border-line-dashed font-medium text-ink-3"
                        : "border border-line bg-card font-medium text-ink-2 hover:bg-sunken"
                    }`}
                  >
                    {MONTH_COLORS[m].short}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <TransactionFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        year={year}
        month={month}
        onSaved={() => {
          // MonthView klausosi šito ir persikrauna
          window.dispatchEvent(new CustomEvent("finansai:changed"));
        }}
      />
    </div>
  );
}
