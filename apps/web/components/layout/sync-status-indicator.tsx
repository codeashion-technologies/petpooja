"use client";

import { Check, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSyncNow, useSyncStatus } from "@/hooks/use-sync";

export function SyncStatusIndicator() {
  const { data, isLoading } = useSyncStatus();
  const syncNow = useSyncNow();

  if (isLoading || !data) {
    return null;
  }

  // If this machine i   s the central server / sync hub
  if (data.role === "server") {
    return (
      <span
        className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 rounded-full"
        title="This PC is acting as Central Cloud / Sync Server"
      >
        <Cloud className="h-3.5 w-3.5" />
        <span>Cloud Hub</span>
      </span>
    );
  }

  const isEnabled = data.enabled;
  const isOffline = Boolean(data.lastError) || !isEnabled;
  const isSyncing = syncNow.isPending;
  const pending = data.pendingChanges ?? 0;

  const handleSyncClick = () => {
    syncNow.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(`Sync Complete: ${res.pushed} uploaded, ${res.pulled} downloaded`);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Sync failed. Will retry automatically.");
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-85 focus:outline-none"
        title="Click to view Cloud Sync details"
      >
        {isSyncing ? (
          <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span className="hidden sm:inline">Syncing…</span>
          </span>
        ) : isOffline ? (
          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
            <CloudOff className="h-3.5 w-3.5" />
            <span>Offline {pending > 0 ? `(${pending})` : "Mode"}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <Check className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Synced</span>
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-4">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center justify-between pb-2">
            <h4 className="font-semibold text-sm">Cloud Sync Status</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isOffline
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isOffline ? "Offline / Local" : "Cloud Connected"}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="text-xs space-y-1.5 text-muted-foreground py-2">
          <div className="flex justify-between">
            <span>Cloud Server:</span>
            <span className="font-mono text-foreground truncate max-w-[170px]">
              {data.serverUrl || "Central Supabase"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Last Synced:</span>
            <span className="text-foreground">
              {data.lastSyncAt ? new Date(data.lastSyncAt).toLocaleTimeString() : "Pending"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Pending Local Changes:</span>
            <span className={`font-semibold ${pending > 0 ? "text-amber-500" : "text-foreground"}`}>
              {pending} changes
            </span>
          </div>
        </div>

        {isOffline && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded my-2">
            Local Mode: All your bills & orders are safely stored on this computer. They will automatically upload when internet reconnects.
          </p>
        )}

        <div className="pt-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 text-xs h-8"
            onClick={handleSyncClick}
            disabled={syncNow.isPending}
          >
            <RefreshCw className={`h-3 w-3 ${syncNow.isPending ? "animate-spin" : ""}`} />
            {syncNow.isPending ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
