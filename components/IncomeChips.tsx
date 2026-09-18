"use client";

import { X } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatEur } from "@/lib/format";
import { deleteTransaction, restoreTransaction } from "@/lib/db";
import { useUndoRedo } from "@/lib/undoRedo";

type Props = {
  income: Transaction[];
  onChanged: () => void;
  onAdd?: () => void;
};

export default function IncomeChips({ income, onChanged, onAdd }: Props) {
  const { pushAction } = useUndoRedo();
  const total = income.reduce((s, t) => s + t.amount, 0);

  async function handleDelete(t: Transaction) {
    await deleteTransaction(t);
    pushAction({
      label: `Ištrinta: ${t.description}`,
      undo: async () => restoreTransaction(t),
      redo: async () => deleteTransaction(t),
    });
    onChanged();
  }

  return (
    <div className="app-card rounded-card px-5 py-[18px]">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="app-display text-[17px]">Iš kur atėjo</h2>
        <div className="flex-1" />
        <span className="app-num text-[17px]">{formatEur(total)}</span>
      </div>

      {income.length === 0 ? (
        <p className="text-[13.5px] leading-relaxed text-ink-3">
          Šį mėnesį pajamų dar neįrašei.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {income.map((t) => (
            <div key={t.id} className="flex items-center gap-3">
              <span
                className="block h-[30px] w-[9px] flex-shrink-0 rounded-full"
                style={{ background: "var(--saved)" }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium capitalize">
                {t.description}
              </span>
              <span className="app-num text-[15.5px]">{formatEur(t.amount)}</span>
              <button
                type="button"
                onClick={() => handleDelete(t)}
                aria-label={`Ištrinti pajamą ${t.description}`}
                className="app-focusable flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] text-ink-3 hover:bg-sunken"
              >
                <X size={15} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="app-focusable app-dashed mt-3.5 min-h-[42px] w-full rounded-[13px] text-[13.5px] font-bold"
        >
          Pridėti pajamas
        </button>
      )}
    </div>
  );
}
