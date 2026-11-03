import Link from "next/link";
import { LifeBuoy, Sparkles } from "lucide-react";

export function BrandFooter() {
  return (
    <div className="flex flex-col gap-2 border-t border-sidebar-border px-4 py-3">
      <Link
        href="/pricing"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        <Sparkles className="h-3.5 w-3.5" />
        SaaS Plans & Pricing
      </Link>
      <a
        href="https://orderrestro.nodedr.com/contact"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-sidebar-border px-3 py-1.5 text-xs font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LifeBuoy className="h-3.5 w-3.5" />
        Contact support
      </a>
      <div className="text-left text-[11px] font-medium leading-tight text-sidebar-foreground/60 flex items-center justify-between">
        <span>OrderRestro POS</span>
        <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">v1.9 SaaS</span>
      </div>
    </div>
  );
}
