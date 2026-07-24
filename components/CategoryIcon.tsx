import {
  Bus,
  House,
  Shapes,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Ticket,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { ExpenseCategory } from "@/lib/types";

const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  Maistas: ShoppingBasket,
  Takeout: Utensils,
  Nuoma: House,
  Transportas: Bus,
  "Telefonas, mini mokesčiai": Smartphone,
  Pramogos: Ticket,
  Šmutkės: Shirt,
  Kita: Shapes,
};

type CategoryIconProps = {
  category: ExpenseCategory;
  size?: number;
  className?: string;
  color?: string;
  decorative?: boolean;
};

export default function CategoryIcon({
  category,
  size = 22,
  className = "",
  color,
  decorative = true,
}: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category] ?? Shapes;

  return (
    <Icon
      size={size}
      strokeWidth={1.8}
      className={className}
      color={color}
      aria-hidden={decorative ? "true" : undefined}
    />
  );
}

