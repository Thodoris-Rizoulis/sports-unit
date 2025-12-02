import { z } from "zod";
import { idField } from "@/types/common";

// ========================================
// Post Input Validation Schemas
// For validating user input in forms and API requests
// Output types are defined in types/prisma.ts
// ========================================

/**
 * Post content validation
 */
export const postContentField = z
  .string()
  .min(1, "Post content cannot be empty")
  .max(500, "Post content cannot exceed 500 characters")
  .refine(
    (content) => !/<[^>]*>/.test(content),
    "Post content cannot contain HTML tags"
  );

/**
 * Comment content validation
 */
export const commentContentField = z
  .string()
  .min(1, "Comment content cannot be empty")
  .max(200, "Comment content cannot exceed 200 characters")
  .regex(
    /^[^<>&]*$/,
    "Comment content cannot contain HTML or special characters"
  );

// ========================================
// Input Schemas
// ========================================

/**
 * Schema for creating a new post
 */
export const createPostInputSchema = z.object({
  content: postContentField,
  media: z
    .array(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal("image"),
          file: z.string(),
        }),
        z.object({
          type: z.literal("video"),
          file: z.string(),
        }),
      ])
    )
    .optional(),
});

/**
 * Schema for creating a new comment
 */
export const createCommentInputSchema = z.object({
  content: commentContentField,
  parentCommentId: idField.nullable(),
});

/**
 * Schema for toggling like
 */
export const toggleLikeInputSchema = z.object({
  postId: idField,
});

/**
 * Schema for toggling save
 */
export const toggleSaveInputSchema = z.object({
  postId: idField,
});

/**
 * Schema for sharing a post
 */
export const sharePostInputSchema = z.object({
  postId: idField,
});

// ========================================
// Inferred Input Types
// ========================================

export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
export type ToggleLikeInput = z.infer<typeof toggleLikeInputSchema>;
export type ToggleSaveInput = z.infer<typeof toggleSaveInputSchema>;
export type SharePostInput = z.infer<typeof sharePostInputSchema>;
