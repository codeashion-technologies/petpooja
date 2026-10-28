"use client";

import React, { useState } from "react";
import { useBranch } from "@/hooks/use-branch";
import { useCurrentShift } from "@/hooks/use-cash-drawer";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CashDrawerDialog } from "./cash-drawer-dialog";
import { Wallet } from "lucide-react";

export function CashDrawerButton({ className }: { className?: string }) {
  const { branchId } = useBranch();
  const { data: currentShift, isLoading } = useCurrentShift(branchId);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading || !branchId) {
    return null;
  }

  const isShiftOpen = Boolean(currentShift && currentShift.status === "OPEN");

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className={`h-9 px-2.5 sm:px-3 text-xs font-medium rounded-full border transition-all ${
          isShiftOpen
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
            : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
        } ${className || ""}`}
        title={isShiftOpen ? "Active Shift - Click to manage cash drawer" : "Shift Closed - Click to open shift"}
      >
        <span
          className={`mr-1.5 h-2 w-2 rounded-full ${
            isShiftOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`}
        />
        <Wallet className="mr-1 h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {isShiftOpen
            ? `Till: ${formatCurrency(currentShift?.expectedCash ?? 0)}`
            : "Open Shift"}
        </span>
        <span className="sm:hidden">
          {isShiftOpen ? formatCurrency(currentShift?.expectedCash ?? 0) : "Shift"}
        </span>
      </Button>

      <CashDrawerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
