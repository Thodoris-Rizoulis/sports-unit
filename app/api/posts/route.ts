import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { PostService } from "@/services/posts";
import { createPostInputSchema } from "@/types/posts";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Get query params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get feed
    const posts = await PostService.getFeed(parseInt(session.user.id), {
      limit,
      offset,
    });

    return createSuccessResponse({ posts });
  } catch (error) {
    console.error("Get posts error:", error);
    return createErrorResponse("Failed to get posts", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Parse and validate input
    const body = await request.json();
    const input = createPostInputSchema.parse(body);

    // Create post
    const result = await PostService.createPost(
      parseInt(session.user.id),
      input
    );

    return createSuccessResponse(result, 201);
  } catch (error) {
    console.error("Create post error:", error);
    return createErrorResponse("Failed to create post", 500);
  }
}
