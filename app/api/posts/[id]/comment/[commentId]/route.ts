import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { PostService } from "@/services/posts";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    const { commentId } = await params;
    const commentIdNum = parseInt(commentId);

    if (isNaN(commentIdNum)) {
      return createErrorResponse("Invalid comment ID", 400);
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return createErrorResponse("Content is required", 400);
    }

    // Update comment
    const comment = await PostService.updateComment(
      commentIdNum,
      userId,
      content.trim()
    );

    if (!comment) {
      return createErrorResponse("Comment not found or not authorized", 404);
    }

    return createSuccessResponse({ comment });
  } catch (error) {
    console.error("Update comment error:", error);
    return createErrorResponse("Failed to update comment", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    const { id, commentId } = await params;
    const postId = parseInt(id);
    const commentIdNum = parseInt(commentId);

    if (isNaN(postId) || isNaN(commentIdNum)) {
      return createErrorResponse("Invalid post or comment ID", 400);
    }

    // Delete comment
    const deleted = await PostService.deleteComment(commentIdNum, userId);

    if (!deleted) {
      return createErrorResponse("Comment not found or not authorized", 404);
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return createErrorResponse("Failed to delete comment", 500);
  }
}
