"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import SessionGuard from "@/components/SessionGuard";
import { PostFeed } from "@/components/posts/PostFeed";

export default function SavedPage() {
  const { data: session } = useSession();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<number>>(new Set());

  const handlePostUnsaved = (postId: number) => {
    // Immediately hide the post from the UI
    setHiddenPostIds((prev) => new Set(prev).add(postId));

    // Trigger a refresh after a delay to ensure consistency
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
      // Clear hidden posts since they'll be refreshed from server
      setHiddenPostIds(new Set());
    }, 2000);
  };

  return (
    <SessionGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Posts</h1>
          <p className="text-gray-600">
            Your bookmarked posts, {session?.user?.name}
          </p>
        </div>

        <div>
          <PostFeed
            refreshTrigger={refreshTrigger}
            feedType="saved"
            optimisticPosts={[]}
            onPostUnsaved={handlePostUnsaved}
            excludePostIds={hiddenPostIds}
          />
        </div>
      </div>
    </SessionGuard>
  );
}
