"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Edit3, MessageSquare, Loader2 } from "lucide-react";
import { useUpdateProfile, useProfile } from "@/hooks/useProfile";
import { EditProfileForm } from "@/types/profile";
import { getProfileUrl } from "@/lib/utils";
import { ProfileHeroProps } from "@/types/components";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "./EditProfileModal";
import { useImageUpload } from "@/hooks/useImageUpload";
import { ConnectionButton } from "@/components/connections/ConnectionButton";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useGetOrCreateConversation } from "@/hooks/useMessaging";

/**
 * SendMessageButton Component
 * Shows "Send message" button for connected users only
 */
function SendMessageButton({ targetUserId }: { targetUserId: number }) {
  const router = useRouter();
  const { data: connectionStatus } = useConnectionStatus(targetUserId);
  const getOrCreateConversation = useGetOrCreateConversation();

  // Only show for connected users
  const isConnected = connectionStatus?.status === "connected";

  if (!isConnected) {
    return null;
  }

  const handleClick = async () => {
    try {
      const result = await getOrCreateConversation.mutateAsync(targetUserId);
      // Navigate to inbox with the conversation
      router.push(`/inbox?c=${result.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      disabled={getOrCreateConversation.isPending}
      className="gap-2"
    >
      {getOrCreateConversation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      Message
    </Button>
  );
}

export function ProfileHero({
  profile,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: ProfileHeroProps) {
  const [hoveredImage, setHoveredImage] = useState<"cover" | "profile" | null>(
    null
  );
  const { data: cachedProfile } = useProfile(
    // Use the stable public UUID as the canonical identifier
    (profile as { publicUuid?: string }).publicUuid
  );
  const activeProfile = cachedProfile ?? profile;

  const coverUpload = useImageUpload(activeProfile, "cover");
  const profileUpload = useImageUpload(activeProfile, "profile");

  const [isSaving, setIsSaving] = useState(false);

  const updateProfileMutation = useUpdateProfile();
  const router = useRouter();

  const handleHeroSave = async (data: EditProfileForm) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        sportId: activeProfile.sportId ?? undefined,
      };

      const updated = await updateProfileMutation.mutateAsync(payload);

      // If username changed, update URL
      if (updated && updated.username !== activeProfile.username) {
        const url = getProfileUrl(
          updated as { publicUuid?: string; username: string }
        );
        router.replace(url);
      }

      onSetEditing(null);
    } catch (err) {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const onFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "profile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === "cover") coverUpload.handleUpload(file);
    else profileUpload.handleUpload(file);
    e.currentTarget.value = "";
  };

  return (
    <>
      <Card className="w-full overflow-hidden">
        <CardContent className="p-0">
          {/* Cover Image Section */}
          <div
            className="relative h-64 md:h-80 bg-linear-to-br from-blue-400 to-purple-600 group"
            onMouseEnter={() => isOwner && setHoveredImage("cover")}
            onMouseLeave={() =>
              setHoveredImage((h) => (h === "cover" ? null : h))
            }
          >
            <Image
              src={coverUpload.preview || "/default_cover.webp"}
              alt="Cover image"
              fill
              className="object-cover"
              loading="eager"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

            {isOwner && hoveredImage === "cover" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileChange(e, "cover")}
                    disabled={coverUpload.uploading}
                  />
                  <div className="bg-background/90 hover:bg-background text-foreground font-medium px-4 py-2 rounded-lg inline-flex items-center transition-colors">
                    {coverUpload.uploading ? "Uploading..." : "Change Cover"}
                  </div>
                </label>
              </div>
            )}

            {/* Profile Avatar - positioned to overlap cover */}
            <div
              className="absolute -bottom-8 left-6 md:left-8 group/avatar"
              onMouseEnter={() => isOwner && setHoveredImage("profile")}
              onMouseLeave={() =>
                setHoveredImage((h) => (h === "profile" ? null : h))
              }
            >
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg relative">
                <AvatarImage
                  src={profileUpload.preview || "/default_profile.jpg"}
                  alt="Profile picture"
                />
                <AvatarFallback className="text-xl md:text-2xl bg-muted">
                  {activeProfile.firstName?.[0] ?? ""}
                  {activeProfile.lastName?.[0] ?? ""}
                </AvatarFallback>

                {isOwner && hoveredImage === "profile" && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity duration-200">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onFileChange(e, "profile")}
                        disabled={profileUpload.uploading}
                      />
                      <div className="bg-background/90 hover:bg-background text-foreground font-medium rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                        {profileUpload.uploading ? "..." : "+"}
                      </div>
                    </label>
                  </div>
                )}
              </Avatar>
            </div>
          </div>

          {/* User Info Section */}
          <div className="pt-12 pb-6 px-6 md:px-8 relative">
            {/* Icon edit button at top-right of the bottom area */}
            {isOwner && (
              <div className="absolute top-4 right-4 z-40">
                <Button
                  onClick={() => onSetEditing("hero")}
                  variant="ghost"
                  size="sm"
                  aria-label="Edit profile"
                  title={
                    currentlyEditing && currentlyEditing !== "hero"
                      ? `Finish editing ${currentlyEditing} first`
                      : undefined
                  }
                  disabled={
                    currentlyEditing !== null && currentlyEditing !== "hero"
                  }
                  className="p-2 rounded-full bg-white/80 hover:bg-white"
                >
                  <Edit3 className="w-4 h-4 text-foreground" />
                </Button>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {activeProfile.firstName} {activeProfile.lastName}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    @{activeProfile.username}
                  </p>
                </div>
                {(activeProfile.teamName || activeProfile.location) && (
                  <p className="text-foreground/80 mb-3 flex items-center gap-2">
                    {activeProfile.teamName && (
                      <span className="font-medium">
                        {activeProfile.teamName}
                      </span>
                    )}
                    {activeProfile.teamName && activeProfile.location && (
                      <span>•</span>
                    )}
                    {activeProfile.location && (
                      <span>{activeProfile.location}</span>
                    )}
                  </p>
                )}

                {activeProfile.openToOpportunities && (
                  <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-accent/30 px-3 py-1 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Open to opportunities
                  </Badge>
                )}
              </div>

              {!isOwner && (
                <div className="flex-shrink-0 flex items-center gap-2">
                  <ConnectionButton targetUserId={activeProfile.userId} />
                  <SendMessageButton targetUserId={activeProfile.userId} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProfileModal
        open={currentlyEditing === "hero"}
        onClose={() => onSetEditing(null)}
        profile={activeProfile}
        onSave={handleHeroSave}
        isSaving={isSaving}
      />
    </>
  );
}

export default ProfileHero;
