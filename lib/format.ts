export function formatEur(amount: number): string {
  const formatted = new Intl.NumberFormat("lt-LT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} €`;
}

export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat("lt-LT", { day: "numeric", month: "numeric" }).format(d);
}
