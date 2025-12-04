/**
 * /api/messages/conversations/[id]/read
 * Feature: 015-direct-messaging
 *
 * POST - Mark a conversation as read
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { MessagingService } from "@/services/messaging";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/messages/conversations/[id]/read
 *
 * Mark a conversation as read.
 * Updates the lastReadAt timestamp for the user's participation.
 *
 * Response: { success: true }
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

    const userId = parseInt(session.user.id);
    await MessagingService.markAsRead(conversationId, userId);

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Error marking conversation as read:", error);

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
