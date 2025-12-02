import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { ExperienceService } from "@/services/experience";
import { experienceSchema } from "@/types/enhanced-profile";

/**
 * PUT /api/profile/[uuid]/experience/[id]
 * Update an experience entry (owner only)
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
    const experienceId = parseInt(id);
    if (isNaN(experienceId)) {
      return createErrorResponse("Invalid experience ID", 400);
    }

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    if (userId !== parseInt(session.user.id)) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input (partial update)
    const body = await request.json();
    const validationResult = experienceSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const experience = await ExperienceService.update(
      experienceId,
      userId,
      validationResult.data
    );

    if (!experience) {
      return createErrorResponse("Experience not found", 404);
    }

    return createSuccessResponse({ experience });
  } catch (error) {
    console.error("Update experience error:", error);
    return createErrorResponse("Failed to update experience", 500);
  }
}

/**
 * DELETE /api/profile/[uuid]/experience/[id]
 * Delete an experience entry (owner only)
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
    const experienceId = parseInt(id);
    if (isNaN(experienceId)) {
      return createErrorResponse("Invalid experience ID", 400);
    }

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    if (userId !== parseInt(session.user.id)) {
      return createErrorResponse("Forbidden", 403);
    }

    const deleted = await ExperienceService.delete(experienceId, userId);

    if (!deleted) {
      return createErrorResponse("Experience not found", 404);
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Delete experience error:", error);
    return createErrorResponse("Failed to delete experience", 500);
  }
}
