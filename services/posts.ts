import prisma from "@/lib/prisma";
import {
  Post,
  PostComment,
  PostMediaItem,
  toUserSummary,
} from "@/types/prisma";

// ========================================
// Input Types for PostService
// ========================================

type CreatePostInput = {
  content: string;
  media?: Array<{ type: string; file: string }>;
};

type CreateCommentInput = {
  content: string;
  parentCommentId?: number | null;
};

// ========================================
// Post Service
// ========================================

export class PostService {
  /**
   * Create a new post with optional media
   */
  static async createPost(
    userId: number,
    input: CreatePostInput
  ): Promise<Post> {
    const result = await prisma.$transaction(async (tx) => {
      // Create post
      const post = await tx.post.create({
        data: {
          userId,
          content: input.content,
        },
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
        },
      });

      // Insert media if provided
      const mediaRecords: PostMediaItem[] = [];
      if (input.media && input.media.length > 0) {
        for (let i = 0; i < input.media.length; i++) {
          const item = input.media[i];
          const media = await tx.postMedia.create({
            data: {
              postId: post.id,
              mediaType: item.type,
              url: null,
              key: item.file,
              orderIndex: i,
            },
          });
          mediaRecords.push({
            id: media.id,
            postId: media.postId,
            mediaType: media.mediaType,
            url: media.url,
            key: media.key,
            orderIndex: media.orderIndex,
          });
        }
      }

      return {
        id: post.id,
        publicUuid: post.publicUuid,
        content: post.content,
        createdAt: post.createdAt ?? new Date(),
        updatedAt: post.updatedAt ?? new Date(),
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        isSaved: false,
        media: mediaRecords,
        user: toUserSummary(post.user),
      };
    });

    return result;
  }

  /**
   * Get feed for user: posts from accepted connections and own posts
   */
  static async getFeed(
    userId: number,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Post[]> {
    const { limit = 20, offset = 0 } = options;

    // Get connected user IDs
    const connections = await prisma.connection.findMany({
      where: {
        status: "accepted",
        OR: [{ requesterId: userId }, { recipientId: userId }],
      },
      select: {
        requesterId: true,
        recipientId: true,
      },
    });

    const connectedUserIds = connections.map((c) =>
      c.requesterId === userId ? c.recipientId : c.requesterId
    );

    // Include own posts
    const userIds = [...connectedUserIds, userId];

    // Get posts
    const posts = await prisma.post.findMany({
      where: {
        userId: { in: userIds },
      },
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
      take: limit,
      skip: offset,
    });

    return posts.map((p) => ({
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
    }));
  }

  /**
   * Toggle like on a post
   */
  static async toggleLike(
    postId: number,
    userId: number
  ): Promise<{ liked: boolean; count: number }> {
    return await prisma.$transaction(async (tx) => {
      // Check if like exists
      const existingLike = await tx.postLike.findFirst({
        where: { postId, userId },
      });

      let liked: boolean;
      if (existingLike) {
        // Unlike
        await tx.postLike.delete({
          where: { id: existingLike.id },
        });
        liked = false;
      } else {
        // Like
        await tx.postLike.create({
          data: { postId, userId },
        });
        liked = true;
      }

      // Get updated count
      const count = await tx.postLike.count({
        where: { postId },
      });

      return { liked, count };
    });
  }

  /**
   * Add a comment to a post (or reply to another comment)
   */
  static async addComment(
    postId: number,
    userId: number,
    input: CreateCommentInput
  ): Promise<PostComment> {
    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId,
        parentCommentId: input.parentCommentId ?? null,
        content: input.content,
      },
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
      },
    });

    return {
      id: comment.id,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId,
      content: comment.content,
      createdAt: comment.createdAt ?? new Date(),
      likeCount: 0,
      isLiked: false,
      user: toUserSummary(comment.user),
    };
  }

  /**
   * Get comments for a post with like counts
   */
  static async getComments(
    postId: number,
    userId?: number
  ): Promise<PostComment[]> {
    const comments = await prisma.postComment.findMany({
      where: { postId },
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
        _count: {
          select: { likes: true },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: "asc" },
    });

    return comments.map((c) => ({
      id: c.id,
      postId: c.postId,
      parentCommentId: c.parentCommentId,
      content: c.content,
      createdAt: c.createdAt ?? new Date(),
      likeCount: c._count.likes,
      isLiked: Array.isArray(c.likes) ? c.likes.length > 0 : false,
      user: toUserSummary(c.user),
    }));
  }

  /**
   * Toggle like on a comment
   */
  static async toggleCommentLike(
    commentId: number,
    userId: number
  ): Promise<{ liked: boolean; count: number }> {
    return await prisma.$transaction(async (tx) => {
      // Check if like exists
      const existingLike = await tx.postCommentLike.findFirst({
        where: { commentId, userId },
      });

      let liked: boolean;
      if (existingLike) {
        // Unlike
        await tx.postCommentLike.delete({
          where: { id: existingLike.id },
        });
        liked = false;
      } else {
        // Like
        await tx.postCommentLike.create({
          data: { commentId, userId },
        });
        liked = true;
      }

      // Get updated count
      const count = await tx.postCommentLike.count({
        where: { commentId },
      });

      return { liked, count };
    });
  }

  /**
   * Share a post (record the share action)
   */
  static async sharePost(postId: number, userId: number): Promise<void> {
    await prisma.postShare.create({
      data: { postId, userId },
    });
  }

  /**
   * Toggle save on a post
   */
  static async toggleSave(
    postId: number,
    userId: number
  ): Promise<{ saved: boolean }> {
    return await prisma.$transaction(async (tx) => {
      // Check if save exists
      const existingSave = await tx.postSave.findFirst({
        where: { postId, userId },
      });

      let saved: boolean;
      if (existingSave) {
        // Unsave
        await tx.postSave.delete({
          where: { id: existingSave.id },
        });
        saved = false;
      } else {
        // Save
        await tx.postSave.create({
          data: { postId, userId },
        });
        saved = true;
      }

      return { saved };
    });
  }

  /**
   * Get a single post by public UUID
   */
  static async getPostByUuid(publicUuid: string): Promise<Post | null> {
    const post = await prisma.post.findUnique({
      where: { publicUuid },
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
      },
    });

    if (!post) return null;

    return {
      id: post.id,
      publicUuid: post.publicUuid,
      content: post.content,
      createdAt: post.createdAt ?? new Date(),
      updatedAt: post.updatedAt ?? new Date(),
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLiked: false, // No user context
      isSaved: false,
      media: post.media.map((m) => ({
        id: m.id,
        postId: m.postId,
        mediaType: m.mediaType,
        url: m.url,
        key: m.key,
        orderIndex: m.orderIndex,
      })),
      user: toUserSummary(post.user),
    };
  }

  /**
   * Get saved posts for a user
   */
  static async getSavedPosts(
    userId: number,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Post[]> {
    const { limit = 20, offset = 0 } = options;

    const saves = await prisma.postSave.findMany({
      where: { userId },
      include: {
        post: {
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return saves.map((s) => ({
      id: s.post.id,
      publicUuid: s.post.publicUuid,
      content: s.post.content,
      createdAt: s.post.createdAt ?? new Date(),
      updatedAt: s.post.updatedAt ?? new Date(),
      likeCount: s.post._count.likes,
      commentCount: s.post._count.comments,
      isLiked: s.post.likes.length > 0,
      isSaved: true,
      media: s.post.media.map((m) => ({
        id: m.id,
        postId: m.postId,
        mediaType: m.mediaType,
        url: m.url,
        key: m.key,
        orderIndex: m.orderIndex,
      })),
      user: toUserSummary(s.post.user),
    }));
  }
}
