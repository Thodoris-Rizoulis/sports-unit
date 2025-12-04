import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { LanguageService } from "@/services/languages";
import { languageSchema } from "@/types/enhanced-profile";

/**
 * PUT /api/profile/[uuid]/languages/[id]
 * Update a language entry (owner only)
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
    const languageId = parseInt(id);
    if (isNaN(languageId)) {
      return createErrorResponse("Invalid language ID", 400);
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
    const validationResult = languageSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const language = await LanguageService.update(
      languageId,
      userId,
      validationResult.data
    );

    if (!language) {
      return createErrorResponse("Language not found", 404);
    }

    return createSuccessResponse({ language });
  } catch (error) {
    // Handle duplicate language error
    if (error instanceof Error && error.message.includes("already exists")) {
      return createErrorResponse(error.message, 409);
    }
    console.error("Update language error:", error);
    return createErrorResponse("Failed to update language", 500);
  }
}

/**
 * DELETE /api/profile/[uuid]/languages/[id]
 * Delete a language entry (owner only)
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
    const languageId = parseInt(id);
    if (isNaN(languageId)) {
      return createErrorResponse("Invalid language ID", 400);
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

    const deleted = await LanguageService.delete(languageId, userId);

    if (!deleted) {
      return createErrorResponse("Language not found", 404);
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error("Delete language error:", error);
    return createErrorResponse("Failed to delete language", 500);
  }
}
