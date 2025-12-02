// ========================================
// Prisma Include Patterns & Mapped Types
// Single source of truth for all output types
// ========================================

import { Prisma } from "@prisma/client";
import type {
  Sport as PrismaSport,
  Position as PrismaPosition,
  Team as PrismaTeam,
  ProfileRole as PrismaProfileRole,
} from "@prisma/client";

// ========================================
// Re-export Prisma Base Models
// ========================================

export type Sport = PrismaSport;
export type Position = PrismaPosition;
export type Team = PrismaTeam;
export type Role = PrismaProfileRole;

// ========================================
// Include Patterns (reusable query shapes)
// ========================================

// User with full profile data
export const includeUserProfile = {
  role: true,
  attributes: {
    include: {
      sport: true,
      team: true,
    },
  },
} satisfies Prisma.UserInclude;

// Post with user info, media, and counts
export const includePostFeed = {
  user: {
    include: {
      attributes: true,
    },
  },
  media: {
    orderBy: { orderIndex: "asc" as const },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
} satisfies Prisma.PostInclude;

// Comment with user info and like count
export const includePostComment = {
  user: {
    include: {
      attributes: true,
    },
  },
  _count: {
    select: {
      likes: true,
    },
  },
} satisfies Prisma.PostCommentInclude;

// Connection with both users
export const includeConnectionWithUsers = {
  requester: true,
  recipient: true,
} satisfies Prisma.ConnectionInclude;

// ========================================
// Inferred Types from Includes
// ========================================

export type UserWithProfile = Prisma.UserGetPayload<{
  include: typeof includeUserProfile;
}>;

export type PostWithFeed = Prisma.PostGetPayload<{
  include: typeof includePostFeed;
}>;

export type CommentWithUser = Prisma.PostCommentGetPayload<{
  include: typeof includePostComment;
}>;

export type ConnectionWithUsers = Prisma.ConnectionGetPayload<{
  include: typeof includeConnectionWithUsers;
}>;

// ========================================
// Shared Nested Types (DRY)
// ========================================

/**
 * User summary for embedding in posts, comments, etc.
 * Single definition used across all entities.
 */
export type UserSummary = {
  id: number;
  publicUuid: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
};

/**
 * Media item for posts
 */
export type PostMediaItem = {
  id: number;
  postId: number;
  mediaType: string;
  url: string | null;
  key: string | null;
  orderIndex: number | null;
};

// ========================================
// UI Output Types
// Clean shapes for components - nested user pattern
// ========================================

/**
 * User profile for profile pages and cards
 */
export type UserProfile = {
  userId: number;
  publicUuid: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  location: string | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  openToOpportunities: boolean;
  sportId: number | null;
  sportName: string | null;
  teamId: number | null;
  teamName: string | null;
};

/**
 * Post for feed display
 * Uses nested user object for consistency and type safety
 */
export type Post = {
  id: number;
  publicUuid: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  media: PostMediaItem[];
  user: UserSummary;
};

/**
 * Comment for display
 * Uses nested user object for consistency
 */
export type PostComment = {
  id: number;
  postId: number;
  content: string;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean;
  parentCommentId: number | null;
  user: UserSummary;
};

/**
 * Search result user
 */
export type SearchUserResult = {
  id: number;
  publicUuid: string;
  firstName: string;
  lastName: string;
  username: string;
  profileImageUrl: string | null;
};

/**
 * Connection status for UI
 */
export type ConnectionStatusUI =
  | "none"
  | "pending_sent"
  | "pending_received"
  | "connected";

/**
 * Connection list item
 */
export type ConnectionListItem = {
  id: number;
  user: UserSummary;
  status: "pending_sent" | "pending_received" | "accepted" | "declined";
  createdAt: Date;
};

/**
 * Connection status response (for API)
 */
export type ConnectionStatusResponse = {
  status: ConnectionStatusUI;
  connectionId?: number;
  requester?: {
    id: number;
    username: string;
    publicUuid: string;
  };
};

// ========================================
// Mappers - Transform Prisma results to UI types
// ========================================

/**
 * Map Prisma UserWithProfile to UserProfile
 */
export function toUserProfile(user: UserWithProfile): UserProfile {
  return {
    userId: user.id,
    publicUuid: user.publicUuid,
    username: user.username,
    firstName: user.attributes?.firstName ?? "",
    lastName: user.attributes?.lastName ?? "",
    bio: user.attributes?.bio ?? null,
    location: user.attributes?.location ?? null,
    profileImageUrl: user.attributes?.profilePictureUrl ?? null,
    coverImageUrl: user.attributes?.coverPictureUrl ?? null,
    openToOpportunities: user.attributes?.openToOpportunities ?? false,
    sportId: user.attributes?.sportId ?? null,
    sportName: user.attributes?.sport?.name ?? null,
    teamId: user.attributes?.teamId ?? null,
    teamName: user.attributes?.team?.name ?? null,
  };
}

/**
 * Create UserSummary from Prisma user with attributes
 */
export function toUserSummary(user: {
  id: number;
  publicUuid: string;
  username: string;
  attributes?: {
    firstName: string | null;
    lastName: string | null;
    profilePictureUrl: string | null;
  } | null;
}): UserSummary {
  return {
    id: user.id,
    publicUuid: user.publicUuid,
    username: user.username,
    firstName: user.attributes?.firstName ?? "",
    lastName: user.attributes?.lastName ?? "",
    profileImageUrl: user.attributes?.profilePictureUrl ?? null,
  };
}

/**
 * Map Prisma post to Post for UI
 */
export function toPost(
  post: PostWithFeed & { likes?: { id: number }[]; saves?: { id: number }[] }
): Post {
  return {
    id: post.id,
    publicUuid: post.publicUuid,
    content: post.content,
    createdAt: post.createdAt ?? new Date(),
    updatedAt: post.updatedAt ?? new Date(),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    isLiked: (post.likes?.length ?? 0) > 0,
    isSaved: (post.saves?.length ?? 0) > 0,
    media: post.media.map((m) => ({
      id: m.id,
      postId: m.postId,
      mediaType: m.mediaType,
      url: m.url,
      key: m.key,
      orderIndex: m.orderIndex,
    })),
    user: toUserSummary(post.user),
  };
}

/**
 * Map Prisma comment to PostComment for UI
 */
export function toPostComment(
  comment: CommentWithUser & { likes?: { id: number }[] }
): PostComment {
  return {
    id: comment.id,
    postId: comment.postId,
    content: comment.content,
    createdAt: comment.createdAt ?? new Date(),
    likeCount: comment._count.likes,
    isLiked: (comment.likes?.length ?? 0) > 0,
    parentCommentId: comment.parentCommentId,
    user: toUserSummary(comment.user),
  };
}
