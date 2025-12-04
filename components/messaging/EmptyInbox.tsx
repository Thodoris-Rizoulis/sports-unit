"use client";

/**
 * EmptyInbox Component
 * Feature: 015-direct-messaging
 *
 * Empty state for inbox when user has no conversations.
 * Encourages users to connect with others to start messaging.
 */

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";

type EmptyInboxProps = {
  className?: string;
};

export function EmptyInbox({ className }: EmptyInboxProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center h-full p-8 text-center ${className}`}
    >
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Connect with other users to start messaging. Once you're connected, you
        can send and receive direct messages.
      </p>
      <Button asChild>
        <Link href="/discovery">
          <Users className="h-4 w-4 mr-2" />
          Discover People
        </Link>
      </Button>
    </div>
  );
}
