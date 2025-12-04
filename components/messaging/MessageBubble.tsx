"use client";

/**
 * MessageBubble Component
 * Feature: 015-direct-messaging
 *
 * Displays a single message with left/right alignment based on sender.
 * Supports text content and media attachments.
 */

import React from "react";
import Image from "next/image";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import type { MessageUI } from "@/types/prisma";

type MessageBubbleProps = {
  message: MessageUI;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
};

/**
 * Format timestamp for display
 * - "12:30 PM" for today
 * - "Yesterday, 12:30 PM" for yesterday
 * - "Dec 15, 12:30 PM" for older
 */
function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }
  return format(date, "MMM d, h:mm a");
}

export function MessageBubble({
  message,
  isOwnMessage,
  showTimestamp = true,
}: MessageBubbleProps) {
  const messageDate = new Date(message.createdAt);
  const hasMedia = message.media && message.media.length > 0;
  const hasContent = message.content && message.content.trim().length > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-1 max-w-[85%] sm:max-w-[70%]",
        isOwnMessage ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      {/* Media attachments */}
      {hasMedia &&
        message.media.map((media) => (
          <div
            key={media.id}
            className={cn(
              "rounded-2xl overflow-hidden",
              isOwnMessage ? "rounded-br-md" : "rounded-bl-md"
            )}
          >
            {media.mediaType === "image" && media.url && (
              <Image
                src={media.url}
                alt="Message attachment"
                width={300}
                height={200}
                className="object-cover max-w-full h-auto"
                style={{ maxHeight: "300px" }}
              />
            )}
            {media.mediaType === "video" && media.url && (
              <video
                src={media.url}
                controls
                className="max-w-full h-auto"
                style={{ maxHeight: "300px" }}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>
        ))}

      {/* Text content */}
      {hasContent && (
        <div
          className={cn(
            "px-4 py-2 rounded-2xl",
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      )}

      {/* Timestamp */}
      {showTimestamp && (
        <span className="text-xs text-muted-foreground px-1">
          {formatMessageTime(messageDate)}
        </span>
      )}
    </div>
  );
}
