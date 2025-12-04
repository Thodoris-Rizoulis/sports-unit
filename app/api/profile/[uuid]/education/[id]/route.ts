import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { EducationService } from "@/services/education";
import { educationSchema } from "@/types/enhanced-profile";

/**
 * PUT /api/profile/[uuid]/education/[id]
 * Update an education entry (owner only)
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

    const sessionUserId = requireSessionUserId(session);

    const { uuid, id } = await params;
    const educationId = parseInt(id);
    if (isNaN(educationId)) {
      return createErrorResponse("Invalid education ID", 400);
    }

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    if (userId !== sessionUserId) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input (partial update)
    const body = await request.json();
    const validationResult = educationSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const entry = await EducationService.update(
      educationId,
      userId,
      validationResult.data
    );

    if (!entry) {
      return createErrorResponse("Education not found", 404);
    }

    return createSuccessResponse({ education: entry });
  } catch (error) {
    console.error("Update education error:", error);
    return createErrorResponse("Failed to update education", 500);
  }
}

/**
 * DELETE /api/profile/[uuid]/education/[id]
 * Delete an education entry (owner only)
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

    const sessionUserId = requireSessionUserId(session);

    const { uuid, id } = await params;
    const educationId = parseInt(id);
    if (isNaN(educationId)) {
      return createErrorResponse("Invalid education ID", 400);
    }

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    if (userId !== sessionUserId) {
      return createErrorResponse("Forbidden", 403);
    }

    const deleted = await EducationService.delete(educationId, userId);

    if (!deleted) {
      return createErrorResponse("Education not found", 404);
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Delete education error:", error);
    return createErrorResponse("Failed to delete education", 500);
  }
}
