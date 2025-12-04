"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPostInputSchema, CreatePostInput } from "@/types/posts";
import { Post } from "@/types/prisma";
import { ImageIcon, VideoIcon, LinkIcon, PenTool } from "lucide-react";
import { MediaPreview } from "./MediaPreview";
import { LinkDialog } from "./LinkDialog";
import { cn } from "@/lib/utils";
import { requireSessionUserId } from "@/lib/auth-utils";

interface PostCreationFormProps {
  onPostCreated?: (post: Post) => void;
}

export function PostCreationForm({ onPostCreated }: PostCreationFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    Array<{
      file: File;
      type: "image" | "video";
      uploadProgress?: number;
      uploadStatus?: "pending" | "uploading" | "completed" | "error";
      error?: string;
      uploadedKey?: string;
    }>
  >([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowButtons(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostInputSchema),
  });

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

    // Find the file in selectedFiles and update its status
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

      // Upload file to R2 with progress tracking
      await uploadWithProgress(uploadUrl, file);

      // Update file status to completed
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

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addLink = (linkData: { title: string; url: string }) => {
    // Insert markdown-style link at cursor position or at end
    const textarea = document.querySelector(
      'textarea[name="content"]'
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const linkText = `[${linkData.title}](${linkData.url})`;

      // Replace selected text with link, or insert at cursor
      const newText = text.substring(0, start) + linkText + text.substring(end);
      textarea.value = newText;

      // Update form value
      setValue("content", newText);

      // Focus back to textarea
      textarea.focus();
      textarea.setSelectionRange(
        start + linkText.length,
        start + linkText.length
      );
    }
  };

  // File validation logic
  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const maxSize = 50; // 50MB

    for (const file of files) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        console.error(`${file.name} is too large (max ${maxSize}MB)`);
        continue;
      }

      // Check file type
      const acceptTypes = ["image/*", "video/*"];
      const isValidType = acceptTypes.some((type) => {
        if (type === "*") return true;
        if (type.endsWith("/*")) {
          const baseType = type.slice(0, -1); // Remove the /*
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isValidType) {
        console.error(`${file.name} is not a supported file type`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  // Drag and drop handlers
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
      // Build media array from uploaded files only
      const media = selectedFiles.map((file) => ({
        type: file.type,
        file: file.uploadedKey!,
      }));

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, media }),
      });

      if (!response.ok) throw new Error("Post creation failed");

      const createdPost = await response.json();

      reset();
      setSelectedFiles([]);
      onPostCreated?.(createdPost);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      ref={cardRef}
      className="border-border/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden"
    >
      <CardContent className="p-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn(
            "divide-y divide-border/30 transition-all duration-200",
            isDragOver && "ring-2 ring-primary ring-opacity-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Text Input Area */}
          <div className="p-6 border-b-0">
            <div className="relative">
              <Textarea
                id="content"
                {...register("content")}
                placeholder="Write something..."
                rows={3}
                onFocus={() => setShowButtons(true)}
                className="resize-none border-0 bg-transparent text-foreground placeholder-muted-foreground focus:ring-0 focus:outline-none text-base leading-relaxed min-h-[80px]"
              />
              <PenTool className="absolute top-3 right-3 h-5 w-5 text-muted-foreground/60" />
            </div>
            {errors.content && (
              <p className="text-sm text-destructive mt-2">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Media/Attachment Bar */}
          <div
            className={cn(
              "px-6 py-4 transition-all duration-300 overflow-hidden",
              showButtons || selectedFiles.length > 0
                ? "opacity-100 max-h-96"
                : "opacity-0 max-h-0"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {/* Photo Upload */}
                <label className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/10 hover:bg-secondary/20 cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) handleFileSelect(files);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <ImageIcon className="h-5 w-5 text-secondary group-hover:text-secondary/80" />
                </label>

                {/* Divider */}
                <div className="h-8 w-px bg-border/50 mx-2"></div>

                {/* Video Upload */}
                <label className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 hover:bg-red-100 cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) handleFileSelect(files);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <VideoIcon className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                </label>

                {/* Divider */}
                <div className="h-8 w-px bg-border/50 mx-2"></div>

                {/* Link Button */}
                <button
                  type="button"
                  onClick={() => setIsLinkDialogOpen(true)}
                  className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors group"
                >
                  <LinkIcon className="h-5 w-5 text-accent group-hover:text-accent/80" />
                </button>
              </div>

              {/* Post Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>

            {/* Media Preview */}
            <MediaPreview
              selectedFiles={selectedFiles}
              onRemoveFile={(index) => {
                setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
              }}
              onReorderFiles={(newOrder) => {
                setSelectedFiles(newOrder);
              }}
            />
          </div>
        </form>
      </CardContent>

      {/* Link Dialog */}
      <LinkDialog
        isOpen={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
        onAddLink={addLink}
      />
    </Card>
  );
}
