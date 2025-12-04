"use client";

/**
 * MessageMediaUpload Component
 * Feature: 015-direct-messaging
 *
 * Media upload button for attaching images/videos to messages.
 * Uses the existing upload API with messaging-specific path prefix.
 */

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadedMedia = {
  url: string;
  key: string;
  type: "image" | "video";
};

type MessageMediaUploadProps = {
  onMediaUploaded: (media: UploadedMedia) => void;
  onMediaRemoved: () => void;
  currentMedia: UploadedMedia | null;
  disabled?: boolean;
  className?: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export function MessageMediaUpload({
  onMediaUploaded,
  onMediaRemoved,
  currentMedia,
  disabled = false,
  className,
}: MessageMediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Unsupported file type. Please use JPEG, PNG, GIF, WebP, MP4, or WebM."
      );
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Get upload URL from API
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          pathPrefix: "messages", // Use messages folder for media
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl, key } = await res.json();

      // Upload file directly to storage
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      // Determine media type
      const mediaType = ALLOWED_IMAGE_TYPES.includes(file.type)
        ? "image"
        : "video";

      onMediaUploaded({
        url: publicUrl,
        key: key,
        type: mediaType,
      });
    } catch (err) {
      console.error("Media upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload media");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setError(null);
    onMediaRemoved();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Preview or upload button */}
      {currentMedia ? (
        <div className="relative inline-block">
          {currentMedia.type === "image" ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
              <Image
                src={currentMedia.url}
                alt="Upload preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove media"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          disabled={disabled || isUploading}
          className="h-10 w-10"
          aria-label="Attach media"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Error message */}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
