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
  AthleteMetrics as PrismaAthleteMetrics,
  UserExperience as PrismaUserExperience,
  UserEducation as PrismaUserEducation,
  UserCertification as PrismaUserCertification,
  UserLanguage as PrismaUserLanguage,
  UserAward as PrismaUserAward,
  Message as PrismaMessage,
  MessageMedia as PrismaMessageMedia,
} from "@prisma/client";

// Re-export analytics types for convenience
export type { ProfileAnalyticsData, ProfileVisitResponse } from "./analytics";

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

// Notification with actor (for display)
export const includeNotificationWithActor = {
  actor: {
    select: {
      id: true,
      username: true,
      publicUuid: true,
      attributes: {
        select: {
          firstName: true,
          lastName: true,
          profilePictureUrl: true,
        },
      },
    },
  },
} satisfies Prisma.NotificationInclude;

// ========================================
// Messaging Include Patterns
// ========================================

// Conversation with participants and last message
export const includeConversationWithParticipants = {
  participants: {
    include: {
      user: {
        include: {
          attributes: {
            select: {
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
            },
          },
        },
      },
    },
  },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: {
      media: true,
    },
  },
} satisfies Prisma.ConversationInclude;

// Message with sender and media
export const includeMessageWithSender = {
  sender: {
    include: {
      attributes: {
        select: {
          firstName: true,
          lastName: true,
          profilePictureUrl: true,
        },
      },
    },
  },
  media: {
    orderBy: { orderIndex: "asc" as const },
  },
} satisfies Prisma.MessageInclude;

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

export type NotificationWithActor = Prisma.NotificationGetPayload<{
  include: typeof includeNotificationWithActor;
}>;

// Messaging inferred types
export type ConversationWithParticipants = Prisma.ConversationGetPayload<{
  include: typeof includeConversationWithParticipants;
}>;

export type MessageWithSender = Prisma.MessageGetPayload<{
  include: typeof includeMessageWithSender;
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
// Notification Output Types
// ========================================

/**
 * Notification types for type safety
 */
export type NotificationTypeEnum =
  | "CONNECTION_REQUEST"
  | "POST_LIKE"
  | "POST_COMMENT";

/**
 * Single notification for display
 */
export type NotificationUI = {
  id: number;
  type: NotificationTypeEnum;
  entityType: string;
  entityId: number;
  entityPublicUuid?: string;
  isRead: boolean;
  createdAt: Date;
  actor: UserSummary;
};

/**
 * Grouped notification for dropdown display
 * Multiple likes/comments on the same post are grouped together
 */
export type GroupedNotification = {
  id: number;
  type: NotificationTypeEnum;
  entityType: string;
  entityId: number;
  entityPublicUuid?: string;
  isRead: boolean;
  createdAt: Date;
  actor: UserSummary;
  otherActors: UserSummary[];
  count: number;
};

/**
 * Paginated notifications response
 */
export type NotificationsResponse = {
  notifications: GroupedNotification[];
  nextCursor: number | null;
  hasMore: boolean;
};

// ========================================
// Messaging Output Types
// ========================================

/**
 * Message media item for display
 */
export type MessageMediaUI = {
  id: number;
  mediaType: string;
  url: string | null;
};

/**
 * Message for display in conversation
 */
export type MessageUI = {
  id: number;
  content: string | null;
  senderId: number;
  createdAt: string; // ISO timestamp
  media: MessageMediaUI[];
};

/**
 * Last message preview for conversation list
 */
export type LastMessagePreview = {
  id: number;
  content: string | null;
  senderId: number;
  createdAt: string; // ISO timestamp
  hasMedia: boolean;
  isOwnMessage: boolean;
};

/**
 * Conversation for list display
 */
export type ConversationUI = {
  id: number;
  otherUser: UserSummary;
  lastMessage: LastMessagePreview | null;
  unreadCount: number;
  updatedAt: string; // ISO timestamp
};

/**
 * Conversation with messages for chat view
 */
export type ConversationDetailUI = {
  id: number;
  otherUser: UserSummary;
  messages: MessageUI[];
  nextCursor: number | null;
  hasMore: boolean;
};

/**
 * Response for creating/getting a conversation
 */
export type GetOrCreateConversationResponse = {
  id: number;
  otherUser: UserSummary;
  isNew: boolean;
};

/**
 * Response for listing conversations
 */
export type ConversationsListResponse = {
  conversations: ConversationUI[];
  nextCursor: number | null;
  hasMore: boolean;
};

/**
 * Recent message for header dropdown
 */
export type RecentMessageUI = {
  id: number;
  conversationId: number;
  content: string | null;
  hasMedia: boolean;
  createdAt: string; // ISO timestamp
  sender: UserSummary;
};

/**
 * Response for recent messages
 */
export type RecentMessagesResponse = {
  messages: RecentMessageUI[];
};

/**
 * Response for unread count
 */
export type UnreadCountResponse = {
  count: number;
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
// Hashtag Types
// ========================================

/**
 * Hashtag for display
 */
export type Hashtag = {
  id: number;
  name: string;
  createdAt: Date;
};

/**
 * Popular hashtag for widget (without post count per spec)
 */
export type PopularHashtag = {
  id: number;
  name: string;
};

/**
 * Response type for popular hashtags API
 */
export type PopularHashtagsResponse = {
  hashtags: PopularHashtag[];
};

/**
 * Response type for hashtag posts API
 */
export type HashtagPostsResponse = {
  hashtag: string;
  posts: Post[];
  nextCursor: number | null;
  hasMore: boolean;
};

// ========================================
// Enhanced Profile UI Types
// ========================================

/**
 * Extended user profile with role information for role-based section visibility
 */
export type ExtendedUserProfile = UserProfile & {
  roleId: number | null;
  roleName: string | null; // 'athlete' | 'coach' | 'scout'
  dateOfBirth: Date | null;
  height: number | null;
  positions: number[] | null;
  strongFoot: string | null;
};

/**
 * Athlete metrics for display
 */
export type AthleteMetricsUI = {
  id: number;
  userId: number;
  sprintSpeed30m: number | null;
  agilityTTest: number | null;
  beepTestLevel: number | null;
  beepTestShuttle: number | null;
  verticalJump: number | null;
};

/**
 * Experience entry for display
 */
export type ExperienceUI = {
  id: number;
  title: string;
  teamId: number;
  teamName: string;
  yearFrom: number;
  yearTo: number | null; // null = Present
  location: string | null;
};

/**
 * Education entry for display
 */
export type EducationUI = {
  id: number;
  title: string; // Institution name
  subtitle: string | null; // Degree/program
  yearFrom: number;
  yearTo: number | null; // null = Present
};

/**
 * Certification entry for display
 */
export type CertificationUI = {
  id: number;
  title: string;
  organization: string | null;
  year: number;
  description: string | null;
};

/**
 * Language entry for display
 */
export type LanguageUI = {
  id: number;
  language: string;
  level: "native" | "fluent" | "proficient" | "intermediate" | "basic";
};

/**
 * Award entry for display
 */
export type AwardUI = {
  id: number;
  title: string;
  year: number;
  description: string | null;
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

// ========================================
// Notification Mappers
// ========================================

/**
 * Map Prisma Notification to NotificationUI
 */
export function toNotificationUI(
  notification: NotificationWithActor,
  entityPublicUuid?: string
): NotificationUI {
  return {
    id: notification.id,
    type: notification.type as NotificationTypeEnum,
    entityType: notification.entityType,
    entityId: notification.entityId,
    entityPublicUuid,
    isRead: notification.isRead,
    createdAt: notification.createdAt ?? new Date(),
    actor: toUserSummary(notification.actor),
  };
}

/**
 * Map NotificationUI to GroupedNotification (single notification, no grouping)
 */
export function toGroupedNotification(
  notification: NotificationUI,
  otherActors: UserSummary[] = [],
  count: number = 1
): GroupedNotification {
  return {
    ...notification,
    otherActors,
    count,
  };
}

// ========================================
// Messaging Mappers
// ========================================

/**
 * Map Prisma MessageMedia to MessageMediaUI
 */
export function toMessageMedia(media: PrismaMessageMedia): MessageMediaUI {
  return {
    id: media.id,
    mediaType: media.mediaType,
    url: media.url,
  };
}

/**
 * Map Prisma Message with sender to MessageUI
 */
export function toMessage(message: MessageWithSender): MessageUI {
  return {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
    media: message.media.map(toMessageMedia),
  };
}

/**
 * Create last message preview from Prisma message
 */
export function toLastMessagePreview(
  message: PrismaMessage & { media?: PrismaMessageMedia[] },
  currentUserId: number
): LastMessagePreview {
  return {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
    hasMedia: (message.media?.length ?? 0) > 0,
    isOwnMessage: message.senderId === currentUserId,
  };
}

/**
 * Map Prisma Conversation to ConversationUI
 * @param conversation - Conversation with participants and last message
 * @param currentUserId - Current user's ID (to determine "other" user)
 * @param unreadCount - Number of unread messages
 */
export function toConversationUI(
  conversation: ConversationWithParticipants,
  currentUserId: number,
  unreadCount: number = 0
): ConversationUI {
  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== currentUserId
  );

  if (!otherParticipant) {
    throw new Error("Conversation must have another participant");
  }

  const lastMessage = conversation.messages[0] ?? null;

  return {
    id: conversation.id,
    otherUser: toUserSummary(otherParticipant.user),
    lastMessage: lastMessage
      ? toLastMessagePreview(lastMessage, currentUserId)
      : null,
    unreadCount,
    updatedAt:
      conversation.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

/**
 * Map Prisma Message to RecentMessageUI for header dropdown
 */
export function toRecentMessage(
  message: MessageWithSender & { conversationId: number }
): RecentMessageUI {
  return {
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    hasMedia: message.media.length > 0,
    createdAt: message.createdAt?.toISOString() ?? new Date().toISOString(),
    sender: toUserSummary(message.sender),
  };
}

// ========================================
// Enhanced Profile Mappers
// ========================================

/**
 * Map Prisma AthleteMetrics to AthleteMetricsUI
 */
export function toAthleteMetrics(
  metrics: PrismaAthleteMetrics | null
): AthleteMetricsUI | null {
  if (!metrics) return null;
  return {
    id: metrics.id,
    userId: metrics.userId,
    sprintSpeed30m: metrics.sprintSpeed30m
      ? parseFloat(metrics.sprintSpeed30m.toString())
      : null,
    agilityTTest: metrics.agilityTTest
      ? parseFloat(metrics.agilityTTest.toString())
      : null,
    beepTestLevel: metrics.beepTestLevel,
    beepTestShuttle: metrics.beepTestShuttle,
    verticalJump: metrics.verticalJump,
  };
}

/**
 * Map Prisma UserExperience to ExperienceUI
 */
export function toExperience(
  experience: PrismaUserExperience & { team: { name: string } }
): ExperienceUI {
  return {
    id: experience.id,
    title: experience.title,
    teamId: experience.teamId,
    teamName: experience.team.name,
    yearFrom: experience.yearFrom,
    yearTo: experience.yearTo,
    location: experience.location,
  };
}

/**
 * Map Prisma UserEducation to EducationUI
 */
export function toEducation(education: PrismaUserEducation): EducationUI {
  return {
    id: education.id,
    title: education.title,
    subtitle: education.subtitle,
    yearFrom: education.yearFrom,
    yearTo: education.yearTo,
  };
}

/**
 * Map Prisma UserCertification to CertificationUI
 */
export function toCertification(
  certification: PrismaUserCertification
): CertificationUI {
  return {
    id: certification.id,
    title: certification.title,
    organization: certification.organization,
    year: certification.year,
    description: certification.description,
  };
}

/**
 * Map Prisma UserLanguage to LanguageUI
 */
export function toLanguage(language: PrismaUserLanguage): LanguageUI {
  return {
    id: language.id,
    language: language.language,
    level: language.level,
  };
}

/**
 * Map Prisma UserAward to AwardUI
 */
export function toAward(award: PrismaUserAward): AwardUI {
  return {
    id: award.id,
    title: award.title,
    year: award.year,
    description: award.description,
  };
}

// ========================================
// Watchlist Include Patterns
// ========================================

/**
 * Include pattern for watchlist with athlete count
 */
export const includeWatchlistWithCount = {
  _count: {
    select: {
      athletes: true,
    },
  },
} satisfies Prisma.WatchlistInclude;

/**
 * Include pattern for watchlist with full athlete data (for discovery)
 */
export const includeWatchlistWithAthletes = {
  athletes: {
    include: {
      athlete: {
        include: {
          attributes: {
            include: {
              sport: true,
            },
          },
          athleteMetrics: true,
        },
      },
    },
  },
} satisfies Prisma.WatchlistInclude;

/**
 * Include pattern for athlete discovery (user with full profile data)
 */
export const includeAthleteForDiscovery = {
  attributes: {
    include: {
      sport: true,
    },
  },
  athleteMetrics: true,
  watchedBy: {
    select: {
      watchlistId: true,
      watchlist: {
        select: {
          userId: true,
        },
      },
    },
  },
} satisfies Prisma.UserInclude;

// ========================================
// Inferred Watchlist Types
// ========================================

export type WatchlistWithCount = Prisma.WatchlistGetPayload<{
  include: typeof includeWatchlistWithCount;
}>;

export type WatchlistWithAthletes = Prisma.WatchlistGetPayload<{
  include: typeof includeWatchlistWithAthletes;
}>;

export type AthleteForDiscovery = Prisma.UserGetPayload<{
  include: typeof includeAthleteForDiscovery;
}>;

// ========================================
// Watchlist Mappers
// ========================================

import type {
  WatchlistSummary,
  WatchlistDetail,
  WatchlistAthleteItem,
} from "./watchlists";
import type {
  AthleteDiscoveryResult,
  AthleteDiscoveryMetrics,
} from "./discovery";

/**
 * Calculate age from date of birth
 * Returns null if date is invalid, in the future, or results in age <= 0
 */
export function calculateAge(dateOfBirth: Date | null): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  // Check if birth date is in the future
  if (birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  // Return null for invalid ages (0 or negative)
  return age > 0 ? age : null;
}

/**
 * Extract metrics from Prisma AthleteMetrics
 */
export function toDiscoveryMetrics(
  metrics: PrismaAthleteMetrics | null
): AthleteDiscoveryMetrics | null {
  if (!metrics) return null;
  return {
    sprintSpeed30m: metrics.sprintSpeed30m
      ? parseFloat(metrics.sprintSpeed30m.toString())
      : null,
    agilityTTest: metrics.agilityTTest
      ? parseFloat(metrics.agilityTTest.toString())
      : null,
    beepTestLevel: metrics.beepTestLevel,
    beepTestShuttle: metrics.beepTestShuttle,
    verticalJump: metrics.verticalJump,
  };
}

/**
 * Map Prisma Watchlist with count to WatchlistSummary
 */
export function toWatchlistSummary(
  watchlist: WatchlistWithCount
): WatchlistSummary {
  return {
    id: watchlist.id,
    name: watchlist.name,
    description: watchlist.description,
    athleteCount: watchlist._count.athletes,
    createdAt: watchlist.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: watchlist.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

/**
 * Map Prisma Watchlist to WatchlistDetail
 */
export function toWatchlistDetail(watchlist: {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}): WatchlistDetail {
  return {
    id: watchlist.id,
    name: watchlist.name,
    description: watchlist.description,
    createdAt: watchlist.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: watchlist.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

/**
 * Map Prisma User (athlete) to AthleteDiscoveryResult
 * @param athlete - User with attributes, metrics, and watchedBy
 * @param currentUserId - Current user's ID (to filter watchlistIds)
 */
export function toAthleteDiscoveryResult(
  athlete: AthleteForDiscovery,
  currentUserId: number
): AthleteDiscoveryResult {
  // Filter watchlist IDs to only include ones owned by current user
  const inWatchlistIds = athlete.watchedBy
    .filter((wa) => wa.watchlist.userId === currentUserId)
    .map((wa) => wa.watchlistId);

  return {
    id: athlete.id,
    publicUuid: athlete.publicUuid,
    username: athlete.username,
    firstName: athlete.attributes?.firstName ?? "",
    lastName: athlete.attributes?.lastName ?? "",
    profileImageUrl: athlete.attributes?.profilePictureUrl ?? null,
    location: athlete.attributes?.location ?? null,
    openToOpportunities: athlete.attributes?.openToOpportunities ?? false,
    strongFoot: athlete.attributes?.strongFoot ?? null,
    height: athlete.attributes?.height ?? null,
    age: calculateAge(athlete.attributes?.dateOfBirth ?? null),
    sportId: athlete.attributes?.sportId ?? null,
    sportName: athlete.attributes?.sport?.name ?? null,
    positions: athlete.attributes?.positions as number[] | null,
    metrics: toDiscoveryMetrics(athlete.athleteMetrics),
    inWatchlistIds,
  };
}

/**
 * Map WatchlistAthlete (junction) with full athlete data to WatchlistAthleteItem
 */
export function toWatchlistAthleteItem(
  entry: WatchlistWithAthletes["athletes"][number]
): WatchlistAthleteItem {
  const athlete = entry.athlete;
  return {
    id: athlete.id,
    publicUuid: athlete.publicUuid,
    username: athlete.username,
    firstName: athlete.attributes?.firstName ?? "",
    lastName: athlete.attributes?.lastName ?? "",
    profileImageUrl: athlete.attributes?.profilePictureUrl ?? null,
    location: athlete.attributes?.location ?? null,
    openToOpportunities: athlete.attributes?.openToOpportunities ?? false,
    strongFoot: athlete.attributes?.strongFoot ?? null,
    height: athlete.attributes?.height ?? null,
    age: calculateAge(athlete.attributes?.dateOfBirth ?? null),
    sportId: athlete.attributes?.sportId ?? null,
    sportName: athlete.attributes?.sport?.name ?? null,
    positions: athlete.attributes?.positions as number[] | null,
    metrics: toDiscoveryMetrics(athlete.athleteMetrics),
    addedAt: entry.addedAt?.toISOString() ?? new Date().toISOString(),
  };
}
