import { NextRequest, NextResponse } from "next/server";
import { PostService } from "@/services/posts";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    const post = await PostService.getPostByUuid(uuid);
    if (!post) {
      return createErrorResponse("Post not found", 404);
    }

    return createSuccessResponse({ post });
  } catch (error) {
    console.error("Get post by UUID error:", error);
    return createErrorResponse("Failed to get post", 500);
  }
}
