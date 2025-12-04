"use client";

/**
 * MessageInput Component
 * Feature: 015-direct-messaging
 *
 * Text input for composing messages with character counter.
 * Supports sending via Enter key and button click.
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MESSAGE_MAX_LENGTH } from "@/types/messaging";

type MessageInputProps = {
  onSend: (content: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
};

export function MessageInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = "Type a message...",
  className,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = content.length;
  const isOverLimit = characterCount > MESSAGE_MAX_LENGTH;
  const canSend =
    content.trim().length > 0 && !isOverLimit && !disabled && !isLoading;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (!canSend) return;
    onSend(content.trim());
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              "resize-none min-h-[40px] max-h-[150px] pr-12",
              isOverLimit && "border-destructive focus-visible:ring-destructive"
            )}
            aria-label="Message input"
          />
          {/* Character counter */}
          <span
            className={cn(
              "absolute bottom-2 right-3 text-xs",
              isOverLimit
                ? "text-destructive font-medium"
                : characterCount > MESSAGE_MAX_LENGTH * 0.8
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-muted-foreground"
            )}
          >
            {characterCount}/{MESSAGE_MAX_LENGTH}
          </span>
        </div>

        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Error message for over limit */}
      {isOverLimit && (
        <p className="text-xs text-destructive">
          Message exceeds maximum length of {MESSAGE_MAX_LENGTH} characters
        </p>
      )}
    </div>
  );
}
