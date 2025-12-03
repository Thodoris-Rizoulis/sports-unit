"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { AlertCircle, Loader2 } from "lucide-react";
import {
  athleteMetricsSchema,
  AthleteMetricsInput,
} from "@/types/enhanced-profile";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import type { AthleteMetricsUI } from "@/types/prisma";

type MetricsEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uuid: string;
  metrics: AthleteMetricsUI | null | undefined;
};

/**
 * MetricsEditModal - Modal for editing athlete performance metrics
 * Fields: Sprint Speed (30m), Agility T-Test, Beep Test Level/Shuttle, Vertical Jump
 */
export function MetricsEditModal({
  open,
  onOpenChange,
  uuid,
  metrics,
}: MetricsEditModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AthleteMetricsInput>({
    resolver: zodResolver(athleteMetricsSchema),
    defaultValues: {
      sprintSpeed30m: metrics?.sprintSpeed30m || null,
      agilityTTest: metrics?.agilityTTest || null,
      beepTestLevel: metrics?.beepTestLevel || null,
      beepTestShuttle: metrics?.beepTestShuttle || null,
      verticalJump: metrics?.verticalJump || null,
    },
  });

  // Reset form when modal opens or metrics change
  useEffect(() => {
    if (open) {
      reset({
        sprintSpeed30m: metrics?.sprintSpeed30m || null,
        agilityTTest: metrics?.agilityTTest || null,
        beepTestLevel: metrics?.beepTestLevel || null,
        beepTestShuttle: metrics?.beepTestShuttle || null,
        verticalJump: metrics?.verticalJump || null,
      });
    }
  }, [open, metrics, reset]);

  const updateMetricsMutation = useMutation({
    mutationFn: async (data: AthleteMetricsInput) => {
      const res = await fetch(`/api/profile/${uuid}/metrics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update metrics");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athleteMetrics", uuid] });
      queryClient.invalidateQueries({ queryKey: ["profile", uuid] });
      toast.success("Metrics updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update metrics");
    },
  });

  const onSubmit = (data: AthleteMetricsInput) => {
    // Convert empty strings to null for proper handling
    const cleanedData: AthleteMetricsInput = {
      sprintSpeed30m: data.sprintSpeed30m || null,
      agilityTTest: data.agilityTTest || null,
      beepTestLevel: data.beepTestLevel || null,
      beepTestShuttle: data.beepTestShuttle || null,
      verticalJump: data.verticalJump || null,
    };
    updateMetricsMutation.mutate(cleanedData);
  };

  const {
    SPRINT_SPEED_30M,
    AGILITY_T_TEST,
    BEEP_TEST_LEVEL,
    BEEP_TEST_SHUTTLE,
    VERTICAL_JUMP,
  } = VALIDATION_CONSTANTS.ATHLETE_METRICS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Performance Metrics</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Sprint Speed (30m) */}
          <div className="space-y-2">
            <Label htmlFor="sprintSpeed30m">Sprint Speed 30m (seconds)</Label>
            <Input
              id="sprintSpeed30m"
              type="number"
              step="0.01"
              placeholder={`${SPRINT_SPEED_30M.MIN} - ${SPRINT_SPEED_30M.MAX}`}
              {...register("sprintSpeed30m", {
                setValueAs: (v) => {
                  if (v === "" || v === null || v === undefined) return null;
                  const num = parseFloat(v);
                  return isNaN(num) ? null : num;
                },
              })}
            />
            {errors.sprintSpeed30m && (
              <p className="text-sm text-red-600">
                {errors.sprintSpeed30m.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter your 30-meter sprint time in seconds (e.g., 4.25)
            </p>
          </div>

          {/* Agility T-Test */}
          <div className="space-y-2">
            <Label htmlFor="agilityTTest">Agility T-Test (seconds)</Label>
            <Input
              id="agilityTTest"
              type="number"
              step="0.01"
              placeholder={`${AGILITY_T_TEST.MIN} - ${AGILITY_T_TEST.MAX}`}
              {...register("agilityTTest", {
                setValueAs: (v) => {
                  if (v === "" || v === null || v === undefined) return null;
                  const num = parseFloat(v);
                  return isNaN(num) ? null : num;
                },
              })}
            />
            {errors.agilityTTest && (
              <p className="text-sm text-red-600">
                {errors.agilityTTest.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter your T-Test agility time in seconds (e.g., 9.50)
            </p>
          </div>

          {/* Beep Test Level & Shuttle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beepTestLevel">Beep Test Level</Label>
              <Input
                id="beepTestLevel"
                type="number"
                step="1"
                placeholder={`${BEEP_TEST_LEVEL.MIN} - ${BEEP_TEST_LEVEL.MAX}`}
                {...register("beepTestLevel", {
                  setValueAs: (v) => {
                    if (v === "" || v === null || v === undefined) return null;
                    const num = parseInt(v, 10);
                    return isNaN(num) ? null : num;
                  },
                })}
              />
              {errors.beepTestLevel && (
                <p className="text-sm text-red-600">
                  {errors.beepTestLevel.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="beepTestShuttle">Beep Test Shuttle</Label>
              <Input
                id="beepTestShuttle"
                type="number"
                step="1"
                placeholder={`${BEEP_TEST_SHUTTLE.MIN} - ${BEEP_TEST_SHUTTLE.MAX}`}
                {...register("beepTestShuttle", {
                  setValueAs: (v) => {
                    if (v === "" || v === null || v === undefined) return null;
                    const num = parseInt(v, 10);
                    return isNaN(num) ? null : num;
                  },
                })}
              />
              {errors.beepTestShuttle && (
                <p className="text-sm text-red-600">
                  {errors.beepTestShuttle.message}
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 -mt-3">
            Enter your beep test result (e.g., Level 12, Shuttle 8)
          </p>

          {/* Vertical Jump */}
          <div className="space-y-2">
            <Label htmlFor="verticalJump">Vertical Jump (cm)</Label>
            <Input
              id="verticalJump"
              type="number"
              step="0.1"
              placeholder={`${VERTICAL_JUMP.MIN} - ${VERTICAL_JUMP.MAX}`}
              {...register("verticalJump", {
                setValueAs: (v) => {
                  if (v === "" || v === null || v === undefined) return null;
                  const num = parseFloat(v);
                  return isNaN(num) ? null : num;
                },
              })}
            />
            {errors.verticalJump && (
              <p className="text-sm text-red-600">
                {errors.verticalJump.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter your vertical jump height in centimeters (e.g., 65.5)
            </p>
          </div>

          {/* Error Message */}
          {updateMetricsMutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">
                {updateMetricsMutation.error instanceof Error
                  ? updateMetricsMutation.error.message
                  : "Failed to update metrics"}
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
              disabled={isSubmitting || updateMetricsMutation.isPending}
            >
              {updateMetricsMutation.isPending ? (
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
