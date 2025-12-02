"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import SessionGuard from "@/components/SessionGuard";
import { PostCreationForm } from "@/components/posts/PostCreationForm";
import { PostFeed } from "@/components/posts/PostFeed";

import { Post } from "@/types/prisma";

export default function Dashboard() {
  const { data: session } = useSession();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [optimisticPosts, setOptimisticPosts] = useState<Post[]>([]);
  const postFormRef = useRef<HTMLDivElement>(null);

  const handlePostCreated = (newPost: Post) => {
    // Add to optimistic posts for immediate UI update
    setOptimisticPosts((prev) => [newPost, ...prev]);

    // Trigger a refresh after a delay to ensure consistency
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
      // Clear optimistic posts since they're now in the fetched posts
      setOptimisticPosts([]);
    }, 2000);
  };

  return (
    <SessionGuard>
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div ref={postFormRef}>
          <PostCreationForm onPostCreated={handlePostCreated} />
        </div>

        <div>
          <PostFeed
            refreshTrigger={refreshTrigger}
            optimisticPosts={optimisticPosts}
          />
        </div>
      </div>
    </SessionGuard>
  );
}
