"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { MONTH_COLORS } from "@/lib/monthColors";

const today = new Date();

type MonthContextValue = {
  year: number;
  month: number;
  palette: (typeof MONTH_COLORS)[number];
  next: () => void;
  prev: () => void;
};

const MonthContext = createContext<MonthContextValue | null>(null);

export function MonthProvider({ children }: { children: React.ReactNode }) {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  function go(direction: 1 | -1) {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setYear(newYear);
    setMonth(newMonth);
  }

  const palette = MONTH_COLORS[month];

  const value = useMemo(
    () => ({ year, month, palette, next: () => go(1), prev: () => go(-1) }),
    [year, month]
  );

  return <MonthContext.Provider value={value}>{children}</MonthContext.Provider>;
}

export function useMonth() {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error("useMonth must be used within MonthProvider");
  return ctx;
}
