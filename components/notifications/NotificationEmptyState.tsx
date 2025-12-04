"use client";

/**
 * NotificationEmptyState Component
 *
 * Displayed when the user has no notifications.
 */

import React from "react";
import { BellIcon } from "@heroicons/react/24/outline";

type NotificationEmptyStateProps = {
  message?: string;
};

export function NotificationEmptyState({
  message = "No notifications yet",
}: NotificationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <BellIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        When you get notifications, they&apos;ll show up here
      </p>
    </div>
  );
}
