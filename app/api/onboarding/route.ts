import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { query } from "@/lib/db";
import { onboardingSchema } from "@/types/validation";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const validatedData = onboardingSchema.parse(body);

    // Check if username is unique
    const existingUser = await query(
      "SELECT id FROM users WHERE username = $1 AND id != $2",
      [validatedData.username, userId]
    );
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Insert user attributes
    const insertQuery = `
      INSERT INTO user_attributes (
        user_id, first_name, last_name, bio, location, date_of_birth,
        height, profile_picture_url, cover_picture_url, sport_id,
        positions, team_id, open_to_opportunities, strong_foot
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      userId,
      validatedData.basicProfile.firstName,
      validatedData.basicProfile.lastName,
      validatedData.basicProfile.bio || null,
      validatedData.basicProfile.location || null,
      validatedData.basicProfile.dateOfBirth || null,
      validatedData.basicProfile.height || null,
      validatedData.profilePictureUrl || null,
      validatedData.coverPictureUrl || null,
      validatedData.sportsDetails.sportId,
      JSON.stringify(validatedData.sportsDetails.positionIds),
      validatedData.sportsDetails.teamId || null,
      validatedData.sportsDetails.openToOpportunities,
      validatedData.sportsDetails.strongFoot || null,
    ];

    const result = await query(insertQuery, values);

    // Update user role and onboarding status
    await query(
      "UPDATE users SET role_id = (SELECT id FROM profile_roles WHERE role_name = $1), is_onboarding_complete = true WHERE id = $2",
      [validatedData.role, userId]
    );

    // Update username if provided
    if (validatedData.username !== session.user.name) {
      await query("UPDATE users SET username = $1 WHERE id = $2", [
        validatedData.username,
        userId,
      ]);
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Onboarding submission failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
