"use client";

/**
 * InboxDropdown Component
 * Feature: 015-direct-messaging
 *
 * Dropdown showing recent messages when clicking Inbox icon in header.
 * Hides badge when opened (local state only, no API call per FR-019).
 */

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { InboxIcon } from "@heroicons/react/24/solid";
import { InboxBadge } from "./InboxBadge";
import { useRecentMessages, useUnreadMessageCount } from "@/hooks/useMessaging";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { RecentMessageUI } from "@/types/prisma";

type InboxDropdownProps = {
  showLabel?: boolean;
  className?: string;
};

/**
 * Truncate message content for preview
 */
function truncateContent(
  content: string | null,
  maxLength: number = 50
): string {
  if (!content) return "Sent a media attachment";
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + "...";
}

export function InboxDropdown({
  showLabel = true,
  className,
}: InboxDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenBadge, setHasSeenBadge] = useState(false);

  // Fetch unread count
  const { data: unreadData } = useUnreadMessageCount();
  const unreadCount = unreadData?.count ?? 0;

  // Fetch recent messages when dropdown opens
  const { data: recentData, isLoading } = useRecentMessages({
    enabled: isOpen,
    limit: 10,
  });
  const recentMessages = recentData?.messages ?? [];

  // Reset "seen" state when new messages arrive
  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      setHasSeenBadge(false);
    }
  }, [unreadCount, isOpen]);

  // Hide badge when dropdown opens (visual only, per FR-019)
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setHasSeenBadge(true);
    }
  };

  // Handle clicking on a recent message
  const handleMessageClick = (message: RecentMessageUI) => {
    setIsOpen(false);
    router.push(`/inbox?c=${message.conversationId}`);
  };

  // Display count: 0 if user has opened dropdown since last update
  const displayCount = hasSeenBadge ? 0 : unreadCount;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-primary-foreground hover:text-primary hover:bg-accent transition-colors",
            className
          )}
        >
          <div className="relative">
            <InboxIcon className="h-5 w-5" />
            <InboxBadge count={displayCount} />
          </div>
          {showLabel && <span>Inbox</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Messages</h3>
          <Link
            href="/inbox"
            onClick={() => setIsOpen(false)}
            className="text-sm text-primary hover:underline"
          >
            See all
          </Link>
        </div>

        <ScrollArea className="max-h-80">
          {/* Loading state */}
          {isLoading && (
            <div className="p-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && recentMessages.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-xs mt-1">
                Connect with users to start messaging
              </p>
            </div>
          )}

          {/* Recent messages */}
          {!isLoading && recentMessages.length > 0 && (
            <div className="divide-y">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-accent transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleMessageClick(message);
                    }
                  }}
                >
                  <Image
                    src={
                      message.sender.profileImageUrl || "/default_profile.jpg"
                    }
                    alt={`${message.sender.firstName} ${message.sender.lastName}`}
                    width={40}
                    height={40}
                    className="rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">
                        {message.sender.firstName} {message.sender.lastName}
                      </p>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: false,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {truncateContent(message.content)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
