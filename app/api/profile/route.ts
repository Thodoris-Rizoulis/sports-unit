import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { UserService } from "@/services/profile";
import prisma from "@/lib/prisma";
import { profilePartialUpdateSchema } from "@/types/profile";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    // Fetch the full user profile (includes publicUuid and username for URL generation)
    const profile = await UserService.getUserProfileByUserId(userId);

    if (!profile) {
      return createErrorResponse("Profile not found", 404);
    }

    return createSuccessResponse(profile);
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return createErrorResponse("Failed to fetch profile", 500);
  }
}

// PUT /api/profile - Update profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);
    const body = await request.json();
    const validatedData = profilePartialUpdateSchema.parse(body);

    // Check if profile exists
    const existingProfile = await UserService.getUserAttributes(userId);
    if (!existingProfile) {
      return createErrorResponse("Profile not found", 404);
    }

    // If the client requested a username change, attempt to update it first so
    // the canonical profile we return includes the new username.
    const canonicalBefore = await UserService.getUserProfileByUserId(userId);

    if (
      validatedData.username &&
      validatedData.username !== canonicalBefore?.username
    ) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { username: validatedData.username },
        });
      } catch (e: any) {
        if (e?.code === "P2002") {
          return createErrorResponse("Username already taken", 409);
        }
        console.error("Failed to update username:", e);
        return createErrorResponse("Failed to update username", 500);
      }
    }

    const updates = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      bio: validatedData.bio,
      location: validatedData.location,
      dateOfBirth: validatedData.dateOfBirth?.toISOString(),
      height: validatedData.height,
      profilePictureUrl: validatedData.profileImageUrl,
      coverPictureUrl: validatedData.coverImageUrl,
      sportId: validatedData.sportId,
      positionIds: validatedData.positionIds,
      teamId: validatedData.teamId,
      openToOpportunities: validatedData.openToOpportunities,
      strongFoot: validatedData.strongFoot,
    };

    const result = await UserService.updateUserAttributes(userId, updates);

    // Fetch canonical profile (includes username and publicUuid) to return to client
    try {
      const profile = await UserService.getUserProfileByUserId(userId);
      if (profile) {
        return createSuccessResponse(profile);
      }
    } catch (e) {
      console.error("Failed to fetch canonical profile after update:", e);
    }

    // Fallback: return the DB row if canonical profile couldn't be composed
    return createSuccessResponse(result);
  } catch (error) {
    console.error("Profile update failed:", error);

    if (error instanceof z.ZodError) {
      return createErrorResponse("Invalid data", 400, error.issues);
    }

    return createErrorResponse("Failed to update profile", 500);
  }
}
