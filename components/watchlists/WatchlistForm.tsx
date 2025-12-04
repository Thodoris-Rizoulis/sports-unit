"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  createWatchlistSchema,
  type CreateWatchlistInput,
} from "@/types/watchlists";
import { Loader2 } from "lucide-react";

type WatchlistFormProps = {
  initialData?: {
    name: string;
    description?: string | null;
  };
  onSubmit: (data: CreateWatchlistInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

/**
 * Form for creating or editing a watchlist.
 * Uses React Hook Form with Zod validation.
 */
export function WatchlistForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save",
}: WatchlistFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateWatchlistInput>({
    resolver: zodResolver(createWatchlistSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || undefined,
    },
  });

  const handleFormSubmit = async (data: CreateWatchlistInput) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Top Prospects 2024"
          {...register("name")}
          className="mt-1"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional description for this watchlist"
          {...register("description")}
          className="mt-1 resize-none"
          rows={3}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
