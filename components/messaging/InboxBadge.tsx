"use client";

/**
 * InboxBadge Component
 * Feature: 015-direct-messaging
 *
 * Displays unread message count badge on the Inbox icon in header.
 * Shows "99+" when count exceeds 99.
 */

import React from "react";
import { cn } from "@/lib/utils";

type InboxBadgeProps = {
  count: number;
  className?: string;
};

export function InboxBadge({ count, className }: InboxBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
        count > 99 && "min-w-[24px]",
        className
      )}
      aria-label={`${count} unread messages`}
    >
      {displayCount}
    </span>
  );
}
