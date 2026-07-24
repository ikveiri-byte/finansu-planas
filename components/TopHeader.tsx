"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMonth } from "@/lib/monthContext";
import { useUndoRedo } from "@/lib/undoRedo";
import { monthLabel } from "@/lib/monthColors";

const TABS = [
  { href: "/menuo", label: "Mėnuo" },
  { href: "/statistika", label: "Statistika" },
  { href: "/pirkiniai-skolos", label: "Pirkiniai · Skolos" },
  { href: "/fiksuotos", label: "Fiksuotos išlaidos" },
];

export default function TopHeader() {
  const pathname = usePathname();
  const { year, month, palette, next, prev } = useMonth();
  const { undo, redo, canUndo, canRedo, lastLabel } = useUndoRedo();

  const showMonthRow = pathname?.startsWith("/menuo") || pathname?.startsWith("/pirkiniai-skolos");
  const showUndoRow = (pathname?.startsWith("/statistika") || pathname?.startsWith("/fiksuotos")) && (canUndo || canRedo);

  return (
    <div className="sticky top-0 z-40 bg-card" style={{ boxShadow: "0 1px 0 #e5e7eb" }}>
      <div className="flex overflow-x-auto no-scrollbar" style={{ borderBottom: "2px solid #f3f4f6" }}>
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 text-center whitespace-nowrap"
              style={{
                padding: "12px 4px",
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? palette.accent : "#9ca3af",
                borderBottom: `2.5px solid ${active ? palette.accent : "transparent"}`,
                minWidth: 70,
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {showMonthRow && (
        <div className="flex items-center justify-between" style={{ padding: "8px 14px" }}>
          <button
            onClick={prev}
            aria-label="Ankstesnis mėnuo"
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: palette.light, width: 34, height: 34, color: palette.dark, fontSize: 20, border: "none" }}
          >
            ‹
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>{monthLabel(year, month)}</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={undo}
              disabled={!canUndo}
              title={canUndo ? `Atšaukti: ${lastLabel}` : ""}
              className="rounded-full flex items-center justify-center"
              style={{
                background: canUndo ? palette.light : "#f3f4f6",
                width: 34,
                height: 34,
                color: canUndo ? palette.dark : "#d1d5db",
                fontSize: 17,
                border: "none",
              }}
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="rounded-full flex items-center justify-center"
              style={{
                background: canRedo ? palette.light : "#f3f4f6",
                width: 34,
                height: 34,
                color: canRedo ? palette.dark : "#d1d5db",
                fontSize: 17,
                border: "none",
              }}
            >
              ↪
            </button>
            <button
              onClick={next}
              aria-label="Kitas mėnuo"
              className="rounded-full flex items-center justify-center"
              style={{ background: palette.light, width: 34, height: 34, color: palette.dark, fontSize: 20, border: "none" }}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {showUndoRow && (
        <div className="flex items-center gap-2" style={{ padding: "6px 14px", borderTop: "1px solid #f3f4f6" }}>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-1 rounded-lg"
            style={{ padding: "5px 12px", background: canUndo ? palette.light : "#f3f4f6", color: canUndo ? palette.dark : "#d1d5db", fontSize: 12, fontWeight: 600, border: "none" }}
          >
            ↩ {canUndo ? lastLabel : "Atšaukti"}
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center gap-1 rounded-lg"
            style={{ padding: "5px 12px", background: canRedo ? palette.light : "#f3f4f6", color: canRedo ? palette.dark : "#d1d5db", fontSize: 12, fontWeight: 600, border: "none" }}
          >
            ↪ Pakartoti
          </button>
        </div>
      )}
    </div>
  );
}
