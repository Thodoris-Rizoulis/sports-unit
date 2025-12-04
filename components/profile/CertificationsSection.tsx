"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Plus, Edit3, Trash2, Building2 } from "lucide-react";
import { CertificationsSectionProps } from "@/types/components";
import { useCertifications } from "@/hooks/useCertifications";
import type { CertificationUI } from "@/types/prisma";

/**
 * CertificationsSection - Displays licenses and certifications
 * Only visible to coaches (roleName === 'coach')
 */
export function CertificationsSection({
  profile,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: CertificationsSectionProps) {
  // Only show for coaches
  if (profile.roleName !== "coach") {
    return null;
  }

  const { data: certifications, isLoading } = useCertifications(
    profile.publicUuid
  );

  const hasCertifications = certifications && certifications.length > 0;

  if (isLoading) {
    return <CertificationsSectionSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Award className="w-5 h-5" />
            Licenses & Certifications
          </CardTitle>
          {isOwner && (
            <Button
              onClick={() => onSetEditing("certification-add")}
              disabled={
                currentlyEditing !== null &&
                !currentlyEditing?.startsWith("certification")
              }
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                currentlyEditing &&
                !currentlyEditing?.startsWith("certification")
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
        {!hasCertifications ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {isOwner
                ? "Add your licenses and certifications."
                : "No certifications added yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert) => (
              <CertificationItem
                key={cert.id}
                certification={cert}
                isOwner={isOwner}
                currentlyEditing={currentlyEditing}
                onEdit={() => onSetEditing(`certification-edit-${cert.id}`)}
                onDelete={() => onSetEditing(`certification-delete-${cert.id}`)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Single certification entry display
 */
function CertificationItem({
  certification,
  isOwner,
  currentlyEditing,
  onEdit,
  onDelete,
}: {
  certification: CertificationUI;
  isOwner: boolean;
  currentlyEditing: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <h4 className="font-semibold text-foreground">{certification.title}</h4>
        {certification.organization && (
          <p className="flex items-center gap-1 text-foreground/80 mt-1">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            {certification.organization}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {certification.year}
        </p>
        {certification.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {certification.description}
          </p>
        )}
      </div>
      {isOwner && (
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("certification")
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
              !currentlyEditing?.startsWith("certification")
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
 * Loading skeleton for CertificationsSection
 */
export function CertificationsSectionSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
