"use client";

import { useState, useEffect } from "react";

interface Profile {
  userId: string;
  coverImageUrl?: string;
  profileImageUrl?: string;
}

export function useImageUpload(profile: Profile, type: "cover" | "profile") {
  const [preview, setPreview] = useState<string>(
    type === "cover"
      ? profile.coverImageUrl || ""
      : profile.profileImageUrl || ""
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(
      type === "cover"
        ? profile.coverImageUrl || ""
        : profile.profileImageUrl || ""
    );
  }, [profile.coverImageUrl, profile.profileImageUrl, type]);

  const handleUpload = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          userId: profile.userId,
        }),
      });

      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, publicUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      const updateRes = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "cover"
            ? { coverImageUrl: publicUrl }
            : { profileImageUrl: publicUrl }
        ),
      });
      if (!updateRes.ok) throw new Error("Profile update failed");

      setPreview(publicUrl);
    } catch (err) {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  return {
    preview,
    uploading,
    handleUpload,
  };
}
