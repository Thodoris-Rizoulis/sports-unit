"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImageIcon, VideoIcon, Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
}

export function DragDropUpload({
  onFileSelect,
  accept = "image/*,video/*",
  multiple = true,
  maxFiles = 10,
  maxSize = 50, // 50MB default
  disabled = false,
  className,
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          errors.push(`${file.name} is too large (max ${maxSize}MB)`);
          continue;
        }

        // Check file type
        const acceptTypes = accept.split(",").map((type) => type.trim());
        const isValidType = acceptTypes.some((type) => {
          if (type === "*") return true;
          if (type.endsWith("/*")) {
            const baseType = type.slice(0, -1); // Remove the /*
            return file.type.startsWith(baseType);
          }
          return file.type === type;
        });

        if (!isValidType) {
          errors.push(`${file.name} is not a supported file type`);
          continue;
        }

        validFiles.push(file);
      }

      if (errors.length > 0) {
        setError(errors.join(", "));
      } else {
        setError(null);
      }

      return validFiles;
    },
    [accept, maxSize]
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (!multiple && fileArray.length > 1) {
        setError("Only one file allowed");
        return;
      }

      if (fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validFiles = validateFiles(fileArray);
      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }
    },
    [multiple, maxFiles, validateFiles, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [disabled, handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={cn("space-y-2", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            {isDragOver ? (
              <Upload className="h-12 w-12 text-primary animate-bounce" />
            ) : (
              <div className="flex gap-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <VideoIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver ? "Drop files here" : "Drag & drop media here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports images and videos up to {maxSize}MB each
              {multiple && ` (max ${maxFiles} files)`}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="h-auto p-0 ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
