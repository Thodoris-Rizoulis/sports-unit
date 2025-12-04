"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit3, User, Calendar, Ruler, MapPin, Footprints } from "lucide-react";
import { KeyInformationSectionProps } from "@/types/components";
import { useQuery } from "@tanstack/react-query";
import type { Position } from "@/types/prisma";
import { KeyInfoEditModal } from "./KeyInfoEditModal";
import { useKeyInfo } from "@/hooks/useKeyInfo";

/**
 * KeyInformationSection - Displays athlete key information
 * Only visible to athletes (roleName === 'athlete')
 */
export function KeyInformationSection({
  profile,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: KeyInformationSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook must be called before any conditional returns
  const { data: keyInfo, isLoading } = useKeyInfo(profile.publicUuid);

  // Fetch positions to display names (must be before any conditional returns)
  const { data: positions } = useQuery<Position[]>({
    queryKey: ["positions", profile.sportId],
    queryFn: async () => {
      if (!profile.sportId) return [];
      const res = await fetch(`/api/positions?sportId=${profile.sportId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.positions || data;
    },
    enabled:
      profile.roleName === "athlete" &&
      !!profile.sportId &&
      !!keyInfo?.positions?.length,
  });

  // Only show for athletes (after all hooks)
  if (profile.roleName !== "athlete") {
    return null;
  }

  const handleOpenModal = () => {
    onSetEditing("keyInfo");
    setIsModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      onSetEditing(null);
    }
  };

  // Format date of birth
  const formatDateOfBirth = (date: Date | null) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate age from DOB
  const calculateAge = (date: Date | null) => {
    if (!date) return null;
    const dob = new Date(date);
    const today = new Date();
    if (dob > today) return null;
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  };

  // Get position names from IDs
  const getPositionNames = () => {
    if (!keyInfo?.positions || keyInfo.positions.length === 0) {
      return "Not specified";
    }
    if (!positions || positions.length === 0) {
      return keyInfo.positions.join(", ");
    }
    const positionNames = keyInfo.positions
      .map((id: number) => positions.find((p) => p.id === id)?.name)
      .filter(Boolean);
    return positionNames.length > 0
      ? positionNames.join(", ")
      : "Not specified";
  };

  // Format height
  const formatHeight = (height: number | null) => {
    if (!height) return "Not specified";
    return `${height} cm`;
  };

  // Format strong foot
  const formatStrongFoot = (foot: string | null) => {
    if (!foot) return "Not specified";
    return foot.charAt(0).toUpperCase() + foot.slice(1);
  };

  if (isLoading) {
    return <KeyInformationSectionSkeleton />;
  }

  const age = calculateAge(keyInfo?.dateOfBirth ?? null);

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5" />
              Key Information
            </CardTitle>
            {isOwner && (
              <Button
                onClick={handleOpenModal}
                disabled={
                  currentlyEditing !== null && currentlyEditing !== "keyInfo"
                }
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  currentlyEditing && currentlyEditing !== "keyInfo"
                    ? `Finish editing ${currentlyEditing} first`
                    : undefined
                }
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {formatDateOfBirth(keyInfo?.dateOfBirth ?? null)}
                  {age !== null && age > 0 && (
                    <span className="text-muted-foreground font-normal ml-1">
                      ({age} years old)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Height */}
            <div className="flex items-start gap-3">
              <Ruler className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="font-medium">
                  {formatHeight(keyInfo?.height ?? null)}
                </p>
              </div>
            </div>

            {/* Positions */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Positions</p>
                <p className="font-medium">{getPositionNames()}</p>
              </div>
            </div>

            {/* Strong Foot */}
            <div className="flex items-start gap-3">
              <Footprints className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Strong Foot</p>
                <p className="font-medium">
                  {formatStrongFoot(keyInfo?.strongFoot ?? null)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <KeyInfoEditModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        profile={profile}
        keyInfo={keyInfo}
      />
    </>
  );
}

/**
 * Loading skeleton for KeyInformationSection
 */
export function KeyInformationSectionSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
