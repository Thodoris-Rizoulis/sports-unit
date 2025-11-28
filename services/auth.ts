import pool from "@/lib/db-connection";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "@/types/auth";

// AuthService class
export class AuthService {
  static async getUserByEmail(email: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (res.rows.length === 0) return null;
      const user = res.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.username,
        roleId: user.role_id,
        onboardingComplete: user.is_onboarding_complete,
        password: user.password,
      };
    } finally {
      client.release();
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM users WHERE id = $1", [
        parseInt(id),
      ]);
      if (res.rows.length === 0) return null;
      const user = res.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.username,
        roleId: user.role_id,
        onboardingComplete: user.is_onboarding_complete,
        password: user.password,
      };
    } finally {
      client.release();
    }
  }

  static async updateOnboardingComplete(id: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        "UPDATE users SET is_onboarding_complete = true WHERE id = $1",
        [parseInt(id)]
      );
    } finally {
      client.release();
    }
  }

  static async checkUsernameExists(username: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );
      return res.rows.length > 0;
    } finally {
      client.release();
    }
  }

  static async checkRoleExists(roleId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT id FROM profile_roles WHERE id = $1",
        [roleId]
      );
      return res.rows.length > 0;
    } finally {
      client.release();
    }
  }

  static async registerUser(
    email: string,
    hashedPassword: string,
    username: string,
    roleId: number
  ): Promise<User> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO users (email, password, username, role_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [email, hashedPassword, username, roleId]
      );
      const user = res.rows[0];
      return {
        id: user.id,
        email: user.email,
        name: user.username,
        roleId: user.role_id,
        onboardingComplete: user.is_onboarding_complete,
        password: user.password,
      };
    } finally {
      client.release();
    }
  }
}

// NextAuth configuration
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
          const user = await AuthService.getUserByEmail(credentials.email);

          if (!user) {
            return null;
          }

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
            name: user.name,
            roleId: user.roleId,
            onboardingComplete: user.onboardingComplete,
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
        const user = await AuthService.getUserById(token.sub);
        if (user) {
          token.roleId = user.roleId;
          token.onboardingComplete = user.onboardingComplete;
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
