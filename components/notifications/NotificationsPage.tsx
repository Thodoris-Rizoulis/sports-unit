"use client";

/**
 * NotificationsPage Component
 *
 * Full notification history page with infinite scroll.
 * Displays all notifications (ungrouped) with read/unread visual distinction.
 */

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { Loader2, BellOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem, getNavigationUrl } from "./NotificationItem";
import {
  useInfiniteNotifications,
  useMarkAllAsRead,
  useUnreadCount,
} from "@/hooks/useNotifications";
import type { GroupedNotification } from "@/types/prisma";

export function NotificationsPage() {
  const router = useRouter();
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });
  const hasMarkedAsReadRef = useRef(false);

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications({ limit: 20, grouped: false });

  const markAllAsRead = useMarkAllAsRead();

  // Fetch next page when load more trigger is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Auto-mark all notifications as read when page loads (for mobile users)
  useEffect(() => {
    if (!isLoading && unreadCount > 0 && !hasMarkedAsReadRef.current) {
      hasMarkedAsReadRef.current = true;
      markAllAsRead.mutate();
    }
  }, [isLoading, unreadCount, markAllAsRead]);

  // Flatten all pages into a single array
  const notifications: GroupedNotification[] =
    data?.pages.flatMap((page) => page.notifications) ?? [];

  const handleNotificationClick = (notification: GroupedNotification) => {
    const url = getNavigationUrl(notification);
    if (url !== "#") {
      router.push(url);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Failed to load notifications
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            There was an error loading your notifications. Please try again.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No notifications yet
            </h2>
            <p className="text-sm text-muted-foreground">
              When you receive connection requests or interactions on your
              posts, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        )}

        {/* Load More Trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {/* End of list message */}
        {!hasNextPage && notifications.length > 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground border-t border-border">
            You&apos;ve reached the end
          </div>
        )}
      </div>
    </div>
  );
}
