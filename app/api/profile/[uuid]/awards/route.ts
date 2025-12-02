import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { AwardService } from "@/services/awards";
import { awardSchema } from "@/types/enhanced-profile";

/**
 * GET /api/profile/[uuid]/awards
 * Get all award entries for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    const awards = await AwardService.getAll(userId);

    return createSuccessResponse({ awards });
  } catch (error) {
    console.error("Get awards error:", error);
    return createErrorResponse("Failed to get awards", 500);
  }
}

/**
 * POST /api/profile/[uuid]/awards
 * Create a new award entry (owner only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { uuid } = await params;

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    if (userId !== parseInt(session.user.id)) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = awardSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const award = await AwardService.create(userId, validationResult.data);

    return createSuccessResponse({ award }, 201);
  } catch (error) {
    console.error("Create award error:", error);
    return createErrorResponse("Failed to create award", 500);
  }
}
