"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut } from "lucide-react";
import { UserProfile } from "@/types/prisma";

/**
 * Prisma UserAttribute response shape (camelCase)
 */
interface UserAttributeResponse {
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
}

/**
 * ProfileWidget - Displays current authenticated user's profile information in a compact card format
 * Used in the left sidebar of shared layouts for dashboard and discovery pages
 *
 * Features:
 * - Fetches user profile data from /api/profile
 * - Shows loading skeleton during fetch
 * - Displays profile picture centered at top
 * - Shows name, username, team, location with icon
 * - Includes sign out button
 * - Clickable to navigate to user's profile page
 */
export default function ProfileWidget() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const userAttribute: UserAttributeResponse = await response.json();

        // Map UserAttribute to UserProfile format
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
          sportName: null, // API doesn't return sport name currently
        };

        setProfile(userProfile);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (loading) {
    return (
      <Card className="w-full max-w-sm pt-0">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !profile) {
    return (
      <Card className="w-full max-w-sm pt-0">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            {error || "Profile not available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm pt-0">
      {profile.openToOpportunities && (
        <div className="w-full bg-accent text-accent-foreground text-center py-2 text-sm font-medium rounded-t-lg">
          Open to Opportunities
        </div>
      )}
      <CardContent className="py-4 px-2">
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Picture */}
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={profile.profileImageUrl ?? undefined}
              alt={`${profile.username}'s profile`}
            />
            <AvatarFallback className="text-lg">
              {profile.firstName?.[0] ?? ""}
              {profile.lastName?.[0] ?? ""}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <div className="text-center">
            <h3 className="font-semibold text-sm">
              {profile.firstName} {profile.lastName}
            </h3>
          </div>

          {/* Username */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>

          {/* Team Name */}
          {profile.teamName && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {profile.teamName}
              </p>
            </div>
          )}

          {/* Location */}
          {profile.location && (
            <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Divider */}
          <hr className="w-full border-border" />

          {/* Sign Out Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
