/**
 * Messaging Hooks
 * Feature: 015-direct-messaging
 *
 * React Query hooks for messaging-related data fetching and mutations.
 * Includes WebSocket hook for real-time updates.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import type {
  ConversationUI,
  MessageUI,
  RecentMessageUI,
  UserSummary,
} from "@/types/prisma";
import type { SendMessageInput } from "@/types/messaging";

// ========================================
// Query Keys
// ========================================

export const messagingKeys = {
  all: ["messaging"] as const,
  unreadCount: () => [...messagingKeys.all, "unread-count"] as const,
  recent: (limit?: number) => [...messagingKeys.all, "recent", limit] as const,
  conversations: (params?: { search?: string }) =>
    [...messagingKeys.all, "conversations", params] as const,
  conversationsInfinite: (params?: { search?: string }) =>
    [...messagingKeys.all, "conversations", "infinite", params] as const,
  conversation: (id: number) =>
    [...messagingKeys.all, "conversation", id] as const,
  messages: (conversationId: number) =>
    [...messagingKeys.all, "messages", conversationId] as const,
  messagesInfinite: (conversationId: number) =>
    [...messagingKeys.all, "messages", "infinite", conversationId] as const,
};

// ========================================
// Types
// ========================================

type ConversationsResponse = {
  conversations: ConversationUI[];
  nextCursor: number | null;
  hasMore: boolean;
};

type MessagesResponse = {
  messages: MessageUI[];
  otherUser: UserSummary;
  nextCursor: number | null;
  hasMore: boolean;
};

type GetOrCreateConversationResponse = {
  id: number;
  otherUser: UserSummary;
  isNew: boolean;
};

type RecentMessagesResponse = {
  messages: RecentMessageUI[];
};

type UnreadCountResponse = {
  count: number;
};

// ========================================
// Unread Count Hook
// ========================================

/**
 * Fetch unread message count for badge display
 */
export function useUnreadMessageCount() {
  return useQuery({
    queryKey: messagingKeys.unreadCount(),
    queryFn: async (): Promise<UnreadCountResponse> => {
      const res = await fetch("/api/messages/unread-count");
      if (!res.ok) throw new Error("Failed to fetch unread count");
      return res.json();
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000, // Poll every 5 seconds for real-time badge updates
  });
}

// ========================================
// Recent Messages Hook
// ========================================

/**
 * Fetch recent messages for header dropdown
 */
export function useRecentMessages(options?: {
  limit?: number;
  enabled?: boolean;
}) {
  const { limit = 10, enabled = true } = options ?? {};

  return useQuery({
    queryKey: messagingKeys.recent(limit),
    queryFn: async (): Promise<RecentMessagesResponse> => {
      const params = new URLSearchParams();
      if (limit) params.set("limit", limit.toString());

      const res = await fetch(`/api/messages/recent?${params}`);
      if (!res.ok) throw new Error("Failed to fetch recent messages");
      return res.json();
    },
    enabled,
    refetchOnMount: "always",
    staleTime: 10000, // 10 seconds
  });
}

// ========================================
// Conversations Hooks
// ========================================

/**
 * Fetch conversations list with pagination
 */
export function useConversations(options?: {
  search?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { search, limit = 20, enabled = true } = options ?? {};

  return useInfiniteQuery({
    queryKey: messagingKeys.conversationsInfinite({ search }),
    queryFn: async ({ pageParam }): Promise<ConversationsResponse> => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      if (search) params.set("search", search);
      if (pageParam) params.set("cursor", pageParam.toString());

      const res = await fetch(`/api/messages/conversations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000, // Poll every 5 seconds for real-time sidebar updates
  });
}

// ========================================
// Single Conversation Hook
// ========================================

/**
 * Fetch a single conversation with its messages
 */
export function useConversation(
  conversationId: number | undefined,
  options?: { limit?: number; enabled?: boolean }
) {
  const { limit = 20, enabled = true } = options ?? {};

  return useInfiniteQuery({
    queryKey: messagingKeys.messagesInfinite(conversationId ?? 0),
    queryFn: async ({ pageParam }): Promise<MessagesResponse> => {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      if (pageParam) params.set("cursor", pageParam.toString());

      const res = await fetch(
        `/api/messages/conversations/${conversationId}?${params}`
      );
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: enabled && !!conversationId,
    staleTime: 5000, // 5 seconds
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

// ========================================
// Get or Create Conversation Hook
// ========================================

/**
 * Get or create a conversation with another user
 */
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      userId: number
    ): Promise<GetOrCreateConversationResponse> => {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get/create conversation");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate conversations list to include new conversation
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversationsInfinite(),
      });
    },
  });
}

// ========================================
// Send Message Hook
// ========================================

/**
 * Send a message to a conversation with optimistic update
 */
export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendMessageInput): Promise<MessageUI> => {
      const res = await fetch(`/api/messages/conversations/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send message");
      }
      return res.json();
    },
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: messagingKeys.messagesInfinite(conversationId),
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(
        messagingKeys.messagesInfinite(conversationId)
      );

      // Optimistically update to the new value
      // Note: We don't have sender info here, so we'll let the real response update
      // This is a simple optimistic update - more complex would add a temp message

      return { previousData };
    },
    onError: (_error, _newMessage, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          messagingKeys.messagesInfinite(conversationId),
          context.previousData
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messagesInfinite(conversationId),
      });
      // Also update conversations list (for last message preview)
      queryClient.invalidateQueries({
        queryKey: messagingKeys.conversationsInfinite(),
      });
    },
  });
}

// ========================================
// Mark as Read Hook
// ========================================

/**
 * Mark a conversation as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      conversationId: number
    ): Promise<{ success: boolean }> => {
      const res = await fetch(
        `/api/messages/conversations/${conversationId}/read`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: async (_data, conversationId) => {
      // Update unread count immediately
      await queryClient.invalidateQueries({
        queryKey: messagingKeys.unreadCount(),
      });
      // Update conversation's unread count in the list
      await queryClient.invalidateQueries({
        queryKey: messagingKeys.conversationsInfinite(),
      });
      // Also invalidate recent messages for header dropdown
      await queryClient.invalidateQueries({
        queryKey: messagingKeys.recent(),
      });
    },
  });
}

// ========================================
// WebSocket Hook
// ========================================

type NewMessageEvent = {
  id: number;
  conversationId: number;
  content: string | null;
  senderId: number;
  createdAt: string;
  media: Array<{
    id: number;
    mediaType: string;
    url: string | null;
  }>;
};

type UnreadCountEvent = {
  count: number;
};

type ConnectionStatusEvent = {
  conversationId: number;
  isConnected: boolean;
};

type UseMessageSocketOptions = {
  enabled?: boolean;
  userId?: number;
  sessionToken?: string;
  onNewMessage?: (message: NewMessageEvent) => void;
  onUnreadCountUpdate?: (count: number) => void;
  onConnectionStatusChange?: (event: ConnectionStatusEvent) => void;
  onError?: (error: Error) => void;
};

/**
 * Connect to WebSocket for real-time messaging updates.
 * Handles new message events and unread count updates.
 *
 * NOTE: WebSocket is optional - if no server is running, the hook
 * will silently fail and the app will use HTTP polling instead.
 */
export function useMessageSocket(options: UseMessageSocketOptions = {}) {
  const {
    enabled = false, // Disabled by default until WebSocket server is set up
    userId,
    sessionToken,
    onNewMessage,
    onUnreadCountUpdate,
    onConnectionStatusChange,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const joinedConversationsRef = useRef<Set<number>>(new Set());
  const maxReconnectAttempts = 3; // Limit reconnection attempts

  // Calculate backoff delay with exponential increase (max 30 seconds)
  const getReconnectDelay = useCallback(() => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const attempt = reconnectAttemptRef.current;
    return Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Skip connection if not enabled or missing credentials
    if (!enabled || !userId || !sessionToken) return;
    if (socketRef.current?.connected) return;

    // Stop trying after max attempts
    if (reconnectAttemptRef.current >= maxReconnectAttempts) {
      console.log(
        "[messaging] WebSocket: Max reconnection attempts reached, using HTTP polling"
      );
      return;
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const socket = io(`${appUrl}/messaging`, {
        path: "/api/socket",
        auth: {
          sessionToken,
          userId,
        },
        reconnection: false, // We handle reconnection manually
        timeout: 5000, // 5 second timeout
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("[messaging] WebSocket connected");
        setIsConnected(true);
        reconnectAttemptRef.current = 0;

        // Rejoin previously joined conversations
        joinedConversationsRef.current.forEach((conversationId) => {
          socket.emit("join-conversation", { conversationId });
        });
      });

      socket.on("disconnect", (reason) => {
        console.log("[messaging] WebSocket disconnected:", reason);
        setIsConnected(false);

        // Attempt reconnection only for unexpected disconnects
        if (
          enabled &&
          reason !== "io client disconnect" &&
          reconnectAttemptRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptRef.current += 1;
          const delay = getReconnectDelay();
          console.log(
            `[messaging] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts})...`
          );
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      });

      socket.on("connect_error", (error) => {
        // Silently handle connection errors - WebSocket is optional
        console.log("[messaging] WebSocket unavailable, using HTTP polling");
        setIsConnected(false);

        // Clean up the socket
        socket.disconnect();
        socketRef.current = null;

        // Don't retry if server is unavailable
        reconnectAttemptRef.current = maxReconnectAttempts;
      });

      // Handle new messages
      socket.on("new-message", (message: NewMessageEvent) => {
        console.log("[messaging] New message received:", message.id);
        onNewMessage?.(message);

        // Update the messages cache
        queryClient.invalidateQueries({
          queryKey: messagingKeys.messagesInfinite(message.conversationId),
        });

        // Update conversations list (for preview and order)
        queryClient.invalidateQueries({
          queryKey: messagingKeys.conversationsInfinite(),
        });

        // Update recent messages
        queryClient.invalidateQueries({
          queryKey: messagingKeys.recent(),
        });
      });

      // Handle unread count updates
      socket.on("unread-count", (data: UnreadCountEvent) => {
        console.log("[messaging] Unread count update:", data.count);
        queryClient.setQueryData(messagingKeys.unreadCount(), {
          count: data.count,
        });
        onUnreadCountUpdate?.(data.count);
      });

      // Handle connection status changes (e.g., user unfriended)
      socket.on("connection-status-changed", (event: ConnectionStatusEvent) => {
        console.log("[messaging] Connection status changed:", event);
        onConnectionStatusChange?.(event);
      });

      // Handle errors
      socket.on(
        "message-error",
        (data: { error: string; conversationId: number }) => {
          console.error("[messaging] Message error:", data);
          onError?.(new Error(data.error));
        }
      );
    } catch (error) {
      // Silently fail - WebSocket is optional
      console.log(
        "[messaging] WebSocket initialization failed, using HTTP polling"
      );
    }
  }, [
    enabled,
    userId,
    sessionToken,
    queryClient,
    onNewMessage,
    onUnreadCountUpdate,
    onConnectionStatusChange,
    onError,
    getReconnectDelay,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    joinedConversationsRef.current.clear();
  }, []);

  // Join a conversation room
  const joinConversation = useCallback((conversationId: number) => {
    joinedConversationsRef.current.add(conversationId);
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-conversation", { conversationId });
    }
  }, []);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId: number) => {
    joinedConversationsRef.current.delete(conversationId);
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave-conversation", { conversationId });
    }
  }, []);

  // Send message via WebSocket (alternative to REST API)
  const sendMessage = useCallback(
    (
      conversationId: number,
      content?: string,
      mediaUrl?: string,
      mediaType?: "image" | "video",
      mediaKey?: string
    ) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("send-message", {
          conversationId,
          content,
          mediaUrl,
          mediaType,
          mediaKey,
        });
      }
    },
    []
  );

  // Effect to manage connection lifecycle
  useEffect(() => {
    if (enabled && userId && sessionToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, userId, sessionToken, connect, disconnect]);

  return {
    isConnected,
    disconnect,
    reconnect: connect,
    joinConversation,
    leaveConversation,
    sendMessage,
  };
}
