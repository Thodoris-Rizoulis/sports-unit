import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getSessionUserId, requireSessionUserId } from "@/lib/auth-utils";
import { PostService } from "@/services/posts";
import { createPostInputSchema } from "@/types/posts";

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

    // Get current user for liked/saved status
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session) ?? undefined;

    const post = await PostService.getPostById(postId, userId);
    if (!post) {
      return createErrorResponse("Post not found", 404);
    }

    return createSuccessResponse({ post });
  } catch (error) {
    console.error("Get post error:", error);
    return createErrorResponse("Failed to get post", 500);
  }
}

export async function PUT(
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
    const input = createPostInputSchema.parse(body);

    // Update post
    const post = await PostService.updatePost(postId, userId, input);

    if (!post) {
      return createErrorResponse("Post not found or not authorized", 404);
    }

    return createSuccessResponse({ post });
  } catch (error) {
    console.error("Update post error:", error);
    return createErrorResponse("Failed to update post", 500);
  }
}

export async function DELETE(
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

    // Delete post
    const deleted = await PostService.deletePost(postId, userId);

    if (!deleted) {
      return createErrorResponse("Post not found or not authorized", 404);
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return createErrorResponse("Failed to delete post", 500);
  }
}
