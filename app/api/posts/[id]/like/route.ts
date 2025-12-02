import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { PostService } from "@/services/posts";

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

    const { id } = await params;
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return createErrorResponse("Invalid post ID", 400);
    }

    // Toggle like
    const result = await PostService.toggleLike(
      postId,
      parseInt(session.user.id)
    );

    return createSuccessResponse(result);
  } catch (error) {
    console.error("Toggle like error:", error);
    return createErrorResponse("Failed to toggle like", 500);
  }
}
