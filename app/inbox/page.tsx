"use client";

/**
 * Inbox Page
 * Feature: 015-direct-messaging
 *
 * Main messaging page with responsive layout:
 * - Desktop: Split view with conversation list and active conversation
 * - Mobile: List view only, conversation opens in separate page
 */

import React, { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ConversationView } from "@/components/messaging/ConversationView";
import { useMessageSocket } from "@/hooks/useMessaging";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageSquare, Loader2 } from "lucide-react";
import type { ConversationUI } from "@/types/prisma";

function InboxContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationUI | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Get conversation ID from URL if present
  const conversationIdParam = searchParams.get("c");

  // WebSocket connection
  const { isConnected, joinConversation, leaveConversation } = useMessageSocket(
    {
      enabled: status === "authenticated" && !!session?.user?.id,
      userId: session?.user?.id ? parseInt(session.user.id) : undefined,
      sessionToken: session?.user?.id, // Simplified - in production use actual session token
      onError: (error) => {
        console.error("[inbox] WebSocket error:", error);
        setIsReconnecting(true);
      },
    }
  );

  // Update reconnecting state when connected
  useEffect(() => {
    if (isConnected) {
      setIsReconnecting(false);
    }
  }, [isConnected]);

  // Join/leave conversation room when selection changes
  useEffect(() => {
    if (selectedConversation) {
      joinConversation(selectedConversation.id);
      return () => {
        leaveConversation(selectedConversation.id);
      };
    }
  }, [selectedConversation?.id, joinConversation, leaveConversation]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: ConversationUI) => {
    if (isMobile) {
      // On mobile, navigate to conversation detail page
      router.push(`/inbox/${conversation.id}`);
    } else {
      // On desktop, show in split view
      setSelectedConversation(conversation);
      // Update URL without navigation
      window.history.replaceState(null, "", `/inbox?c=${conversation.id}`);
    }
  };

  // Handle back from conversation (desktop only)
  const handleBack = () => {
    setSelectedConversation(null);
    window.history.replaceState(null, "", "/inbox");
  };

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversation List - Always visible on desktop, hidden on mobile when conversation selected */}
      <div
        className={`${isMobile ? "w-full" : "w-80 lg:w-96 border-r"} ${
          selectedConversation && isMobile ? "hidden" : ""
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
          <ConversationList
            selectedConversationId={selectedConversation?.id}
            onSelectConversation={handleSelectConversation}
            className="flex-1"
          />
        </div>
      </div>

      {/* Conversation View - Desktop split view */}
      {!isMobile && (
        <div className="flex-1 h-full">
          {selectedConversation ? (
            <ConversationView
              conversationId={selectedConversation.id}
              showHeader={true}
              isReconnecting={isReconnecting}
              className="h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Select a conversation
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a conversation from the list to view messages
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InboxLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<InboxLoading />}>
      <InboxContent />
    </Suspense>
  );
}
