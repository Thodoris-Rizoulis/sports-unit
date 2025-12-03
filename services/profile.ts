import prisma from "@/lib/prisma";
import {
  includeUserProfile,
  toUserProfile,
  UserProfile,
  SearchUserResult,
  ExtendedUserProfile,
} from "@/types/prisma";
import type { UserAttribute } from "@prisma/client";
import type { KeyInfoInput } from "@/types/enhanced-profile";

// UserService class - Prisma implementation
export class UserService {
  static async getUserAttributes(
    userId: number
  ): Promise<(UserAttribute & { teamName?: string; roleId?: number }) | null> {
    const attr = await prisma.userAttribute.findUnique({
      where: { userId },
      include: {
        team: { select: { name: true } },
        user: { select: { roleId: true } },
      },
    });

    if (!attr) return null;

    return {
      ...attr,
      teamName: attr.team?.name,
      roleId: attr.user?.roleId ?? undefined,
    };
  }

  static async getUserProfile(username: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { username },
      include: includeUserProfile,
    });

    if (!user) return null;
    return toUserProfile(user);
  }

  static async getUserIdByUsername(username: string): Promise<number | null> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  static async getUserProfileByUuid(uuid: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { publicUuid: uuid },
      include: includeUserProfile,
    });

    if (!user) return null;
    return toUserProfile(user);
  }

  static async getUserProfileByUserId(
    userId: number
  ): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: includeUserProfile,
    });

    if (!user) return null;
    return toUserProfile(user);
  }

  static async updateUsername(
    userId: number,
    username: string
  ): Promise<{ username: string; publicUuid: string } | null> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: { username: true, publicUuid: true },
    });
    return user;
  }

  static async createUserProfile(
    userId: number,
    profileData: {
      firstName: string;
      lastName: string;
      bio?: string;
      location?: string;
      dateOfBirth?: string;
      height?: number;
      profilePictureUrl?: string;
      coverPictureUrl?: string;
      sportId: number;
      positionIds: number[];
      teamId?: number;
      openToOpportunities: boolean;
      strongFoot?: string;
      roleId: number;
      username?: string;
    }
  ): Promise<UserAttribute> {
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create user attributes
      const attr = await tx.userAttribute.create({
        data: {
          userId,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          bio: profileData.bio,
          location: profileData.location,
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth)
            : null,
          height: profileData.height,
          profilePictureUrl: profileData.profilePictureUrl,
          coverPictureUrl: profileData.coverPictureUrl,
          sportId: profileData.sportId,
          positions: profileData.positionIds,
          teamId: profileData.teamId,
          openToOpportunities: profileData.openToOpportunities,
          strongFoot: profileData.strongFoot,
        },
      });

      // Update user role and onboarding status
      await tx.user.update({
        where: { id: userId },
        data: {
          roleId: profileData.roleId,
          isOnboardingComplete: true,
          ...(profileData.username && { username: profileData.username }),
        },
      });

      return attr;
    });

    return result;
  }

  static async updateUserAttributes(
    userId: number,
    updates: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      location?: string;
      dateOfBirth?: string;
      height?: number;
      profilePictureUrl?: string;
      coverPictureUrl?: string;
      sportId?: number;
      positionIds?: number[];
      teamId?: number;
      openToOpportunities?: boolean;
      strongFoot?: string;
    }
  ): Promise<UserAttribute> {
    // Build update data object
    const data: Parameters<typeof prisma.userAttribute.update>[0]["data"] = {};

    if (updates.firstName !== undefined) data.firstName = updates.firstName;
    if (updates.lastName !== undefined) data.lastName = updates.lastName;
    if (updates.bio !== undefined) data.bio = updates.bio;
    if (updates.location !== undefined) data.location = updates.location;
    if (updates.dateOfBirth !== undefined) {
      data.dateOfBirth = new Date(updates.dateOfBirth);
    }
    if (updates.height !== undefined) data.height = updates.height;
    if (updates.profilePictureUrl !== undefined) {
      data.profilePictureUrl = updates.profilePictureUrl;
    }
    if (updates.coverPictureUrl !== undefined) {
      data.coverPictureUrl = updates.coverPictureUrl;
    }
    if (updates.sportId !== undefined) data.sportId = updates.sportId;
    if (updates.positionIds !== undefined) data.positions = updates.positionIds;
    if (updates.teamId !== undefined) data.teamId = updates.teamId;
    if (updates.openToOpportunities !== undefined) {
      data.openToOpportunities = updates.openToOpportunities;
    }
    if (updates.strongFoot !== undefined) data.strongFoot = updates.strongFoot;

    if (Object.keys(data).length === 0) {
      throw new Error("No fields to update");
    }

    return prisma.userAttribute.update({
      where: { userId },
      data,
    });
  }

  static async searchUsers(
    query: string,
    limit: number = 10
  ): Promise<SearchUserResult[]> {
    // Use raw query for full-text search (Prisma doesn't support tsvector natively)
    const results = await prisma.$queryRaw<
      Array<{
        id: number;
        public_uuid: string;
        username: string;
        first_name: string | null;
        last_name: string | null;
        profile_picture_url: string | null;
      }>
    >`
      SELECT
        u.id,
        u.public_uuid,
        u.username,
        ua.first_name,
        ua.last_name,
        ua.profile_picture_url
      FROM users u
      LEFT JOIN user_attributes ua ON u.id = ua.user_id
      WHERE u.search_text IS NOT NULL 
        AND to_tsvector('english', u.search_text) @@ to_tsquery('english', ${query} || ':*')
      ORDER BY ts_rank(to_tsvector('english', u.search_text), to_tsquery('english', ${query} || ':*')) DESC
      LIMIT ${limit}
    `;

    return results.map((row) => ({
      id: row.id,
      publicUuid: row.public_uuid,
      firstName: row.first_name || "",
      lastName: row.last_name || "",
      username: row.username,
      profileImageUrl: row.profile_picture_url || null,
    }));
  }
}

// Export searchUsers function for API use
export async function searchUsers(
  query: string,
  limit: number = 10
): Promise<SearchUserResult[]> {
  return UserService.searchUsers(query, limit);
}

// Extended include pattern for full profile with role name
const includeExtendedUserProfile = {
  ...includeUserProfile,
  role: true,
} satisfies Parameters<typeof prisma.user.findUnique>[0]["include"];

/**
 * Get extended user profile with role information for role-based section visibility
 */
export async function getExtendedUserProfile(
  uuid: string
): Promise<ExtendedUserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { publicUuid: uuid },
    include: includeExtendedUserProfile,
  });

  if (!user) return null;

  const baseProfile = toUserProfile(user);

  return {
    ...baseProfile,
    roleId: user.roleId,
    roleName: user.role?.roleName ?? null,
    dateOfBirth: user.attributes?.dateOfBirth ?? null,
    height: user.attributes?.height ?? null,
    positions: (user.attributes?.positions as number[] | null) ?? null,
    strongFoot: user.attributes?.strongFoot ?? null,
  };
}

/**
 * Get extended user profile by user ID for owner operations
 */
export async function getExtendedUserProfileById(
  userId: number
): Promise<ExtendedUserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: includeExtendedUserProfile,
  });

  if (!user) return null;

  const baseProfile = toUserProfile(user);

  return {
    ...baseProfile,
    roleId: user.roleId,
    roleName: user.role?.roleName ?? null,
    dateOfBirth: user.attributes?.dateOfBirth ?? null,
    height: user.attributes?.height ?? null,
    positions: (user.attributes?.positions as number[] | null) ?? null,
    strongFoot: user.attributes?.strongFoot ?? null,
  };
}

/**
 * Update key information fields (DOB, height, positions, strongFoot) for athletes
 */
export async function updateKeyInfo(
  userId: number,
  data: KeyInfoInput
): Promise<void> {
  const updateData: Parameters<typeof prisma.userAttribute.update>[0]["data"] =
    {};

  if (data.dateOfBirth !== undefined) {
    updateData.dateOfBirth = data.dateOfBirth;
  }
  if (data.height !== undefined) {
    updateData.height = data.height;
  }
  if (data.positionIds !== undefined) {
    updateData.positions = data.positionIds;
  }
  if (data.strongFoot !== undefined) {
    updateData.strongFoot = data.strongFoot;
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  await prisma.userAttribute.update({
    where: { userId },
    data: updateData,
  });
}

/**
 * Get user ID from public UUID
 */
export async function getUserIdFromUuid(uuid: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { publicUuid: uuid },
    select: { id: true },
  });
  return user?.id ?? null;
}
