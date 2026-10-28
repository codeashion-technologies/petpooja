"use client";

import React, { useMemo } from "react";
import { formatCurrency } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw } from "lucide-react";

export const INDIAN_DENOMINATIONS = [
  { label: "₹500", value: 500, isNote: true },
  { label: "₹200", value: 200, isNote: true },
  { label: "₹100", value: 100, isNote: true },
  { label: "₹50", value: 50, isNote: true },
  { label: "₹20", value: 20, isNote: true },
  { label: "₹10", value: 10, isNote: true },
  { label: "₹5", value: 5, isNote: false },
  { label: "₹2", value: 2, isNote: false },
  { label: "₹1", value: 1, isNote: false },
] as const;

interface DenominationCounterProps {
  denominations: Record<string, number>;
  onChange: (counts: Record<string, number>, total: number) => void;
}

export function DenominationCounter({
  denominations,
  onChange,
}: DenominationCounterProps) {
  const handleCountChange = (denomVal: number, count: number) => {
    const validCount = Math.max(0, isNaN(count) ? 0 : Math.floor(count));
    const next = { ...denominations, [denomVal.toString()]: validCount };
    const total = calculateTotal(next);
    onChange(next, total);
  };

  const calculateTotal = (counts: Record<string, number>) => {
    return INDIAN_DENOMINATIONS.reduce((sum, d) => {
      const count = counts[d.value.toString()] || 0;
      return sum + d.value * count;
    }, 0);
  };

  const grandTotal = useMemo(
    () => calculateTotal(denominations),
    [denominations],
  );

  const handleReset = () => {
    onChange({}, 0);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Currency Breakdown (નોટ ગણતરી)
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {INDIAN_DENOMINATIONS.map((d) => {
          const count = denominations[d.value.toString()] || 0;
          const subtotal = d.value * count;

          return (
            <div
              key={d.value}
              className="flex items-center justify-between rounded-md border border-border/60 bg-background/80 p-2 shadow-sm text-sm"
            >
              <div className="min-w-[58px]">
                <span className="font-bold text-foreground">{d.label}</span>
                <span className="text-[10px] text-muted-foreground ml-1">
                  {d.isNote ? "Note" : "Coin"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-full p-0"
                  onClick={() => handleCountChange(d.value, count - 1)}
                  disabled={count <= 0}
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <Input
                  type="number"
                  min="0"
                  value={count === 0 ? "" : count}
                  placeholder="0"
                  onChange={(e) =>
                    handleCountChange(d.value, parseInt(e.target.value, 10))
                  }
                  className="h-7 w-14 text-center font-mono text-sm px-1 py-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 rounded-full p-0"
                  onClick={() => handleCountChange(d.value, count + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="min-w-[65px] text-right font-mono font-medium text-xs text-foreground">
                {subtotal > 0 ? formatCurrency(subtotal) : "₹0"}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 text-primary border border-primary/20">
        <span className="text-xs font-semibold uppercase tracking-wider">
          Total Counted Cash (કુલ રોકડ)
        </span>
        <span className="text-base font-bold font-mono">
          {formatCurrency(grandTotal)}
        </span>
      </div>
    </div>
  );
}
