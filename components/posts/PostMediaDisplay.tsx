"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { PostMediaItem } from "@/types/prisma";
import { Play } from "lucide-react";
import { MediaLightbox } from "./MediaLightbox";

interface PostMediaDisplayProps {
  media: PostMediaItem[];
}

export function PostMediaDisplay({ media }: PostMediaDisplayProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!media || media.length === 0) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Single image
  if (media.length === 1 && media[0].mediaType === "image") {
    const imageUrl =
      media[0].url ||
      `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${media[0].key}`;
    return (
      <>
        <div
          className="mt-4 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={imageUrl}
            alt="Post image"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
        <MediaLightbox
          media={media}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  // Single video
  if (media.length === 1 && media[0].mediaType === "video") {
    const videoUrl =
      media[0].url ||
      `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${media[0].key}`;
    return (
      <div className="mt-4 rounded-lg overflow-hidden border">
        <video
          src={videoUrl}
          controls
          className="w-full h-auto max-h-96 object-cover"
          poster={`${videoUrl}#t=0.1`}
        />
      </div>
    );
  }

  // Multiple images (grid layout)
  if (media.every((m) => m.mediaType === "image")) {
    return (
      <div className="mt-4 grid gap-2 rounded-lg overflow-hidden border">
        {media.length === 2 && (
          <div className="grid grid-cols-2 gap-2">
            {media.map((item, index) => {
              const imageUrl =
                item.url ||
                `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${item.key}`;
              return (
                <Image
                  key={item.id}
                  src={imageUrl}
                  alt="Post image"
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  loading="lazy"
                  onClick={() => openLightbox(index)}
                />
              );
            })}
          </div>
        )}
        {media.length === 3 && (
          <div className="grid grid-cols-2 gap-2">
            <Image
              src={
                media[0].url ||
                `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${media[0].key}`
              }
              alt="Post image"
              width={300}
              height={300}
              className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
              onClick={() => openLightbox(0)}
            />
            <div className="grid grid-rows-2 gap-2">
              <Image
                src={
                  media[1].url ||
                  `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${media[1].key}`
                }
                alt="Post image"
                width={300}
                height={150}
                className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={() => openLightbox(1)}
              />
              <Image
                src={
                  media[2].url ||
                  `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${media[2].key}`
                }
                alt="Post image"
                width={300}
                height={150}
                className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={() => openLightbox(2)}
              />
            </div>
          </div>
        )}
        {media.length >= 4 && (
          <div className="grid grid-cols-2 gap-2">
            {media.slice(0, 4).map((item, index) => {
              const imageUrl =
                item.url ||
                `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${item.key}`;
              return (
                <Image
                  key={item.id}
                  src={imageUrl}
                  alt="Post image"
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  loading="lazy"
                  onClick={() => openLightbox(index)}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Mixed media types - show as list
  return (
    <>
      <div className="mt-4 space-y-2">
        {media.map((item, index) => {
          if (item.mediaType === "image") {
            const imageUrl =
              item.url ||
              `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${item.key}`;
            return (
              <div
                key={item.id}
                className="rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={imageUrl}
                  alt="Post image"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            );
          }

          if (item.mediaType === "video") {
            const videoUrl =
              item.url ||
              `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${item.key}`;
            return (
              <div key={item.id} className="rounded-lg overflow-hidden border">
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-auto max-h-96 object-cover"
                  poster={`${videoUrl}#t=0.1`}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
      <MediaLightbox
        media={media}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
