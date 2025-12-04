"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import SessionGuard from "@/components/SessionGuard";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileAbout } from "@/components/profile/ProfileAbout";
import { KeyInformationSection } from "@/components/profile/KeyInformationSection";
import { AthleteMetricsSection } from "@/components/profile/AthleteMetricsSection";
import { RecentActivitySection } from "@/components/profile/RecentActivitySection";
import { ExperienceSection } from "@/components/profile/ExperienceSection";
import { EducationSection } from "@/components/profile/EducationSection";
import { CertificationsSection } from "@/components/profile/CertificationsSection";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { ExperienceModal } from "@/components/profile/ExperienceModal";
import { EducationModal } from "@/components/profile/EducationModal";
import { CertificationModal } from "@/components/profile/CertificationModal";
import { LanguageModal } from "@/components/profile/LanguageModal";
import { AwardModal } from "@/components/profile/AwardModal";
import { DeleteConfirmationDialog } from "@/components/profile/DeleteConfirmationDialog";
import {
  ExtendedUserProfile,
  ExperienceUI,
  EducationUI,
  CertificationUI,
  LanguageUI,
  AwardUI,
} from "@/types/prisma";
import { useExperience, useDeleteExperience } from "@/hooks/useExperience";
import { useEducation, useDeleteEducation } from "@/hooks/useEducation";
import {
  useCertifications,
  useDeleteCertification,
} from "@/hooks/useCertifications";
import { useLanguages, useDeleteLanguage } from "@/hooks/useLanguages";
import { useAwards, useDeleteAward } from "@/hooks/useAwards";

type Props = {
  profile: ExtendedUserProfile;
};

/**
 * Parse editingSection string to determine action type and entity ID
 */
function parseEditingSection(editingSection: string | null): {
  entityType: string | null;
  action: "add" | "edit" | "delete" | null;
  id: number | null;
} {
  if (!editingSection) {
    return { entityType: null, action: null, id: null };
  }

  const parts = editingSection.split("-");
  if (parts.length < 2) {
    return { entityType: null, action: null, id: null };
  }

  const entityType = parts[0]; // experience, education, certification, language, award
  const action = parts[1] as "add" | "edit" | "delete";
  const id = parts.length === 3 ? parseInt(parts[2], 10) : null;

  return { entityType, action, id };
}

export default function ProfilePageWrapper({ profile }: Props) {
  const { data: session } = useSession();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const visitRecordedRef = useRef(false);

  const isOwner = session?.user?.id === profile.userId.toString();
  const isAthlete = profile.roleName === "athlete";
  const isCoach = profile.roleName === "coach";

  // Parse current editing section
  const { entityType, action, id } = useMemo(
    () => parseEditingSection(editingSection),
    [editingSection]
  );

  // Fetch data for finding items to edit/delete
  const { data: experiences } = useExperience(profile.publicUuid);
  const { data: education } = useEducation(profile.publicUuid);
  const { data: certifications } = useCertifications(profile.publicUuid);
  const { data: languages } = useLanguages(profile.publicUuid);
  const { data: awards } = useAwards(profile.publicUuid);

  // Delete mutations
  const deleteExperience = useDeleteExperience(profile.publicUuid);
  const deleteEducation = useDeleteEducation(profile.publicUuid);
  const deleteCertification = useDeleteCertification(profile.publicUuid);
  const deleteLanguage = useDeleteLanguage(profile.publicUuid);
  const deleteAward = useDeleteAward(profile.publicUuid);

  // Find items for editing
  const editingExperience = useMemo<ExperienceUI | null>(() => {
    if (entityType === "experience" && action === "edit" && id && experiences) {
      return experiences.find((e) => e.id === id) ?? null;
    }
    return null;
  }, [entityType, action, id, experiences]);

  const editingEducation = useMemo<EducationUI | null>(() => {
    if (entityType === "education" && action === "edit" && id && education) {
      return education.find((e) => e.id === id) ?? null;
    }
    return null;
  }, [entityType, action, id, education]);

  const editingCertification = useMemo<CertificationUI | null>(() => {
    if (
      entityType === "certification" &&
      action === "edit" &&
      id &&
      certifications
    ) {
      return certifications.find((c) => c.id === id) ?? null;
    }
    return null;
  }, [entityType, action, id, certifications]);

  const editingLanguage = useMemo<LanguageUI | null>(() => {
    if (entityType === "language" && action === "edit" && id && languages) {
      return languages.find((l) => l.id === id) ?? null;
    }
    return null;
  }, [entityType, action, id, languages]);

  const editingAward = useMemo<AwardUI | null>(() => {
    if (entityType === "award" && action === "edit" && id && awards) {
      return awards.find((a) => a.id === id) ?? null;
    }
    return null;
  }, [entityType, action, id, awards]);

  // Delete confirmation state
  const isDeleting =
    deleteExperience.isPending ||
    deleteEducation.isPending ||
    deleteCertification.isPending ||
    deleteLanguage.isPending ||
    deleteAward.isPending;

  // Get delete item info for confirmation dialog
  const deleteItemInfo = useMemo(() => {
    if (action !== "delete" || !id) return null;

    switch (entityType) {
      case "experience": {
        const item = experiences?.find((e) => e.id === id);
        return item
          ? {
              title: "Delete Experience",
              description: `Are you sure you want to delete "${item.title}" at ${item.teamName}?`,
            }
          : null;
      }
      case "education": {
        const item = education?.find((e) => e.id === id);
        return item
          ? {
              title: "Delete Education",
              description: `Are you sure you want to delete "${item.title}"?`,
            }
          : null;
      }
      case "certification": {
        const item = certifications?.find((c) => c.id === id);
        return item
          ? {
              title: "Delete Certification",
              description: `Are you sure you want to delete "${item.title}"?`,
            }
          : null;
      }
      case "language": {
        const item = languages?.find((l) => l.id === id);
        return item
          ? {
              title: "Delete Language",
              description: `Are you sure you want to delete "${item.language}"?`,
            }
          : null;
      }
      case "award": {
        const item = awards?.find((a) => a.id === id);
        return item
          ? {
              title: "Delete Award",
              description: `Are you sure you want to delete "${item.title}"?`,
            }
          : null;
      }
      default:
        return null;
    }
  }, [
    entityType,
    action,
    id,
    experiences,
    education,
    certifications,
    languages,
    awards,
  ]);

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!id) return;

    try {
      switch (entityType) {
        case "experience":
          await deleteExperience.mutateAsync(id);
          toast.success("Experience deleted successfully");
          break;
        case "education":
          await deleteEducation.mutateAsync(id);
          toast.success("Education deleted successfully");
          break;
        case "certification":
          await deleteCertification.mutateAsync(id);
          toast.success("Certification deleted successfully");
          break;
        case "language":
          await deleteLanguage.mutateAsync(id);
          toast.success("Language deleted successfully");
          break;
        case "award":
          await deleteAward.mutateAsync(id);
          toast.success("Award deleted successfully");
          break;
      }
      setEditingSection(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete";
      toast.error(message);
    }
  };

  // Record profile visit when viewing someone else's profile
  useEffect(() => {
    // Only record if:
    // - Not the owner (no self-visits)
    // - Session is loaded
    // - Haven't already recorded this visit
    if (!isOwner && session?.user?.id && !visitRecordedRef.current) {
      visitRecordedRef.current = true;

      // Fire and forget - don't block rendering
      fetch(`/api/profile/${profile.publicUuid}/visit`, {
        method: "POST",
      }).catch((error) => {
        // Non-critical, just log
        console.error("Failed to record profile visit:", error);
      });
    }
  }, [isOwner, session?.user?.id, profile.publicUuid]);

  // Close modal handler
  const handleCloseModal = () => setEditingSection(null);

  return (
    <SessionGuard>
      <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-6 lg:px-8 pb-24 md:pb-6 overflow-x-hidden">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
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

          {/* Athlete-only: Key Information */}
          {isAthlete && (
            <KeyInformationSection
              profile={profile}
              isOwner={isOwner}
              currentlyEditing={editingSection}
              onSetEditing={setEditingSection}
            />
          )}

          {/* Athlete-only: Athlete Metrics */}
          {isAthlete && (
            <AthleteMetricsSection
              profile={profile}
              isOwner={isOwner}
              currentlyEditing={editingSection}
              onSetEditing={setEditingSection}
            />
          )}

          {/* Recent Activity (2 posts) */}
          <RecentActivitySection
            profile={profile}
            isOwner={isOwner}
            currentlyEditing={editingSection}
            onSetEditing={setEditingSection}
          />

          {/* Experience Section */}
          <ExperienceSection
            profile={profile}
            isOwner={isOwner}
            currentlyEditing={editingSection}
            onSetEditing={setEditingSection}
          />

          {/* Education Section */}
          <EducationSection
            profile={profile}
            isOwner={isOwner}
            currentlyEditing={editingSection}
            onSetEditing={setEditingSection}
          />

          {/* Coach-only: Certifications */}
          {isCoach && (
            <CertificationsSection
              profile={profile}
              isOwner={isOwner}
              currentlyEditing={editingSection}
              onSetEditing={setEditingSection}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <ProfileSidebar
          profile={profile}
          isOwner={isOwner}
          currentlyEditing={editingSection}
          onSetEditing={setEditingSection}
        />
      </div>

      {/* Experience Modal */}
      <ExperienceModal
        open={
          entityType === "experience" && (action === "add" || action === "edit")
        }
        onClose={handleCloseModal}
        uuid={profile.publicUuid}
        sportId={profile.sportId}
        experience={editingExperience}
      />

      {/* Education Modal */}
      <EducationModal
        open={
          entityType === "education" && (action === "add" || action === "edit")
        }
        onClose={handleCloseModal}
        uuid={profile.publicUuid}
        education={editingEducation}
      />

      {/* Certification Modal */}
      <CertificationModal
        open={
          entityType === "certification" &&
          (action === "add" || action === "edit")
        }
        onClose={handleCloseModal}
        uuid={profile.publicUuid}
        certification={editingCertification}
      />

      {/* Language Modal */}
      <LanguageModal
        open={
          entityType === "language" && (action === "add" || action === "edit")
        }
        onClose={handleCloseModal}
        uuid={profile.publicUuid}
        language={editingLanguage}
      />

      {/* Award Modal */}
      <AwardModal
        open={entityType === "award" && (action === "add" || action === "edit")}
        onClose={handleCloseModal}
        uuid={profile.publicUuid}
        award={editingAward}
      />

      {/* Delete Confirmation Dialog */}
      {deleteItemInfo && (
        <DeleteConfirmationDialog
          open={action === "delete"}
          onOpenChange={(open) => !open && setEditingSection(null)}
          onConfirm={handleDeleteConfirm}
          title={deleteItemInfo.title}
          description={deleteItemInfo.description}
          isDeleting={isDeleting}
        />
      )}
    </SessionGuard>
  );
}
