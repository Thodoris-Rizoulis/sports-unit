import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { query, getUserAttributes } from "@/lib/db";
import { onboardingSchema, profileUpdateSchema } from "@/types/validation";
import { authOptions } from "@/lib/auth"; // Assuming auth options are exported

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const profile = await getUserAttributes(userId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// POST /api/profile - Create profile (onboarding)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const validatedData = onboardingSchema.parse(body);

    // Check if profile already exists
    const existingProfile = await getUserAttributes(userId);
    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists" },
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
    console.error("Profile creation failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Check if profile exists
    const existingProfile = await getUserAttributes(userId);
    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (validatedData.basicProfile?.firstName !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(validatedData.basicProfile.firstName);
    }
    if (validatedData.basicProfile?.lastName !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(validatedData.basicProfile.lastName);
    }
    if (validatedData.basicProfile?.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(validatedData.basicProfile.bio);
    }
    if (validatedData.basicProfile?.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(validatedData.basicProfile.location);
    }
    if (validatedData.basicProfile?.dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramIndex++}`);
      values.push(validatedData.basicProfile.dateOfBirth);
    }
    if (validatedData.basicProfile?.height !== undefined) {
      updates.push(`height = $${paramIndex++}`);
      values.push(validatedData.basicProfile.height);
    }
    if (validatedData.profilePictureUrl !== undefined) {
      updates.push(`profile_picture_url = $${paramIndex++}`);
      values.push(validatedData.profilePictureUrl);
    }
    if (validatedData.coverPictureUrl !== undefined) {
      updates.push(`cover_picture_url = $${paramIndex++}`);
      values.push(validatedData.coverPictureUrl);
    }
    if (validatedData.sportsDetails?.sportId !== undefined) {
      updates.push(`sport_id = $${paramIndex++}`);
      values.push(validatedData.sportsDetails.sportId);
    }
    if (validatedData.sportsDetails?.positionIds !== undefined) {
      updates.push(`positions = $${paramIndex++}`);
      values.push(JSON.stringify(validatedData.sportsDetails.positionIds));
    }
    if (validatedData.sportsDetails?.teamId !== undefined) {
      updates.push(`team_id = $${paramIndex++}`);
      values.push(validatedData.sportsDetails.teamId);
    }
    if (validatedData.sportsDetails?.openToOpportunities !== undefined) {
      updates.push(`open_to_opportunities = $${paramIndex++}`);
      values.push(validatedData.sportsDetails.openToOpportunities);
    }
    if (validatedData.sportsDetails?.strongFoot !== undefined) {
      updates.push(`strong_foot = $${paramIndex++}`);
      values.push(validatedData.sportsDetails.strongFoot);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const updateQuery = `
      UPDATE user_attributes
      SET ${updates.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;
    values.push(userId);

    const result = await query(updateQuery, values);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Profile update failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
