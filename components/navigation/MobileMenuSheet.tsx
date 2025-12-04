"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  UserIcon,
  BookmarkIcon,
  QueueListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import {
  LogOut,
  Eye,
  Heart,
  TrendingUp,
  Hash,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile, PopularHashtagsResponse } from "@/types/prisma";
import type { ProfileAnalyticsData } from "@/types/analytics";

type MobileMenuSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Response shape from /api/profile
 */
type UserAttributeResponse = {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  location: string | null;
  dateOfBirth: string | null;
  height: number | null;
  profilePictureUrl: string | null;
  coverPictureUrl: string | null;
  sportId: number | null;
  positions: number[];
  teamId: number | null;
  teamName?: string;
  openToOpportunities: boolean;
};

const navigationItems = [
  { name: "Network", href: "/network", icon: UserIcon },
  { name: "Saved", href: "/saved", icon: BookmarkIcon },
  { name: "Watchlists", href: "/watchlists", icon: QueueListIcon },
];

async function fetchPopularHashtags(): Promise<PopularHashtagsResponse> {
  const res = await fetch("/api/hashtags/popular");
  if (!res.ok) {
    throw new Error("Failed to fetch popular hashtags");
  }
  return res.json();
}

/**
 * MobileMenuSheet - Bottom sheet menu for mobile navigation
 * Contains profile summary, analytics, navigation links, hashtags, and sign out
 */
export function MobileMenuSheet({ open, onOpenChange }: MobileMenuSheetProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalyticsData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Fetch popular hashtags
  const { data: hashtagsData } = useQuery({
    queryKey: ["popular-hashtags"],
    queryFn: fetchPopularHashtags,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: open, // Only fetch when sheet is open
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user || !open) return;

      try {
        setLoadingProfile(true);
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");

        const userAttribute: UserAttributeResponse = await response.json();
        const userProfile: UserProfile = {
          userId: userAttribute.userId,
          publicUuid: session.user.publicUuid,
          firstName: userAttribute.firstName ?? "",
          lastName: userAttribute.lastName ?? "",
          username: session.user.username,
          teamId: userAttribute.teamId ?? null,
          teamName: userAttribute.teamName ?? null,
          location: userAttribute.location ?? null,
          bio: userAttribute.bio ?? null,
          coverImageUrl: userAttribute.coverPictureUrl ?? null,
          profileImageUrl: userAttribute.profilePictureUrl ?? null,
          openToOpportunities: userAttribute.openToOpportunities,
          sportId: userAttribute.sportId ?? null,
          sportName: null,
        };
        setProfile(userProfile);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [session, open]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user || !open) return;

      try {
        setLoadingAnalytics(true);
        const response = await fetch("/api/profile/analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics");

        const data: ProfileAnalyticsData = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [session, open]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleNavigation = () => {
    onOpenChange(false);
  };

  const profileHref =
    session?.user?.publicUuid && session?.user?.username
      ? `/profile/${session.user.publicUuid}/${session.user.username}`
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-left">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu with profile, analytics, and quick links
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {/* Profile Card */}
          <div className="bg-accent/50 rounded-xl p-4">
            {loadingProfile ? (
              <div className="flex items-center space-x-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ) : profile ? (
              <Link
                href={profileHref || "#"}
                onClick={handleNavigation}
                className="flex items-center space-x-3"
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={profile.profileImageUrl ?? undefined}
                    alt={`${profile.username}'s profile`}
                  />
                  <AvatarFallback className="text-lg">
                    {profile.firstName?.[0] ?? ""}
                    {profile.lastName?.[0] ?? ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    {profile.openToOpportunities && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Open
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    @{profile.username}
                  </p>
                  {profile.location && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">
                Profile not available
              </p>
            )}
          </div>

          {/* Analytics Summary */}
          <div className="bg-accent/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Your Analytics
              </span>
              {analytics && (
                <span className="text-xs text-muted-foreground">
                  (Last {analytics.periodDays} days)
                </span>
              )}
            </div>
            {loadingAnalytics ? (
              <div className="flex justify-around">
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
              </div>
            ) : analytics ? (
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.profileViews}
                  </p>
                  <p className="text-xs text-muted-foreground">Profile Views</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.postImpressions}
                  </p>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Analytics not available
              </p>
            )}
          </div>

          <Separator />

          {/* Navigation Links */}
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavigation}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <Separator />

          {/* Popular Hashtags */}
          {hashtagsData?.hashtags && hashtagsData.hashtags.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3 px-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Trending Hashtags
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtagsData.hashtags.slice(0, 8).map((hashtag) => (
                  <Link
                    key={hashtag.id}
                    href={`/hashtag/${hashtag.name}`}
                    onClick={handleNavigation}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-accent rounded-full hover:bg-accent/80 transition-colors"
                  >
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {hashtag.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Sign Out */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
