"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2 } from "lucide-react";
import { educationSchema, EducationInput } from "@/types/enhanced-profile";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import type { EducationUI } from "@/types/prisma";

type EducationModalProps = {
  open: boolean;
  onClose: () => void;
  uuid: string;
  education?: EducationUI | null;
};

/**
 * EducationModal - Modal for adding/editing education entries
 * Fields: Title (Institution), Subtitle (Degree), Years, Current checkbox
 */
export function EducationModal({
  open,
  onClose,
  uuid,
  education,
}: EducationModalProps) {
  const queryClient = useQueryClient();
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);

  const currentYear = new Date().getFullYear();
  const isEditMode = !!education;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EducationInput>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      title: education?.title || "",
      subtitle: education?.subtitle || "",
      yearFrom: education?.yearFrom || currentYear,
      yearTo: education?.yearTo || null,
    },
  });

  const watchYearFrom = watch("yearFrom");

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (education) {
        setIsCurrentlyStudying(education.yearTo === null);
        reset({
          title: education.title,
          subtitle: education.subtitle || "",
          yearFrom: education.yearFrom,
          yearTo: education.yearTo || null,
        });
      } else {
        setIsCurrentlyStudying(false);
        reset({
          title: "",
          subtitle: "",
          yearFrom: currentYear,
          yearTo: null,
        });
      }
    }
  }, [open, education, reset, currentYear]);

  // Update yearTo when "current" checkbox changes
  useEffect(() => {
    if (isCurrentlyStudying) {
      setValue("yearTo", null);
    }
  }, [isCurrentlyStudying, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: EducationInput) => {
      const url = isEditMode
        ? `/api/profile/${uuid}/education/${education.id}`
        : `/api/profile/${uuid}/education`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          yearTo: isCurrentlyStudying ? null : data.yearTo,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.message ||
            `Failed to ${isEditMode ? "update" : "add"} education`
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education", uuid] });
      toast.success(
        isEditMode
          ? "Education updated successfully"
          : "Education added successfully"
      );
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save education");
    },
  });

  const onSubmit = (data: EducationInput) => {
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
            {isEditMode ? "Edit Education" : "Add Education"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title (Institution) */}
          <div className="space-y-2">
            <Label htmlFor="title">Institution *</Label>
            <Input
              id="title"
              placeholder="e.g., University of Sports"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Subtitle (Degree) */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Degree / Field of Study</Label>
            <Input
              id="subtitle"
              placeholder="e.g., BSc in Sports Science"
              {...register("subtitle")}
            />
            {errors.subtitle && (
              <p className="text-sm text-red-600">{errors.subtitle.message}</p>
            )}
          </div>

          {/* Years */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearFrom">Start Year *</Label>
              <Input
                id="yearFrom"
                type="number"
                min={VALIDATION_CONSTANTS.YEAR.MIN}
                max={VALIDATION_CONSTANTS.YEAR.MAX}
                {...register("yearFrom", { valueAsNumber: true })}
              />
              {errors.yearFrom && (
                <p className="text-sm text-red-600">
                  {errors.yearFrom.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearTo">End Year</Label>
              <Controller
                name="yearTo"
                control={control}
                render={({ field }) => (
                  <Input
                    id="yearTo"
                    type="number"
                    min={watchYearFrom || VALIDATION_CONSTANTS.YEAR.MIN}
                    max={VALIDATION_CONSTANTS.YEAR.MAX}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : parseInt(val, 10));
                    }}
                    disabled={isCurrentlyStudying}
                  />
                )}
              />
              {errors.yearTo && (
                <p className="text-sm text-red-600">{errors.yearTo.message}</p>
              )}
            </div>
          </div>

          {/* Currently Studying Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isCurrentlyStudying"
              checked={isCurrentlyStudying}
              onCheckedChange={(checked) =>
                setIsCurrentlyStudying(checked === true)
              }
            />
            <Label htmlFor="isCurrentlyStudying" className="cursor-pointer">
              I am currently studying here
            </Label>
          </div>

          {/* Error Message */}
          {mutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : `Failed to ${isEditMode ? "update" : "add"} education`}
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
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Education"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
