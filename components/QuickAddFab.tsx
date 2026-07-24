"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import TransactionFormModal from "./TransactionFormModal";

export default function QuickAddFab() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const now = new Date();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Greitas įrašas"
        className="fixed flex items-center justify-center app-focusable"
        style={{
          right: 18,
          bottom: "max(24px, env(safe-area-inset-bottom))",
          width: 58,
          height: 58,
          borderRadius: 999,
          background: "linear-gradient(135deg, var(--blue-700), var(--blue-500))",
          boxShadow: "var(--shadow-fab)",
          border: "none",
          zIndex: 30,
        }}
      >
        <Plus size={30} strokeWidth={2} color="#ffffff" aria-hidden="true" />
      </button>
      <TransactionFormModal
        open={open}
        onClose={() => setOpen(false)}
        year={now.getFullYear()}
        month={now.getMonth() + 1}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
