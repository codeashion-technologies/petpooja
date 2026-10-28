"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CashDrawerShiftView,
  CashDrawerTransactionView,
  CloseShiftDto,
  DrawerTransactionDto,
  OpenShiftDto,
} from "@nodedr-restaurant/types";

export function useCurrentShift(branchId: string | null) {
  return useQuery({
    queryKey: ["cash-drawer", "current", branchId],
    queryFn: () =>
      api.get<CashDrawerShiftView | null>(
        `/cash-drawer/current?branchId=${branchId}`,
      ),
    enabled: Boolean(branchId),
    refetchInterval: 15_000, // Poll every 15s to keep sales & till metrics fresh
  });
}

export function useShiftHistory(branchId: string | null) {
  return useQuery({
    queryKey: ["cash-drawer", "history", branchId],
    queryFn: () =>
      api.get<CashDrawerShiftView[]>(
        `/cash-drawer/shifts?branchId=${branchId}&limit=25`,
      ),
    enabled: Boolean(branchId),
  });
}

export function useCashDrawerActions(branchId: string | null) {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["cash-drawer", "current", branchId] });
    qc.invalidateQueries({ queryKey: ["cash-drawer", "history", branchId] });
  };

  const openShift = useMutation({
    mutationFn: (body: OpenShiftDto) =>
      api.post<CashDrawerShiftView>(
        `/cash-drawer/open?branchId=${branchId}`,
        body,
      ),
    onSuccess: invalidate,
  });

  const addTransaction = useMutation({
    mutationFn: (body: DrawerTransactionDto) =>
      api.post<CashDrawerTransactionView>(
        `/cash-drawer/transaction?branchId=${branchId}`,
        body,
      ),
    onSuccess: invalidate,
  });

  const closeShift = useMutation({
    mutationFn: (body: CloseShiftDto) =>
      api.post<CashDrawerShiftView>(
        `/cash-drawer/close?branchId=${branchId}`,
        body,
      ),
    onSuccess: invalidate,
  });

  return { openShift, addTransaction, closeShift };
}
