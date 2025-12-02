"use client";

import { LanguagesWidget } from "./LanguagesWidget";
import { AwardsWidget } from "./AwardsWidget";
import { ProfileSidebarProps } from "@/types/components";

/**
 * ProfileSidebar - Container for sidebar widgets
 * Responsive: Right sidebar on desktop (lg+), below content on mobile/tablet
 */
export function ProfileSidebar({
  profile,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: ProfileSidebarProps) {
  return (
    <aside className="w-full lg:w-80 space-y-4">
      <LanguagesWidget
        uuid={profile.publicUuid}
        isOwner={isOwner}
        currentlyEditing={currentlyEditing}
        onSetEditing={onSetEditing}
      />
      <AwardsWidget
        uuid={profile.publicUuid}
        isOwner={isOwner}
        currentlyEditing={currentlyEditing}
        onSetEditing={onSetEditing}
      />
    </aside>
  );
}
