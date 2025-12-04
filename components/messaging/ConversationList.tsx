"use client";

/**
 * ConversationList Component
 * Feature: 015-direct-messaging
 *
 * List of conversations with search functionality.
 * Supports infinite scroll for loading more conversations.
 */

import React, { useState, useMemo } from "react";
import { ConversationItem } from "./ConversationItem";
import { EmptyInbox } from "./EmptyInbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations } from "@/hooks/useMessaging";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { ConversationUI } from "@/types/prisma";

type ConversationListProps = {
  selectedConversationId?: number;
  onSelectConversation: (conversation: ConversationUI) => void;
  className?: string;
};

export function ConversationList({
  selectedConversationId,
  onSelectConversation,
  className,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch conversations with search
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useConversations({
    search: debouncedSearch || undefined,
  });

  // Flatten pages into single array
  const conversations = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.conversations);
  }, [data?.pages]);

  // Handle scroll to load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1" onScrollCapture={handleScroll}>
        {/* Loading state */}
        {isLoading && (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">
              {error instanceof Error
                ? error.message
                : "Failed to load conversations"}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && conversations.length === 0 && (
          <>
            {searchQuery ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">
                  No conversations found for "{searchQuery}"
                </p>
              </div>
            ) : (
              <EmptyInbox />
            )}
          </>
        )}

        {/* Conversations */}
        {!isLoading && conversations.length > 0 && (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => onSelectConversation(conversation)}
              />
            ))}

            {/* Loading more indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* End of list */}
            {!hasNextPage && conversations.length >= 5 && (
              <div className="flex justify-center py-4">
                <p className="text-xs text-muted-foreground">
                  No more conversations
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
