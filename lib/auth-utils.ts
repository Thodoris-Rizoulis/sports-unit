import { Session } from "next-auth";

/**
 * Extract the user ID from a NextAuth session as a number.
 * Centralizes the parseInt logic to avoid duplication across the codebase.
 */
export function getSessionUserId(session: Session | null): number | null {
  if (!session?.user?.id) return null;
  return parseInt(session.user.id);
}

/**
 * Extract the user ID from a session, throwing if not authenticated.
 * Use this when you've already verified the session exists.
 */
export function requireSessionUserId(session: Session | null): number {
  const userId = getSessionUserId(session);
  if (userId === null) {
    throw new Error("Unauthorized: No valid session");
  }
  return userId;
}
