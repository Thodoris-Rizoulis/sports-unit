import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { PostService } from "@/services/posts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { commentId } = await params;
    const commentIdNum = parseInt(commentId);
    if (isNaN(commentIdNum)) {
      return createErrorResponse("Invalid comment ID", 400);
    }

    // Toggle comment like
    const result = await PostService.toggleCommentLike(
      commentIdNum,
      parseInt(session.user.id)
    );

    return createSuccessResponse(result);
  } catch (error) {
    console.error("Toggle comment like error:", error);
    return createErrorResponse("Failed to toggle comment like", 500);
  }
}
