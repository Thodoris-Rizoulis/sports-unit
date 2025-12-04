import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { UserProfile } from "@/types/prisma";
import { editProfileSchema, EditProfileForm } from "@/types/profile";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (data: EditProfileForm) => Promise<void>;
  isSaving: boolean;
}

export function EditProfileModal({
  open,
  onClose,
  profile,
  onSave,
  isSaving,
}: EditProfileModalProps) {
  const { data: teamsData } = useTeams(profile.sportId);
  const combinedTeams: Array<any> = Array.isArray(teamsData) ? teamsData : [];

  const form = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      username: profile.username || "",
      teamId: profile.teamId ?? null,
      location: profile.location || "",
      openToOpportunities: !!profile.openToOpportunities,
    },
  });

  const teamId = useWatch({ control: form.control, name: "teamId" });
  const openToOpportunities = useWatch({
    control: form.control,
    name: "openToOpportunities",
  });
  const watchedUsername = useWatch({ control: form.control, name: "username" });
  const usernameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Username availability checking integrated with form validation
  useEffect(() => {
    if (!watchedUsername || watchedUsername === profile.username) {
      form.clearErrors("username");
      setIsCheckingUsername(false);
      return;
    }

    // Clear previous timeout
    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    setIsCheckingUsername(true);

    // Set up new timeout for checking
    usernameCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(
            watchedUsername
          )}`
        );
        if (!res.ok) throw new Error("Check failed");
        const data = await res.json();
        if (!data.available) {
          form.setError("username", { message: "Username is already taken" });
        } else {
          form.clearErrors("username");
        }
      } catch (err) {
        form.setError("username", { message: "Failed to check availability" });
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, [watchedUsername, form, profile.username]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
        teamId: profile.teamId ?? null,
        location: profile.location || "",
        openToOpportunities: !!profile.openToOpportunities,
      });
      // Trigger validation to ensure form state is correct
      form.trigger();
    }
  }, [open, profile, form]);

  const onSubmit = async (data: EditProfileForm) => {
    await onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
        >
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...form.register("firstName")} />
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...form.register("lastName")} />
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...form.register("username")} />
            <div className="mt-1 flex items-center gap-2">
              {isCheckingUsername && (
                <p className="text-sm text-muted-foreground">Checking...</p>
              )}
              {!isCheckingUsername &&
                !form.formState.errors.username &&
                watchedUsername &&
                watchedUsername !== profile.username && (
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm">Username available</p>
                  </div>
                )}
            </div>
            {form.formState.errors.username && (
              <p className="text-sm text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="team">Team</Label>
            <Select
              value={teamId !== null ? String(teamId) : "none"}
              onValueChange={(val) =>
                form.setValue("teamId", val === "none" ? null : Number(val))
              }
            >
              <SelectTrigger id="team" className="w-full">
                <SelectValue placeholder="No team">
                  {teamId !== null
                    ? combinedTeams.find((t) => t.id === teamId)?.name ??
                      profile.teamName ??
                      "No team"
                    : profile.teamName ?? "No team"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team</SelectItem>
                {profile.teamId &&
                  !combinedTeams.find((t) => t.id === profile.teamId) && (
                    <SelectItem value={String(profile.teamId)}>
                      {profile.teamName ?? `Team ${profile.teamId}`}
                    </SelectItem>
                  )}
                {combinedTeams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...form.register("location")} />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <Checkbox
              id="openToOpportunities"
              checked={openToOpportunities}
              onCheckedChange={(v) => form.setValue("openToOpportunities", !!v)}
            />
            <Label htmlFor="openToOpportunities">Open to opportunities</Label>
          </div>
        </form>

        <DialogFooter>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={
                isSaving ||
                Object.keys(form.formState.errors).length > 0 ||
                isCheckingUsername
              }
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
