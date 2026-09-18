import type { ExpenseCategory } from "@/lib/types";
import { CAT_ICON } from "@/lib/categoryIcons";

type CategoryIconProps = {
  category: ExpenseCategory;
  size?: number;
  className?: string;
  decorative?: boolean;
  /**
   * Nebenaudojamas: ženklai dabar yra emoji, o jų spalvos nustatyti negalima.
   * Paliktas tik tam, kad dar neperdaryti vaizdai susikompiliuotų.
   */
  color?: string;
};

/**
 * Kategorijų ženklai — emoji, ne linijinės ikonos.
 * Sąrašas gyvena lib/categoryIcons.ts.
 */
export default function CategoryIcon({
  category,
  size = 18,
  className = "",
  decorative = true,
}: CategoryIconProps) {
  return (
    <span
      className={className}
      style={{ fontSize: size, lineHeight: 1 }}
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : category}
    >
      {CAT_ICON[category] ?? "💡"}
    </span>
  );
}
