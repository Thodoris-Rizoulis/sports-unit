"use client";

/**
 * NotificationBell Component
 *
 * Bell icon with unread notification count badge.
 * Displayed in the header, shows badge when there are unread notifications.
 * Supports both dropdown and link-only modes.
 * Uses SSE for real-time updates when in dropdown mode.
 */

import React, { useState } from "react";
import Link from "next/link";
import { BellIcon } from "@heroicons/react/24/solid";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useUnreadCount,
  useNotificationStream,
} from "@/hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";

type NotificationBellProps = {
  className?: string;
  showLabel?: boolean;
  /** If true, renders as a dropdown. If false, renders as a link. */
  useDropdown?: boolean;
  /** If true, enables real-time SSE updates. Default: true */
  enableRealtime?: boolean;
};

export function NotificationBell({
  className = "",
  showLabel = true,
  useDropdown = true,
  enableRealtime = true,
}: NotificationBellProps) {
  const { data, isLoading } = useUnreadCount();
  const [isOpen, setIsOpen] = useState(false);

  // Connect to SSE stream for real-time updates (only in dropdown mode)
  useNotificationStream({
    enabled: useDropdown && enableRealtime,
  });

  const count = data?.count ?? 0;

  // Format badge text: show "99+" for counts over 99
  const badgeText = count > 99 ? "99+" : count.toString();

  const bellContent = (
    <>
      <div className="relative">
        <BellIcon className="h-5 w-5" />
        {!isLoading && count > 0 && (
          <span
            className="absolute -top-2 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-destructive rounded-full"
            aria-hidden="true"
          >
            {badgeText}
          </span>
        )}
      </div>
      {showLabel && <span>Notifications</span>}
    </>
  );

  // When className is provided, use it directly (for mobile nav integration)
  // Otherwise use default desktop styling
  const baseClassName = className
    ? `relative flex flex-col items-center justify-center ${className}`
    : "relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground hover:text-primary hover:bg-accent transition-colors";

  // Link-only mode (for mobile navigation)
  if (!useDropdown) {
    return (
      <Link
        href="/notifications"
        className={baseClassName}
        aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
      >
        {bellContent}
      </Link>
    );
  }

  // Dropdown mode (for desktop)
  // Only render NotificationDropdown when open to prevent auto-mark-as-read from firing on mount
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={baseClassName}
          aria-label={`Notifications${count > 0 ? `, ${count} unread` : ""}`}
        >
          {bellContent}
        </button>
      </DropdownMenuTrigger>
      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </DropdownMenu>
  );
}
