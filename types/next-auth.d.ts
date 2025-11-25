import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roleId: number;
      onboardingComplete: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    roleId: number;
    onboardingComplete: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleId: number;
    onboardingComplete: boolean;
  }
}
