"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMonth } from "@/lib/monthContext";
import TransactionFormModal from "./TransactionFormModal";

export default function QuickAddFab() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { palette } = useMonth();
  const now = new Date();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Greitas įrašas"
        className="fixed w-[52px] h-[52px] rounded-full text-white flex items-center justify-center z-30"
        style={{
          right: 18,
          bottom: 28,
          background: `linear-gradient(135deg, ${palette.accent}, ${palette.dark})`,
          boxShadow: `0 4px 18px ${palette.accent}55`,
          fontSize: 28,
          border: "none",
        }}
      >
        ＋
      </button>
      <TransactionFormModal
        open={open}
        onClose={() => setOpen(false)}
        year={now.getFullYear()}
        month={now.getMonth() + 1}
        accent={palette.accent}
        light={palette.light}
        onSaved={() => router.refresh()}
      />
    </>
  );
}
