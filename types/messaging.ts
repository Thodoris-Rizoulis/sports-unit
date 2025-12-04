/**
 * Messaging Types - Zod Schemas & Input Types
 * Feature: 015-direct-messaging
 *
 * Input validation schemas for messaging API endpoints.
 * Output types are defined in types/prisma.ts
 */

import { z } from "zod";
import { idField } from "./common";

// ========================================
// Constants
// ========================================

export const MESSAGE_MAX_LENGTH = 500;
export const CONVERSATIONS_DEFAULT_LIMIT = 20;
export const MESSAGES_DEFAULT_LIMIT = 20;
export const RECENT_MESSAGES_DEFAULT_LIMIT = 10;

// ========================================
// Reusable Field Schemas
// ========================================

export const messageContentField = z
  .string()
  .max(
    MESSAGE_MAX_LENGTH,
    `Message must be at most ${MESSAGE_MAX_LENGTH} characters`
  )
  .optional();

export const mediaTypeField = z.enum(["image", "video"]);

export const paginationLimitField = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : undefined))
  .pipe(z.number().int().positive().max(100).optional());

export const paginationCursorField = z
  .string()
  .optional()
  .transform((val) => (val ? parseInt(val, 10) : undefined))
  .pipe(z.number().int().positive().optional());

export const searchQueryField = z.string().max(100).optional();

// ========================================
// API Input Schemas
// ========================================

/**
 * Schema for creating/getting a conversation
 * POST /api/messages/conversations
 */
export const getOrCreateConversationSchema = z.object({
  userId: idField,
});

export type GetOrCreateConversationInput = z.infer<
  typeof getOrCreateConversationSchema
>;

/**
 * Schema for listing conversations
 * GET /api/messages/conversations
 */
export const listConversationsSchema = z.object({
  limit: paginationLimitField,
  cursor: paginationCursorField,
  search: searchQueryField,
});

export type ListConversationsInput = z.infer<typeof listConversationsSchema>;

/**
 * Schema for getting a conversation with messages
 * GET /api/messages/conversations/[id]
 */
export const getConversationSchema = z.object({
  limit: paginationLimitField,
  cursor: paginationCursorField,
});

export type GetConversationInput = z.infer<typeof getConversationSchema>;

/**
 * Schema for sending a message
 * POST /api/messages/conversations/[id]
 */
export const sendMessageSchema = z
  .object({
    content: messageContentField,
    mediaUrl: z.string().url().optional(),
    mediaKey: z.string().optional(),
    mediaType: mediaTypeField.optional(),
  })
  .refine((data) => data.content || data.mediaUrl, {
    message: "Either content or media is required",
  })
  .refine(
    (data) => {
      // If mediaUrl is provided, mediaType should also be provided
      if (data.mediaUrl && !data.mediaType) return false;
      return true;
    },
    { message: "Media type is required when media URL is provided" }
  );

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

/**
 * Schema for getting recent messages (dropdown)
 * GET /api/messages/recent
 */
export const getRecentMessagesSchema = z.object({
  limit: paginationLimitField,
});

export type GetRecentMessagesInput = z.infer<typeof getRecentMessagesSchema>;

// ========================================
// WebSocket Event Schemas
// ========================================

/**
 * Schema for join-conversation event
 */
export const joinConversationEventSchema = z.object({
  conversationId: idField,
});

export type JoinConversationEvent = z.infer<typeof joinConversationEventSchema>;

/**
 * Schema for leave-conversation event
 */
export const leaveConversationEventSchema = z.object({
  conversationId: idField,
});

export type LeaveConversationEvent = z.infer<
  typeof leaveConversationEventSchema
>;

/**
 * Schema for send-message WebSocket event
 * Alternative to REST API for sending messages
 */
export const sendMessageEventSchema = z
  .object({
    conversationId: idField,
    content: messageContentField,
    mediaUrl: z.string().url().optional(),
    mediaKey: z.string().optional(),
    mediaType: mediaTypeField.optional(),
  })
  .refine((data) => data.content || data.mediaUrl, {
    message: "Either content or media is required",
  });

export type SendMessageEvent = z.infer<typeof sendMessageEventSchema>;

// ========================================
// Service Layer Options Types
// ========================================

/**
 * Options for getConversations service method
 */
export type GetConversationsOptions = {
  limit?: number;
  cursor?: number;
  search?: string;
};

/**
 * Options for getMessages service method
 */
export type GetMessagesOptions = {
  limit?: number;
  cursor?: number;
};

/**
 * Input for sendMessage service method
 */
export type SendMessageServiceInput = {
  content?: string;
  mediaUrl?: string;
  mediaKey?: string;
  mediaType?: "image" | "video";
};
