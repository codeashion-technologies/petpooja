import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  type CashDrawerShiftView,
  type CashDrawerTransactionView,
  type CloseShiftDto,
  type DrawerTransactionDto,
  type OpenShiftDto,
} from '@nodedr-restaurant/types';

@Injectable()
export class CashDrawerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the current open shift for a branch, computing real-time sales & cash metrics.
   * If no shift is open, returns null.
   */
  async getCurrentShift(branchId: string): Promise<CashDrawerShiftView | null> {
    const shift = await this.prisma.cashDrawerShift.findFirst({
      where: { branchId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!shift) {
      return null;
    }

    return this.computeShiftMetrics(shift);
  }

  /**
   * Opens a new cash drawer shift with an initial float.
   */
  async openShift(
    branchId: string,
    userId: string,
    dto: OpenShiftDto,
  ): Promise<CashDrawerShiftView> {
    const existing = await this.prisma.cashDrawerShift.findFirst({
      where: { branchId, status: 'OPEN' },
    });

    if (existing) {
      throw new ConflictException(
        'There is already an active open shift for this branch. Please close it first.',
      );
    }

    const created = await this.prisma.cashDrawerShift.create({
      data: {
        branchId,
        userId,
        openingFloat: dto.openingFloat,
        openingDenominations: dto.denominations ?? {},
        openingNotes: dto.notes,
        status: 'OPEN',
      },
      include: {
        user: { select: { id: true, name: true } },
        transactions: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return this.computeShiftMetrics(created);
  }

  /**
   * Adds a transaction during the shift: CASH_DROP (safe drop), CASH_IN (float add), or PAY_OUT (petty expense).
   */
  async addTransaction(
    branchId: string,
    userId: string,
    dto: DrawerTransactionDto,
  ): Promise<CashDrawerTransactionView> {
    const shift = await this.prisma.cashDrawerShift.findFirst({
      where: { branchId, status: 'OPEN' },
    });

    if (!shift) {
      throw new BadRequestException('No active shift is open for this branch.');
    }

    const tx = await this.prisma.cashDrawerTransaction.create({
      data: {
        shiftId: shift.id,
        branchId,
        userId,
        type: dto.type,
        amount: dto.amount,
        reason: dto.reason,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return {
      id: tx.id,
      shiftId: tx.shiftId,
      type: tx.type as any,
      amount: Number(tx.amount),
      reason: tx.reason,
      userId: tx.userId,
      userName: tx.user?.name,
      createdAt: tx.createdAt.toISOString(),
    };
  }

  /**
   * Closes the active shift, calculates expected cash vs counted cash variance, and produces Z-Report data.
   */
  async closeShift(
    branchId: string,
    userId: string,
    dto: CloseShiftDto,
  ): Promise<CashDrawerShiftView> {
    const shift = await this.prisma.cashDrawerShift.findFirst({
      where: { branchId, status: 'OPEN' },
      include: {
        user: { select: { id: true, name: true } },
        transactions: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!shift) {
      throw new BadRequestException('No active shift is open for this branch.');
    }

    // Compute live metrics up to this moment
    const metrics = await this.computeShiftMetrics(shift);

    const actualCash = dto.countedCash;
    const expectedCash = metrics.expectedCash;
    const variance = Number((actualCash - expectedCash).toFixed(2));

    const closed = await this.prisma.cashDrawerShift.update({
      where: { id: shift.id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedById: userId,
        cashSales: metrics.cashSales,
        upiSales: metrics.upiSales,
        cardSales: metrics.cardSales,
        otherSales: metrics.otherSales,
        totalSales: metrics.totalSales,
        orderCount: metrics.orderCount,
        cashIn: metrics.cashIn,
        cashDrop: metrics.cashDrop,
        cashExpenses: metrics.cashExpenses,
        cashRefunds: metrics.cashRefunds,
        expectedCash,
        actualCash,
        variance,
        closingDenominations: dto.denominations ?? {},
        closingNotes: dto.notes,
      },
      include: {
        user: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return {
      id: closed.id,
      branchId: closed.branchId,
      userId: closed.userId,
      userName: closed.user?.name,
      status: 'CLOSED',
      openedAt: closed.openedAt.toISOString(),
      closedAt: closed.closedAt?.toISOString(),
      openingFloat: Number(closed.openingFloat),
      openingDenominations: closed.openingDenominations as any,
      openingNotes: closed.openingNotes,
      cashSales: Number(closed.cashSales),
      upiSales: Number(closed.upiSales),
      cardSales: Number(closed.cardSales),
      otherSales: Number(closed.otherSales),
      totalSales: Number(closed.totalSales),
      orderCount: closed.orderCount,
      cashIn: Number(closed.cashIn),
      cashDrop: Number(closed.cashDrop),
      cashExpenses: Number(closed.cashExpenses),
      cashRefunds: Number(closed.cashRefunds),
      expectedCash: Number(closed.expectedCash ?? expectedCash),
      actualCash: Number(closed.actualCash ?? actualCash),
      variance: Number(closed.variance ?? variance),
      closingDenominations: closed.closingDenominations as any,
      closingNotes: closed.closingNotes,
      closedById: closed.closedById,
      closedByName: closed.closedBy?.name,
      transactions: closed.transactions.map((tx) => ({
        id: tx.id,
        shiftId: tx.shiftId,
        type: tx.type as any,
        amount: Number(tx.amount),
        reason: tx.reason,
        userId: tx.userId,
        userName: tx.user?.name,
        createdAt: tx.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Lists past shifts for the branch.
   */
  async listShifts(branchId: string, limit = 20): Promise<CashDrawerShiftView[]> {
    const shifts = await this.prisma.cashDrawerShift.findMany({
      where: { branchId },
      orderBy: { openedAt: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return shifts.map((s) => ({
      id: s.id,
      branchId: s.branchId,
      userId: s.userId,
      userName: s.user?.name,
      status: s.status as any,
      openedAt: s.openedAt.toISOString(),
      closedAt: s.closedAt?.toISOString(),
      openingFloat: Number(s.openingFloat),
      openingDenominations: s.openingDenominations as any,
      openingNotes: s.openingNotes,
      cashSales: Number(s.cashSales),
      upiSales: Number(s.upiSales),
      cardSales: Number(s.cardSales),
      otherSales: Number(s.otherSales),
      totalSales: Number(s.totalSales),
      orderCount: s.orderCount,
      cashIn: Number(s.cashIn),
      cashDrop: Number(s.cashDrop),
      cashExpenses: Number(s.cashExpenses),
      cashRefunds: Number(s.cashRefunds),
      expectedCash: Number(s.expectedCash ?? 0),
      actualCash: s.actualCash != null ? Number(s.actualCash) : null,
      variance: s.variance != null ? Number(s.variance) : null,
      closingDenominations: s.closingDenominations as any,
      closingNotes: s.closingNotes,
      closedById: s.closedById,
      closedByName: s.closedBy?.name,
      transactions: s.transactions.map((tx) => ({
        id: tx.id,
        shiftId: tx.shiftId,
        type: tx.type as any,
        amount: Number(tx.amount),
        reason: tx.reason,
        userId: tx.userId,
        userName: tx.user?.name,
        createdAt: tx.createdAt.toISOString(),
      })),
    }));
  }

  /**
   * Helper to aggregate real-time payments, refunds, and till transactions during an active shift.
   */
  private async computeShiftMetrics(shift: any): Promise<CashDrawerShiftView> {
    const startTime = shift.openedAt;
    const endTime = shift.closedAt ?? new Date();

    // 1. Fetch payments made during this shift window
    const payments = await this.prisma.payment.findMany({
      where: {
        order: {
          branchId: shift.branchId,
          status: { not: 'CANCELLED' },
        },
        createdAt: {
          gte: startTime,
          lte: endTime,
        },
      },
      select: {
        method: true,
        amount: true,
        orderId: true,
      },
    });

    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let otherSales = 0;
    const orderIds = new Set<string>();

    for (const p of payments) {
      const amt = Number(p.amount);
      if (p.method === 'CASH') {
        cashSales += amt;
      } else if (p.method === 'UPI') {
        upiSales += amt;
      } else if (p.method === 'CARD') {
        cardSales += amt;
      } else {
        otherSales += amt;
      }
      orderIds.add(p.orderId);
    }

    const totalSales = Number(
      (cashSales + upiSales + cardSales + otherSales).toFixed(2),
    );
    const orderCount = orderIds.size;

    // 2. Fetch cash refunds
    const refunds = await this.prisma.refund.findMany({
      where: {
        order: {
          branchId: shift.branchId,
        },
        method: 'CASH',
        createdAt: {
          gte: startTime,
          lte: endTime,
        },
      },
      select: { amount: true },
    });

    let cashRefunds = 0;
    for (const r of refunds) {
      cashRefunds += Number(r.amount);
    }

    // 3. Aggregate shift transactions
    let cashIn = 0;
    let cashDrop = 0;
    let cashExpenses = 0;

    const txs: CashDrawerTransactionView[] = [];
    for (const tx of shift.transactions ?? []) {
      const amt = Number(tx.amount);
      if (tx.type === 'CASH_IN') cashIn += amt;
      else if (tx.type === 'CASH_DROP') cashDrop += amt;
      else if (tx.type === 'PAY_OUT') cashExpenses += amt;

      txs.push({
        id: tx.id,
        shiftId: tx.shiftId,
        type: tx.type as any,
        amount: amt,
        reason: tx.reason,
        userId: tx.userId,
        userName: tx.user?.name,
        createdAt: tx.createdAt.toISOString(),
      });
    }

    // Expected in drawer = Opening Float + Cash Sales - Cash Refunds + Cash In - Cash Drop - Cash Expenses
    const openingFloat = Number(shift.openingFloat);
    const expectedCash = Number(
      (
        openingFloat +
        cashSales -
        cashRefunds +
        cashIn -
        cashDrop -
        cashExpenses
      ).toFixed(2),
    );

    return {
      id: shift.id,
      branchId: shift.branchId,
      userId: shift.userId,
      userName: shift.user?.name,
      status: shift.status,
      openedAt: shift.openedAt.toISOString(),
      closedAt: shift.closedAt?.toISOString(),
      openingFloat,
      openingDenominations: shift.openingDenominations as any,
      openingNotes: shift.openingNotes,
      cashSales: Number(cashSales.toFixed(2)),
      upiSales: Number(upiSales.toFixed(2)),
      cardSales: Number(cardSales.toFixed(2)),
      otherSales: Number(otherSales.toFixed(2)),
      totalSales,
      orderCount,
      cashIn: Number(cashIn.toFixed(2)),
      cashDrop: Number(cashDrop.toFixed(2)),
      cashExpenses: Number(cashExpenses.toFixed(2)),
      cashRefunds: Number(cashRefunds.toFixed(2)),
      expectedCash,
      actualCash: shift.actualCash != null ? Number(shift.actualCash) : null,
      variance: shift.variance != null ? Number(shift.variance) : null,
      closingDenominations: shift.closingDenominations as any,
      closingNotes: shift.closingNotes,
      closedById: shift.closedById,
      closedByName: shift.closedBy?.name,
      transactions: txs,
    };
  }
}
