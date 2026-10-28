"use client";

import { Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
      title={isFullscreen ? "Exit Fullscreen (F11 / Esc)" : "Fullscreen POS Mode (F11)"}
      aria-label="Toggle Fullscreen"
    >
      {isFullscreen ? (
        <Minimize className="h-[18px] w-[18px]" />
      ) : (
        <Maximize className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
