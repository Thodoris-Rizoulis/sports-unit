"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileAbout } from "@/components/profile/ProfileAbout";
import { UserProfile } from "@/types/profile";
import SessionGuard from "@/components/SessionGuard";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetch(`/api/profile/${username}`)
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(() => {
          setProfile(null);
          setLoading(false);
        });
    }
  }, [username]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const isOwner = session?.user?.id === profile.userId.toString();

  return (
    <SessionGuard>
      <div className="space-y-6">
        <ProfileHero profile={profile} isOwner={isOwner} />
        <ProfileAbout profile={profile} isOwner={isOwner} />
      </div>
    </SessionGuard>
  );
}
