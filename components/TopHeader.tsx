"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Undo2, Redo2 } from "lucide-react";
import { useMonth } from "@/lib/monthContext";
import { useUndoRedo } from "@/lib/undoRedo";
import { monthLabel } from "@/lib/monthColors";

const TABS = [
  { href: "/menuo", label: "Mėnuo" },
  { href: "/statistika", label: "Statistika" },
  { href: "/pirkiniai-skolos", label: "Pirkiniai · Skolos" },
  { href: "/fiksuotos", label: "Fiksuotos" },
];

export default function TopHeader() {
  const pathname = usePathname();
  const { year, month, next, prev } = useMonth();
  const { undo, redo, canUndo, canRedo, lastLabel } = useUndoRedo();

  const showMonthRow = pathname?.startsWith("/menuo") || pathname?.startsWith("/pirkiniai-skolos");
  const showUndoRow = (pathname?.startsWith("/statistika") || pathname?.startsWith("/fiksuotos")) && (canUndo || canRedo);

  return (
    <div className="sticky top-0 z-40 bg-surface-strong/95 backdrop-blur" style={{ boxShadow: "0 1px 0 var(--line-soft)" }}>
      <div className="flex gap-1 overflow-x-auto no-scrollbar" style={{ padding: "10px 10px 8px" }}>
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-shrink-0 text-center whitespace-nowrap rounded-full transition-colors app-focusable"
              style={{
                padding: "9px 14px",
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                color: active ? "#ffffff" : "var(--text-secondary)",
                background: active ? "linear-gradient(135deg, var(--blue-700), var(--blue-500))" : "transparent",
                minWidth: 44,
                minHeight: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {showMonthRow && (
        <div className="flex items-center justify-between border-t" style={{ padding: "10px 14px", borderColor: "var(--line-soft)" }}>
          <button
            onClick={prev}
            aria-label="Ankstesnis mėnuo"
            className="rounded-full flex items-center justify-center flex-shrink-0 app-focusable"
            style={{ background: "var(--line-soft)", width: 40, height: 40, color: "var(--navy-900)", border: "none" }}
          >
            <ChevronLeft size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <span className="app-numeric" style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>
            {monthLabel(year, month)}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={undo}
              disabled={!canUndo}
              aria-label={canUndo ? `Atšaukti: ${lastLabel}` : "Atšaukti (nėra ką atšaukti)"}
              title={canUndo ? `Atšaukti: ${lastLabel}` : undefined}
              className="rounded-full flex items-center justify-center app-focusable"
              style={{
                background: canUndo ? "var(--line-soft)" : "transparent",
                width: 40,
                height: 40,
                color: canUndo ? "var(--navy-900)" : "var(--muted)",
                border: "none",
                opacity: canUndo ? 1 : 0.42,
                cursor: canUndo ? "pointer" : "not-allowed",
              }}
            >
              <Undo2 size={19} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              aria-label="Grąžinti"
              className="rounded-full flex items-center justify-center app-focusable"
              style={{
                background: canRedo ? "var(--line-soft)" : "transparent",
                width: 40,
                height: 40,
                color: canRedo ? "var(--navy-900)" : "var(--muted)",
                border: "none",
                opacity: canRedo ? 1 : 0.42,
                cursor: canRedo ? "pointer" : "not-allowed",
              }}
            >
              <Redo2 size={19} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="Kitas mėnuo"
              className="rounded-full flex items-center justify-center flex-shrink-0 app-focusable"
              style={{ background: "var(--line-soft)", width: 40, height: 40, color: "var(--navy-900)", border: "none" }}
            >
              <ChevronRight size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {showUndoRow && (
        <div className="flex items-center gap-2 border-t" style={{ padding: "8px 14px", borderColor: "var(--line-soft)" }}>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 rounded-full app-focusable"
            style={{
              padding: "6px 14px",
              minHeight: 36,
              background: canUndo ? "var(--line-soft)" : "transparent",
              color: canUndo ? "var(--navy-900)" : "var(--muted)",
              fontSize: 12.5,
              fontWeight: 600,
              border: "none",
              opacity: canUndo ? 1 : 0.42,
              cursor: canUndo ? "pointer" : "not-allowed",
            }}
          >
            <Undo2 size={16} strokeWidth={1.8} aria-hidden="true" />
            {canUndo ? lastLabel : "Atšaukti"}
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center gap-1.5 rounded-full app-focusable"
            style={{
              padding: "6px 14px",
              minHeight: 36,
              background: canRedo ? "var(--line-soft)" : "transparent",
              color: canRedo ? "var(--navy-900)" : "var(--muted)",
              fontSize: 12.5,
              fontWeight: 600,
              border: "none",
              opacity: canRedo ? 1 : 0.42,
              cursor: canRedo ? "pointer" : "not-allowed",
            }}
          >
            <Redo2 size={16} strokeWidth={1.8} aria-hidden="true" />
            Pakartoti
          </button>
        </div>
      )}
    </div>
  );
}
