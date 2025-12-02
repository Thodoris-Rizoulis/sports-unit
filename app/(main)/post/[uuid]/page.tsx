"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SessionGuard from "@/components/SessionGuard";
import { Post } from "@/types/prisma";
import { PostItem } from "@/components/posts/PostItem";
import { Card, CardContent } from "@/components/ui/card";

export default function PostPage() {
  const { data: session } = useSession();
  const params = useParams();
  const uuid = params.uuid as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/by-uuid/${uuid}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Post not found");
          } else {
            throw new Error("Failed to fetch post");
          }
          return;
        }
        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    if (uuid) {
      fetchPost();
    }
  }, [uuid]);

  if (loading) {
    return (
      <SessionGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading post...</p>
          </div>
        </div>
      </SessionGuard>
    );
  }

  if (error || !post) {
    return (
      <SessionGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
              <p className="text-gray-600">
                {error ||
                  "The post you're looking for doesn't exist or has been removed."}
              </p>
            </CardContent>
          </Card>
        </div>
      </SessionGuard>
    );
  }

  return (
    <SessionGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post</h1>
          <p className="text-gray-600">
            Shared post from {session?.user?.name}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <PostItem post={post} />
        </div>
      </div>
    </SessionGuard>
  );
}
