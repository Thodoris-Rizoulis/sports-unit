import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { getUserIdFromUuid, updateKeyInfo } from "@/services/profile";
import { keyInfoSchema } from "@/types/enhanced-profile";

/**
 * PUT /api/profile/[uuid]/key-info
 * Update key information (owner only)
 * Fields: dateOfBirth, height, positionIds, strongFoot
 */
export async function PUT(
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
    const sessionUserId = requireSessionUserId(session);
    if (userId !== sessionUserId) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = keyInfoSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    await updateKeyInfo(userId, validationResult.data);

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Update key info error:", error);
    return createErrorResponse("Failed to update key information", 500);
  }
}
