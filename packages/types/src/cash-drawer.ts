import { z } from "zod";

export const cashShiftStatusEnum = z.enum(["OPEN", "CLOSED"]);
export type CashShiftStatus = z.infer<typeof cashShiftStatusEnum>;

export const drawerTxTypeEnum = z.enum(["CASH_IN", "CASH_DROP", "PAY_OUT"]);
export type DrawerTxType = z.infer<typeof drawerTxTypeEnum>;

export const openShiftSchema = z.object({
  openingFloat: z.coerce.number().min(0).default(0),
  denominations: z.record(z.string(), z.number()).optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
});
export type OpenShiftDto = z.infer<typeof openShiftSchema>;

export const closeShiftSchema = z.object({
  countedCash: z.coerce.number().min(0),
  denominations: z.record(z.string(), z.number()).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});
export type CloseShiftDto = z.infer<typeof closeShiftSchema>;

export const drawerTransactionSchema = z.object({
  type: drawerTxTypeEnum,
  amount: z.coerce.number().positive(),
  reason: z.string().trim().min(1).max(200),
});
export type DrawerTransactionDto = z.infer<typeof drawerTransactionSchema>;

export interface DenominationBreakdown {
  [denomination: string]: number; // e.g. "500": 10, "200": 5, "100": 20
}

export interface CashDrawerTransactionView {
  id: string;
  shiftId: string;
  type: DrawerTxType;
  amount: number;
  reason: string;
  userId: string;
  userName?: string;
  createdAt: string;
}

export interface CashDrawerShiftView {
  id: string;
  branchId: string;
  userId: string;
  userName?: string;
  status: CashShiftStatus;
  openedAt: string;
  closedAt?: string | null;
  openingFloat: number;
  openingDenominations?: DenominationBreakdown | null;
  openingNotes?: string | null;

  // Real-time sales breakdown
  cashSales: number;
  upiSales: number;
  cardSales: number;
  otherSales: number;
  totalSales: number;
  orderCount: number;

  // Drawer cash transactions
  cashIn: number;
  cashDrop: number;
  cashExpenses: number;
  cashRefunds: number;

  // Closing / Reconciliation
  expectedCash: number;
  actualCash?: number | null;
  variance?: number | null;
  closingDenominations?: DenominationBreakdown | null;
  closingNotes?: string | null;
  closedById?: string | null;
  closedByName?: string | null;

  transactions?: CashDrawerTransactionView[];
}
