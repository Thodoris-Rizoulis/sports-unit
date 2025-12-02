"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  Play,
  ImageIcon,
  VideoIcon,
  Upload,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaFile {
  file: File;
  preview?: string;
  type: "image" | "video";
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface MediaPreviewProps {
  selectedFiles: MediaFile[];
  onRemoveFile: (index: number) => void;
  onReorderFiles?: (files: MediaFile[]) => void;
  className?: string;
}

export function MediaPreview({
  selectedFiles,
  onRemoveFile,
  onReorderFiles,
  className,
}: MediaPreviewProps) {
  if (selectedFiles.length === 0) return null;

  return (
    <div className={cn("mt-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Selected Media ({selectedFiles.length})
        </h3>
      </div>

      <div className="grid gap-3">
        {/* Render selected files */}
        {selectedFiles.map((mediaFile, index) => (
          <MediaPreviewItem
            key={`file-${mediaFile.file.name}-${index}`}
            mediaFile={mediaFile}
            onRemove={() => onRemoveFile(index)}
          />
        ))}
      </div>
    </div>
  );
}

interface MediaPreviewItemProps {
  mediaFile: MediaFile;
  onRemove: () => void;
}

function MediaPreviewItem({ mediaFile, onRemove }: MediaPreviewItemProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (mediaFile.preview) {
      setPreview(mediaFile.preview);
      return;
    }

    // Generate preview for the file
    const objectUrl = URL.createObjectURL(mediaFile.file);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [mediaFile.file, mediaFile.preview]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Preview */}
        <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
          {preview ? (
            mediaFile.type === "image" ? (
              <Image
                src={preview}
                alt={mediaFile.file.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Play className="h-6 w-6 text-white" />
                </div>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {mediaFile.type === "image" ? (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              ) : (
                <VideoIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Upload Status Overlay */}
          {mediaFile.uploadStatus && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              {mediaFile.uploadStatus === "uploading" &&
                mediaFile.uploadProgress !== undefined && (
                  <div className="text-center text-white">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />
                    <div className="text-xs">{mediaFile.uploadProgress}%</div>
                  </div>
                )}
              {mediaFile.uploadStatus === "completed" && (
                <CheckCircle className="h-6 w-6 text-green-400" />
              )}
              {mediaFile.uploadStatus === "error" && (
                <X className="h-6 w-6 text-red-400" />
              )}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {mediaFile.file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(mediaFile.file.size)} • {mediaFile.type}
              </p>
              {mediaFile.error && (
                <p className="text-xs text-destructive mt-1">
                  {mediaFile.error}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 flex-shrink-0"
              disabled={mediaFile.uploadStatus === "uploading"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload Progress Bar */}
          {mediaFile.uploadStatus === "uploading" &&
            mediaFile.uploadProgress !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${mediaFile.uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
        </div>
      </div>
    </Card>
  );
}
