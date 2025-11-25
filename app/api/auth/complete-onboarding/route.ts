import { getServerSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import { query } from "@/lib/db";
import { NextResponse } from "next/server";

// Reuse the auth config
const authOptions: NextAuthOptions = {
  // ... same as in [...nextauth]/route.ts
  providers: [], // Not needed here
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      // Add roleId and onboardingComplete
      const users = await query(
        "SELECT role_id, is_onboarding_complete FROM users WHERE id = $1",
        [token.sub]
      );
      if (users.rows.length > 0) {
        token.roleId = users.rows[0].role_id;
        token.onboardingComplete = users.rows[0].is_onboarding_complete;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.roleId = token.roleId as number;
        session.user.onboardingComplete = token.onboardingComplete as boolean;
      }
      return session;
    },
  },
};

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await query(
      "UPDATE users SET is_onboarding_complete = true WHERE id = $1",
      [parseInt(session.user.id)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
