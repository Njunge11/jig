"use client";
import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => onlineManager.subscribe(onChange);

/** The one offline banner. The app shell draws it. */
export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => onlineManager.isOnline(),
    () => true,
  );
  if (online) return null;
  return (
    <div role="status" className="bg-muted px-4 py-2 text-center text-sm text-foreground">
      You are offline. A change that you make now is sent when the connection returns. Keep this page open.
    </div>
  );
}
