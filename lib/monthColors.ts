// Tikslios spalvos iš tavo ankstesnės programėlės — kiekvienas kalendorinis
// mėnuo visada turi tą pačią spalvų porą (accent -> dark gradientui, light -> pilkiukams, bg -> foną).
export const MONTH_COLORS: Record<
  number,
  { accent: string; dark: string; light: string; bg: string; accentSoft: string; name: string }
> = {
  1: { accent: "#3b82f6", dark: "#1d4ed8", light: "#dbeafe", bg: "#eff6ff", accentSoft: "#dbeafe", name: "Sausis" },
  2: { accent: "#8b5cf6", dark: "#6d28d9", light: "#ede9fe", bg: "#f5f3ff", accentSoft: "#ede9fe", name: "Vasaris" },
  3: { accent: "#06b6d4", dark: "#0e7490", light: "#cffafe", bg: "#ecfeff", accentSoft: "#cffafe", name: "Kovas" },
  4: { accent: "#10b981", dark: "#047857", light: "#d1fae5", bg: "#ecfdf5", accentSoft: "#d1fae5", name: "Balandis" },
  5: { accent: "#f59e0b", dark: "#b45309", light: "#fef3c7", bg: "#fffbeb", accentSoft: "#fef3c7", name: "Gegužė" },
  6: { accent: "#ec4899", dark: "#be185d", light: "#fce7f3", bg: "#fdf2f8", accentSoft: "#fce7f3", name: "Birželis" },
  7: { accent: "#14b8a6", dark: "#0f766e", light: "#ccfbf1", bg: "#f0fdfa", accentSoft: "#ccfbf1", name: "Liepa" },
  8: { accent: "#f97316", dark: "#c2410c", light: "#ffedd5", bg: "#fff7ed", accentSoft: "#ffedd5", name: "Rugpjūtis" },
  9: { accent: "#6366f1", dark: "#4338ca", light: "#e0e7ff", bg: "#eef2ff", accentSoft: "#e0e7ff", name: "Rugsėjis" },
  10: { accent: "#ef4444", dark: "#7c3aed", light: "#fee2e2", bg: "#fef2f2", accentSoft: "#fee2e2", name: "Spalis" },
  11: { accent: "#0ea5e9", dark: "#0369a1", light: "#e0f2fe", bg: "#f0f9ff", accentSoft: "#e0f2fe", name: "Lapkritis" },
  12: { accent: "#a855f7", dark: "#1d4ed8", light: "#f3e8ff", bg: "#faf5ff", accentSoft: "#f3e8ff", name: "Gruodis" },
};

export function monthLabel(year: number, month: number) {
  return `${MONTH_COLORS[month].name} ${year}`;
}

export const MONTH_NAMES_GENITIVE: Record<number, string> = {
  1: "sausio", 2: "vasario", 3: "kovo", 4: "balandžio", 5: "gegužės", 6: "birželio",
  7: "liepos", 8: "rugpjūčio", 9: "rugsėjo", 10: "spalio", 11: "lapkričio", 12: "gruodžio",
};
