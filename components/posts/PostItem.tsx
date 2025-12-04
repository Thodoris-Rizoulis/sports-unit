"use client";

import { useState, memo, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Post } from "@/types/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { PostInteractions } from "./PostInteractions";
import { CommentSection } from "./CommentSection";
import { PostMediaDisplay } from "./PostMediaDisplay";
import { PostEditModal } from "./PostEditModal";
import { TextWithLinks } from "../TextWithLinks";
import { formatRelativeTime, getProfileUrl } from "@/lib/utils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface PostItemProps {
  post: Post;
  onPostUnsaved?: () => void;
  onPostDeleted?: (postId: number) => void;
  onPostUpdated?: (post: Post) => void;
}

export const PostItem = memo(function PostItem({
  post,
  onPostUnsaved,
  onPostDeleted,
  onPostUpdated,
}: PostItemProps) {
  const { data: session } = useSession();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [menuOpen, setMenuOpen] = useState(false);
  const [canSelect, setCanSelect] = useState(false);

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

  const isOwner = session?.user?.id === String(currentPost.user.id);
  const userName = `${currentPost.user.firstName} ${currentPost.user.lastName}`;
  const profileUrl = getProfileUrl({
    publicUuid: currentPost.user.publicUuid,
    username: currentPost.user.username,
  });

  const handleCommentClick = () => {
    setCommentsOpen(!commentsOpen);
  };

  const handleSelect = (callback: () => void) => (e: Event) => {
    e.preventDefault();
    if (!canSelect) {
      return;
    }
    setMenuOpen(false);
    // Delay the callback to prevent scroll jump when modal opens
    requestAnimationFrame(() => {
      callback();
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${currentPost.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");

      setDeleteDialogOpen(false);
      onPostDeleted?.(currentPost.id);
    } catch (error) {
      console.error("Delete post error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setCurrentPost(updatedPost);
    onPostUpdated?.(updatedPost);
  };

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-md border-border/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start space-x-3 md:space-x-4">
            <Link href={profileUrl} className="flex-shrink-0">
              <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-primary/10 hover:ring-primary/20 transition-all duration-200">
                <AvatarImage
                  src={currentPost.user.profileImageUrl || undefined}
                  alt={userName}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentPost.user.firstName[0]}
                  {currentPost.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Link
                    href={profileUrl}
                    className="font-semibold text-foreground hover:text-primary transition-colors duration-200 truncate"
                  >
                    {userName}
                  </Link>
                  <span className="text-sm text-muted-foreground flex-shrink-0">
                    {formatRelativeTime(currentPost.createdAt)}
                  </span>
                </div>
                {isOwner && (
                  <DropdownMenu
                    open={menuOpen}
                    onOpenChange={setMenuOpen}
                    modal={false}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="Post options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={handleSelect(() => setEditModalOpen(true))}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={handleSelect(() => setDeleteDialogOpen(true))}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="space-y-4">
                {currentPost.content && (
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                    <TextWithLinks text={currentPost.content} />
                  </div>
                )}
                <PostMediaDisplay media={currentPost.media || []} />
                <div className="pt-2">
                  <PostInteractions
                    postId={currentPost.id}
                    initialLikes={currentPost.likeCount}
                    initialLiked={currentPost.isLiked}
                    initialComments={currentPost.commentCount}
                    initialSaved={currentPost.isSaved}
                    onCommentClick={handleCommentClick}
                    postUuid={currentPost.publicUuid}
                    onPostUnsaved={onPostUnsaved}
                  />
                </div>
                <CommentSection
                  postId={currentPost.id}
                  postOwnerId={currentPost.user.id}
                  isOpen={commentsOpen}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <PostEditModal
        post={currentPost}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onPostUpdated={handlePostUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
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
});
