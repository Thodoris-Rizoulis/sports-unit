import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roleId: number | null;
      onboardingComplete: boolean;
      publicUuid: string;
      username: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    roleId: number | null;
    onboardingComplete: boolean;
    publicUuid: string;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roleId: number | null;
    onboardingComplete: boolean;
    publicUuid: string;
    username: string;
  }
}
