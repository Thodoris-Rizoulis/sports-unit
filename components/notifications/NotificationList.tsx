"use client";

/**
 * NotificationList Component
 *
 * Renders a list of notifications with proper grouping display.
 */

import React from "react";
import { useRouter } from "next/navigation";
import type { GroupedNotification } from "@/types/prisma";
import { NotificationItem, getNavigationUrl } from "./NotificationItem";
import { NotificationEmptyState } from "./NotificationEmptyState";

type NotificationListProps = {
  notifications: GroupedNotification[];
  onNotificationClick?: () => void;
};

export function NotificationList({
  notifications,
  onNotificationClick,
}: NotificationListProps) {
  const router = useRouter();

  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  const handleClick = (notification: GroupedNotification) => {
    const url = getNavigationUrl(notification);
    if (url !== "#") {
      router.push(url);
    }
    onNotificationClick?.();
  };

  return (
    <div className="divide-y divide-border">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={() => handleClick(notification)}
        />
      ))}
    </div>
  );
}
