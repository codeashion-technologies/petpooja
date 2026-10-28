"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { useBranch } from "@/hooks/use-branch";
import {
  useCurrentShift,
  useShiftHistory,
  useCashDrawerActions,
} from "@/hooks/use-cash-drawer";
import { useI18n } from "@/lib/i18n/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DenominationCounter } from "./denomination-counter";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  DollarSign,
  History,
  Lock,
  Printer,
  Receipt,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import type { CashDrawerShiftView, DrawerTxType } from "@nodedr-restaurant/types";

interface CashDrawerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CashDrawerDialog({ open, onOpenChange }: CashDrawerDialogProps) {
  const { branchId, branches } = useBranch();
  const currentBranch = branches.find((b) => b.id === branchId);
  const { data: currentShift, isLoading } = useCurrentShift(branchId);
  const { data: shiftHistory } = useShiftHistory(branchId);
  const { openShift, addTransaction, closeShift } = useCashDrawerActions(branchId);
  const { t } = useI18n();

  // Active sub-tab
  const [tab, setTab] = useState<string>("overview");

  // Open Shift Form State
  const [openingFloat, setOpeningFloat] = useState<number>(0);
  const [openingDenoms, setOpeningDenoms] = useState<Record<string, number>>({});
  const [openingNotes, setOpeningNotes] = useState<string>("");
  const [showDenomInOpen, setShowDenomInOpen] = useState<boolean>(false);

  // Quick Transaction Modal State (Cash Drop / Cash In / Pay Out)
  const [txType, setTxType] = useState<DrawerTxType | null>(null);
  const [txAmount, setTxAmount] = useState<string>("");
  const [txReason, setTxReason] = useState<string>("");

  // Close Shift Form State
  const [countedCash, setCountedCash] = useState<number>(0);
  const [closingDenoms, setClosingDenoms] = useState<Record<string, number>>({});
  const [closingNotes, setClosingNotes] = useState<string>("");
  const [manualCountedInput, setManualCountedInput] = useState<string>("");

  // Last Closed Shift (for Z-Report display)
  const [zReportShift, setZReportShift] = useState<CashDrawerShiftView | null>(null);

  const isShiftOpen = Boolean(currentShift && currentShift.status === "OPEN");

  // Quick preset floats
  const PRESET_FLOATS = [500, 1000, 2000, 3000, 5000];

  const handleOpenShift = async () => {
    const floatAmount = showDenomInOpen ? openingFloat : Number(openingFloat);
    if (isNaN(floatAmount) || floatAmount < 0) {
      toast.error("Please enter a valid starting float amount");
      return;
    }

    openShift.mutate(
      {
        openingFloat: floatAmount,
        denominations: showDenomInOpen ? openingDenoms : undefined,
        notes: openingNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Cashier shift opened successfully!");
          setOpeningFloat(0);
          setOpeningDenoms({});
          setOpeningNotes("");
          setTab("overview");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to open shift");
        },
      },
    );
  };

  const handleAddTx = async () => {
    if (!txType) return;
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount greater than 0");
      return;
    }
    if (!txReason.trim()) {
      toast.error("Please enter a reason for this drawer transaction");
      return;
    }

    addTransaction.mutate(
      {
        type: txType,
        amount: amt,
        reason: txReason.trim(),
      },
      {
        onSuccess: () => {
          const labels: Record<DrawerTxType, string> = {
            CASH_DROP: "Cash Drop to safe recorded",
            CASH_IN: "Cash float added to drawer",
            PAY_OUT: "Petty expense recorded",
          };
          toast.success(labels[txType]);
          setTxType(null);
          setTxAmount("");
          setTxReason("");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Transaction failed");
        },
      },
    );
  };

  const handleCloseShift = async () => {
    if (!currentShift) return;
    const finalCounted = manualCountedInput !== "" ? parseFloat(manualCountedInput) : countedCash;
    if (isNaN(finalCounted) || finalCounted < 0) {
      toast.error("Please count and enter the actual cash in the till");
      return;
    }

    const variance = Number((finalCounted - currentShift.expectedCash).toFixed(2));
    if (variance < -50 && !closingNotes.trim()) {
      toast.error("There is a cash shortage. Please provide an explanation note.");
      return;
    }

    closeShift.mutate(
      {
        countedCash: finalCounted,
        denominations: closingDenoms,
        notes: closingNotes.trim() || undefined,
      },
      {
        onSuccess: (closedData) => {
          toast.success("Shift closed and reconciled!");
          setZReportShift(closedData);
          setCountedCash(0);
          setClosingDenoms({});
          setClosingNotes("");
          setManualCountedInput("");
          setTab("zreport");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to close shift");
        },
      },
    );
  };

  const handlePrintZReport = () => {
    window.print();
  };

  // Variance calculation for shift closing
  const currentVariance = currentShift
    ? (manualCountedInput !== "" ? parseFloat(manualCountedInput) || 0 : countedCash) - currentShift.expectedCash
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b border-border/80 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Cash Drawer & Shift Management
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {currentBranch?.name || "Main Branch"} · Float, Cash Drops & Shift Reconciliation
                </DialogDescription>
              </div>
            </div>

            {/* Shift Status Indicator Pill */}
            {isShiftOpen ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Shift Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Shift Closed
              </span>
            )}
          </div>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              {isShiftOpen ? "Active Shift" : "Open Shift"}
            </TabsTrigger>
            <TabsTrigger value="close" disabled={!isShiftOpen}>
              Close Shift (Z-Report)
            </TabsTrigger>
            <TabsTrigger value="history">
              Shift History
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW / START SHIFT */}
          <TabsContent value="overview" className="space-y-4 pt-2">
            {!isShiftOpen ? (
              /* START SHIFT VIEW */
              <div className="space-y-4 rounded-xl border border-dashed border-border p-5 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Start Cashier Shift</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Enter the starting cash float (શરૂઆતની રોકડ) in the till to activate billing and tracking for this register.
                  </p>
                </div>

                <div className="space-y-3 max-w-md mx-auto text-left">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Starting Cash Float (ઓપનિંગ કેશ)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="10"
                        placeholder="e.g. 2000"
                        value={openingFloat || ""}
                        onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                        className="font-mono text-base font-semibold"
                      />
                    </div>
                  </div>

                  {/* Float Quick Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_FLOATS.map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant={openingFloat === amt ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setOpeningFloat(amt);
                          setShowDenomInOpen(false);
                        }}
                      >
                        ₹{amt}
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant={showDenomInOpen ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowDenomInOpen(!showDenomInOpen)}
                    >
                      {showDenomInOpen ? "Hide Breakdown" : "Denominations Breakdown"}
                    </Button>
                  </div>

                  {showDenomInOpen && (
                    <div className="pt-2">
                      <DenominationCounter
                        denominations={openingDenoms}
                        onChange={(counts, total) => {
                          setOpeningDenoms(counts);
                          setOpeningFloat(total);
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Shift Notes (Optional)
                    </label>
                    <Input
                      placeholder="e.g. Morning counter shift, change from bank"
                      value={openingNotes}
                      onChange={(e) => setOpeningNotes(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <Button
                    className="w-full mt-2"
                    size="lg"
                    onClick={handleOpenShift}
                    disabled={openShift.isPending}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {openShift.isPending ? "Starting Shift…" : "Start Shift (શિફ્ટ શરૂ કરો)"}
                  </Button>
                </div>
              </div>
            ) : (
              /* ACTIVE SHIFT VIEW */
              currentShift && (
                <div className="space-y-4">
                  {/* Top Shift Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground gap-2">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <User className="h-3.5 w-3.5 text-primary" />
                      Cashier: <span className="font-semibold">{currentShift.userName || "Operator"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Started: {new Date(currentShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5" />
                      Orders: <span className="font-semibold text-foreground">{currentShift.orderCount}</span>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Expected in Drawer (Hero Card) */}
                    <Card className="col-span-2 border-primary/30 bg-primary/5">
                      <CardContent className="p-3.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center justify-between">
                          Expected Cash in Till
                          <Wallet className="h-4 w-4 text-primary" />
                        </span>
                        <div className="text-2xl font-black font-mono mt-1 text-primary">
                          {formatCurrency(currentShift.expectedCash)}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Float ₹{currentShift.openingFloat} + Cash Sales ₹{currentShift.cashSales} + In ₹{currentShift.cashIn} − Drop ₹{currentShift.cashDrop} − Out ₹{currentShift.cashExpenses}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Cash Sales Card */}
                    <Card>
                      <CardContent className="p-3.5">
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          Cash Sales (રોકડ)
                        </span>
                        <div className="text-lg font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(currentShift.cashSales)}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Refunds: {formatCurrency(currentShift.cashRefunds)}
                        </span>
                      </CardContent>
                    </Card>

                    {/* Digital / UPI / Card Sales */}
                    <Card>
                      <CardContent className="p-3.5">
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          UPI / Card (ડિજિટલ)
                        </span>
                        <div className="text-lg font-bold font-mono mt-1 text-foreground">
                          {formatCurrency(currentShift.upiSales + currentShift.cardSales + currentShift.otherSales)}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          UPI: ₹{currentShift.upiSales} · Card: ₹{currentShift.cardSales}
                        </span>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Till Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[130px] border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600"
                      onClick={() => {
                        setTxType("CASH_DROP");
                        setTxAmount("");
                        setTxReason("Transfer to safe");
                      }}
                    >
                      <ArrowUpRight className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                      Cash Drop (સેફમાં જમા)
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[130px] border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600"
                      onClick={() => {
                        setTxType("CASH_IN");
                        setTxAmount("");
                        setTxReason("Add cash float / change");
                      }}
                    >
                      <ArrowDownLeft className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                      Cash In (રોકડ ઉમેરો)
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[130px] border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600"
                      onClick={() => {
                        setTxType("PAY_OUT");
                        setTxAmount("");
                        setTxReason("");
                      }}
                    >
                      <DollarSign className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
                      Till Expense (ખર્ચ)
                    </Button>
                  </div>

                  {/* Inline Transaction Form (When Cash Drop / In / Out Clicked) */}
                  {txType && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-3 animate-in fade-in-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {txType === "CASH_DROP" && "⬇️ Cash Drop (Transfer excess cash to Safe/Owner)"}
                          {txType === "CASH_IN" && "⬆️ Cash In (Add extra float/change to drawer)"}
                          {txType === "PAY_OUT" && "🛒 Till Expense (Petty cash out: Milk, Courier, Supplies)"}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground"
                          onClick={() => setTxType(null)}
                        >
                          ✕
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                            Amount (રકમ)
                          </label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Amount (₹)"
                            value={txAmount}
                            onChange={(e) => setTxAmount(e.target.value)}
                            className="font-mono text-sm"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                            Reason (કારણ)
                          </label>
                          <Input
                            placeholder={txType === "PAY_OUT" ? "e.g. Milk purchase, Vegetable, Courier" : "Reason"}
                            value={txReason}
                            onChange={(e) => setTxReason(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setTxType(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddTx}
                          disabled={addTransaction.isPending}
                        >
                          {addTransaction.isPending ? "Recording…" : "Save Transaction"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Transactions List */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Recent Drawer Movements
                    </h4>

                    {currentShift.transactions && currentShift.transactions.length > 0 ? (
                      <div className="rounded-lg border border-border divide-y divide-border overflow-hidden text-xs">
                        {currentShift.transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-2.5 bg-background">
                            <div className="flex items-center gap-2">
                              {tx.type === "CASH_DROP" && (
                                <span className="p-1 rounded bg-amber-500/10 text-amber-600 font-semibold text-[10px]">
                                  DROP
                                </span>
                              )}
                              {tx.type === "CASH_IN" && (
                                <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-[10px]">
                                  IN
                                </span>
                              )}
                              {tx.type === "PAY_OUT" && (
                                <span className="p-1 rounded bg-rose-500/10 text-rose-600 font-semibold text-[10px]">
                                  EXPENSE
                                </span>
                              )}
                              <div>
                                <span className="font-medium text-foreground">{tx.reason}</span>
                                <span className="text-[10px] text-muted-foreground ml-2">
                                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-foreground">
                              {tx.type === "CASH_IN" ? "+" : "−"}
                              {formatCurrency(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground p-3 border border-dashed rounded-lg text-center">
                        No manual drawer movements recorded yet during this shift.
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </TabsContent>

          {/* TAB 2: CLOSE SHIFT (Z-REPORT) */}
          <TabsContent value="close" className="space-y-4 pt-2">
            {currentShift && (
              <div className="space-y-4">
                {/* Expected Cash Reminder */}
                <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3.5 border border-border">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block">
                      Expected in Till (ગલ્લામાં અપેક્ષિત રોકડ)
                    </span>
                    <span className="text-xl font-bold font-mono text-foreground">
                      {formatCurrency(currentShift.expectedCash)}
                    </span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Total Orders: <span className="font-semibold text-foreground">{currentShift.orderCount}</span></div>
                    <div>Total Sales: <span className="font-semibold text-foreground">{formatCurrency(currentShift.totalSales)}</span></div>
                  </div>
                </div>

                {/* Denomination Counter for Counting Cash */}
                <div>
                  <DenominationCounter
                    denominations={closingDenoms}
                    onChange={(counts, total) => {
                      setClosingDenoms(counts);
                      setCountedCash(total);
                      setManualCountedInput("");
                    }}
                  />
                </div>

                {/* Direct override input if cashier prefers total */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Or Enter Total Directly:
                  </span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Counted cash (₹)"
                    value={manualCountedInput}
                    onChange={(e) => setManualCountedInput(e.target.value)}
                    className="font-mono text-sm max-w-[180px]"
                  />
                </div>

                {/* Live Discrepancy (Variance) Banner */}
                <div
                  className={`rounded-lg p-3.5 flex items-center justify-between border ${
                    currentVariance === 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : currentVariance < 0
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {currentVariance === 0 ? (
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="h-5 w-5" />
                    )}
                    <div>
                      <span className="font-bold text-sm block">
                        {currentVariance === 0
                          ? "Balanced (સંતુલિત - કોઈ તફાવત નથી)"
                          : currentVariance < 0
                          ? `Short by ${formatCurrency(Math.abs(currentVariance))} (રોકડ ઓછી છે)`
                          : `Over by ${formatCurrency(currentVariance)} (વધારે રોકડ)`}
                      </span>
                      <span className="text-[11px] opacity-80">
                        Counted: {formatCurrency(manualCountedInput !== "" ? parseFloat(manualCountedInput) || 0 : countedCash)} vs Expected: {formatCurrency(currentShift.expectedCash)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discrepancy Note */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Closing Explanation / Notes {currentVariance < -50 && <span className="text-destructive">* (Required for shortage)</span>}
                  </label>
                  <Input
                    placeholder="Reason for discrepancy or shift handover note…"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Close Button */}
                <Button
                  className="w-full"
                  size="lg"
                  variant={currentVariance < 0 ? "destructive" : "default"}
                  onClick={handleCloseShift}
                  disabled={closeShift.isPending}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {closeShift.isPending
                    ? "Reconciling & Closing Shift…"
                    : "Close Shift & Generate Z-Report (શિફ્ટ બંધ કરો)"}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: SHIFT HISTORY */}
          <TabsContent value="history" className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Past Shifts & Closings
              </h4>
            </div>

            {shiftHistory && shiftHistory.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {shiftHistory.map((s) => (
                  <Card key={s.id} className="p-3 text-xs border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {s.userName || "Operator"}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          · {new Date(s.openedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.status === "OPEN"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : (s.variance ?? 0) === 0
                            ? "bg-muted text-muted-foreground"
                            : (s.variance ?? 0) < 0
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {s.status === "OPEN"
                          ? "ACTIVE"
                          : (s.variance ?? 0) === 0
                          ? "BALANCED"
                          : `${(s.variance ?? 0) > 0 ? "+" : ""}${formatCurrency(s.variance ?? 0)}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-muted-foreground pt-1 border-t border-border/60">
                      <div>
                        Opening: <span className="font-mono text-foreground">{formatCurrency(s.openingFloat)}</span>
                      </div>
                      <div>
                        Sales: <span className="font-mono text-foreground">{formatCurrency(s.totalSales)}</span>
                      </div>
                      <div className="text-right">
                        Actual: <span className="font-mono font-semibold text-foreground">{formatCurrency(s.actualCash ?? s.expectedCash)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground p-6 text-center border border-dashed rounded-lg">
                No past shifts recorded for this branch yet.
              </p>
            )}
          </TabsContent>

          {/* TAB 4: Z-REPORT DISPLAY MODAL (AFTER CLOSING) */}
          {zReportShift && (
            <TabsContent value="zreport" className="space-y-4 pt-2">
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 font-mono text-xs shadow-sm">
                <div className="text-center border-b border-dashed border-border pb-3">
                  <h3 className="font-bold text-base uppercase text-foreground">Z-REPORT · SHIFT SUMMARY</h3>
                  <p className="text-[11px] text-muted-foreground">{currentBranch?.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Closed: {new Date(zReportShift.closedAt || Date.now()).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1.5 text-foreground">
                  <div className="flex justify-between">
                    <span>Cashier / Operator:</span>
                    <span className="font-bold">{zReportShift.userName || "Operator"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span>{zReportShift.orderCount}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1">
                    <span>Opening Float:</span>
                    <span>{formatCurrency(zReportShift.openingFloat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Sales:</span>
                    <span className="text-emerald-600 font-semibold">+{formatCurrency(zReportShift.cashSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UPI Sales:</span>
                    <span>{formatCurrency(zReportShift.upiSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Card Sales:</span>
                    <span>{formatCurrency(zReportShift.cardSales)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1 font-bold">
                    <span>Total Gross Sales:</span>
                    <span>{formatCurrency(zReportShift.totalSales)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cash In:</span>
                    <span>+{formatCurrency(zReportShift.cashIn)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cash Drops (Safe):</span>
                    <span>−{formatCurrency(zReportShift.cashDrop)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Till Expenses:</span>
                    <span>−{formatCurrency(zReportShift.cashExpenses)}</span>
                  </div>
                  <div className="flex justify-between border-t border-double border-border pt-2 text-sm font-bold">
                    <span>Expected Cash:</span>
                    <span>{formatCurrency(zReportShift.expectedCash)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Actual Counted Cash:</span>
                    <span>{formatCurrency(zReportShift.actualCash ?? 0)}</span>
                  </div>
                  <div
                    className={`flex justify-between text-sm font-bold pt-1 ${
                      (zReportShift.variance ?? 0) === 0
                        ? "text-emerald-600"
                        : (zReportShift.variance ?? 0) < 0
                        ? "text-destructive"
                        : "text-amber-500"
                    }`}
                  >
                    <span>Discrepancy (તફાવત):</span>
                    <span>
                      {(zReportShift.variance ?? 0) === 0
                        ? "BALANCED (₹0.00)"
                        : (zReportShift.variance ?? 0) < 0
                        ? `SHORT (${formatCurrency(Math.abs(zReportShift.variance ?? 0))})`
                        : `OVER (+${formatCurrency(zReportShift.variance ?? 0)})`}
                    </span>
                  </div>
                  {zReportShift.closingNotes && (
                    <div className="pt-2 text-[11px] text-muted-foreground italic">
                      Note: "{zReportShift.closingNotes}"
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button className="flex-1" size="sm" onClick={handlePrintZReport}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Z-Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setZReportShift(null);
                      setTab("overview");
                      onOpenChange(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
