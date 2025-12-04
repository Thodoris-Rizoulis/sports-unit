"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { PostMediaItem } from "@/types/prisma";

interface MediaLightboxProps {
  media: PostMediaItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaLightbox({
  media,
  initialIndex = 0,
  isOpen,
  onClose,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentMedia = media[currentIndex];
  const hasMultiple = media.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!currentMedia) return null;

  const mediaUrl =
    currentMedia.url ||
    `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${currentMedia.key}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-full h-full max-h-[90vh] p-0 bg-black/95 border-none"
        showCloseButton={false}
      >
        <VisuallyHidden.Root asChild>
          <DialogTitle>Media viewer</DialogTitle>
        </VisuallyHidden.Root>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {hasMultiple && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 z-10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 z-10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Media display */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {currentMedia.mediaType === "image" ? (
              <Image
                src={mediaUrl}
                alt="Post media"
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
                priority
              />
            ) : (
              <video
                src={mediaUrl}
                controls
                className="max-w-full max-h-full object-contain"
                autoPlay
              />
            )}
          </div>

          {/* Indicator */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
