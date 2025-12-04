"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Plus, Edit3, Trash2 } from "lucide-react";
import { AwardsWidgetProps } from "@/types/components";
import { useAwards } from "@/hooks/useAwards";
import type { AwardUI } from "@/types/prisma";

/**
 * AwardsWidget - Displays user's awards in sidebar
 */
export function AwardsWidget({
  uuid,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: AwardsWidgetProps) {
  const { data: awards, isLoading } = useAwards(uuid);

  const hasAwards = awards && awards.length > 0;

  if (isLoading) {
    return <AwardsWidgetSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Awards
          </CardTitle>
          {isOwner && (
            <Button
              onClick={() => onSetEditing("award-add")}
              disabled={
                currentlyEditing !== null &&
                !currentlyEditing?.startsWith("award")
              }
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              title={
                currentlyEditing && !currentlyEditing?.startsWith("award")
                  ? `Finish editing ${currentlyEditing} first`
                  : "Add award"
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasAwards ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {isOwner ? "Showcase your achievements." : "No awards added."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {awards.map((award) => (
              <AwardItem
                key={award.id}
                award={award}
                isOwner={isOwner}
                currentlyEditing={currentlyEditing}
                onEdit={() => onSetEditing(`award-edit-${award.id}`)}
                onDelete={() => onSetEditing(`award-delete-${award.id}`)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Single award entry display
 */
function AwardItem({
  award,
  isOwner,
  currentlyEditing,
  onEdit,
  onDelete,
}: {
  award: AwardUI;
  isOwner: boolean;
  currentlyEditing: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between py-1 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {award.title}
          </span>
          <span className="text-sm text-muted-foreground shrink-0">
            {award.year}
          </span>
        </div>
        {award.description && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {award.description}
          </p>
        )}
      </div>
      {isOwner && (
        <div className="flex items-center gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("award")
            }
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("award")
            }
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for AwardsWidget
 */
export function AwardsWidgetSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="py-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-3 w-full mt-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
