"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { Post } from "@/types/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostInteractions } from "./PostInteractions";
import { CommentSection } from "./CommentSection";
import { PostMediaDisplay } from "./PostMediaDisplay";
import { TextWithLinks } from "../TextWithLinks";
import { formatRelativeTime, getProfileUrl } from "@/lib/utils";

interface PostItemProps {
  post: Post;
  onPostUnsaved?: () => void;
}

export const PostItem = memo(function PostItem({
  post,
  onPostUnsaved,
}: PostItemProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);

  const userName = `${post.user.firstName} ${post.user.lastName}`;
  const profileUrl = getProfileUrl({
    publicUuid: post.user.publicUuid,
    username: post.user.username,
  });

  const handleCommentClick = () => {
    setCommentsOpen(!commentsOpen);
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md border-border/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Link href={profileUrl}>
            <Avatar className="h-12 w-12 ring-2 ring-primary/10 hover:ring-primary/20 transition-all duration-200">
              <AvatarImage
                src={post.user.profileImageUrl || undefined}
                alt={userName}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {post.user.firstName[0]}
                {post.user.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-3">
              <Link
                href={profileUrl}
                className="font-semibold text-foreground hover:text-primary transition-colors duration-200 truncate"
              >
                {userName}
              </Link>
              <span className="text-sm text-muted-foreground flex-shrink-0">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
            <div className="space-y-4">
              {post.content && (
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                  <TextWithLinks text={post.content} />
                </div>
              )}
              <PostMediaDisplay media={post.media || []} />
              <div className="pt-2">
                <PostInteractions
                  postId={post.id}
                  initialLikes={post.likeCount}
                  initialLiked={post.isLiked}
                  initialComments={post.commentCount}
                  initialSaved={post.isSaved}
                  onCommentClick={handleCommentClick}
                  postUuid={post.publicUuid}
                  onPostUnsaved={onPostUnsaved}
                />
              </div>
              <CommentSection postId={post.id} isOpen={commentsOpen} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
