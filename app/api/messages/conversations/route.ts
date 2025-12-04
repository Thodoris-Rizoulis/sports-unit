/**
 * /api/messages/conversations
 * Feature: 015-direct-messaging
 *
 * GET - List user's conversations with pagination and search
 * POST - Get or create a conversation with another user
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { MessagingService } from "@/services/messaging";
import {
  listConversationsSchema,
  getOrCreateConversationSchema,
} from "@/types/messaging";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

/**
 * GET /api/messages/conversations
 *
 * List all conversations for the authenticated user.
 * Supports cursor-based pagination and search by user name.
 *
 * Query Parameters:
 * - limit: number (optional, default 20, max 100)
 * - cursor: number (optional, conversation ID for pagination)
 * - search: string (optional, search by participant name)
 *
 * Response: { conversations: ConversationUI[], nextCursor: number | null, hasMore: boolean }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const parseResult = listConversationsSchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parseResult.error.issues
      );
    }

    const userId = requireSessionUserId(session);
    const result = await MessagingService.getConversations(
      userId,
      parseResult.data
    );

    return createSuccessResponse(result);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}

/**
 * POST /api/messages/conversations
 *
 * Get or create a conversation with another user.
 * If a conversation already exists between the two users, returns it.
 * Otherwise, creates a new conversation.
 *
 * Request Body:
 * - userId: number (the other user's ID)
 *
 * Response: { id: number, otherUser: UserSummary, isNew: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const body = await request.json();

    // Parse and validate request body
    const parseResult = getOrCreateConversationSchema.safeParse(body);

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid request body",
        400,
        parseResult.error.issues
      );
    }

    const currentUserId = requireSessionUserId(session);
    const { userId: otherUserId } = parseResult.data;

    // Prevent messaging yourself
    if (currentUserId === otherUserId) {
      return createErrorResponse(
        "Cannot create conversation with yourself",
        400
      );
    }

    const result = await MessagingService.getOrCreateConversation(
      currentUserId,
      otherUserId
    );

    // Return 201 if new conversation was created, 200 if existing
    return createSuccessResponse(result, result.isNew ? 201 : 200);
  } catch (error) {
    console.error("Error getting/creating conversation:", error);

    // Handle specific error for not connected users
    if (
      error instanceof Error &&
      error.message.includes("only message users you are connected with")
    ) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
