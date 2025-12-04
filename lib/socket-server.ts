/**
 * Socket.io Server Configuration
 * Feature: 015-direct-messaging
 *
 * WebSocket server for real-time messaging functionality.
 * Handles authentication, room management, and message broadcasting.
 */

import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { MessagingService } from "@/services/messaging";
import type {
  JoinConversationEvent,
  LeaveConversationEvent,
  SendMessageEvent,
} from "@/types/messaging";
import {
  joinConversationEventSchema,
  leaveConversationEventSchema,
  sendMessageEventSchema,
} from "@/types/messaging";

// ========================================
// Types
// ========================================

type AuthenticatedSocket = Socket & {
  userId: number;
};

type NewMessagePayload = {
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

type UnreadCountPayload = {
  count: number;
};

type MessageErrorPayload = {
  error: string;
  conversationId: number;
};

type ConnectionStatusPayload = {
  conversationId: number;
  isConnected: boolean;
};

// ========================================
// Socket.io Server Class
// ========================================

export class SocketServer {
  private io: SocketIOServer | null = null;
  private userSockets: Map<number, Set<string>> = new Map();

  /**
   * Initialize the Socket.io server
   */
  initialize(httpServer: HTTPServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Create messaging namespace
    const messaging = this.io.of("/messaging");

    // Authentication middleware
    messaging.use(async (socket, next) => {
      try {
        // Get session from handshake auth
        const sessionToken = socket.handshake.auth?.sessionToken;

        if (!sessionToken) {
          console.warn(
            `[messaging] WebSocket auth failed: No session token provided`
          );
          return next(new Error("Authentication required"));
        }

        // Validate session - in production, you'd verify the session token
        // For now, we'll use the userId passed in auth
        const userId = socket.handshake.auth?.userId;

        if (!userId || typeof userId !== "number") {
          console.warn(`[messaging] WebSocket auth failed: Invalid userId`);
          return next(new Error("Invalid authentication"));
        }

        // Attach userId to socket
        (socket as AuthenticatedSocket).userId = userId;

        console.info(
          `[messaging] WebSocket connect: ${JSON.stringify({ userId })}`
        );
        next();
      } catch (error) {
        console.error(
          `[messaging] WebSocket auth error: ${JSON.stringify({
            error: String(error),
          })}`
        );
        next(new Error("Authentication failed"));
      }
    });

    // Connection handler
    messaging.on("connection", (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      const userId = authSocket.userId;

      // Track socket for user
      this.addUserSocket(userId, socket.id);

      // Handle joining a conversation room
      socket.on("join-conversation", async (data: JoinConversationEvent) => {
        try {
          const parsed = joinConversationEventSchema.safeParse(data);
          if (!parsed.success) {
            socket.emit("message-error", {
              error: "Invalid conversation ID",
              conversationId: data?.conversationId ?? 0,
            });
            return;
          }

          const { conversationId } = parsed.data;

          // Verify user is a participant
          const isParticipant = await MessagingService.isParticipant(
            conversationId,
            userId
          );

          if (!isParticipant) {
            socket.emit("message-error", {
              error: "Not a participant of this conversation",
              conversationId,
            });
            return;
          }

          // Join the room
          socket.join(`conversation:${conversationId}`);
          console.info(
            `[messaging] Joined room: ${JSON.stringify({
              userId,
              conversationId,
            })}`
          );
        } catch (error) {
          console.error(
            `[messaging] Join conversation error: ${JSON.stringify({
              error: String(error),
            })}`
          );
        }
      });

      // Handle leaving a conversation room
      socket.on("leave-conversation", (data: LeaveConversationEvent) => {
        try {
          const parsed = leaveConversationEventSchema.safeParse(data);
          if (!parsed.success) return;

          const { conversationId } = parsed.data;
          socket.leave(`conversation:${conversationId}`);
          console.info(
            `[messaging] Left room: ${JSON.stringify({
              userId,
              conversationId,
            })}`
          );
        } catch (error) {
          console.error(
            `[messaging] Leave conversation error: ${JSON.stringify({
              error: String(error),
            })}`
          );
        }
      });

      // Handle sending a message via WebSocket
      socket.on("send-message", async (data: SendMessageEvent) => {
        try {
          const parsed = sendMessageEventSchema.safeParse(data);
          if (!parsed.success) {
            socket.emit("message-error", {
              error: "Invalid message data",
              conversationId: data?.conversationId ?? 0,
            });
            return;
          }

          const { conversationId, content, mediaUrl, mediaKey, mediaType } =
            parsed.data;

          // Send message through service
          const message = await MessagingService.sendMessage(
            conversationId,
            userId,
            { content, mediaUrl, mediaKey, mediaType }
          );

          // Broadcast to conversation room
          this.broadcastMessage(conversationId, {
            id: message.id,
            conversationId,
            content: message.content,
            senderId: message.senderId,
            createdAt: message.createdAt,
            media: message.media,
          });

          // Update unread count for other participant
          const conversation = await MessagingService.getConversation(
            conversationId
          );
          if (conversation) {
            const otherUserId = conversation.participantIds.find(
              (id) => id !== userId
            );
            if (otherUserId) {
              await this.updateUnreadCount(otherUserId);
            }
          }
        } catch (error) {
          console.error(
            `[messaging] Send message error: ${JSON.stringify({
              error: String(error),
              conversationId: data?.conversationId,
            })}`
          );
          socket.emit("message-error", {
            error:
              error instanceof Error ? error.message : "Failed to send message",
            conversationId: data?.conversationId ?? 0,
          });
        }
      });

      // Handle disconnect
      socket.on("disconnect", (reason) => {
        this.removeUserSocket(userId, socket.id);
        console.info(
          `[messaging] WebSocket disconnect: ${JSON.stringify({
            userId,
            reason,
          })}`
        );
      });
    });

    console.info("[messaging] Socket.io server initialized");
    return this.io;
  }

  /**
   * Track a socket connection for a user
   */
  private addUserSocket(userId: number, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  /**
   * Remove a socket connection for a user
   */
  private removeUserSocket(userId: number, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  /**
   * Get all socket IDs for a user
   */
  private getUserSockets(userId: number): string[] {
    return Array.from(this.userSockets.get(userId) ?? []);
  }

  /**
   * Broadcast a new message to a conversation room
   */
  broadcastMessage(conversationId: number, message: NewMessagePayload): void {
    if (!this.io) return;

    this.io
      .of("/messaging")
      .to(`conversation:${conversationId}`)
      .emit("new-message", message);
  }

  /**
   * Send updated unread count to a specific user
   */
  async updateUnreadCount(userId: number): Promise<void> {
    if (!this.io) return;

    try {
      const count = await MessagingService.getUnreadCount(userId);
      const sockets = this.getUserSockets(userId);

      for (const socketId of sockets) {
        this.io.of("/messaging").to(socketId).emit("unread-count", { count });
      }
    } catch (error) {
      console.error(
        `[messaging] Update unread count error: ${JSON.stringify({
          error: String(error),
          userId,
        })}`
      );
    }
  }

  /**
   * Notify user about connection status change
   */
  notifyConnectionStatusChange(
    userId: number,
    conversationId: number,
    isConnected: boolean
  ): void {
    if (!this.io) return;

    const sockets = this.getUserSockets(userId);
    for (const socketId of sockets) {
      this.io.of("/messaging").to(socketId).emit("connection-status-changed", {
        conversationId,
        isConnected,
      });
    }
  }

  /**
   * Get the Socket.io server instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Singleton instance
export const socketServer = new SocketServer();
