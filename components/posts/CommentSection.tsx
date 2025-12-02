"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PostComment } from "@/types/prisma";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeartIcon, MessageCircleIcon } from "lucide-react";
import { formatRelativeTime, getProfileUrl } from "@/lib/utils";

interface CommentSectionProps {
  postId: number;
  isOpen: boolean;
}

interface CommentItemProps {
  comment: PostComment;
  onReply: (parentId: number) => void;
}

interface CommentThread {
  comment: PostComment;
  replies: CommentThread[];
}

function CommentItem({ comment, onReply }: CommentItemProps) {
  const [likes, setLikes] = useState(comment.likeCount);
  const [liked, setLiked] = useState(comment.isLiked);
  const [loading, setLoading] = useState(false);

  const userName = `${comment.user.firstName} ${comment.user.lastName}`;
  const profileUrl = getProfileUrl({
    publicUuid: comment.user.publicUuid,
    username: comment.user.username,
  });

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/posts/${comment.postId}/comment/${comment.id}/like`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Failed to toggle comment like");

      const data = await response.json();
      setLiked(data.liked);
      setLikes(data.count);
    } catch (error) {
      console.error("Comment like error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-3 py-3">
      <Link href={profileUrl}>
        <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/20 transition-all duration-200">
          <AvatarImage
            src={comment.user.profileImageUrl || undefined}
            alt={userName}
          />
          <AvatarFallback className="text-xs">
            {comment.user.firstName[0]}
            {comment.user.lastName[0]}
          </AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <div className="bg-muted rounded-lg px-3 py-2">
          <Link
            href={profileUrl}
            className="font-semibold text-sm hover:text-primary transition-colors duration-200"
          >
            {userName}
          </Link>
          <div className="text-sm">{comment.content}</div>
        </div>
        <div className="flex items-center space-x-4 mt-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className={`h-6 px-2 text-xs transition-colors duration-200 ${
              liked
                ? "text-destructive hover:text-destructive/80"
                : "hover:text-primary"
            }`}
          >
            <HeartIcon
              className={`h-3 w-3 mr-1 transition-transform duration-200 ${
                liked
                  ? "fill-current scale-110 text-destructive"
                  : "hover:scale-110"
              }`}
            />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id)}
            className="h-6 px-2 text-xs transition-colors duration-200 hover:text-primary"
          >
            <MessageCircleIcon className="h-3 w-3 mr-1 transition-transform duration-200 hover:scale-110" />
            Reply
          </Button>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function CommentThread({
  thread,
  onReply,
}: {
  thread: CommentThread;
  onReply: (parentId: number) => void;
}) {
  return (
    <div>
      <CommentItem comment={thread.comment} onReply={onReply} />
      {thread.replies.length > 0 && (
        <div className="ml-11 border-l-2 border-border pl-4 space-y-2">
          {thread.replies.map((reply) => (
            <CommentThread
              key={reply.comment.id}
              thread={reply}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postId, isOpen }: CommentSectionProps) {
  const { data: session } = useSession();
  const [commentThreads, setCommentThreads] = useState<CommentThread[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const buildCommentTree = (comments: PostComment[]): CommentThread[] => {
    const commentMap = new Map<number, CommentThread>();
    const roots: CommentThread[] = [];

    // Create thread objects
    comments.forEach((comment) => {
      commentMap.set(comment.id, { comment, replies: [] });
    });

    // Build tree
    comments.forEach((comment) => {
      const thread = commentMap.get(comment.id)!;
      if (comment.parentCommentId) {
        const parent = commentMap.get(comment.parentCommentId);
        if (parent) {
          parent.replies.push(thread);
        }
      } else {
        roots.push(thread);
      }
    });

    return roots;
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comment`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      const threads = buildCommentTree(data.comments);
      setCommentThreads(threads);
    } catch (error) {
      console.error("Fetch comments error:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [postId, isOpen]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          parentCommentId: replyTo,
        }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      setNewComment("");
      setReplyTo(null);
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Post comment error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3">
        {commentThreads.map((thread) => (
          <CommentThread
            key={thread.comment.id}
            thread={thread}
            onReply={setReplyTo}
          />
        ))}
      </div>

      <div className="border-t pt-4">
        {replyTo && (
          <div className="mb-2 text-sm text-muted-foreground">
            Replying to comment #{replyTo}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
              className="ml-2 h-auto p-0 text-xs"
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex space-x-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            className="flex-1 min-h-[80px]"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || loading}
            className="self-end"
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
