import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { AwardService } from "@/services/awards";
import { awardSchema } from "@/types/enhanced-profile";

/**
 * PUT /api/profile/[uuid]/awards/[id]
 * Update an award entry (owner only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { uuid, id } = await params;
    const awardId = parseInt(id);
    if (isNaN(awardId)) {
      return createErrorResponse("Invalid award ID", 400);
    }

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    const sessionUserId = requireSessionUserId(session);
    if (userId !== sessionUserId) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input (partial update)
    const body = await request.json();
    const validationResult = awardSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const award = await AwardService.update(
      awardId,
      userId,
      validationResult.data
    );

    if (!award) {
      return createErrorResponse("Award not found", 404);
    }

    return createSuccessResponse({ award });
  } catch (error) {
    console.error("Update award error:", error);
    return createErrorResponse("Failed to update award", 500);
  }
}

/**
 * DELETE /api/profile/[uuid]/awards/[id]
 * Delete an award entry (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string; id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { uuid, id } = await params;
    const awardId = parseInt(id);
    if (isNaN(awardId)) {
      return createErrorResponse("Invalid award ID", 400);
    }

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    const sessionUserId = requireSessionUserId(session);
    if (userId !== sessionUserId) {
      return createErrorResponse("Forbidden", 403);
    }

    const deleted = await AwardService.delete(awardId, userId);

    if (!deleted) {
      return createErrorResponse("Award not found", 404);
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Delete award error:", error);
    return createErrorResponse("Failed to delete award", 500);
  }
}
