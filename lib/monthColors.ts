/**
 * Mėnesio spalva — vienintelis programėlės akcentas.
 * Ji nudažo hero kortelę, aktyvų mėnesį juostoje ir didžiausią kategoriją.
 *
 * Kiekvienas mėnuo turi:
 *   accent — sodrus užpildas (tekstas ant jo VISADA tamsus, --ink)
 *   tint   — blyški to paties atspalvio versija ramesnėms kortelėms
 *   deep   — tamsi versija smulkiam tekstui ant tint
 *   bar    — vidutinė versija diagramų juostelėms
 *
 * Senieji raktai (dark, light, bg, accentSoft) palikti, kad nesulūžtų
 * dar neperdaryti komponentai.
 */
export type MonthPalette = {
  name: string;
  short: string;
  accent: string;
  tint: string;
  deep: string;
  bar: string;
  track: string;
  /** @deprecated senas raktas */
  dark: string;
  /** @deprecated senas raktas */
  light: string;
  /** @deprecated senas raktas */
  bg: string;
  /** @deprecated senas raktas */
  accentSoft: string;
};

function month(
  name: string,
  short: string,
  accent: string,
  tint: string,
  deep: string,
  bar: string
): MonthPalette {
  return {
    name,
    short,
    accent,
    tint,
    deep,
    bar,
    track: "#efe9dc",
    dark: deep,
    light: tint,
    bg: "#f2eee4",
    accentSoft: tint,
  };
}

export const MONTH_COLORS: Record<number, MonthPalette> = {
  1: month("Sausis", "Sau", "#8fb3ce", "#e4edf3", "#2f4c63", "#b6cedf"),
  2: month("Vasaris", "Vas", "#a5a2d6", "#eae9f5", "#3c3968", "#c4c2e4"),
  3: month("Kovas", "Kov", "#c4a0ce", "#f2e9f4", "#533963", "#d8bfe0"),
  4: month("Balandis", "Bal", "#a8cc87", "#eaf2e1", "#3c5a29", "#c2dca9"),
  5: month("Gegužė", "Geg", "#cbd972", "#f1f4dd", "#4f591c", "#dae39b"),
  6: month("Birželis", "Bir", "#7fc9bc", "#e2f2ef", "#21564d", "#a8dcd2"),
  7: month("Liepa", "Lie", "#f2ce5c", "#fbf0d3", "#6b5210", "#f6de94"),
  8: month("Rugpjūtis", "Rgp", "#f0a860", "#fbe9d6", "#6e3e0f", "#f5c595"),
  9: month("Rugsėjis", "Rgs", "#e3b44a", "#f5e9cf", "#6e4a10", "#e0c173"),
  10: month("Spalis", "Spa", "#e08774", "#f9e4df", "#6b2a1d", "#ebaa9c"),
  11: month("Lapkritis", "Lap", "#c193b8", "#f3e8f0", "#55304d", "#d5b3ce"),
  12: month("Gruodis", "Gru", "#8c9fbc", "#e6eaf2", "#2e3d54", "#b3c0d4"),
};

export const MONTH_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function monthLabel(year: number, month: number) {
  return `${MONTH_COLORS[month].name} ${year}`;
}

export const MONTH_NAMES_GENITIVE: Record<number, string> = {
  1: "sausio",
  2: "vasario",
  3: "kovo",
  4: "balandžio",
  5: "gegužės",
  6: "birželio",
  7: "liepos",
  8: "rugpjūčio",
  9: "rugsėjo",
  10: "spalio",
  11: "lapkričio",
  12: "gruodžio",
};
