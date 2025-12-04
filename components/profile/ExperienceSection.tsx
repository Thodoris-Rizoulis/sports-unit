"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Edit3, Trash2, MapPin } from "lucide-react";
import { ExperienceSectionProps } from "@/types/components";
import { useExperience } from "@/hooks/useExperience";
import type { ExperienceUI } from "@/types/prisma";

/**
 * Format year range for display
 */
function formatYearRange(yearFrom: number, yearTo: number | null): string {
  if (yearTo === null) {
    return `${yearFrom} - Present`;
  }
  if (yearFrom === yearTo) {
    return `${yearFrom}`;
  }
  return `${yearFrom} - ${yearTo}`;
}

/**
 * ExperienceSection - Displays work/team experience entries
 */
export function ExperienceSection({
  profile,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: ExperienceSectionProps) {
  const { data: experiences, isLoading } = useExperience(profile.publicUuid);

  const hasExperiences = experiences && experiences.length > 0;

  if (isLoading) {
    return <ExperienceSectionSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="w-5 h-5" />
            Experience
          </CardTitle>
          {isOwner && (
            <Button
              onClick={() => onSetEditing("experience-add")}
              disabled={
                currentlyEditing !== null &&
                !currentlyEditing?.startsWith("experience")
              }
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                currentlyEditing && !currentlyEditing?.startsWith("experience")
                  ? `Finish editing ${currentlyEditing} first`
                  : undefined
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasExperiences ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {isOwner
                ? "Add your experience to showcase your career journey."
                : "No experience added yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <ExperienceItem
                key={exp.id}
                experience={exp}
                isOwner={isOwner}
                currentlyEditing={currentlyEditing}
                onEdit={() => onSetEditing(`experience-edit-${exp.id}`)}
                onDelete={() => onSetEditing(`experience-delete-${exp.id}`)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Single experience entry display
 */
function ExperienceItem({
  experience,
  isOwner,
  currentlyEditing,
  onEdit,
  onDelete,
}: {
  experience: ExperienceUI;
  isOwner: boolean;
  currentlyEditing: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isPresent = experience.yearTo === null;

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-foreground">{experience.title}</h4>
          {isPresent && (
            <Badge variant="secondary" className="text-xs">
              Current
            </Badge>
          )}
        </div>
        <p className="text-foreground/80 mt-1">{experience.teamName}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{formatYearRange(experience.yearFrom, experience.yearTo)}</span>
          {experience.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {experience.location}
            </span>
          )}
        </div>
      </div>
      {isOwner && (
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("experience")
            }
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("experience")
            }
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for ExperienceSection
 */
export function ExperienceSectionSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
