"use client";

import { Download, MonitorCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone/installed mode
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error - iOS Safari specific property
      Boolean(window.navigator.standalone);

    setIsStandalone(standaloneMode);

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  // If already running inside standalone app mode, don't show prompt
  if (isStandalone) {
    return (
      <span
        className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-md"
        title="Running in Desktop POS App Mode"
      >
        <MonitorCheck className="h-3.5 w-3.5" />
        <span className="hidden xl:inline">POS App</span>
      </span>
    );
  }

  // If browser fired install prompt event, show 1-click Install button
  if (deferredPrompt) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstall}
        className="hidden sm:inline-flex items-center gap-1.5 h-8 text-xs font-medium border-primary/40 text-primary hover:bg-primary/10"
        title="Install OrderRestro as Desktop POS Software"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </Button>
    );
  }

  return null;
}
