import prisma from "@/lib/prisma";
import { enforcePaginationLimit, enforcePaginationOffset } from "@/lib/utils";
import {
  Post,
  PostComment,
  PostMediaItem,
  toUserSummary,
} from "@/types/prisma";
import { HashtagService } from "./hashtags";
import { NotificationService } from "./notifications";

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

    // Extract and link hashtags after transaction completes
    await HashtagService.extractAndLinkHashtags(result.id, result.content);

    return result;
  }

  /**
   * Get feed for user: posts from accepted connections and own posts
   */
  static async getFeed(
    userId: number,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Post[]> {
    const limit = enforcePaginationLimit(options.limit);
    const offset = enforcePaginationOffset(options.offset);

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
    // Get post to check owner for notifications
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    const result = await prisma.$transaction(async (tx) => {
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

    // Handle notifications (outside transaction for non-blocking)
    if (post && post.userId !== userId) {
      if (result.liked) {
        // Create notification on like
        await NotificationService.create({
          recipientId: post.userId,
          actorId: userId,
          type: "POST_LIKE",
          entityType: "post",
          entityId: postId,
        });
      } else {
        // Delete notification on unlike
        await NotificationService.deleteByAction(userId, "POST_LIKE", postId);
      }
    }

    return result;
  }

  /**
   * Add a comment to a post (or reply to another comment)
   */
  static async addComment(
    postId: number,
    userId: number,
    input: CreateCommentInput
  ): Promise<PostComment> {
    // Get post to check owner for notifications
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    // Get parent comment author if this is a reply
    let parentCommentAuthorId: number | null = null;
    if (input.parentCommentId) {
      const parentComment = await prisma.postComment.findUnique({
        where: { id: input.parentCommentId },
        select: { userId: true },
      });
      parentCommentAuthorId = parentComment?.userId ?? null;
    }

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

    // Notification logic:
    // 1. POST_COMMENT → Post owner gets notified for ANY comment/reply on their post (not self)
    // 2. COMMENT_REPLY → Comment owner gets notified when someone replies to their comment
    // 3. Conflict: If post owner IS the parent comment author, only send POST_COMMENT (not both)

    const postOwnerId = post?.userId;
    const isCommenterPostOwner = postOwnerId === userId;
    const isParentCommentByPostOwner = parentCommentAuthorId === postOwnerId;

    // Send POST_COMMENT to post owner for any comment (if commenter is not the post owner)
    if (postOwnerId && !isCommenterPostOwner) {
      await NotificationService.create({
        recipientId: postOwnerId,
        actorId: userId,
        type: "POST_COMMENT",
        entityType: "post",
        entityId: postId,
      });
    }

    // Send COMMENT_REPLY to parent comment author when:
    // - This IS a reply (has parentCommentId)
    // - Parent comment author is NOT the current user (no self-notification)
    // - Parent comment author is NOT the post owner (they already got POST_COMMENT above)
    if (
      parentCommentAuthorId !== null &&
      parentCommentAuthorId !== userId &&
      !isParentCommentByPostOwner
    ) {
      await NotificationService.create({
        recipientId: parentCommentAuthorId,
        actorId: userId,
        type: "COMMENT_REPLY",
        entityType: "post",
        entityId: postId,
      });
    }

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
    const limit = enforcePaginationLimit(options.limit);
    const offset = enforcePaginationOffset(options.offset);

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

  /**
   * Get posts by a specific user
   */
  static async getUserPosts(
    targetUserId: number,
    currentUserId?: number,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Post[]> {
    const limit = enforcePaginationLimit(options.limit);
    const offset = enforcePaginationOffset(options.offset);

    const posts = await prisma.post.findMany({
      where: {
        userId: targetUserId,
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
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
        saves: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
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
      isLiked: Array.isArray(p.likes) ? p.likes.length > 0 : false,
      isSaved: Array.isArray(p.saves) ? p.saves.length > 0 : false,
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
   * Update a post (only by the owner)
   */
  static async updatePost(
    postId: number,
    userId: number,
    input: CreatePostInput
  ): Promise<Post | null> {
    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!existingPost || existingPost.userId !== userId) {
      return null;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update post content
      const post = await tx.post.update({
        where: { id: postId },
        data: {
          content: input.content,
          updatedAt: new Date(),
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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      // Delete existing media and add new ones if provided
      await tx.postMedia.deleteMany({ where: { postId } });

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
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isLiked: false,
        isSaved: false,
        media: mediaRecords,
        user: toUserSummary(post.user),
      };
    });

    // Update hashtags
    await HashtagService.extractAndLinkHashtags(postId, input.content);

    return result;
  }

  /**
   * Delete a post (only by the owner)
   * Returns true if deleted, false if not found or not authorized
   */
  static async deletePost(postId: number, userId: number): Promise<boolean> {
    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!existingPost || existingPost.userId !== userId) {
      return false;
    }

    // Delete the post (cascades to media, likes, comments, saves, shares, hashtags)
    await prisma.post.delete({ where: { id: postId } });

    return true;
  }

  /**
   * Update a comment (only by the comment owner)
   */
  static async updateComment(
    commentId: number,
    userId: number,
    content: string
  ): Promise<PostComment | null> {
    // Verify ownership
    const existingComment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!existingComment || existingComment.userId !== userId) {
      return null;
    }

    const comment = await prisma.postComment.update({
      where: { id: commentId },
      data: { content },
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
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    return {
      id: comment.id,
      postId: comment.postId,
      parentCommentId: comment.parentCommentId,
      content: comment.content,
      createdAt: comment.createdAt ?? new Date(),
      likeCount: comment._count.likes,
      isLiked: comment.likes.length > 0,
      user: toUserSummary(comment.user),
    };
  }

  /**
   * Delete a comment
   * User can delete their own comment from any post
   * Post owner can delete any comment on their post
   * Returns true if deleted, false if not found or not authorized
   */
  static async deleteComment(
    commentId: number,
    userId: number
  ): Promise<boolean> {
    // Get comment with post info
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: {
        userId: true,
        post: {
          select: { userId: true },
        },
      },
    });

    if (!comment) {
      return false;
    }

    // Check authorization: either comment owner or post owner
    const isCommentOwner = comment.userId === userId;
    const isPostOwner = comment.post.userId === userId;

    if (!isCommentOwner && !isPostOwner) {
      return false;
    }

    // Delete the comment (cascades to likes and replies)
    await prisma.postComment.delete({ where: { id: commentId } });

    return true;
  }

  /**
   * Get a single post by ID with user context
   */
  static async getPostById(
    postId: number,
    currentUserId?: number
  ): Promise<Post | null> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
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
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
        saves: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
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
      isLiked: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      isSaved: Array.isArray(post.saves) ? post.saves.length > 0 : false,
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
}
