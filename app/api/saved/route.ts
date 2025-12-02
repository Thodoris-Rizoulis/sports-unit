import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { PostService } from "@/services/posts";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const posts = await PostService.getSavedPosts(parseInt(session.user.id), {
      limit,
      offset,
    });

    return createSuccessResponse({ posts });
  } catch (error) {
    console.error("Get saved posts error:", error);
    return createErrorResponse("Failed to get saved posts", 500);
  }
}
