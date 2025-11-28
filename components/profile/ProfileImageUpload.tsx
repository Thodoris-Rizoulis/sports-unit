"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfileImageUploadProps } from "@/types/components";

export function ProfileImageUpload({
  type,
  userId,
  onUpload,
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Get presigned URL
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          userId,
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

      onUpload(publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: "none" }}
        id={`${type}-upload`}
      />
      <label htmlFor={`${type}-upload`}>
        <Button variant="outline" disabled={uploading} asChild>
          <span>{uploading ? "Uploading..." : `Upload ${type} image`}</span>
        </Button>
      </label>
    </div>
  );
}
