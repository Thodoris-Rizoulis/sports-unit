import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { PostService } from "@/services/posts";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const postId = parseInt(id);
    if (isNaN(postId)) {
      return createErrorResponse("Invalid post ID", 400);
    }

    const result = await PostService.toggleSave(
      postId,
      parseInt(session.user.id)
    );

    return createSuccessResponse({
      saved: result.saved,
      message: result.saved ? "Post saved" : "Post unsaved",
    });
  } catch (error) {
    console.error("Toggle save error:", error);
    return createErrorResponse("Failed to toggle save", 500);
  }
}
