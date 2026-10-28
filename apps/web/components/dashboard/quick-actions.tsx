import { CalendarPlus, ChefHat, LayoutGrid, ShoppingCart, UtensilsCrossed, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

const ACTIONS = [
  { href: "/pos", labelKey: "quickActions.newOrder", icon: ShoppingCart },
  { href: "/cash-drawer", labelKey: "nav.cashDrawer", icon: Wallet },
  { href: "/tables", labelKey: "quickActions.tables", icon: LayoutGrid },
  { href: "/reservations", labelKey: "quickActions.newReservation", icon: CalendarPlus },
  { href: "/kds", labelKey: "quickActions.kds", icon: ChefHat },
  { href: "/menu", labelKey: "quickActions.menu", icon: UtensilsCrossed },
];

export function QuickActions() {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Button key={action.href} variant="outline" size="sm" render={<Link href={action.href} />}>
          <action.icon className="h-4 w-4" />
          {t(action.labelKey)}
        </Button>
      ))}
    </div>
  );
}
