"use client";

/**
 * NotificationDropdown Component
 *
 * Dropdown panel that shows recent notifications with mark-all-as-read functionality.
 * Automatically marks all notifications as read when opened.
 * Refetches notifications on open to ensure latest data.
 */

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationList } from "./NotificationList";
import { useNotifications, useMarkAllAsRead } from "@/hooks/useNotifications";
import { Loader2 } from "lucide-react";

type NotificationDropdownProps = {
  onClose?: () => void;
};

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { data, isLoading, error, refetch } = useNotifications({
    limit: 10,
    grouped: true,
  });
  const markAllAsRead = useMarkAllAsRead();
  const hasMarkedAsReadRef = useRef(false);
  const hasRefetchedRef = useRef(false);

  const notifications = data?.notifications ?? [];
  const hasNotifications = notifications.length > 0;

  // Refetch notifications when dropdown opens to ensure we have latest data
  useEffect(() => {
    if (!hasRefetchedRef.current) {
      hasRefetchedRef.current = true;
      console.log("[NOTIF] Dropdown: mounted, refetching notifications");
      refetch();
    }
  }, [refetch]);

  // Automatically mark all notifications as read when dropdown opens
  // Only trigger once per dropdown open (using ref to prevent multiple calls)
  useEffect(() => {
    console.log(
      "[NOTIF] Dropdown: effect check - isLoading:",
      isLoading,
      "hasNotifications:",
      hasNotifications,
      "hasMarkedAsRead:",
      hasMarkedAsReadRef.current
    );
    if (!isLoading && hasNotifications && !hasMarkedAsReadRef.current) {
      hasMarkedAsReadRef.current = true;
      console.log("[NOTIF] Dropdown: triggering markAllAsRead");
      markAllAsRead.mutate();
    }
  }, [isLoading, hasNotifications, markAllAsRead]);

  return (
    <DropdownMenuContent align="end" className="w-80 md:w-96" sideOffset={8}>
      <div className="flex items-center justify-between px-2 py-1.5">
        <DropdownMenuLabel className="p-0 font-semibold">
          Notifications
        </DropdownMenuLabel>
      </div>
      <DropdownMenuSeparator />
      <div className="max-h-[350px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-destructive">
            Failed to load notifications
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            onNotificationClick={onClose}
          />
        )}
      </div>
      {hasNotifications && (
        <>
          <DropdownMenuSeparator />
          <div className="p-2">
            <Link
              href="/notifications"
              className="block text-center text-sm text-primary hover:underline"
              onClick={onClose}
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </DropdownMenuContent>
  );
}
