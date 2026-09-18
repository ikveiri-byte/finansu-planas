"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { formatEur } from "@/lib/format";
import { upsertSavingsGoal } from "@/lib/db";

type Props = {
  totalIncome: number;
  totalExpenses: number;
  savingsGoal: number;
  year: number;
  month: number;
  onGoalChanged: (goal: number) => void;
};

export default function HeroStats({
  totalIncome,
  totalExpenses,
  savingsGoal,
  year,
  month,
  onGoalChanged,
}: Props) {
  const sutaupyta = totalIncome - totalExpenses;
  const likutis = sutaupyta - savingsGoal;
  const goalReached = savingsGoal > 0 && sutaupyta >= savingsGoal;
  const goalProgress =
    savingsGoal > 0 ? Math.min(100, Math.max(0, (sutaupyta / savingsGoal) * 100)) : 0;
  const expenseShare = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;

  const [goalInput, setGoalInput] = useState(savingsGoal ? String(savingsGoal) : "");
  const [saving, setSaving] = useState(false);

  // Perjungus mėnesį laukelis turi parodyti to mėnesio tikslą
  useEffect(() => {
    setGoalInput(savingsGoal ? String(savingsGoal) : "");
  }, [savingsGoal, year, month]);

  async function saveGoal() {
    const val = parseFloat(goalInput.replace(",", ".")) || 0;
    if (val === savingsGoal) return;
    setSaving(true);
    await upsertSavingsGoal(year, month, val);
    onGoalChanged(val);
    setSaving(false);
  }

  const card = "rounded-card px-5 py-[18px] flex flex-col gap-1.5 min-h-[142px]";
  const label = "text-[13px] font-bold";

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
      {/* Likutis */}
      <div className={`${card} app-accent col-span-2 lg:col-span-1`}>
        <div className={`${label} text-accent-deep`}>Likutis</div>
        <div className="app-num text-[32px] leading-tight">{formatEur(likutis)}</div>
        <div className="text-[12.5px] leading-snug text-accent-deep">
          {savingsGoal > 0 ? "atidėjus tikslą" : "tikslas dar nenustatytas"}
        </div>
      </div>

      {/* Pajamos */}
      <div className={`${card} app-card`}>
        <div className={`${label} text-ink-2`}>Pajamos</div>
        <div className="app-num text-[25px] leading-tight">{formatEur(totalIncome)}</div>
      </div>

      {/* Išlaidos */}
      <div className={`${card} app-card`}>
        <div className={`${label} text-ink-2`}>Išlaidos</div>
        <div className="app-num text-[25px] leading-tight">{formatEur(totalExpenses)}</div>
        {totalIncome > 0 && (
          <div className="text-[12.5px] text-ink-3">{expenseShare} % pajamų</div>
        )}
      </div>

      {/* Sutaupyta */}
      <div className={`${card} app-accent-tint`}>
        <div className={`${label} text-accent-deep`}>Sutaupyta</div>
        <div
          className="app-num text-[25px] leading-tight"
          style={{ color: sutaupyta < 0 ? "var(--danger)" : undefined }}
        >
          {formatEur(sutaupyta)}
        </div>
        {savingsGoal > 0 && (
          <>
            <div
              className="h-2 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={Math.round(goalProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Santaupų tikslo pažanga"
              style={{ background: "rgba(0,0,0,0.08)" }}
            >
              <div
                className="h-2 rounded-full bg-saved"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <div
              className="text-[12.5px] font-bold"
              style={{ color: goalReached ? "var(--saved-deep)" : "var(--danger)" }}
            >
              {goalReached
                ? "tikslas pasiektas"
                : `trūksta ${formatEur(savingsGoal - sutaupyta)}`}
            </div>
          </>
        )}
      </div>

      {/* Tikslas — įrašomas ranka */}
      <div className={`${card} app-dashed col-span-2 lg:col-span-1`}>
        <label
          htmlFor="santaupu-tikslas"
          className={`${label} flex items-center gap-1.5 text-ink-2`}
        >
          Tikslas
          <Pencil size={13} strokeWidth={1.9} aria-hidden="true" />
        </label>
        <div className="flex items-center gap-2">
          <input
            id="santaupu-tikslas"
            inputMode="decimal"
            value={goalInput}
            placeholder="0"
            onChange={(e) => setGoalInput(e.target.value)}
            onBlur={saveGoal}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="app-num app-focusable min-h-[46px] w-full min-w-0 rounded-[13px] border border-line bg-sunken-2 px-3 text-[23px] text-ink outline-none"
          />
          <span className="app-num text-[20px] text-ink-3">€</span>
        </div>
        <div className="text-[12.5px] text-ink-3">
          {saving ? "išsaugoma…" : "įrašyk savo sumą"}
        </div>
      </div>
    </div>
  );
}
