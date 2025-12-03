"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Plus, Edit3, Trash2 } from "lucide-react";
import { EducationSectionProps } from "@/types/components";
import { useEducation } from "@/hooks/useEducation";
import type { EducationUI } from "@/types/prisma";

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
 * EducationSection - Displays education history entries
 */
export function EducationSection({
  profile,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: EducationSectionProps) {
  const { data: education, isLoading } = useEducation(profile.publicUuid);

  const hasEducation = education && education.length > 0;

  if (isLoading) {
    return <EducationSectionSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <GraduationCap className="w-5 h-5" />
            Education
          </CardTitle>
          {isOwner && (
            <Button
              onClick={() => onSetEditing("education-add")}
              disabled={
                currentlyEditing !== null &&
                !currentlyEditing?.startsWith("education")
              }
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                currentlyEditing && !currentlyEditing?.startsWith("education")
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
        {!hasEducation ? (
          <div className="text-center py-6">
            <p className="text-gray-500">
              {isOwner
                ? "Add your education background."
                : "No education added yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => (
              <EducationItem
                key={edu.id}
                education={edu}
                isOwner={isOwner}
                currentlyEditing={currentlyEditing}
                onEdit={() => onSetEditing(`education-edit-${edu.id}`)}
                onDelete={() => onSetEditing(`education-delete-${edu.id}`)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Single education entry display
 */
function EducationItem({
  education,
  isOwner,
  currentlyEditing,
  onEdit,
  onDelete,
}: {
  education: EducationUI;
  isOwner: boolean;
  currentlyEditing: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isPresent = education.yearTo === null;

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900">{education.title}</h4>
          {isPresent && (
            <Badge variant="secondary" className="text-xs">
              Current
            </Badge>
          )}
        </div>
        {education.subtitle && (
          <p className="text-gray-700 mt-1">{education.subtitle}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {formatYearRange(education.yearFrom, education.yearTo)}
        </p>
      </div>
      {isOwner && (
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("education")
            }
            className="text-gray-500 hover:text-gray-700"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("education")
            }
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for EducationSection
 */
export function EducationSectionSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-28" />
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
