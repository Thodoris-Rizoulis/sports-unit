"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
  BookmarkIcon,
} from "lucide-react";
import { ShareModal } from "./ShareModal";

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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

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

    // Record the share action
    try {
      await fetch(`/api/posts/${postId}/share`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Share record error:", error);
    }

    // Generate share URL and open modal
    const url = `${window.location.origin}/post/${postUuid}`;
    setShareUrl(url);
    setShareModalOpen(true);
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
    <div className="flex items-center justify-around md:justify-start md:gap-4 mt-3 pt-3 border-t border-border/50">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={loading}
        aria-label={
          liked ? `Unlike post (${likes} likes)` : `Like post (${likes} likes)`
        }
        aria-pressed={liked}
        className={`flex-1 md:flex-none flex items-center justify-center space-x-1 px-2 md:px-3 transition-all duration-200 hover:scale-105 active:scale-95 ${
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
        className="flex-1 md:flex-none flex items-center justify-center space-x-1 px-2 md:px-3 transition-all duration-200 hover:scale-105 active:scale-95 hover:text-primary"
        onClick={onCommentClick}
        aria-label={`View comments${
          initialComments > 0 ? ` (${initialComments})` : ""
        }`}
      >
        <MessageCircleIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        <span>{initialComments > 0 ? initialComments : ""}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex-1 md:flex-none flex items-center justify-center space-x-1 px-2 md:px-3 transition-all duration-200 hover:scale-105 active:scale-95 hover:text-primary"
        onClick={handleShare}
        disabled={!postUuid}
        aria-label="Share post"
      >
        <ShareIcon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={loading}
        aria-label={saved ? "Remove from saved posts" : "Save post"}
        aria-pressed={saved}
        className={`flex-1 md:flex-none flex items-center justify-center space-x-1 px-2 md:px-3 transition-all duration-200 hover:scale-105 active:scale-95 ${
          saved ? "text-secondary" : "hover:text-primary"
        }`}
      >
        <BookmarkIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            saved ? "fill-current scale-110" : "hover:scale-110"
          }`}
        />
        <span className="hidden sm:inline">Save</span>
      </Button>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareUrl}
      />
    </div>
  );
}
