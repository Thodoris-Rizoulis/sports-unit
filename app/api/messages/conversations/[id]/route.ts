/**
 * /api/messages/conversations/[id]
 * Feature: 015-direct-messaging
 *
 * GET - Get conversation with messages
 * POST - Send a message to the conversation
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { MessagingService } from "@/services/messaging";
import { getConversationSchema, sendMessageSchema } from "@/types/messaging";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/messages/conversations/[id]
 *
 * Get a conversation with its messages.
 * Supports cursor-based pagination for messages.
 *
 * Query Parameters:
 * - limit: number (optional, default 20, max 100)
 * - cursor: number (optional, message ID for pagination)
 *
 * Response: { messages: MessageUI[], otherUser: UserSummary, nextCursor: number | null, hasMore: boolean }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const conversationId = parseInt(id);

    if (isNaN(conversationId)) {
      return createErrorResponse("Invalid conversation ID", 400);
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const parseResult = getConversationSchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    });

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parseResult.error.issues
      );
    }

    const userId = requireSessionUserId(session);
    const result = await MessagingService.getMessages(
      conversationId,
      userId,
      parseResult.data
    );

    return createSuccessResponse(result);
  } catch (error) {
    console.error("Error fetching conversation messages:", error);

    // Handle not a participant error
    if (error instanceof Error && error.message.includes("not a participant")) {
      return createErrorResponse(error.message, 403);
    }

    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}

/**
 * POST /api/messages/conversations/[id]
 *
 * Send a message to a conversation.
 * Either text content or media is required.
 *
 * Request Body:
 * - content: string (optional, max 500 chars)
 * - mediaUrl: string (optional, URL of uploaded media)
 * - mediaKey: string (optional, storage key of media)
 * - mediaType: "image" | "video" (required if mediaUrl is provided)
 *
 * Response: MessageUI
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const conversationId = parseInt(id);

    if (isNaN(conversationId)) {
      return createErrorResponse("Invalid conversation ID", 400);
    }

    const body = await request.json();

    // Parse and validate request body
    const parseResult = sendMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid request body",
        400,
        parseResult.error.issues
      );
    }

    const userId = requireSessionUserId(session);
    const message = await MessagingService.sendMessage(
      conversationId,
      userId,
      parseResult.data
    );

    return createSuccessResponse(message, 201);
  } catch (error) {
    console.error("Error sending message:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("not a participant")) {
        return createErrorResponse(error.message, 403);
      }
      if (error.message.includes("only message users you are connected with")) {
        return createErrorResponse(error.message, 403);
      }
    }

    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
