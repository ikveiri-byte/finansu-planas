"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useMonth } from "@/lib/monthContext";
import TransactionFormModal from "./TransactionFormModal";

export default function QuickAddFab() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { year, month } = useMonth();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Greitas įrašas"
        className="app-focusable fixed right-[18px] z-30 flex h-[62px] w-[62px] items-center justify-center rounded-[22px] bg-ink text-card lg:hidden"
        style={{ bottom: "max(24px, env(safe-area-inset-bottom))" }}
      >
        <Plus size={26} strokeWidth={2.2} aria-hidden="true" />
      </button>

      <TransactionFormModal
        open={open}
        onClose={() => setOpen(false)}
        year={year}
        month={month}
        onSaved={() => {
          window.dispatchEvent(new CustomEvent("finansai:changed"));
          router.refresh();
        }}
      />
    </>
  );
}
