import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { PostService } from "@/services/posts";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    await PostService.sharePost(postId, userId);

    return createSuccessResponse({ message: "Post shared successfully" });
  } catch (error) {
    console.error("Share post error:", error);
    return createErrorResponse("Failed to share post", 500);
  }
}
