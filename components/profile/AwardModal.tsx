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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { awardSchema, AwardInput } from "@/types/enhanced-profile";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import type { AwardUI } from "@/types/prisma";

type AwardModalProps = {
  open: boolean;
  onClose: () => void;
  uuid: string;
  award?: AwardUI | null;
};

/**
 * AwardModal - Modal for adding/editing awards and achievements
 * Fields: Title, Year, Description
 */
export function AwardModal({
  open,
  onClose,
  uuid,
  award,
}: AwardModalProps) {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const isEditMode = !!award;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AwardInput>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      title: award?.title || "",
      year: award?.year || currentYear,
      description: award?.description || "",
    },
  });

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (award) {
        reset({
          title: award.title,
          year: award.year,
          description: award.description || "",
        });
      } else {
        reset({
          title: "",
          year: currentYear,
          description: "",
        });
      }
    }
  }, [open, award, reset, currentYear]);

  const mutation = useMutation({
    mutationFn: async (data: AwardInput) => {
      const url = isEditMode
        ? `/api/profile/${uuid}/awards/${award.id}`
        : `/api/profile/${uuid}/awards`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Failed to ${isEditMode ? "update" : "add"} award`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards", uuid] });
      toast.success(isEditMode ? "Award updated successfully" : "Award added successfully");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save award");
    },
  });

  const onSubmit = (data: AwardInput) => {
    mutation.mutate(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Award" : "Add Award"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Award Title *</Label>
            <Input
              id="title"
              placeholder="e.g., MVP, Best Player Award"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year">Year Received *</Label>
            <Input
              id="year"
              type="number"
              min={VALIDATION_CONSTANTS.YEAR.MIN}
              max={VALIDATION_CONSTANTS.YEAR.MAX}
              {...register("year", { valueAsNumber: true })}
            />
            {errors.year && (
              <p className="text-sm text-red-600">{errors.year.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the award..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Error Message */}
          {mutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : `Failed to ${isEditMode ? "update" : "add"} award`}
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
              disabled={isSubmitting || mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Award"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
