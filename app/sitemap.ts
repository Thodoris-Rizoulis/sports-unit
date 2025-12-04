import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sportsunity.gr";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/discovery`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic user profile pages
  try {
    const users = await prisma.user.findMany({
      where: {
        isOnboardingComplete: true,
      },
      select: {
        publicUuid: true,
        username: true,
        updatedAt: true,
      },
      take: 1000, // Limit to prevent massive sitemaps
    });

    const userPages: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${baseUrl}/profile/${user.publicUuid}/${user.username}`,
      lastModified: user.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Dynamic hashtag pages - get hashtags that have posts
    const hashtags = await prisma.hashtag.findMany({
      where: {
        posts: {
          some: {}, // Only include hashtags that have at least one post
        },
      },
      select: {
        name: true,
        createdAt: true,
      },
      take: 500,
    });

    const hashtagPages: MetadataRoute.Sitemap = hashtags.map((hashtag) => ({
      url: `${baseUrl}/hashtag/${encodeURIComponent(hashtag.name)}`,
      lastModified: hashtag.createdAt ?? new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...userPages, ...hashtagPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return just static pages if database query fails
    return staticPages;
  }
}
