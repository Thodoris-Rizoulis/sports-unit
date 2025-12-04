import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getSessionUserId, requireSessionUserId } from "@/lib/auth-utils";
import { PostService } from "@/services/posts";
import { createCommentInputSchema } from "@/types/posts";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return createErrorResponse("Invalid post ID", 400);
    }

    // Get current user for liked status
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session) ?? undefined;

    const comments = await PostService.getComments(postId, userId);
    return createSuccessResponse({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return createErrorResponse("Failed to get comments", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    const { id } = await params;
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return createErrorResponse("Invalid post ID", 400);
    }

    // Parse and validate input
    const body = await request.json();
    const input = createCommentInputSchema.parse(body);

    // Add comment
    const comment = await PostService.addComment(postId, userId, input);

    return createSuccessResponse({ comment }, 201);
  } catch (error) {
    console.error("Add comment error:", error);
    return createErrorResponse("Failed to add comment", 500);
  }
}
