import prisma from "@/lib/prisma";
import { extractHashtags } from "@/lib/utils";
import { Post, PopularHashtag, toUserSummary } from "@/types/prisma";

// ========================================
// Hashtag Service
// ========================================

export class HashtagService {
  /**
   * Extract hashtags from content and link them to a post.
   * Creates new hashtags if they don't exist (upsert pattern).
   * Deduplicates hashtags within the same post.
   *
   * @param postId - The post ID to link hashtags to
   * @param content - The post content to extract hashtags from
   */
  static async extractAndLinkHashtags(
    postId: number,
    content: string | null
  ): Promise<void> {
    if (!content) return;

    const hashtagNames = extractHashtags(content);
    if (hashtagNames.length === 0) return;

    // Upsert hashtags and get their IDs
    const hashtagIds: number[] = [];

    for (const name of hashtagNames) {
      const hashtag = await prisma.hashtag.upsert({
        where: { name },
        create: { name },
        update: {}, // No update needed, just return existing
        select: { id: true },
      });
      hashtagIds.push(hashtag.id);
    }

    // Create post-hashtag links (skip duplicates via unique constraint)
    await prisma.postHashtag.createMany({
      data: hashtagIds.map((hashtagId) => ({
        postId,
        hashtagId,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Get the most popular hashtags from the last N days.
   * Popularity is measured by number of posts using the hashtag.
   *
   * @param days - Number of days to look back (default: 7)
   * @param limit - Maximum number of hashtags to return (default: 5)
   * @returns Array of popular hashtags
   */
  static async getPopularHashtags(
    days: number = 7,
    limit: number = 5
  ): Promise<PopularHashtag[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Use raw query for efficient GROUP BY with ORDER BY count
    const results = await prisma.$queryRaw<{ id: number; name: string }[]>`
      SELECT h.id, h.name
      FROM hashtags h
      JOIN post_hashtags ph ON h.id = ph.hashtag_id
      WHERE ph.created_at >= ${cutoffDate}
      GROUP BY h.id, h.name
      ORDER BY COUNT(ph.id) DESC
      LIMIT ${limit}
    `;

    return results.map((r) => ({
      id: r.id,
      name: r.name,
    }));
  }

  /**
   * Get posts containing a specific hashtag with cursor-based pagination.
   * Returns posts ordered newest first.
   *
   * @param hashtag - The hashtag name (without #, lowercase)
   * @param userId - Current user ID for like/save status
   * @param cursor - Last post ID for pagination (optional)
   * @param limit - Number of posts to return (default: 20)
   * @returns Posts and pagination info
   */
  static async getPostsByHashtag(
    hashtag: string,
    userId: number,
    cursor?: number,
    limit: number = 20
  ): Promise<{ posts: Post[]; nextCursor: number | null; hasMore: boolean }> {
    // Find the hashtag
    const hashtagRecord = await prisma.hashtag.findUnique({
      where: { name: hashtag.toLowerCase() },
      select: { id: true },
    });

    if (!hashtagRecord) {
      return { posts: [], nextCursor: null, hasMore: false };
    }

    // Build where clause for cursor-based pagination
    const whereClause: {
      hashtags: { some: { hashtagId: number } };
      id?: { lt: number };
    } = {
      hashtags: {
        some: { hashtagId: hashtagRecord.id },
      },
    };

    if (cursor) {
      whereClause.id = { lt: cursor };
    }

    // Fetch posts with one extra to determine hasMore
    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            publicUuid: true,
            attributes: {
              select: {
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        media: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        saves: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Fetch one extra to check if there are more
    });

    const hasMore = posts.length > limit;
    const resultPosts = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor =
      resultPosts.length > 0 ? resultPosts[resultPosts.length - 1].id : null;

    return {
      posts: resultPosts.map((p) => ({
        id: p.id,
        publicUuid: p.publicUuid,
        content: p.content,
        createdAt: p.createdAt ?? new Date(),
        updatedAt: p.updatedAt ?? new Date(),
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        isLiked: p.likes.length > 0,
        isSaved: p.saves.length > 0,
        media: p.media.map((m) => ({
          id: m.id,
          postId: m.postId,
          mediaType: m.mediaType,
          url: m.url,
          key: m.key,
          orderIndex: m.orderIndex,
        })),
        user: toUserSummary(p.user),
      })),
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
    };
  }
}
