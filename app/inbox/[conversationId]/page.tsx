"use client";

/**
 * Conversation Detail Page (Mobile)
 * Feature: 015-direct-messaging
 *
 * Full-screen conversation view for mobile devices.
 * Navigates back to inbox list when back button is pressed.
 */

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { ConversationView } from "@/components/messaging/ConversationView";
import { useMessageSocket } from "@/hooks/useMessaging";

export default function ConversationDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const conversationId = params.conversationId
    ? parseInt(params.conversationId as string)
    : null;

  // WebSocket connection
  const { isConnected, joinConversation, leaveConversation } = useMessageSocket(
    {
      enabled:
        status === "authenticated" && !!session?.user?.id && !!conversationId,
      userId: session?.user?.id ? parseInt(session.user.id) : undefined,
      sessionToken: session?.user?.id, // Simplified - in production use actual session token
      onError: (error) => {
        console.error("[conversation] WebSocket error:", error);
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

  // Join/leave conversation room
  useEffect(() => {
    if (conversationId) {
      joinConversation(conversationId);
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, joinConversation, leaveConversation]);

  // Handle back navigation
  const handleBack = () => {
    router.push("/inbox");
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

  // Invalid conversation ID
  if (!conversationId) {
    router.push("/inbox");
    return null;
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ConversationView
        conversationId={conversationId}
        onBack={handleBack}
        showHeader={true}
        isReconnecting={isReconnecting}
        className="h-full"
      />
    </div>
  );
}
