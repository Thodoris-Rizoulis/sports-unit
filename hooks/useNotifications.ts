/**
 * Notification Hooks
 *
 * React Query hooks for notification-related data fetching and mutations.
 * Includes SSE stream hook for real-time updates.
 */

import { useEffect, useRef, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type { NotificationsResponse } from "@/types/prisma";

// ========================================
// Query Keys
// ========================================

export const notificationsKeys = {
  all: ["notifications"] as const,
  unreadCount: () => [...notificationsKeys.all, "unread-count"] as const,
  list: (params?: { limit?: number; cursor?: number; grouped?: boolean }) =>
    [...notificationsKeys.all, "list", params] as const,
  infinite: () => [...notificationsKeys.all, "infinite"] as const,
};

// ========================================
// Unread Count Hook
// ========================================

/**
 * Fetch unread notification count for badge display
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: async (): Promise<{ count: number }> => {
      console.log("[NOTIF] useUnreadCount: fetching from API...");
      const res = await fetch("/api/notifications/unread-count");
      if (!res.ok) throw new Error("Failed to fetch unread count");
      const data = await res.json();
      console.log("[NOTIF] useUnreadCount: API returned count =", data.count);
      return data;
    },
    // Always fetch fresh data on mount (fixes issue when returning to site)
    refetchOnMount: "always",
    // Refetch on window focus for multi-tab sync
    refetchOnWindowFocus: "always",
    // Keep data fresh
    staleTime: 5000, // 5 seconds
  });
}

// ========================================
// SSE Stream Types
// ========================================

type SSEEvent =
  | { type: "connected"; timestamp: number }
  | { type: "unread-count"; count: number; timestamp: number }
  | { type: "error"; message: string; timestamp: number };

type UseNotificationStreamOptions = {
  enabled?: boolean;
  onCountUpdate?: (count: number) => void;
  onError?: (error: Error) => void;
};

// ========================================
// SSE Stream Hook
// ========================================

/**
 * Connect to SSE stream for real-time notification updates.
 * Automatically updates the unread count in React Query cache.
 * Implements exponential backoff for reconnection.
 */
export function useNotificationStream(options?: UseNotificationStreamOptions) {
  const { enabled = true, onCountUpdate, onError } = options ?? {};
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  // Calculate backoff delay with exponential increase (max 30 seconds)
  const getReconnectDelay = useCallback(() => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const attempt = reconnectAttemptRef.current;
    return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  }, []);

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current) return;

    const eventSource = new EventSource("/api/notifications/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("[NOTIF] SSE: Connected");
      isConnectedRef.current = true;
      reconnectAttemptRef.current = 0; // Reset on successful connection
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);

        if (data.type === "unread-count") {
          // Get current count to detect changes
          const currentData = queryClient.getQueryData<{ count: number }>(
            notificationsKeys.unreadCount()
          );
          const currentCount = currentData?.count ?? 0;

          console.log(
            "[NOTIF] SSE: Received count =",
            data.count,
            "| Cache count =",
            currentCount
          );

          // Update React Query cache directly
          queryClient.setQueryData(notificationsKeys.unreadCount(), {
            count: data.count,
          });
          console.log("[NOTIF] SSE: Updated cache to", data.count);

          // If count changed (new notifications or marked as read elsewhere),
          // invalidate the notifications LIST only (not unread count - we just set it)
          if (data.count !== currentCount) {
            console.log(
              "[NOTIF] SSE: Count changed, invalidating list queries"
            );
            // Only invalidate list and infinite queries, NOT unreadCount
            queryClient.invalidateQueries({
              queryKey: notificationsKeys.list(),
            });
            queryClient.invalidateQueries({
              queryKey: notificationsKeys.infinite(),
            });
          }

          onCountUpdate?.(data.count);
        } else if (data.type === "error") {
          onError?.(new Error(data.message));
        }
      } catch (e) {
        console.error("Failed to parse SSE event:", e);
      }
    };

    eventSource.onerror = () => {
      isConnectedRef.current = false;
      eventSource.close();
      eventSourceRef.current = null;

      // Attempt reconnection with exponential backoff
      if (enabled) {
        reconnectAttemptRef.current += 1;
        const delay = getReconnectDelay();

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };
  }, [enabled, queryClient, onCountUpdate, onError, getReconnectDelay]);

  // Disconnect from SSE stream
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    isConnectedRef.current = false;
  }, []);

  // Effect to manage connection lifecycle
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    disconnect,
    reconnect: connect,
  };
}

// ========================================
// Notifications List Hook
// ========================================

/**
 * Fetch paginated notifications for dropdown
 */
export function useNotifications(options?: {
  limit?: number;
  grouped?: boolean;
  enabled?: boolean;
}) {
  const { limit = 15, grouped = true, enabled = true } = options ?? {};

  return useQuery({
    queryKey: notificationsKeys.list({ limit, grouped }),
    queryFn: async (): Promise<NotificationsResponse> => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("grouped", grouped.toString());

      const res = await fetch(`/api/notifications?${params}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    enabled,
    // Always fetch fresh data when dropdown opens
    refetchOnMount: "always",
    staleTime: 5000, // 5 seconds
  });
}

// ========================================
// Mark All As Read Mutation
// ========================================

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{
      success: boolean;
      markedCount: number;
    }> => {
      console.log("[NOTIF] markAllAsRead: calling API...");
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark notifications as read");
      const data = await res.json();
      console.log("[NOTIF] markAllAsRead: API returned", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("[NOTIF] markAllAsRead: success, setting count to 0");
      // Reset unread count to 0 immediately
      queryClient.setQueryData(notificationsKeys.unreadCount(), { count: 0 });
      // Invalidate notifications list to refetch with updated read status
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationsKeys.infinite() });
    },
  });
}

// ========================================
// Infinite Notifications Hook (History Page)
// ========================================

/**
 * Fetch paginated notifications with infinite scroll support.
 * Used for the full notification history page.
 */
export function useInfiniteNotifications(options?: {
  limit?: number;
  grouped?: boolean;
  enabled?: boolean;
}) {
  const { limit = 20, grouped = false, enabled = true } = options ?? {};

  return useInfiniteQuery({
    queryKey: notificationsKeys.infinite(),
    queryFn: async ({ pageParam }): Promise<NotificationsResponse> => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      params.set("grouped", grouped.toString());
      if (pageParam) {
        params.set("cursor", pageParam.toString());
      }

      const res = await fetch(`/api/notifications?${params}`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled,
    staleTime: 10000, // 10 seconds
  });
}
