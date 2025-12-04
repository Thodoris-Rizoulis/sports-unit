import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { CertificationService } from "@/services/certifications";
import { certificationSchema } from "@/types/enhanced-profile";

/**
 * PUT /api/profile/[uuid]/certifications/[id]
 * Update a certification entry (owner only)
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
    const certificationId = parseInt(id);
    if (isNaN(certificationId)) {
      return createErrorResponse("Invalid certification ID", 400);
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
    const validationResult = certificationSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const certification = await CertificationService.update(
      certificationId,
      userId,
      validationResult.data
    );

    if (!certification) {
      return createErrorResponse("Certification not found", 404);
    }

    return createSuccessResponse({ certification });
  } catch (error) {
    console.error("Update certification error:", error);
    return createErrorResponse("Failed to update certification", 500);
  }
}

/**
 * DELETE /api/profile/[uuid]/certifications/[id]
 * Delete a certification entry (owner only)
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
    const certificationId = parseInt(id);
    if (isNaN(certificationId)) {
      return createErrorResponse("Invalid certification ID", 400);
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

    const deleted = await CertificationService.delete(certificationId, userId);

    if (!deleted) {
      return createErrorResponse("Certification not found", 404);
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Delete certification error:", error);
    return createErrorResponse("Failed to delete certification", 500);
  }
}
