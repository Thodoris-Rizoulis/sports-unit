"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PostComment } from "@/types/prisma";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSessionUserId } from "@/lib/auth-utils";
import {
  HeartIcon,
  MessageCircleIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { formatRelativeTime, getProfileUrl } from "@/lib/utils";

interface CommentSectionProps {
  postId: number;
  postOwnerId: number;
  isOpen: boolean;
}

interface CommentItemProps {
  comment: PostComment;
  postId: number;
  postOwnerId: number;
  currentUserId: number | null;
  onReply: (parentId: number) => void;
  onDelete: (commentId: number) => void;
  onUpdate: (commentId: number, content: string) => void;
}

interface CommentThread {
  comment: PostComment;
  replies: CommentThread[];
}

function CommentItem({
  comment,
  postId,
  postOwnerId,
  currentUserId,
  onReply,
  onDelete,
  onUpdate,
}: CommentItemProps) {
  const [likes, setLikes] = useState(comment.likeCount);
  const [liked, setLiked] = useState(comment.isLiked);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [canSelect, setCanSelect] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [currentContent, setCurrentContent] = useState(comment.content);

  // When menu opens, wait a bit before allowing selections
  useEffect(() => {
    if (menuOpen) {
      setCanSelect(false);
      const timer = setTimeout(() => {
        setCanSelect(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setCanSelect(false);
    }
  }, [menuOpen]);

  const isCommentOwner = currentUserId === comment.user.id;
  const isPostOwner = currentUserId === postOwnerId;
  const canDelete = isCommentOwner || isPostOwner;
  const canEdit = isCommentOwner;

  const userName = `${comment.user.firstName} ${comment.user.lastName}`;
  const profileUrl = getProfileUrl({
    publicUuid: comment.user.publicUuid,
    username: comment.user.username,
  });

  const handleSelect = (callback: () => void) => (e: Event) => {
    e.preventDefault();
    if (!canSelect) {
      return;
    }
    setMenuOpen(false);
    // Delay the callback to prevent scroll jump when dialog opens
    requestAnimationFrame(() => {
      callback();
    });
  };

  const handleStartEdit = () => {
    setEditContent(currentContent);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(currentContent);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/posts/${postId}/comment/${comment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editContent.trim() }),
        }
      );

      if (!response.ok) throw new Error("Failed to update comment");

      setCurrentContent(editContent.trim());
      setIsEditing(false);
      onUpdate(comment.id, editContent.trim());
    } catch (error) {
      console.error("Update comment error:", error);
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/posts/${postId}/comment/${comment.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete comment");

      setDeleteDialogOpen(false);
      onDelete(comment.id);
    } catch (error) {
      console.error("Delete comment error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex space-x-3 py-3 group">
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
          <div className="bg-muted rounded-lg px-3 py-2 relative">
            <div className="flex items-start justify-between">
              <Link
                href={profileUrl}
                className="font-semibold text-sm hover:text-primary transition-colors duration-200"
              >
                {userName}
              </Link>
              {(canEdit || canDelete) && !isEditing && (
                <DropdownMenu
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  modal={false}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem
                        onSelect={handleSelect(handleStartEdit)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit comment
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onSelect={handleSelect(() => setDeleteDialogOpen(true))}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete comment
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {isEditing ? (
              <div className="mt-1 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-7 px-2"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || isSaving}
                    className="h-7 px-2"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm">{currentContent}</div>
            )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CommentThread({
  thread,
  postId,
  postOwnerId,
  currentUserId,
  onReply,
  onDelete,
  onUpdate,
}: {
  thread: CommentThread;
  postId: number;
  postOwnerId: number;
  currentUserId: number | null;
  onReply: (parentId: number) => void;
  onDelete: (commentId: number) => void;
  onUpdate: (commentId: number, content: string) => void;
}) {
  return (
    <div>
      <CommentItem
        comment={thread.comment}
        postId={postId}
        postOwnerId={postOwnerId}
        currentUserId={currentUserId}
        onReply={onReply}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
      {thread.replies.length > 0 && (
        <div className="ml-11 border-l-2 border-border pl-4 space-y-2">
          {thread.replies.map((reply) => (
            <CommentThread
              key={reply.comment.id}
              thread={reply}
              postId={postId}
              postOwnerId={postOwnerId}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  postId,
  postOwnerId,
  isOpen,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [commentThreads, setCommentThreads] = useState<CommentThread[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const currentUserId = getSessionUserId(session);

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

  const handleDeleteComment = (commentId: number) => {
    // Refresh comments after deletion
    fetchComments();
  };

  const handleUpdateComment = (commentId: number, content: string) => {
    // The local state is already updated in CommentItem
    // Just log for now, could refresh if needed
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3">
        {commentThreads.map((thread) => (
          <CommentThread
            key={thread.comment.id}
            thread={thread}
            postId={postId}
            postOwnerId={postOwnerId}
            currentUserId={currentUserId}
            onReply={setReplyTo}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
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
