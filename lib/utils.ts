import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========================================
// Pagination Utilities
// ========================================

/** Maximum allowed limit for any paginated query */
export const MAX_PAGINATION_LIMIT = 100;

/** Default pagination limit */
export const DEFAULT_PAGINATION_LIMIT = 20;

/**
 * Enforces pagination limits to prevent excessive data fetching.
 * Clamps the requested limit between 1 and MAX_PAGINATION_LIMIT.
 *
 * @param limit - The requested limit
 * @param defaultLimit - Optional default limit (defaults to 20)
 * @returns A safe limit value
 */
export function enforcePaginationLimit(
  limit?: number,
  defaultLimit: number = DEFAULT_PAGINATION_LIMIT
): number {
  if (limit === undefined || limit === null) {
    return defaultLimit;
  }
  return Math.max(1, Math.min(limit, MAX_PAGINATION_LIMIT));
}

/**
 * Enforces offset to be non-negative.
 *
 * @param offset - The requested offset
 * @returns A safe offset value (minimum 0)
 */
export function enforcePaginationOffset(offset?: number): number {
  if (offset === undefined || offset === null) {
    return 0;
  }
  return Math.max(0, offset);
}

export function getProfileUrl(profile: {
  publicUuid?: string;
  username: string;
}) {
  if (profile.publicUuid)
    return `/profile/${profile.publicUuid}/${profile.username}`;
  return `/profile/${profile.username}`;
}

// URL detection regex - matches http/https URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
// Markdown link regex - matches [title](url) - excludes ) from URL to properly terminate
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
// Hashtag detection regex - matches # followed by alphanumeric and underscores
const HASHTAG_INLINE_REGEX = /(#[a-zA-Z0-9_]+)/g;

/**
 * Text part types for rendering with links and hashtags
 */
export type TextPart =
  | { type: "text"; content: string }
  | { type: "link"; content: string; url: string }
  | { type: "hashtag"; content: string; tag: string };

export function parseTextWithLinks(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  // Reset regex lastIndex to ensure fresh search
  MARKDOWN_LINK_REGEX.lastIndex = 0;

  // First, handle markdown-style links [title](url)
  let match;
  while ((match = MARKDOWN_LINK_REGEX.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      // Check for auto-detected URLs and hashtags in the text before this link
      const beforeText = text.slice(lastIndex, match.index);
      parts.push(...parseAutoLinksAndHashtags(beforeText));
    }

    // Add the markdown link
    parts.push({
      type: "link" as const,
      content: match[1], // title
      url: match[2], // url
    });

    lastIndex = match.index + match[0].length;
  }

  // Handle any remaining text after the last markdown link
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    parts.push(...parseAutoLinksAndHashtags(remainingText));
  }

  return parts;
}

// Helper function to parse auto-detected URLs and hashtags
function parseAutoLinksAndHashtags(text: string): TextPart[] {
  const parts: TextPart[] = [];

  // Combined regex to match URLs and hashtags
  const COMBINED_REGEX = /(https?:\/\/[^\s]+)|(#[a-zA-Z0-9_]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = COMBINED_REGEX.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: "text" as const,
        content: text.slice(lastIndex, match.index),
      });
    }

    if (match[1]) {
      // URL match
      parts.push({
        type: "link" as const,
        content: match[0],
        url: match[0],
      });
    } else if (match[2]) {
      // Hashtag match
      parts.push({
        type: "hashtag" as const,
        content: match[0], // e.g., "#training"
        tag: match[0].slice(1).toLowerCase(), // e.g., "training"
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text" as const,
      content: text.slice(lastIndex),
    });
  }

  return parts;
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else if (diffInDays < 2) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return dateObj.toLocaleDateString();
  } else {
    return dateObj.toLocaleDateString();
  }
}

// ========================================
// Hashtag Utilities
// ========================================

/**
 * Hashtag extraction regex - matches # followed by alphanumeric and underscores
 * Requires whitespace or start-of-string before # (prevents mid-word matches like super#hero)
 */
const HASHTAG_REGEX = /(?:^|\s)(#[a-zA-Z0-9_]+)/g;

/**
 * Extract hashtags from text content for database storage.
 * Returns unique, lowercase hashtag names without the # prefix.
 *
 * @param text - The text content to extract hashtags from
 * @returns Array of unique lowercase hashtag names (without #)
 *
 * @example
 * extractHashtags("Great #Training session! #sports #training")
 * // Returns: ["training", "sports"]
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];

  const matches = text.matchAll(HASHTAG_REGEX);
  const hashtags = new Set<string>();

  for (const match of matches) {
    // match[1] is the captured group including #
    const hashtag = match[1].slice(1).toLowerCase(); // Remove # and lowercase
    if (hashtag.length > 0 && hashtag.length <= 50) {
      hashtags.add(hashtag);
    }
  }

  return Array.from(hashtags);
}
