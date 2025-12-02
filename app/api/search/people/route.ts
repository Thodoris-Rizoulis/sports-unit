import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { searchUsers } from "@/services/profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";

// Validation schema for search query
const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val) return 10;
      const num = parseInt(val, 10);
      return isNaN(num) ? 10 : Math.min(Math.max(num, 1), 50);
    }),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse("Authentication required", 401);
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const qParam = searchParams.get("q");
    const limitParam = searchParams.get("limit");

    const validationResult = searchQuerySchema.safeParse({
      q: qParam,
      limit: limitParam,
    });

    if (!validationResult.success) {
      return createErrorResponse("Invalid query parameters", 400);
    }

    const { q, limit } = validationResult.data;

    // Perform search
    const users = await searchUsers(q, limit);

    return createSuccessResponse({ users });
  } catch (error) {
    console.error("Search API error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
