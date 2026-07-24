import type { Transaction } from "@/lib/types";

export function exportTransactionsToCsv(transactions: Transaction[], filename = "biudzetas.csv") {
  const header = ["Data", "Tipas", "Aprašymas", "Kategorija", "Suma"];
  const rows = transactions.map((t) => [
    t.txn_date,
    t.type === "income" ? "Pajama" : "Išlaida",
    t.description,
    t.category ?? "",
    t.amount.toFixed(2),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
