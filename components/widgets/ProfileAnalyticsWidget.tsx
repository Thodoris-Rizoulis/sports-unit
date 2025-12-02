"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart } from "lucide-react";
import type { ProfileAnalyticsData } from "@/types/analytics";

/**
 * ProfileAnalyticsWidget - Displays profile analytics for the authenticated user
 * Shows profile views and post impressions for the last 7 days
 *
 * Features:
 * - Fetches analytics data from /api/profile/analytics
 * - Shows loading skeleton during fetch
 * - Displays profile views (unique visitors)
 * - Displays post impressions (likes received)
 * - Only visible to authenticated users
 */
export default function ProfileAnalyticsWidget() {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState<ProfileAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/profile/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data: ProfileAnalyticsData = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Unable to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session]);

  // Don't render anything while session is loading or if user is not authenticated
  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-8" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            {error || "Analytics not available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Last {analytics.periodDays} days
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col space-y-3">
          {/* Profile Views */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Profile Views
              </span>
            </div>
            <span className="text-lg font-semibold">
              {analytics.profileViews}
            </span>
          </div>

          {/* Post Impressions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Post Impressions
              </span>
            </div>
            <span className="text-lg font-semibold">
              {analytics.postImpressions}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
