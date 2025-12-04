"use client";

/**
 * Reusable Loading Skeletons
 * Consistent loading states across the application.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

/**
 * Post card skeleton for feed loading states
 */
export function PostSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "border rounded-lg p-6 bg-card/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex space-x-4 pt-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Post feed skeleton (multiple posts)
 */
export function PostFeedSkeleton({
  count = 5,
  className,
}: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Profile card skeleton
 */
export function ProfileCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("border rounded-lg p-4 bg-card", className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * User list skeleton
 */
export function UserListSkeleton({
  count = 5,
  className,
}: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ProfileCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Notification item skeleton
 */
export function NotificationSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-start space-x-3 p-4", className)}>
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

/**
 * Conversation list skeleton
 */
export function ConversationSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center space-x-3 p-4", className)}>
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

/**
 * Message bubble skeleton
 */
export function MessageSkeleton({
  isOwn = false,
  className,
}: SkeletonProps & { isOwn?: boolean }) {
  return (
    <div
      className={cn("flex", isOwn ? "justify-end" : "justify-start", className)}
    >
      <Skeleton
        className={cn(
          "h-10 rounded-2xl",
          isOwn ? "w-32 bg-primary/20" : "w-48"
        )}
      />
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function PageLoading({ className }: SkeletonProps) {
  return (
    <div
      className={cn("flex items-center justify-center min-h-[60vh]", className)}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner
 */
export function InlineLoading({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center justify-center py-4", className)}>
      <div className="flex space-x-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
        <div
          className="h-2 w-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="h-2 w-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
    </div>
  );
}

/**
 * Card loading state
 */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("border rounded-lg p-4 bg-card", className)}>
      <Skeleton className="h-5 w-1/3 mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
