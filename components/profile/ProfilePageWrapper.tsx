"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import SessionGuard from "@/components/SessionGuard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileAbout } from "@/components/profile/ProfileAbout";
import { UserProfile } from "@/types/prisma";

interface Props {
  profile: UserProfile;
}

export default function ProfilePageWrapper({ profile }: Props) {
  const { data: session } = useSession();
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const isOwner = session?.user?.id === profile.userId.toString();

  return (
    <SessionGuard>
      <div className="space-y-6">
        <ProfileHero
          profile={profile}
          isOwner={isOwner}
          currentlyEditing={editingSection}
          onSetEditing={setEditingSection}
        />
        <ProfileAbout
          profile={profile}
          isOwner={isOwner}
          currentlyEditing={editingSection}
          onSetEditing={setEditingSection}
        />
      </div>
    </SessionGuard>
  );
}
