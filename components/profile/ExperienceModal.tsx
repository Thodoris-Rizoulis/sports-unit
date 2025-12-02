"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertCircle, Loader2, ChevronsUpDown, Check } from "lucide-react";
import { experienceSchema, ExperienceInput } from "@/types/enhanced-profile";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ExperienceUI } from "@/types/prisma";

type ExperienceModalProps = {
  open: boolean;
  onClose: () => void;
  uuid: string;
  sportId: number | null;
  experience?: ExperienceUI | null;
};

type Team = {
  id: number;
  name: string;
};

/**
 * ExperienceModal - Modal for adding/editing experience entries
 * Fields: Title, Team (combobox), Years, Location, Current checkbox
 */
export function ExperienceModal({
  open,
  onClose,
  uuid,
  sportId,
  experience,
}: ExperienceModalProps) {
  const queryClient = useQueryClient();
  const [teamSearchOpen, setTeamSearchOpen] = useState(false);
  const [isCurrentPosition, setIsCurrentPosition] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");

  const currentYear = new Date().getFullYear();
  const isEditMode = !!experience;

  // Fetch teams filtered by sport
  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["teams", sportId, teamSearchQuery],
    queryFn: async () => {
      if (!sportId) return [];
      const params = new URLSearchParams();
      params.append("sportId", String(sportId));
      if (teamSearchQuery) params.append("search", teamSearchQuery);
      const res = await fetch(`/api/teams?${params}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.teams || data;
    },
    enabled: open && !!sportId,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExperienceInput>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: experience?.title || "",
      teamId: experience?.teamId || 0,
      yearFrom: experience?.yearFrom || currentYear,
      yearTo: experience?.yearTo || null,
      location: experience?.location || "",
    },
  });

  const watchYearFrom = watch("yearFrom");

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (experience) {
        setIsCurrentPosition(experience.yearTo === null);
        setSelectedTeam({ id: experience.teamId, name: experience.teamName });
        reset({
          title: experience.title,
          teamId: experience.teamId,
          yearFrom: experience.yearFrom,
          yearTo: experience.yearTo || null,
          location: experience.location || "",
        });
      } else {
        setIsCurrentPosition(false);
        setSelectedTeam(null);
        reset({
          title: "",
          teamId: 0,
          yearFrom: currentYear,
          yearTo: null,
          location: "",
        });
      }
    }
  }, [open, experience, reset, currentYear]);

  // Update yearTo when "current" checkbox changes
  useEffect(() => {
    if (isCurrentPosition) {
      setValue("yearTo", null);
    }
  }, [isCurrentPosition, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: ExperienceInput) => {
      const url = isEditMode
        ? `/api/profile/${uuid}/experience/${experience.id}`
        : `/api/profile/${uuid}/experience`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          yearTo: isCurrentPosition ? null : data.yearTo,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Failed to ${isEditMode ? "update" : "add"} experience`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience", uuid] });
      toast.success(isEditMode ? "Experience updated successfully" : "Experience added successfully");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save experience");
    },
  });

  const onSubmit = (data: ExperienceInput) => {
    mutation.mutate(data);
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setValue("teamId", team.id);
    setTeamSearchOpen(false);
  };

  const noSportConfigured = !sportId;

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
            {isEditMode ? "Edit Experience" : "Add Experience"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title / Position *</Label>
            <Input
              id="title"
              placeholder="e.g., Midfielder, Head Coach"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Team Combobox */}
          <div className="space-y-2">
            <Label>Team / Organization *</Label>
            {noSportConfigured ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700">
                  Please select a sport in your profile settings first to choose a team.
                </p>
              </div>
            ) : (
              <>
                <Popover open={teamSearchOpen} onOpenChange={setTeamSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={teamSearchOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedTeam ? selectedTeam.name : "Select a team..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search teams..."
                        value={teamSearchQuery}
                        onValueChange={setTeamSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {teamsLoading ? "Loading..." : "No team found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {teams?.map((team) => (
                            <CommandItem
                              key={team.id}
                              value={team.name}
                              onSelect={() => handleTeamSelect(team)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedTeam?.id === team.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {team.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.teamId && (
                  <p className="text-sm text-red-600">{errors.teamId.message}</p>
                )}
              </>
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
                <p className="text-sm text-red-600">{errors.yearFrom.message}</p>
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
                    disabled={isCurrentPosition}
                  />
                )}
              />
              {errors.yearTo && (
                <p className="text-sm text-red-600">{errors.yearTo.message}</p>
              )}
            </div>
          </div>

          {/* Current Position Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isCurrentPosition"
              checked={isCurrentPosition}
              onCheckedChange={(checked) => setIsCurrentPosition(checked === true)}
            />
            <Label htmlFor="isCurrentPosition" className="cursor-pointer">
              I currently work here
            </Label>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Madrid, Spain"
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Error Message */}
          {mutation.isError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : `Failed to ${isEditMode ? "update" : "add"} experience`}
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
              disabled={isSubmitting || mutation.isPending || noSportConfigured}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Saving..." : "Adding..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Add Experience"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
