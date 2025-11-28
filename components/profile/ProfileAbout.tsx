"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/types/profile";
import { Edit3, User } from "lucide-react";
import { ProfileAboutProps } from "@/types/components";

export function ProfileAbout({ profile, isOwner }: ProfileAboutProps) {
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState(profile.bio || "");

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (response.ok) {
        setEditMode(false);
        window.location.reload();
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Save failed");
    }
  };

  if (editMode) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-gray-500">
              Share your story, interests, and what makes you unique.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditMode(false)}
              className="px-6 py-2 rounded-lg font-medium"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="w-5 h-5" />
            About
          </CardTitle>
          {isOwner && (
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed text-base">
            {profile.bio || "No bio available."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
