"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicProfile } from "@/components/onboarding/BasicProfile";
import { SportsDetails } from "@/components/onboarding/SportsDetails";
import { OnboardingInput } from "@/types/validation";

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();

          // Convert to OnboardingInput format
          setProfile({
            username: "current", // From session
            role: "athlete", // From DB
            basicProfile: {
              firstName: data.first_name,
              lastName: data.last_name,
              bio: data.bio || undefined,
              location: data.location || undefined,
              dateOfBirth: data.date_of_birth || undefined,
              height: data.height || undefined,
            },
            sportsDetails: {
              sportId: data.sport_id || 1,
              positionIds: data.positions
                ? (JSON.parse(data.positions) as number[])
                : [],
              teamId: data.team_id || undefined,
              openToOpportunities: data.open_to_opportunities,
              strongFoot: data.strong_foot as
                | "left"
                | "right"
                | "both"
                | undefined,
            },
            profilePictureUrl: data.profile_picture_url || undefined,
            coverPictureUrl: data.cover_picture_url || undefined,
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        router.push("/profile");
      } else {
        console.error("Failed to save profile");
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Update your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <BasicProfile
            value={profile.basicProfile}
            onChange={(basicProfile) =>
              setProfile({ ...profile, basicProfile })
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sports Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SportsDetails
            value={profile.sportsDetails}
            onChange={(sportsDetails) =>
              setProfile({ ...profile, sportsDetails })
            }
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
