"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Languages, Plus, Edit3, Trash2 } from "lucide-react";
import { LanguagesWidgetProps } from "@/types/components";
import { useLanguages } from "@/hooks/useLanguages";
import type { LanguageUI } from "@/types/prisma";

/**
 * Map language level to badge variant/color
 */
const levelStyles: Record<
  LanguageUI["level"],
  { variant: "default" | "secondary" | "outline"; className: string }
> = {
  native: {
    variant: "default",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  fluent: {
    variant: "secondary",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  proficient: {
    variant: "secondary",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  },
  intermediate: {
    variant: "outline",
    className: "border-orange-300 text-orange-700",
  },
  basic: { variant: "outline", className: "border-gray-300 text-gray-600" },
};

/**
 * Format level for display
 */
function formatLevel(level: LanguageUI["level"]): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

/**
 * LanguagesWidget - Displays user's languages in sidebar
 */
export function LanguagesWidget({
  uuid,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: LanguagesWidgetProps) {
  const { data: languages, isLoading } = useLanguages(uuid);

  const hasLanguages = languages && languages.length > 0;

  if (isLoading) {
    return <LanguagesWidgetSkeleton />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Languages className="w-5 h-5" />
            Languages
          </CardTitle>
          {isOwner && (
            <Button
              onClick={() => onSetEditing("language-add")}
              disabled={
                currentlyEditing !== null &&
                !currentlyEditing?.startsWith("language")
              }
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
              title={
                currentlyEditing && !currentlyEditing?.startsWith("language")
                  ? `Finish editing ${currentlyEditing} first`
                  : "Add language"
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasLanguages ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              {isOwner ? "Add languages you speak." : "No languages added."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {languages.map((lang) => (
              <LanguageItem
                key={lang.id}
                language={lang}
                isOwner={isOwner}
                currentlyEditing={currentlyEditing}
                onEdit={() => onSetEditing(`language-edit-${lang.id}`)}
                onDelete={() => onSetEditing(`language-delete-${lang.id}`)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Single language entry display
 */
function LanguageItem({
  language,
  isOwner,
  currentlyEditing,
  onEdit,
  onDelete,
}: {
  language: LanguageUI;
  isOwner: boolean;
  currentlyEditing: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const style = levelStyles[language.level];

  return (
    <div className="flex items-center justify-between py-1.5 group">
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">{language.language}</span>
        <Badge variant={style.variant} className={`text-xs ${style.className}`}>
          {formatLevel(language.level)}
        </Badge>
      </div>
      {isOwner && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("language")
            }
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={
              currentlyEditing !== null &&
              !currentlyEditing?.startsWith("language")
            }
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton for LanguagesWidget
 */
export function LanguagesWidgetSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
