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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DenominationCounter } from "@/components/cash-drawer/denomination-counter";
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

export default function CashDrawerPage() {
  const { branchId, branches } = useBranch();
  const currentBranch = branches.find((b) => b.id === branchId);
  const { data: currentShift, isLoading } = useCurrentShift(branchId);
  const { data: shiftHistory } = useShiftHistory(branchId);
  const { openShift, addTransaction, closeShift } = useCashDrawerActions(branchId);
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<string>("active");

  // Open Shift Form State
  const [openingFloat, setOpeningFloat] = useState<number>(2000);
  const [openingDenoms, setOpeningDenoms] = useState<Record<string, number>>({});
  const [openingNotes, setOpeningNotes] = useState<string>("");
  const [showDenomInOpen, setShowDenomInOpen] = useState<boolean>(false);

  // Quick Transaction Form State
  const [txType, setTxType] = useState<DrawerTxType | null>(null);
  const [txAmount, setTxAmount] = useState<string>("");
  const [txReason, setTxReason] = useState<string>("");

  // Close Shift Form State
  const [countedCash, setCountedCash] = useState<number>(0);
  const [closingDenoms, setClosingDenoms] = useState<Record<string, number>>({});
  const [closingNotes, setClosingNotes] = useState<string>("");
  const [manualCountedInput, setManualCountedInput] = useState<string>("");

  // Selected shift for Z-report preview
  const [viewingZReport, setViewingZReport] = useState<CashDrawerShiftView | null>(null);

  const isShiftOpen = Boolean(currentShift && currentShift.status === "OPEN");
  const PRESET_FLOATS = [500, 1000, 2000, 3000, 5000];

  const handleOpenShift = () => {
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
          setOpeningNotes("");
          setActiveTab("active");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to open shift");
        },
      },
    );
  };

  const handleAddTx = () => {
    if (!txType) return;
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid amount greater than 0");
      return;
    }
    if (!txReason.trim()) {
      toast.error("Please enter a reason for this transaction");
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
          toast.success("Drawer transaction recorded");
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

  const handleCloseShift = () => {
    if (!currentShift) return;
    const finalCounted = manualCountedInput !== "" ? parseFloat(manualCountedInput) : countedCash;
    if (isNaN(finalCounted) || finalCounted < 0) {
      toast.error("Please count and enter the cash in drawer");
      return;
    }

    const variance = Number((finalCounted - currentShift.expectedCash).toFixed(2));
    if (variance < -50 && !closingNotes.trim()) {
      toast.error("Please provide an explanation note for the shortage.");
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
          toast.success("Shift closed and balanced!");
          setViewingZReport(closedData);
          setCountedCash(0);
          setClosingDenoms({});
          setClosingNotes("");
          setManualCountedInput("");
          setActiveTab("history");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to close shift");
        },
      },
    );
  };

  const currentVariance = currentShift
    ? (manualCountedInput !== "" ? parseFloat(manualCountedInput) || 0 : countedCash) - currentShift.expectedCash
    : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Cash Drawer & Shift Management
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentBranch?.name || "Main Branch"} · Float, Cash Drops, Petty Cash & Z-Report
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {isShiftOpen ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift Active: <strong className="font-mono">{formatCurrency(currentShift?.expectedCash ?? 0)}</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Shift Closed</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full sm:w-auto sm:inline-grid grid-cols-3">
          <TabsTrigger value="active">
            {isShiftOpen ? "Active Shift Overview" : "Open Shift"}
          </TabsTrigger>
          <TabsTrigger value="close" disabled={!isShiftOpen}>
            Close Shift & Reconciliation
          </TabsTrigger>
          <TabsTrigger value="history">
            Shift History & Reports
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ACTIVE / OPEN SHIFT */}
        <TabsContent value="active" className="space-y-5">
          {!isShiftOpen ? (
            /* OPEN SHIFT CARD */
            <Card className="max-w-2xl mx-auto border-dashed">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                  <Lock className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Open Register Shift (શિફ્ટ શરૂ કરો)</CardTitle>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Enter the opening cash float in the drawer to begin recording sales, orders, and expenses.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">
                      Starting Cash Float (ઓપનિંગ કેશ)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      value={openingFloat || ""}
                      onChange={(e) => setOpeningFloat(parseFloat(e.target.value) || 0)}
                      className="font-mono text-base font-semibold"
                      placeholder="e.g. 2000"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
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
                      className="h-7 text-xs ml-auto"
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
                      Shift Notes (વધારાની નોંધ)
                    </label>
                    <Input
                      placeholder="e.g. Morning counter shift, cash float from bank"
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
              </CardContent>
            </Card>
          ) : (
            /* ACTIVE SHIFT VIEW */
            currentShift && (
              <div className="space-y-5">
                {/* Operator Meta Bar */}
                <div className="flex flex-wrap items-center justify-between rounded-xl bg-card border border-border p-4 text-xs shadow-sm gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Active Cashier</span>
                      <span className="font-semibold text-foreground text-sm">{currentShift.userName || "Operator"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Shift Started</span>
                      <span className="font-semibold text-foreground text-sm">
                        {new Date(currentShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Total Orders</span>
                      <span className="font-semibold text-foreground text-sm">{currentShift.orderCount} bills</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => setActiveTab("close")}
                  >
                    <Lock className="mr-1.5 h-3.5 w-3.5" />
                    Close Shift (શિફ્ટ પૂર્ણ કરો)
                  </Button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Expected in Drawer (Hero Card) */}
                  <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-primary mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Expected Cash in Till</span>
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="text-3xl font-black font-mono text-primary">
                        {formatCurrency(currentShift.expectedCash)}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Float ₹{currentShift.openingFloat} + Cash Sales ₹{currentShift.cashSales} + In ₹{currentShift.cashIn} − Drop ₹{currentShift.cashDrop} − Out ₹{currentShift.cashExpenses}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Cash Sales */}
                  <Card>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold text-muted-foreground block uppercase">
                        Cash Sales (રોકડ)
                      </span>
                      <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                        {formatCurrency(currentShift.cashSales)}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Cash Refunds: {formatCurrency(currentShift.cashRefunds)}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Digital Sales */}
                  <Card>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold text-muted-foreground block uppercase">
                        Digital (UPI / Card)
                      </span>
                      <div className="text-2xl font-bold font-mono text-foreground mt-2">
                        {formatCurrency(currentShift.upiSales + currentShift.cardSales + currentShift.otherSales)}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        UPI: ₹{currentShift.upiSales} · Card: ₹{currentShift.cardSales}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Total Sales */}
                  <Card>
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold text-muted-foreground block uppercase">
                        Total Shift Sales
                      </span>
                      <div className="text-2xl font-bold font-mono text-foreground mt-2">
                        {formatCurrency(currentShift.totalSales)}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        Across {currentShift.orderCount} completed bills
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Till Operations Bar */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 min-w-[150px] border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600 font-semibold"
                    onClick={() => {
                      setTxType("CASH_DROP");
                      setTxAmount("");
                      setTxReason("Safe drop");
                    }}
                  >
                    <ArrowUpRight className="mr-1.5 h-4 w-4 text-amber-500" />
                    Cash Drop (સેફમાં જમા)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 min-w-[150px] border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 font-semibold"
                    onClick={() => {
                      setTxType("CASH_IN");
                      setTxAmount("");
                      setTxReason("Add cash float");
                    }}
                  >
                    <ArrowDownLeft className="mr-1.5 h-4 w-4 text-emerald-500" />
                    Cash In (રોકડ ઉમેરો)
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 min-w-[150px] border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-600 font-semibold"
                    onClick={() => {
                      setTxType("PAY_OUT");
                      setTxAmount("");
                      setTxReason("");
                    }}
                  >
                    <DollarSign className="mr-1.5 h-4 w-4 text-rose-500" />
                    Till Expense (કાઉન્ટર ખર્ચ)
                  </Button>
                </div>

                {/* Quick Transaction Form (When Triggered) */}
                {txType && (
                  <Card className="border-primary/40 bg-primary/5 animate-in fade-in-50">
                    <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
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
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-foreground block mb-1">
                            Amount (₹)
                          </label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Amount in Rupees"
                            value={txAmount}
                            onChange={(e) => setTxAmount(e.target.value)}
                            className="font-mono text-sm"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground block mb-1">
                            Reason (કારણ)
                          </label>
                          <Input
                            placeholder={txType === "PAY_OUT" ? "e.g. Milk purchase, Veggies, Ice" : "Reason"}
                            value={txReason}
                            onChange={(e) => setTxReason(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setTxType(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleAddTx} disabled={addTransaction.isPending}>
                          {addTransaction.isPending ? "Recording…" : "Save Transaction"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Movements Table */}
                <Card>
                  <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-sm font-semibold">Shift Drawer Movements Log</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {currentShift.transactions && currentShift.transactions.length > 0 ? (
                      <div className="divide-y divide-border text-xs">
                        {currentShift.transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                              {tx.type === "CASH_DROP" && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 font-bold text-[10px]">
                                  SAFE DROP
                                </span>
                              )}
                              {tx.type === "CASH_IN" && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold text-[10px]">
                                  CASH IN
                                </span>
                              )}
                              {tx.type === "PAY_OUT" && (
                                <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 font-bold text-[10px]">
                                  EXPENSE
                                </span>
                              )}
                              <div>
                                <span className="font-medium text-foreground">{tx.reason}</span>
                                <span className="text-[10px] text-muted-foreground ml-2">
                                  by {tx.userName || "Staff"} · {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-sm text-foreground">
                              {tx.type === "CASH_IN" ? "+" : "−"}
                              {formatCurrency(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground p-6 text-center">
                        No manual drawer movements recorded yet for this active shift.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </TabsContent>

        {/* TAB 2: CLOSE SHIFT */}
        <TabsContent value="close" className="space-y-4">
          {currentShift && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base">Shift Closing & Cash Discrepancy Reconciliation</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Count the physical cash in the till and verify against system expected cash.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Expected Till Summary */}
                <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4 border border-border">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground block">
                      Expected Cash in Till (ગલ્લામાં હોવી જોઈએ)
                    </span>
                    <span className="text-2xl font-bold font-mono text-foreground">
                      {formatCurrency(currentShift.expectedCash)}
                    </span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Total Orders: <span className="font-semibold text-foreground">{currentShift.orderCount}</span></div>
                    <div>Total Sales: <span className="font-semibold text-foreground">{formatCurrency(currentShift.totalSales)}</span></div>
                  </div>
                </div>

                {/* Denominations */}
                <DenominationCounter
                  denominations={closingDenoms}
                  onChange={(counts, total) => {
                    setClosingDenoms(counts);
                    setCountedCash(total);
                    setManualCountedInput("");
                  }}
                />

                {/* Manual override input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Or Enter Counted Total Directly:
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

                {/* Discrepancy Status */}
                <div
                  className={`rounded-lg p-4 flex items-center justify-between border ${
                    currentVariance === 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : currentVariance < 0
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {currentVariance === 0 ? (
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="h-6 w-6" />
                    )}
                    <div>
                      <span className="font-bold text-base block">
                        {currentVariance === 0
                          ? "Balanced (સંતુલિત - કોઈ તફાવત નથી)"
                          : currentVariance < 0
                          ? `Short by ${formatCurrency(Math.abs(currentVariance))} (રોકડ ઓછી નીકળી)`
                          : `Over by ${formatCurrency(currentVariance)} (વધારે રોકડ નીકળી)`}
                      </span>
                      <span className="text-xs opacity-80">
                        Counted: {formatCurrency(manualCountedInput !== "" ? parseFloat(manualCountedInput) || 0 : countedCash)} vs Expected: {formatCurrency(currentShift.expectedCash)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Closing Notes */}
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Closing Notes / Handover Reason {currentVariance < -50 && <span className="text-destructive">* (Shortage explanation required)</span>}
                  </label>
                  <Input
                    placeholder="Enter reason for discrepancy or handover notes…"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Submit Close */}
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
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: HISTORY & AUDIT */}
        <TabsContent value="history" className="space-y-4">
          {/* If viewing a Z-Report */}
          {viewingZReport && (
            <Card className="border-primary/40 bg-card max-w-xl mx-auto shadow-md">
              <CardHeader className="text-center border-b border-dashed border-border pb-3">
                <CardTitle className="text-lg font-mono uppercase">Z-REPORT · SHIFT SUMMARY</CardTitle>
                <p className="text-xs text-muted-foreground">{currentBranch?.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  Closed on {new Date(viewingZReport.closedAt || Date.now()).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 pt-3 font-mono text-xs">
                <div className="space-y-1.5 text-foreground">
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span className="font-bold">{viewingZReport.userName || "Operator"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span>{viewingZReport.orderCount}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1">
                    <span>Opening Float:</span>
                    <span>{formatCurrency(viewingZReport.openingFloat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Sales:</span>
                    <span className="text-emerald-600 font-semibold">+{formatCurrency(viewingZReport.cashSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UPI Sales:</span>
                    <span>{formatCurrency(viewingZReport.upiSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Card Sales:</span>
                    <span>{formatCurrency(viewingZReport.cardSales)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-1 font-bold">
                    <span>Total Sales:</span>
                    <span>{formatCurrency(viewingZReport.totalSales)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cash In:</span>
                    <span>+{formatCurrency(viewingZReport.cashIn)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cash Drops (Safe):</span>
                    <span>−{formatCurrency(viewingZReport.cashDrop)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Till Expenses:</span>
                    <span>−{formatCurrency(viewingZReport.cashExpenses)}</span>
                  </div>
                  <div className="flex justify-between border-t border-double border-border pt-2 text-sm font-bold">
                    <span>Expected Cash:</span>
                    <span>{formatCurrency(viewingZReport.expectedCash)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Counted Cash:</span>
                    <span>{formatCurrency(viewingZReport.actualCash ?? 0)}</span>
                  </div>
                  <div
                    className={`flex justify-between text-sm font-bold pt-1 ${
                      (viewingZReport.variance ?? 0) === 0
                        ? "text-emerald-600"
                        : (viewingZReport.variance ?? 0) < 0
                        ? "text-destructive"
                        : "text-amber-500"
                    }`}
                  >
                    <span>Discrepancy (તફાવત):</span>
                    <span>
                      {(viewingZReport.variance ?? 0) === 0
                        ? "BALANCED (₹0.00)"
                        : (viewingZReport.variance ?? 0) < 0
                        ? `SHORT (${formatCurrency(Math.abs(viewingZReport.variance ?? 0))})`
                        : `OVER (+${formatCurrency(viewingZReport.variance ?? 0)})`}
                    </span>
                  </div>
                  {viewingZReport.closingNotes && (
                    <div className="pt-2 text-[11px] text-muted-foreground italic">
                      Note: "{viewingZReport.closingNotes}"
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button className="flex-1" size="sm" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Z-Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setViewingZReport(null)}>
                    Close Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past Shifts Table */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-sm font-semibold">Previous Cashier Shifts History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {shiftHistory && shiftHistory.length > 0 ? (
                <div className="divide-y divide-border text-xs">
                  {shiftHistory.map((s) => (
                    <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-2 hover:bg-muted/30">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                          <User className="h-4 w-4 text-primary" />
                          <span>{s.userName || "Operator"}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            · {new Date(s.openedAt).toLocaleDateString()} ({new Date(s.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Opening Float: <span className="font-mono text-foreground">{formatCurrency(s.openingFloat)}</span> · Total Sales: <span className="font-mono text-foreground font-semibold">{formatCurrency(s.totalSales)}</span> · Orders: {s.orderCount}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                              ? "ACTIVE SHIFT"
                              : (s.variance ?? 0) === 0
                              ? "BALANCED"
                              : `${(s.variance ?? 0) > 0 ? "+" : ""}${formatCurrency(s.variance ?? 0)}`}
                          </span>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            Counted: {formatCurrency(s.actualCash ?? s.expectedCash)}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setViewingZReport(s)}
                        >
                          Z-Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground p-8 text-center">
                  No previous shifts recorded yet for this branch.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
