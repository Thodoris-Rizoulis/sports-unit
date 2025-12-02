"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/types/prisma";
import { Edit3, User } from "lucide-react";
import { ProfileAboutProps } from "@/types/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function ProfileAbout({
  profile,
  isOwner,
  currentlyEditing,
  onSetEditing,
}: ProfileAboutProps) {
  const [bio, setBio] = useState(profile.bio || "");
  const [displayBio, setDisplayBio] = useState(profile.bio || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // When the modal opens, reset the draft to the latest profile bio
    if (currentlyEditing === "about") {
      setBio(profile.bio || "");
    }
  }, [currentlyEditing, profile.bio]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (response.ok) {
        setDisplayBio(bio);
        onSetEditing(null);
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5" />
              About
            </CardTitle>
            {isOwner && (
              <Button
                onClick={() => onSetEditing("about")}
                disabled={
                  currentlyEditing !== null && currentlyEditing !== "about"
                }
                variant="outline"
                size="sm"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  currentlyEditing && currentlyEditing !== "about"
                    ? `Finish editing ${currentlyEditing} first`
                    : undefined
                }
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-base">
              {displayBio || "No bio available."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={currentlyEditing === "about"}
        onOpenChange={(open) => {
          if (!open) onSetEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label
                htmlFor="bio"
                className="text-sm font-medium text-gray-700"
              >
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
          </div>

          <DialogFooter>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => onSetEditing(null)}
                className="px-6 py-2 rounded-lg font-medium"
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
