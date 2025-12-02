"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2 } from "lucide-react";
import { keyInfoSchema, KeyInfoFormInput } from "@/types/enhanced-profile";
import { ExtendedUserProfile, Position } from "@/types/prisma";
import { VALIDATION_CONSTANTS } from "@/lib/constants";

type KeyInfoEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ExtendedUserProfile;
};

/**
 * KeyInfoEditModal - Modal for editing athlete key information
 * Fields: Date of Birth, Height, Positions (multi-select), Strong Foot
 */
export function KeyInfoEditModal({
  open,
  onOpenChange,
  profile,
}: KeyInfoEditModalProps) {
  const queryClient = useQueryClient();
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);

  // Fetch positions for the user's sport
  const { data: positions, isLoading: positionsLoading } = useQuery<Position[]>({
    queryKey: ["positions", profile.sportId],
    queryFn: async () => {
      if (!profile.sportId) return [];
      const res = await fetch(`/api/positions?sportId=${profile.sportId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.positions || data;
    },
    enabled: open && !!profile.sportId,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KeyInfoFormInput>({
    resolver: zodResolver(keyInfoSchema),
    defaultValues: {
      dateOfBirth: profile.dateOfBirth || null,
      height: profile.height || null,
      positionIds: profile.positions || [],
      strongFoot: profile.strongFoot as "left" | "right" | "both" | null,
    },
  });

  // Initialize selected positions when modal opens
  useEffect(() => {
    if (open) {
      setSelectedPositions(profile.positions || []);
      reset({
        dateOfBirth: profile.dateOfBirth || null,
        height: profile.height || null,
        positionIds: profile.positions || [],
        strongFoot: profile.strongFoot as "left" | "right" | "both" | null,
      });
    }
  }, [open, profile, reset]);

  const updateKeyInfoMutation = useMutation({
    mutationFn: async (data: KeyInfoFormInput) => {
      const res = await fetch(`/api/profile/${profile.publicUuid}/key-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          positionIds: selectedPositions,
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString()
            : null,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update key information");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", profile.publicUuid] });
      toast.success("Key information updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update key information");
    },
  });

  const onSubmit = (data: KeyInfoFormInput) => {
    updateKeyInfoMutation.mutate(data);
  };

  const togglePosition = (positionId: number) => {
    setSelectedPositions((prev) => {
      if (prev.includes(positionId)) {
        return prev.filter((id) => id !== positionId);
      }
      if (prev.length >= VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS) {
        return prev;
      }
      return [...prev, positionId];
    });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const noSportConfigured = !profile.sportId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Key Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formatDateForInput(field.value as Date | null)}
                  onChange={(e) => {
                    field.onChange(e.target.value ? new Date(e.target.value) : null);
                  }}
                  max={new Date().toISOString().split("T")[0]}
                />
              )}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder={`${VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM} - ${VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM}`}
              {...register("height", { valueAsNumber: true })}
              min={VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM}
              max={VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM}
            />
            {errors.height && (
              <p className="text-sm text-red-600">{errors.height.message}</p>
            )}
          </div>

          {/* Positions Multi-Select */}
          <div className="space-y-2">
            <Label>
              Positions (max {VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS})
            </Label>
            {noSportConfigured ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700">
                  Please select a sport in your profile settings first to choose positions.
                </p>
              </div>
            ) : positionsLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading positions...</span>
              </div>
            ) : positions && positions.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {positions.map((position) => (
                  <label
                    key={position.id}
                    className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedPositions.includes(position.id)}
                      onCheckedChange={() => togglePosition(position.id)}
                      disabled={
                        !selectedPositions.includes(position.id) &&
                        selectedPositions.length >= VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS
                      }
                    />
                    <span className="text-sm">{position.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No positions available for this sport.</p>
            )}
            {selectedPositions.length > 0 && (
              <p className="text-xs text-gray-500">
                {selectedPositions.length} of {VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS} positions selected
              </p>
            )}
          </div>

          {/* Strong Foot */}
          <div className="space-y-2">
            <Label htmlFor="strongFoot">Strong Foot</Label>
            <Controller
              name="strongFoot"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) =>
                    field.onChange(value === "" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your strong foot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Error Message */}
          {updateKeyInfoMutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">
                {updateKeyInfoMutation.error instanceof Error
                  ? updateKeyInfoMutation.error.message
                  : "Failed to update key information"}
              </p>
            </div>
          )}

          {/* Actions */}
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting || updateKeyInfoMutation.isPending}
            >
              {updateKeyInfoMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
