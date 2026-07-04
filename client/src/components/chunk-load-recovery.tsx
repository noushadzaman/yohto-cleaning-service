"use client";

import { useEffect } from "react";

const RELOAD_STORAGE_KEY = "yohto-chunk-reload-at";
const RELOAD_COOLDOWN_MS = 15_000;

function isChunkLoadError(reason: unknown): boolean {
  if (!reason) return false;

  if (reason instanceof Error) {
    return (
      reason.name === "ChunkLoadError" ||
      reason.message.includes("Failed to load chunk")
    );
  }

  const message = String(reason);
  return message.includes("ChunkLoadError") || message.includes("Failed to load chunk");
}

/** Reload once after deploy when the browser still has HTML pointing at removed chunks. */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const reloadOnce = () => {
      const lastReload = sessionStorage.getItem(RELOAD_STORAGE_KEY);
      const now = Date.now();
      if (lastReload && now - Number(lastReload) < RELOAD_COOLDOWN_MS) {
        return;
      }

      sessionStorage.setItem(RELOAD_STORAGE_KEY, String(now));
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error ?? event.message)) {
        reloadOnce();
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        reloadOnce();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
