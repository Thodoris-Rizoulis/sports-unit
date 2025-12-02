import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
// Markdown link regex - matches [title](url)
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;

export function parseTextWithLinks(text: string) {
  const parts = [];
  let lastIndex = 0;

  // First, handle markdown-style links [title](url)
  let match;
  while ((match = MARKDOWN_LINK_REGEX.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      // Check for auto-detected URLs in the text before this link
      const beforeText = text.slice(lastIndex, match.index);
      parts.push(...parseAutoLinks(beforeText));
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
    parts.push(...parseAutoLinks(remainingText));
  }

  return parts;
}

// Helper function to parse auto-detected URLs
function parseAutoLinks(text: string) {
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_REGEX.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push({
        type: "text" as const,
        content: text.slice(lastIndex, match.index),
      });
    }

    // Add the URL
    parts.push({
      type: "link" as const,
      content: match[0],
      url: match[0],
    });

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
