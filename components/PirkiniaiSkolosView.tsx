"use client";

import { useCallback, useEffect, useState } from "react";
import type { Debt, PlannedPurchase } from "@/lib/types";
import { useMonth } from "@/lib/monthContext";
import { fetchMonthDebts, fetchMonthPlannedPurchases } from "@/lib/db";
import DebtsAndPurchases from "./DebtsAndPurchases";

export default function PirkiniaiSkolosView() {
  const { year, month, palette } = useMonth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [purchases, setPurchases] = useState<PlannedPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (y: number, m: number) => {
    setLoading(true);
    const [d, p] = await Promise.all([fetchMonthDebts(y, m), fetchMonthPlannedPurchases(y, m)]);
    setDebts(d);
    setPurchases(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(year, month);
  }, [year, month, load]);

  if (loading) return <p className="text-center text-muted py-10">Kraunama…</p>;

  return (
    <DebtsAndPurchases
      year={year}
      month={month}
      debts={debts}
      purchases={purchases}
      accent={palette.accent}
      light={palette.light}
      onChanged={() => load(year, month)}
    />
  );
}
