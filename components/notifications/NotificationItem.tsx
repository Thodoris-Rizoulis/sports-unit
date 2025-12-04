"use client";

/**
 * NotificationItem Component
 *
 * Displays a single notification with actor avatar, action text, and timestamp.
 * Handles grouping display (e.g., "John and 3 others liked your post")
 */

import React from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import type { GroupedNotification, NotificationTypeEnum } from "@/types/prisma";

type NotificationItemProps = {
  notification: GroupedNotification;
  onClick?: () => void;
};

/**
 * Get navigation URL based on notification type
 */
export function getNavigationUrl(notification: GroupedNotification): string {
  switch (notification.type) {
    case "CONNECTION_REQUEST":
      return `/profile/${notification.actor.publicUuid}/${notification.actor.username}`;
    case "POST_LIKE":
    case "POST_COMMENT":
      return notification.entityPublicUuid
        ? `/post/${notification.entityPublicUuid}`
        : "#";
    default:
      return "#";
  }
}

/**
 * Get action text based on notification type
 */
function getActionText(type: NotificationTypeEnum): string {
  switch (type) {
    case "CONNECTION_REQUEST":
      return "sent you a connection request";
    case "POST_LIKE":
      return "liked your post";
    case "POST_COMMENT":
      return "commented on your post";
    default:
      return "interacted with you";
  }
}

/**
 * Format the actor display text with grouping
 */
function formatActorText(notification: GroupedNotification): string {
  const { actor, otherActors, count } = notification;
  const firstName = actor.firstName || actor.username;

  if (count === 1 || otherActors.length === 0) {
    return `${firstName} ${actor.lastName || ""}`.trim();
  }

  const othersCount = count - 1;
  return `${firstName} and ${othersCount} ${
    othersCount === 1 ? "other" : "others"
  }`;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  const actorText = formatActorText(notification);
  const actionText = getActionText(notification.type);
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-accent transition-colors ${
        !notification.isRead ? "bg-accent/50" : ""
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
    >
      {/* Actor Avatar */}
      <div className="flex-shrink-0">
        <Image
          src={notification.actor.profileImageUrl || "/default_profile.jpg"}
          alt={`${notification.actor.firstName} ${notification.actor.lastName}`}
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{actorText}</span>{" "}
          <span className="text-muted-foreground">{actionText}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="flex-shrink-0">
          <div
            className="w-2 h-2 bg-primary rounded-full"
            aria-label="Unread"
          />
        </div>
      )}
    </div>
  );
}
