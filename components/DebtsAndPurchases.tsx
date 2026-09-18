"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import type { Debt, PlannedPurchase } from "@/lib/types";
import { formatEur } from "@/lib/format";
import {
  addDebt,
  addPlannedPurchase,
  deleteDebt,
  deletePlannedPurchase,
  togglePurchaseDone,
  toggleDebtSettled,
} from "@/lib/db";

type Props = {
  year: number;
  month: number;
  debts: Debt[];
  purchases: PlannedPurchase[];
  onChanged: () => void;
};

const FIELD =
  "app-focusable min-h-[48px] rounded-control border border-line bg-sunken-2 px-3 text-[14px] text-ink outline-none placeholder:text-ink-3";

export default function DebtsAndPurchases({
  year,
  month,
  debts,
  purchases,
  onChanged,
}: Props) {
  const [newDebtName, setNewDebtName] = useState("");
  const [newDebtAmount, setNewDebtAmount] = useState("");
  const [newPurchaseName, setNewPurchaseName] = useState("");
  const [newPurchaseAmount, setNewPurchaseAmount] = useState("");

  async function handleAddDebt() {
    const amt = parseFloat(newDebtAmount.replace(",", "."));
    if (!newDebtName.trim() || isNaN(amt)) return;
    await addDebt({ person_name: newDebtName.trim(), amount: amt, year, month });
    setNewDebtName("");
    setNewDebtAmount("");
    onChanged();
  }

  async function handleAddPurchase() {
    if (!newPurchaseName.trim()) return;
    const amt = newPurchaseAmount ? parseFloat(newPurchaseAmount.replace(",", ".")) : null;
    await addPlannedPurchase({
      description: newPurchaseName.trim(),
      amount: amt,
      year,
      month,
    });
    setNewPurchaseName("");
    setNewPurchaseAmount("");
    onChanged();
  }

  const openPurchases = purchases.filter((p) => !p.is_purchased);
  const plannedTotal = openPurchases.reduce((s, p) => s + (p.amount ?? 0), 0);
  const owedTotal = debts.filter((d) => !d.is_settled).reduce((s, d) => s + d.amount, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      {/* ——— norimi pirkiniai ——— */}
      <div className="app-card rounded-panel px-5 py-5">
        <div className="mb-4 flex items-baseline gap-3">
          <h2 className="app-display text-[17px] lg:text-[20px]">Noriu nusipirkti</h2>
          <div className="flex-1" />
          {plannedTotal > 0 && (
            <span className="app-num text-[16px]">{formatEur(plannedTotal)}</span>
          )}
        </div>

        <div className="mb-4 flex gap-2">
          <input
            value={newPurchaseName}
            onChange={(e) => setNewPurchaseName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPurchase()}
            placeholder="Ką norėtum nusipirkti?"
            aria-label="Pirkinio pavadinimas"
            className={`${FIELD} min-w-0 flex-1`}
          />
          <input
            value={newPurchaseAmount}
            onChange={(e) => setNewPurchaseAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPurchase()}
            placeholder="€"
            inputMode="decimal"
            aria-label="Pirkinio suma"
            className={`${FIELD} app-num w-[74px]`}
          />
          <button
            type="button"
            onClick={handleAddPurchase}
            aria-label="Pridėti pirkinį"
            className="app-focusable flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-control bg-ink text-card"
          >
            <Plus size={20} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        {purchases.length === 0 ? (
          <div className="app-dashed rounded-control py-7 text-center text-[13px]">
            Sąrašas tuščias
          </div>
        ) : (
          <div className="flex flex-col">
            {purchases.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 py-2.5 ${
                  i > 0 ? "border-t border-line-soft" : ""
                }`}
                style={{ opacity: p.is_purchased ? 0.5 : 1 }}
              >
                <button
                  type="button"
                  onClick={() => togglePurchaseDone(p.id, !p.is_purchased).then(onChanged)}
                  aria-label={
                    p.is_purchased
                      ? `Pažymėti ${p.description} kaip nenupirktą`
                      : `Pažymėti ${p.description} kaip nupirktą`
                  }
                  className="app-focusable flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[7px] border-2"
                  style={{
                    borderColor: p.is_purchased ? "var(--saved)" : "var(--line-dashed)",
                    background: p.is_purchased ? "var(--saved)" : "transparent",
                  }}
                >
                  {p.is_purchased && (
                    <Check size={13} strokeWidth={3} color="#fcfaf5" aria-hidden="true" />
                  )}
                </button>

                <span
                  className="min-w-0 flex-1 truncate text-[14.5px]"
                  style={{ textDecoration: p.is_purchased ? "line-through" : "none" }}
                >
                  {p.description}
                </span>

                {p.amount != null && (
                  <span className="app-num text-[14.5px]">{formatEur(p.amount)}</span>
                )}

                <button
                  type="button"
                  onClick={() => deletePlannedPurchase(p.id).then(onChanged)}
                  aria-label={`Ištrinti ${p.description}`}
                  className="app-focusable flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-3 hover:bg-sunken"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ——— skolos ——— */}
      <div className="app-card rounded-panel px-5 py-5">
        <div className="mb-1 flex items-baseline gap-3">
          <h2 className="app-display text-[17px] lg:text-[20px]">Man skolingi</h2>
          <div className="flex-1" />
          {owedTotal > 0 && <span className="app-num text-[16px]">{formatEur(owedTotal)}</span>}
        </div>
        <p className="mb-4 text-[12.5px] text-ink-3">Kas ir kiek dar neatidavė</p>

        <div className="mb-4 flex flex-col gap-2">
          <input
            value={newDebtName}
            onChange={(e) => setNewDebtName(e.target.value)}
            placeholder="Kas skolingas"
            aria-label="Skolininko vardas"
            className={FIELD}
          />
          <div className="flex gap-2">
            <input
              value={newDebtAmount}
              onChange={(e) => setNewDebtAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDebt()}
              placeholder="Suma €"
              inputMode="decimal"
              aria-label="Skolos suma"
              className={`${FIELD} app-num min-w-0 flex-1`}
            />
            <button
              type="button"
              onClick={handleAddDebt}
              aria-label="Pridėti skolą"
              className="app-focusable flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-control bg-ink text-card"
            >
              <Plus size={20} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        </div>

        {debts.length === 0 ? (
          <div className="app-dashed rounded-control py-7 text-center text-[13px]">
            Nėra įrašų
          </div>
        ) : (
          <div className="flex flex-col">
            {debts.map((d, i) => (
              <div
                key={d.id}
                className={`flex items-center gap-3 py-2.5 ${
                  i > 0 ? "border-t border-line-soft" : ""
                }`}
                style={{ opacity: d.is_settled ? 0.45 : 1 }}
              >
                <button
                  type="button"
                  onClick={() => toggleDebtSettled(d.id, !d.is_settled).then(onChanged)}
                  aria-label={
                    d.is_settled
                      ? `Pažymėti, kad ${d.person_name} dar neatidavė`
                      : `Pažymėti, kad ${d.person_name} atidavė`
                  }
                  className="app-focusable flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[7px] border-2"
                  style={{
                    borderColor: d.is_settled ? "var(--saved)" : "var(--line-dashed)",
                    background: d.is_settled ? "var(--saved)" : "transparent",
                  }}
                >
                  {d.is_settled && (
                    <Check size={13} strokeWidth={3} color="#fcfaf5" aria-hidden="true" />
                  )}
                </button>

                <span
                  className="min-w-0 flex-1 truncate text-[14.5px] font-medium"
                  style={{ textDecoration: d.is_settled ? "line-through" : "none" }}
                >
                  {d.person_name}
                </span>

                <span className="app-num text-[15px]">{formatEur(d.amount)}</span>

                <button
                  type="button"
                  onClick={() => deleteDebt(d.id).then(onChanged)}
                  aria-label={`Ištrinti skolą: ${d.person_name}`}
                  className="app-focusable flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-3 hover:bg-sunken"
                >
                  <X size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
