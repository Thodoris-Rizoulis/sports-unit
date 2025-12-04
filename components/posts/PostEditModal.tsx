"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPostInputSchema, CreatePostInput } from "@/types/posts";
import { Post, PostMediaItem } from "@/types/prisma";
import { ImageIcon, VideoIcon, X, Loader2 } from "lucide-react";
import { MediaPreview } from "./MediaPreview";
import { cn } from "@/lib/utils";
import { requireSessionUserId } from "@/lib/auth-utils";

type SelectedFile = {
  file: File;
  type: "image" | "video";
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "completed" | "error";
  error?: string;
  uploadedKey?: string;
};

type ExistingMedia = {
  id: number;
  type: "image" | "video";
  key: string;
  url?: string | null;
};

interface PostEditModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: (post: Post) => void;
}

export function PostEditModal({
  post,
  isOpen,
  onClose,
  onPostUpdated,
}: PostEditModalProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostInputSchema),
    defaultValues: {
      content: post.content || "",
    },
  });

  // Reset form when post changes or modal opens
  useEffect(() => {
    if (isOpen && post) {
      setValue("content", post.content || "");
      // Convert existing media to our format
      const media: ExistingMedia[] = (post.media || []).map((m) => ({
        id: m.id,
        type: m.mediaType as "image" | "video",
        key: m.key || "",
        url: m.url,
      }));
      setExistingMedia(media);
      setSelectedFiles([]);
    }
  }, [isOpen, post, setValue]);

  const handleFileSelect = async (files: File[]) => {
    const newFiles = files.map((file) => ({
      file,
      type: file.type.startsWith("image/")
        ? ("image" as const)
        : ("video" as const),
      uploadStatus: "pending" as const,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Auto-upload files immediately
    for (const fileItem of newFiles) {
      await uploadFile(fileItem.file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!session?.user?.id) return;

    setSelectedFiles((prev) =>
      prev.map((item) =>
        item.file === file
          ? { ...item, uploadStatus: "uploading" as const, uploadProgress: 0 }
          : item
      )
    );

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          userId: requireSessionUserId(session),
        }),
      });

      if (!response.ok) throw new Error("Upload failed");

      const { uploadUrl, key } = await response.json();

      // Upload file to R2
      await uploadWithProgress(uploadUrl, file);

      setSelectedFiles((prev) =>
        prev.map((item) =>
          item.file === file
            ? {
                ...item,
                uploadStatus: "completed" as const,
                uploadedKey: key,
                uploadProgress: 100,
              }
            : item
        )
      );
    } catch (error) {
      console.error("File upload error:", error);
      setSelectedFiles((prev) =>
        prev.map((item) =>
          item.file === file
            ? {
                ...item,
                uploadStatus: "error" as const,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : item
        )
      );
    }
  };

  const uploadWithProgress = async (
    uploadUrl: string,
    file: File
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setSelectedFiles((prev) =>
            prev.map((item) =>
              item.file === file ? { ...item, uploadProgress: progress } : item
            )
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const removeExistingMedia = (mediaId: number) => {
    setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const maxSize = 50; // 50MB

    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        console.error(`${file.name} is too large (max ${maxSize}MB)`);
        continue;
      }

      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      if (!isValidType) {
        console.error(`${file.name} is not a supported file type`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isSubmitting) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const validFiles = validateFiles(Array.from(files));
      if (validFiles.length > 0) {
        handleFileSelect(validFiles);
      }
    }
  };

  const onSubmit = async (data: CreatePostInput) => {
    // Check if all files are uploaded
    const pendingFiles = selectedFiles.filter(
      (f) => f.uploadStatus !== "completed"
    );
    if (pendingFiles.length > 0) {
      alert("Please wait for all files to finish uploading");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build media array from existing and new files
      const media = [
        ...existingMedia.map((m) => ({ type: m.type, file: m.key })),
        ...selectedFiles.map((f) => ({
          type: f.type,
          file: f.uploadedKey!,
        })),
      ];

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, media }),
      });

      if (!response.ok) throw new Error("Post update failed");

      const result = await response.json();
      onPostUpdated(result.post);
      onClose();
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSelectedFiles([]);
      setExistingMedia([]);
      onClose();
    }
  };

  const getMediaUrl = (media: ExistingMedia) => {
    if (media.url) return media.url;
    return `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${media.key}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn(
            "space-y-4",
            isDragOver && "ring-2 ring-primary ring-opacity-50 rounded-lg"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Content */}
          <div>
            <Textarea
              {...register("content")}
              placeholder="Write something..."
              rows={4}
              className="resize-none"
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Existing Media Preview */}
          {existingMedia.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Current Media
              </p>
              <div className="grid grid-cols-3 gap-2">
                {existingMedia.map((media) => (
                  <div key={media.id} className="relative group">
                    {media.type === "image" ? (
                      <img
                        src={getMediaUrl(media)}
                        alt="Post media"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={getMediaUrl(media)}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingMedia(media.id)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Media Preview */}
          <MediaPreview
            selectedFiles={selectedFiles}
            onRemoveFile={removeNewFile}
            onReorderFiles={(newOrder) => setSelectedFiles(newOrder)}
          />

          {/* Media Upload Buttons */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center justify-center px-4 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) handleFileSelect(validateFiles(files));
                  e.target.value = "";
                }}
                className="hidden"
              />
              <ImageIcon className="h-4 w-4 text-secondary mr-2" />
              <span className="text-sm text-secondary">Add Image</span>
            </label>

            <label className="flex items-center justify-center px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 cursor-pointer transition-colors group">
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) handleFileSelect(validateFiles(files));
                  e.target.value = "";
                }}
                className="hidden"
              />
              <VideoIcon className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-600">Add Video</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
