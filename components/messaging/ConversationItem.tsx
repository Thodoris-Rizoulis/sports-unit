"use client";

/**
 * ConversationItem Component
 * Feature: 015-direct-messaging
 *
 * Displays a single conversation in the list with avatar, name, preview, and timestamp.
 * Shows unread indicator when there are new messages.
 */

import React from "react";
import Image from "next/image";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import type { ConversationUI } from "@/types/prisma";

type ConversationItemProps = {
  conversation: ConversationUI;
  isSelected?: boolean;
  onClick?: () => void;
};

/**
 * Format timestamp for conversation list
 * - "12:30 PM" for today
 * - "Yesterday" for yesterday
 * - "Dec 15" for this year
 * - "Dec 15, 2023" for older
 */
function formatConversationTime(date: Date): string {
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  const now = new Date();
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, "MMM d");
  }
  return format(date, "MMM d, yyyy");
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function ConversationItem({
  conversation,
  isSelected = false,
  onClick,
}: ConversationItemProps) {
  const { otherUser, lastMessage, unreadCount, updatedAt } = conversation;

  const hasUnread = unreadCount > 0;
  const timestamp = lastMessage?.createdAt
    ? new Date(lastMessage.createdAt)
    : new Date(updatedAt);

  // Build preview text
  let previewText = "No messages yet";
  if (lastMessage) {
    if (lastMessage.hasMedia && !lastMessage.content) {
      previewText = lastMessage.isOwnMessage
        ? "You sent a photo"
        : "Sent a photo";
    } else if (lastMessage.content) {
      const prefix = lastMessage.isOwnMessage ? "You: " : "";
      previewText = prefix + truncateText(lastMessage.content, 50);
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors",
        isSelected ? "bg-accent" : "hover:bg-accent/50",
        hasUnread && "bg-accent/30"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Image
          src={otherUser.profileImageUrl || "/default_profile.jpg"}
          alt={`${otherUser.firstName} ${otherUser.lastName}`}
          width={48}
          height={48}
          className="rounded-full"
        />
        {/* Unread indicator dot */}
        {hasUnread && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "font-medium truncate",
              hasUnread && "text-foreground"
            )}
          >
            {otherUser.firstName} {otherUser.lastName}
          </p>
          <span
            className={cn(
              "text-xs flex-shrink-0",
              hasUnread ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            {formatConversationTime(timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-sm truncate",
              hasUnread
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {previewText}
          </p>
          {hasUnread && (
            <span className="flex-shrink-0 bg-destructive text-destructive-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
