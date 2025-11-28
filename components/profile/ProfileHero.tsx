"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserProfile } from "@/types/profile";
import { CheckCircle, Edit } from "lucide-react";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { Team } from "@/types/sports";
import { ProfileHeroProps } from "@/types/components";

export function ProfileHero({ profile, isOwner }: ProfileHeroProps) {
  const [editMode, setEditMode] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<"cover" | "profile" | null>(
    null
  );
  const [uploading, setUploading] = useState<"cover" | "profile" | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    teamId: profile.teamId?.toString() || "none",
    location: profile.location || "",
    coverImageUrl: profile.coverImageUrl || "",
    profileImageUrl: profile.profileImageUrl || "",
    openToOpportunities: profile.openToOpportunities,
  });

  // Fetch teams when entering edit mode or if needed for display
  useEffect(() => {
    if ((editMode || profile.teamId) && teams.length === 0) {
      fetchTeams();
    }
  }, [editMode, profile.teamId]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      if (profile.sportId) {
        const teamsResponse = await fetch(
          `/api/teams?sportId=${profile.sportId}`
        );
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          // Ensure the current team is included in the list
          let updatedTeams = teamsData;
          if (
            profile.teamId &&
            profile.teamName &&
            !teamsData.find((t: Team) => t.id === profile.teamId)
          ) {
            updatedTeams = [
              ...teamsData,
              {
                id: profile.teamId,
                name: profile.teamName,
                sport_id: profile.sportId,
              },
            ];
          }
          setTeams(updatedTeams);
        }
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username === profile.username) return true; // No change needed

    setUsernameChecking(true);
    try {
      const response = await fetch(
        `/api/profile/check-username?username=${encodeURIComponent(username)}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.available;
      }
      return false;
    } catch (error) {
      console.error("Failed to check username:", error);
      return false;
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    imageType: "cover" | "profile"
  ) => {
    setUploading(imageType);
    try {
      // Get presigned URL
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          userId: profile.userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, publicUrl } = await response.json();

      // Upload file
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      // Update profile
      const updateResponse = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [imageType === "cover" ? "coverImageUrl" : "profileImageUrl"]:
            publicUrl,
        }),
      });

      if (updateResponse.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else {
      // Check username format
      if (
        formData.username.length < VALIDATION_CONSTANTS.USERNAME.MIN_LENGTH ||
        formData.username.length > VALIDATION_CONSTANTS.USERNAME.MAX_LENGTH
      ) {
        newErrors.username = `Username must be ${VALIDATION_CONSTANTS.USERNAME.MIN_LENGTH}-${VALIDATION_CONSTANTS.USERNAME.MAX_LENGTH} characters`;
      } else if (
        !VALIDATION_CONSTANTS.USERNAME.PATTERN.test(formData.username)
      ) {
        newErrors.username =
          "Username can only contain letters, numbers, and underscores";
      } else if (formData.username !== profile.username) {
        // Check availability
        const isAvailable = await checkUsernameAvailability(formData.username);
        if (!isAvailable) {
          newErrors.username = "Username is already taken";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        teamId: formData.teamId === "none" ? null : parseInt(formData.teamId),
      };

      const response = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        setEditMode(false);
        // Redirect to new profile URL if username changed
        const newUsername = dataToSave.username;
        if (newUsername && newUsername !== profile.username) {
          window.location.href = `/profile/${newUsername}`;
        } else {
          window.location.reload();
        }
      } else {
        const errorData = await response.json();
        console.error("Save failed:", errorData);
        setErrors({
          general:
            errorData.error || `Save failed with status ${response.status}`,
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setErrors({ general: "Save failed" });
    }
  };

  if (editMode) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </Button>
            </div>
          </div>
          {errors.general && (
            <p className="text-sm text-red-600">{errors.general}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={`mt-1 ${errors.username ? "border-red-500" : ""}`}
              />
              {errors.username && (
                <p className="text-sm text-red-600 mt-1">{errors.username}</p>
              )}
              {usernameChecking && (
                <p className="text-sm text-gray-500 mt-1">
                  Checking availability...
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="team"
                className="text-sm font-medium text-gray-700"
              >
                Team
              </Label>
              <Select
                value={formData.teamId}
                onValueChange={(value) =>
                  setFormData({ ...formData, teamId: value })
                }
                disabled={loadingTeams}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={
                      loadingTeams ? "Loading teams..." : "Select a team"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="location"
                className="text-sm font-medium text-gray-700"
              >
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="opportunities"
                checked={formData.openToOpportunities}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    openToOpportunities: checked === true,
                  })
                }
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <div className="flex-1">
                <Label
                  htmlFor="opportunities"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Open to opportunities
                </Label>
                <p className="text-xs text-gray-500">
                  Let others know you're interested in new opportunities
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      <CardContent className="p-0">
        {/* Cover Image Section */}
        <div
          className="relative h-64 md:h-80 bg-linear-to-br from-blue-400 to-purple-600 group cursor-pointer"
          onMouseEnter={() => isOwner && setHoveredImage("cover")}
          onMouseLeave={() => setHoveredImage(null)}
        >
          <Image
            src={profile.coverImageUrl || "/default_cover.webp"}
            alt="Cover image"
            fill
            className="object-cover"
            loading="eager"
          />
          {/* Gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

          {/* Hover overlay for cover image editing */}
          {isOwner && hoveredImage === "cover" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-200">
              <div className="text-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "cover");
                    }}
                    disabled={uploading === "cover"}
                  />
                  <div className="bg-white/90 hover:bg-white text-gray-900 font-medium px-4 py-2 rounded-lg inline-flex items-center transition-colors">
                    {uploading === "cover" ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-2 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Change Cover
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Profile Avatar - positioned to overlap cover */}
          <div
            className="absolute -bottom-8 left-6 md:left-8 group/avatar cursor-pointer"
            onMouseEnter={() => isOwner && setHoveredImage("profile")}
            onMouseLeave={() => setHoveredImage(null)}
          >
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg relative">
              <AvatarImage
                src={profile.profileImageUrl || "/default_profile.jpg"}
                alt="Profile picture"
              />
              <AvatarFallback className="text-xl md:text-2xl bg-gray-100">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </AvatarFallback>

              {/* Hover overlay for profile image editing */}
              {isOwner && hoveredImage === "profile" && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center transition-opacity duration-200">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "profile");
                      }}
                      disabled={uploading === "profile"}
                    />
                    <div className="bg-white/90 hover:bg-white text-gray-900 font-medium rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                      {uploading === "profile" ? (
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </Avatar>
          </div>
        </div>

        {/* User Info Section */}
        <div className="pt-12 pb-6 px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-lg text-gray-600">@{profile.username}</p>
              </div>

              {(profile.teamName || profile.location) && (
                <p className="text-gray-700 mb-3 flex items-center gap-2">
                  {profile.teamName && (
                    <span className="font-medium">{profile.teamName}</span>
                  )}
                  {profile.teamName && profile.location && <span>•</span>}
                  {profile.location && <span>{profile.location}</span>}
                </p>
              )}

              {profile.openToOpportunities && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 px-3 py-1 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Open to opportunities
                </Badge>
              )}
            </div>

            {isOwner && (
              <div className="md:self-start">
                <Button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg font-medium transition-colors"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
