/**
 * Messaging Service
 * Feature: 015-direct-messaging
 *
 * Business logic for direct messaging between connected users.
 * All database operations and business rules for conversations and messages.
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  includeConversationWithParticipants,
  includeMessageWithSender,
  toConversationUI,
  toMessage,
  toRecentMessage,
  toUserSummary,
  type ConversationUI,
  type MessageUI,
  type RecentMessageUI,
  type UserSummary,
  type GetOrCreateConversationResponse,
} from "@/types/prisma";
import type {
  GetConversationsOptions,
  GetMessagesOptions,
  SendMessageServiceInput,
} from "@/types/messaging";
import {
  CONVERSATIONS_DEFAULT_LIMIT,
  MESSAGES_DEFAULT_LIMIT,
  RECENT_MESSAGES_DEFAULT_LIMIT,
} from "@/types/messaging";

// ========================================
// Messaging Service
// ========================================

export class MessagingService {
  /**
   * Validate that two users are connected (accepted connection status)
   * @throws Error if users are not connected
   */
  static async validateConnection(
    userId1: number,
    userId2: number
  ): Promise<boolean> {
    const connection = await prisma.connection.findFirst({
      where: {
        status: "accepted",
        OR: [
          { requesterId: userId1, recipientId: userId2 },
          { requesterId: userId2, recipientId: userId1 },
        ],
      },
    });

    if (!connection) {
      console.warn(
        `[messaging] Connection validation failed: ${JSON.stringify({
          userId: userId1,
          targetUserId: userId2,
        })}`
      );
      return false;
    }

    return true;
  }

  /**
   * Get or create a conversation between two users
   * Creates a new conversation if one doesn't exist
   */
  static async getOrCreateConversation(
    userId1: number,
    userId2: number
  ): Promise<GetOrCreateConversationResponse> {
    // Validate users are connected
    const isConnected = await this.validateConnection(userId1, userId2);
    if (!isConnected) {
      throw new Error("You can only message users you are connected with");
    }

    // Find existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
        participants: { every: { userId: { in: [userId1, userId2] } } },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                attributes: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      const otherParticipant = existingConversation.participants.find(
        (p) => p.userId !== userId1
      );
      if (!otherParticipant) {
        throw new Error("Invalid conversation state");
      }

      return {
        id: existingConversation.id,
        otherUser: toUserSummary(otherParticipant.user),
        isNew: false,
      };
    }

    // Create new conversation with both participants
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: userId1 }, { userId: userId2 }],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                attributes: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const otherParticipant = newConversation.participants.find(
      (p) => p.userId !== userId1
    );
    if (!otherParticipant) {
      throw new Error("Failed to create conversation");
    }

    console.info(
      `[messaging] Conversation created: ${JSON.stringify({
        conversationId: newConversation.id,
        participants: [userId1, userId2],
      })}`
    );

    return {
      id: newConversation.id,
      otherUser: toUserSummary(otherParticipant.user),
      isNew: true,
    };
  }

  /**
   * Get user's conversations with pagination and optional search
   */
  static async getConversations(
    userId: number,
    options: GetConversationsOptions = {}
  ): Promise<{
    conversations: ConversationUI[];
    nextCursor: number | null;
    hasMore: boolean;
  }> {
    const limit = options.limit ?? CONVERSATIONS_DEFAULT_LIMIT;
    const { cursor, search } = options;

    // Build where clause
    const where: Prisma.ConversationWhereInput = {
      participants: { some: { userId } },
    };

    // Add cursor pagination
    if (cursor) {
      where.id = { lt: cursor };
    }

    // Add search filter (search by other user's name)
    if (search) {
      where.participants = {
        some: {
          userId: { not: userId },
          user: {
            OR: [
              {
                attributes: {
                  firstName: { contains: search, mode: "insensitive" },
                },
              },
              {
                attributes: {
                  lastName: { contains: search, mode: "insensitive" },
                },
              },
              { username: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      };
    }

    // Fetch conversations
    const conversations = await prisma.conversation.findMany({
      where,
      include: includeConversationWithParticipants,
      orderBy: { updatedAt: "desc" },
      take: limit + 1, // Fetch one extra to check for more
    });

    const hasMore = conversations.length > limit;
    const items = hasMore ? conversations.slice(0, limit) : conversations;
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    // Calculate unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      items.map(async (conv) => {
        const participant = conv.participants.find((p) => p.userId === userId);
        const lastReadAt = participant?.lastReadAt ?? new Date(0);

        // Count messages newer than lastReadAt from other users
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            createdAt: { gt: lastReadAt },
          },
        });

        return toConversationUI(conv, userId, unreadCount);
      })
    );

    return {
      conversations: conversationsWithUnread,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Get messages for a conversation with pagination
   */
  static async getMessages(
    conversationId: number,
    userId: number,
    options: GetMessagesOptions = {}
  ): Promise<{
    messages: MessageUI[];
    otherUser: UserSummary;
    nextCursor: number | null;
    hasMore: boolean;
  }> {
    const limit = options.limit ?? MESSAGES_DEFAULT_LIMIT;
    const { cursor } = options;

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });

    if (!participant) {
      throw new Error("You are not a participant of this conversation");
    }

    // Get other participant
    const otherParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: { not: userId } },
      include: {
        user: {
          include: {
            attributes: {
              select: {
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });

    if (!otherParticipant) {
      throw new Error("Conversation is invalid");
    }

    // Build where clause
    const where: Prisma.MessageWhereInput = { conversationId };
    if (cursor) {
      where.id = { lt: cursor };
    }

    // Fetch messages (newest first for pagination, reversed for display)
    const messages = await prisma.message.findMany({
      where,
      include: includeMessageWithSender,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    // Reverse to get chronological order (oldest first)
    const messagesUI = items.reverse().map(toMessage);

    return {
      messages: messagesUI,
      otherUser: toUserSummary(otherParticipant.user),
      nextCursor,
      hasMore,
    };
  }

  /**
   * Send a message to a conversation
   */
  static async sendMessage(
    conversationId: number,
    senderId: number,
    input: SendMessageServiceInput
  ): Promise<MessageUI> {
    // Verify sender is a participant
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: senderId },
    });

    if (!participant) {
      throw new Error("You are not a participant of this conversation");
    }

    // Get other participant to validate connection
    const otherParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: { not: senderId } },
    });

    if (!otherParticipant) {
      throw new Error("Conversation is invalid");
    }

    // Validate users are still connected
    const isConnected = await this.validateConnection(
      senderId,
      otherParticipant.userId
    );
    if (!isConnected) {
      throw new Error("You can only message users you are connected with");
    }

    // Create message with optional media
    const message = await prisma.$transaction(async (tx) => {
      // Create the message
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId,
          content: input.content ?? null,
          media:
            input.mediaUrl && input.mediaType
              ? {
                  create: {
                    mediaType: input.mediaType,
                    url: input.mediaUrl,
                    key: input.mediaKey,
                    orderIndex: 0,
                  },
                }
              : undefined,
        },
        include: includeMessageWithSender,
      });

      // Update conversation's updatedAt
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    console.info(
      `[messaging] Message sent: ${JSON.stringify({
        conversationId,
        senderId,
        hasMedia: !!input.mediaUrl,
      })}`
    );

    return toMessage(message);
  }

  /**
   * Get total unread message count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    // Get all conversations the user is part of
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });

    if (participants.length === 0) {
      return 0;
    }

    // Count unread messages across all conversations
    let totalUnread = 0;
    for (const p of participants) {
      const lastReadAt = p.lastReadAt ?? new Date(0);
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: userId },
          createdAt: { gt: lastReadAt },
        },
      });
      totalUnread += unreadCount;
    }

    return totalUnread;
  }

  /**
   * Mark a conversation as read (updates lastReadAt)
   */
  static async markAsRead(
    conversationId: number,
    userId: number
  ): Promise<void> {
    const updated = await prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });

    if (updated.count === 0) {
      throw new Error("Conversation not found or you are not a participant");
    }

    console.info(
      `[messaging] Conversation marked as read: ${JSON.stringify({
        conversationId,
        userId,
      })}`
    );
  }

  /**
   * Get recent messages across all conversations (for header dropdown)
   */
  static async getRecentMessages(
    userId: number,
    limit: number = RECENT_MESSAGES_DEFAULT_LIMIT
  ): Promise<RecentMessageUI[]> {
    // Get user's conversation IDs
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    if (participants.length === 0) {
      return [];
    }

    const conversationIds = participants.map((p) => p.conversationId);

    // Get recent messages from other users
    const messages = await prisma.message.findMany({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: userId },
      },
      include: includeMessageWithSender,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return messages.map(toRecentMessage);
  }

  /**
   * Check if user is a participant of a conversation
   */
  static async isParticipant(
    conversationId: number,
    userId: number
  ): Promise<boolean> {
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId },
    });
    return !!participant;
  }

  /**
   * Get conversation by ID (for WebSocket events)
   */
  static async getConversation(conversationId: number): Promise<{
    id: number;
    participantIds: number[];
  } | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    if (!conversation) {
      return null;
    }

    return {
      id: conversation.id,
      participantIds: conversation.participants.map((p) => p.userId),
    };
  }
}
