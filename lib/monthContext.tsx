"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { MONTH_COLORS, type MonthPalette } from "@/lib/monthColors";

const today = new Date();

type MonthContextValue = {
  year: number;
  month: number;
  palette: MonthPalette;
  next: () => void;
  prev: () => void;
  /** Peršokti tiesiai į mėnesį — naudoja metų juosta viršuje. */
  goTo: (year: number, month: number) => void;
};

const MonthContext = createContext<MonthContextValue | null>(null);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const go = useCallback((direction: 1 | -1) => {
    setMonth((prevMonth) => {
      const nextMonth = prevMonth + direction;
      if (nextMonth > 12) {
        setYear((y) => y + 1);
        return 1;
      }
      if (nextMonth < 1) {
        setYear((y) => y - 1);
        return 12;
      }
      return nextMonth;
    });
  }, []);

  const goTo = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  const palette = MONTH_COLORS[month];

  const value = useMemo(
    () => ({
      year,
      month,
      palette,
      next: () => go(1),
      prev: () => go(-1),
      goTo,
    }),
    [year, month, palette, go, goTo]
  );

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}

export function useMonth() {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within MonthProvider");
  return ctx;
}
