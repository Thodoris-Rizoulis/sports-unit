"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
  BookmarkIcon,
} from "lucide-react";

interface PostInteractionsProps {
  postId: number;
  initialLikes?: number;
  initialLiked?: boolean;
  initialComments?: number;
  initialSaved?: boolean;
  onCommentClick?: () => void;
  postUuid?: string;
  onPostUnsaved?: () => void;
}

export function PostInteractions({
  postId,
  initialLikes = 0,
  initialLiked = false,
  initialComments = 0,
  initialSaved = false,
  onCommentClick,
  postUuid,
  onPostUnsaved,
}: PostInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    // Optimistic update
    const wasLiked = liked;
    const previousLikes = likes;
    setLiked(!wasLiked);
    setLikes(wasLiked ? previousLikes - 1 : previousLikes + 1);

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to toggle like");

      const data = await response.json();
      setLiked(data.liked);
      setLikes(data.count);
      // Remove onPostUpdated call since we're handling updates locally
    } catch (error) {
      console.error("Like error:", error);
      // Rollback optimistic update on error
      setLiked(wasLiked);
      setLikes(previousLikes);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!postUuid) return;

    try {
      // Record the share action
      await fetch(`/api/posts/${postId}/share`, {
        method: "POST",
      });

      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/post/${postUuid}`;
      await navigator.clipboard.writeText(shareUrl);
      // TODO: Show success toast
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Share error:", error);
      alert("Failed to share post");
    }
  };

  const handleSave = async () => {
    if (loading) return;

    // Optimistic update
    const wasSaved = saved;
    setSaved(!wasSaved);

    // If unsaving a post, call the callback immediately for optimistic UI update
    if (wasSaved && onPostUnsaved) {
      onPostUnsaved();
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to toggle save");

      const data = await response.json();
      setSaved(data.saved);
      // Remove onPostUpdated call since we're handling updates locally
    } catch (error) {
      console.error("Save error:", error);
      // Rollback optimistic update on error
      setSaved(wasSaved);
      // If we rolled back an unsave, we need to notify that the post should be added back
      // This is handled by the parent component managing the optimistic state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border/50">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95 ${
          liked
            ? "text-destructive hover:text-destructive/80"
            : "hover:text-primary/70"
        }`}
      >
        <HeartIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            liked
              ? "fill-current scale-110 text-destructive"
              : "hover:scale-110"
          }`}
        />
        <span className="transition-colors duration-200">{likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95 hover:text-primary"
        onClick={onCommentClick}
      >
        <MessageCircleIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        <span>{initialComments > 0 ? initialComments : ""}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95 hover:text-primary"
        onClick={handleShare}
        disabled={!postUuid}
      >
        <ShareIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        <span>Share</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={loading}
        className={`flex items-center space-x-1 transition-all duration-200 hover:scale-105 active:scale-95 ${
          saved ? "text-secondary" : "hover:text-primary"
        }`}
      >
        <BookmarkIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            saved ? "fill-current scale-110" : "hover:scale-110"
          }`}
        />
        <span>Save</span>
      </Button>
    </div>
  );
}
