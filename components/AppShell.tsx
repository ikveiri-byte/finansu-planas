"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { useMonth } from "@/lib/monthContext";
import TopHeader from "./TopHeader";
import QuickAddFab from "./QuickAddFab";

const NAV = [
  { href: "/menuo", label: "Mėnuo", short: "Mėnuo", emoji: "🗓️" },
  { href: "/statistika", label: "Statistika", short: "Statistika", emoji: "📊" },
  { href: "/pirkiniai-skolos", label: "Pirkiniai ir skolos", short: "Pirkiniai", emoji: "🧾" },
  { href: "/fiksuotos", label: "Fiksuotos išlaidos", short: "Fiksuotos", emoji: "🔁" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { palette } = useMonth();

  // Mėnesio spalva keliauja į CSS kintamuosius — visa kita programėlė
  // ima ją iš čia ir niekur nekartoja hex reikšmių.
  const themeVars = {
    "--accent": palette.accent,
    "--accent-tint": palette.tint,
    "--accent-deep": palette.deep,
    "--accent-bar": palette.bar,
    "--accent-track": palette.track,
  } as CSSProperties;

  return (
    <div style={themeVars} className="min-h-screen bg-paper lg:flex">
      {/* ——— kompiuterio šoninė juosta ——— */}
      <aside className="hidden lg:flex lg:w-[248px] lg:flex-shrink-0 lg:flex-col lg:gap-7 border-r border-line bg-card px-[18px] py-7 lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center gap-2.5 pl-2">
          <span className="block h-[26px] w-[26px] rounded-[9px] bg-accent" aria-hidden="true" />
          <span className="app-display text-[21px]">Finansai</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`app-focusable flex min-h-[46px] items-center gap-3 rounded-control px-3.5 text-[15px] ${
                  active
                    ? "bg-accent-tint font-bold text-accent-deep"
                    : "font-medium text-ink-2 hover:bg-sunken"
                }`}
              >
                <span className="text-[17px]" aria-hidden="true">
                  {item.emoji}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="h-px bg-line" />

        <p className="px-1.5 text-[12.5px] leading-relaxed text-ink-3">
          Kiekvienas mėnuo turi savo spalvą. Ji nudažo likutį ir aktyvų mėnesį viršuje.
        </p>
      </aside>

      {/* ——— turinys ——— */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* telefono tabai */}
        <div className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur lg:hidden">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 py-2.5">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`app-focusable flex min-h-[38px] flex-shrink-0 items-center justify-center whitespace-nowrap rounded-[12px] px-[15px] text-[13px] ${
                    active ? "bg-accent font-bold text-ink" : "font-medium text-ink-2"
                  }`}
                >
                  {item.short}
                </Link>
              );
            })}
          </div>
        </div>

        <TopHeader />

        <main className="mx-auto w-full max-w-app flex-1 px-3.5 pb-28 pt-3.5 lg:px-10 lg:pb-10 lg:pt-6">
          {children}
        </main>
      </div>

      <QuickAddFab />
    </div>
  );
}
