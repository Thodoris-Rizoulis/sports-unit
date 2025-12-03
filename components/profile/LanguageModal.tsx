"use client";

import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { languageSchema, LanguageInput } from "@/types/enhanced-profile";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import type { LanguageUI } from "@/types/prisma";

type LanguageModalProps = {
  open: boolean;
  onClose: () => void;
  uuid: string;
  language?: LanguageUI | null;
};

const LEVEL_LABELS: Record<string, string> = {
  native: "Native",
  fluent: "Fluent",
  proficient: "Proficient",
  intermediate: "Intermediate",
  basic: "Basic",
};

/**
 * LanguageModal - Modal for adding/editing language proficiencies
 * Fields: Language name, Level dropdown
 */
export function LanguageModal({
  open,
  onClose,
  uuid,
  language,
}: LanguageModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!language;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LanguageInput>({
    resolver: zodResolver(languageSchema),
    defaultValues: {
      language: language?.language || "",
      level: language?.level || "intermediate",
    },
  });

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (language) {
        reset({
          language: language.language,
          level: language.level as LanguageInput["level"],
        });
      } else {
        reset({
          language: "",
          level: "intermediate",
        });
      }
    }
  }, [open, language, reset]);

  const mutation = useMutation({
    mutationFn: async (data: LanguageInput) => {
      const url = isEditMode
        ? `/api/profile/${uuid}/languages/${language.id}`
        : `/api/profile/${uuid}/languages`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.message || `Failed to ${isEditMode ? "update" : "add"} language`
        );
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages", uuid] });
      toast.success(
        isEditMode
          ? "Language updated successfully"
          : "Language added successfully"
      );
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save language");
    },
  });

  const onSubmit = (data: LanguageInput) => {
    mutation.mutate(data);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Language" : "Add Language"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Language Name */}
          <div className="space-y-2">
            <Label htmlFor="language">Language *</Label>
            <Input
              id="language"
              placeholder="e.g., English, Spanish, French"
              {...register("language")}
            />
            {errors.language && (
              <p className="text-sm text-red-600">{errors.language.message}</p>
            )}
          </div>

          {/* Level Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="level">Proficiency Level *</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALIDATION_CONSTANTS.LANGUAGE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {LEVEL_LABELS[level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.level && (
              <p className="text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>

          {/* Error Message */}
          {mutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : `Failed to ${isEditMode ? "update" : "add"} language`}
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
                "Add Language"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
