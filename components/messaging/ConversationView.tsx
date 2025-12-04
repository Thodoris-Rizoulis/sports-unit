"use client";

/**
 * ConversationView Component
 * Feature: 015-direct-messaging
 *
 * Displays a conversation with message list and input.
 * Handles message sending, loading, and real-time updates.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { MessageMediaUpload } from "./MessageMediaUpload";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useConversation,
  useSendMessage,
  useMarkAsRead,
  messagingKeys,
} from "@/hooks/useMessaging";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSessionUserId } from "@/lib/auth-utils";
import type { MessageUI, UserSummary } from "@/types/prisma";

type UploadedMedia = {
  url: string;
  key: string;
  type: "image" | "video";
};

type ConversationViewProps = {
  conversationId: number;
  onBack?: () => void;
  showHeader?: boolean;
  className?: string;
  isReconnecting?: boolean;
};

export function ConversationView({
  conversationId,
  onBack,
  showHeader = true,
  className,
  isReconnecting = false,
}: ConversationViewProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [pendingMedia, setPendingMedia] = useState<UploadedMedia | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastMessageCountRef = useRef(0);

  const currentUserId = getSessionUserId(session);

  // Fetch conversation with messages
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useConversation(conversationId);

  // Send message mutation
  const sendMessage = useSendMessage(conversationId);

  // Mark as read mutation
  const markAsRead = useMarkAsRead();

  // Extract messages and other user from pages
  const allMessages: MessageUI[] = [];
  let otherUser: UserSummary | null = null;

  if (data?.pages) {
    for (const page of data.pages) {
      allMessages.push(...page.messages);
      if (page.otherUser) {
        otherUser = page.otherUser;
      }
    }
  }

  // Sort messages by date (oldest first)
  const sortedMessages = [...allMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Mark as read when viewing conversation
  useEffect(() => {
    if (conversationId && currentUserId && !isLoading) {
      markAsRead.mutate(conversationId);
    }
  }, [conversationId, currentUserId, isLoading]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (
      shouldAutoScroll &&
      sortedMessages.length > lastMessageCountRef.current
    ) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    lastMessageCountRef.current = sortedMessages.length;
  }, [sortedMessages.length, shouldAutoScroll]);

  // Scroll event handler to detect if user scrolled up
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const isAtBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight < 100;
      setShouldAutoScroll(isAtBottom);

      // Load more when scrolled to top
      if (target.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Handle sending a message
  const handleSend = (content: string) => {
    if (!currentUserId) return;

    sendMessage.mutate(
      {
        content: content || undefined,
        mediaUrl: pendingMedia?.url,
        mediaKey: pendingMedia?.key,
        mediaType: pendingMedia?.type,
      },
      {
        onSuccess: () => {
          setPendingMedia(null);
          // Scroll to bottom after sending
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
      }
    );
  };

  // Handle media upload
  const handleMediaUploaded = (media: UploadedMedia) => {
    setPendingMedia(media);
  };

  const handleMediaRemoved = () => {
    setPendingMedia(null);
  };

  if (isLoading) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {showHeader && (
          <div className="flex items-center gap-3 p-4 border-b">
            {onBack && (
              <Button variant="ghost" size="icon" disabled>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        {showHeader && onBack && (
          <div className="flex items-center gap-3 p-4 border-b">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-center">
            {error instanceof Error
              ? error.message
              : "Failed to load conversation"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      {showHeader && otherUser && (
        <div className="flex items-center gap-3 p-4 border-b">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Image
            src={otherUser.profileImageUrl || "/default_profile.jpg"}
            alt={`${otherUser.firstName} ${otherUser.lastName}`}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {otherUser.firstName} {otherUser.lastName}
            </p>
            {otherUser.username && (
              <p className="text-sm text-muted-foreground truncate">
                @{otherUser.username}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reconnecting indicator */}
      {isReconnecting && (
        <div className="flex items-center justify-center gap-2 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-sm">
          <WifiOff className="h-4 w-4" />
          <span>Reconnecting...</span>
        </div>
      )}

      {/* Messages */}
      <ScrollArea
        className="flex-1 p-4"
        onScrollCapture={handleScroll}
        ref={scrollAreaRef}
      >
        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* No more messages indicator */}
        {!hasNextPage && sortedMessages.length > 0 && (
          <div className="flex justify-center py-2 mb-4">
            <p className="text-xs text-muted-foreground">
              Beginning of conversation
            </p>
          </div>
        )}

        {/* Empty state */}
        {sortedMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">
              No messages yet. Say hello! 👋
            </p>
          </div>
        )}

        {/* Messages list */}
        <div className="flex flex-col gap-3">
          {sortedMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))}
        </div>

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <MessageMediaUpload
            currentMedia={pendingMedia}
            onMediaUploaded={handleMediaUploaded}
            onMediaRemoved={handleMediaRemoved}
            disabled={sendMessage.isPending}
          />
          <div className="flex-1 min-w-0">
            <MessageInput
              onSend={handleSend}
              disabled={false}
              isLoading={sendMessage.isPending}
              placeholder="Type a message..."
            />
          </div>
        </div>
        {sendMessage.isError && (
          <p className="text-xs text-destructive mt-2">
            {sendMessage.error instanceof Error
              ? sendMessage.error.message
              : "Failed to send message"}
          </p>
        )}
      </div>
    </div>
  );
}
