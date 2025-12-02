"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ChevronRight } from "lucide-react";
import { RecentActivitySectionProps } from "@/types/components";
import { useRecentPosts } from "@/hooks/useUserPosts";
import { PostItem } from "@/components/posts/PostItem";

// Generate slug from profile name
function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, "-");
}

/**
 * RecentActivitySection - Displays 2 most recent posts with "See All" link
 */
export function RecentActivitySection({
  profile,
  isOwner,
}: RecentActivitySectionProps) {
  const { data, isLoading } = useRecentPosts(profile.publicUuid);

  const posts = data?.pages?.[0]?.posts || [];
  const hasPosts = posts.length > 0;
  const slug = generateSlug(profile.firstName, profile.lastName);

  if (isLoading) {
    return <RecentActivitySectionSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          {hasPosts && (
            <Link
              href={`/profile/${profile.publicUuid}/${slug}/posts`}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              See All
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasPosts ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {isOwner
                ? "You haven't posted anything yet."
                : "No posts yet."}
            </p>
            {isOwner && (
              <Link href="/dashboard">
                <Button variant="outline" className="mt-3">
                  Create your first post
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.slice(0, 2).map((post) => (
              <PostItem key={post.publicUuid} post={post} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for RecentActivitySection
 */
export function RecentActivitySectionSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
