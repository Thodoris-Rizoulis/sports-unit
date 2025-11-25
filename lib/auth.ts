import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const users = await query("SELECT * FROM users WHERE email = $1", [
            credentials.email,
          ]);

          if (users.rows.length === 0) {
            return null;
          }

          const user = users.rows[0];
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            roleId: user.role_id,
            onboardingComplete: user.is_onboarding_complete,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // During sign-in, use the user data
        token.roleId = user.roleId;
        token.onboardingComplete = user.onboardingComplete;
      } else if (token.sub) {
        // For session updates, query the database for fresh data
        const users = await query(
          "SELECT role_id, is_onboarding_complete FROM users WHERE id = $1",
          [token.sub]
        );
        if (users.rows.length > 0) {
          token.roleId = users.rows[0].role_id;
          token.onboardingComplete = users.rows[0].is_onboarding_complete;
        }
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
  pages: {
    // signIn: "/", // Use default signin page
  },
};
