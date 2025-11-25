import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  roleId: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, roleId } = registerSchema.parse(body);

    // Check if email already exists
    const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Check if role exists
    const role = await query("SELECT id FROM profile_roles WHERE id = $1", [
      roleId,
    ]);
    if (role.rows.length === 0) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await query(
      "INSERT INTO users (email, password, username, role_id) VALUES ($1, $2, $3, $4) RETURNING id, email, username, role_id, is_onboarding_complete",
      [email, hashedPassword, username, roleId]
    );

    const user = result.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roleId: user.role_id,
        onboardingComplete: user.is_onboarding_complete,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
