/**
 * Notification Types
 *
 * Zod schemas and input types for notification validation.
 * Output types are defined in types/prisma.ts as per constitution.
 */

import { z } from "zod";
import { idField } from "./common";

// ========================================
// Notification Type Enum
// ========================================

export const notificationTypeSchema = z.enum([
  "CONNECTION_REQUEST",
  "POST_LIKE",
  "POST_COMMENT",
]);
export type NotificationTypeValue = z.infer<typeof notificationTypeSchema>;

// ========================================
// Input Schemas
// ========================================

/**
 * Create notification input (internal use by services)
 */
export const createNotificationSchema = z.object({
  recipientId: idField,
  actorId: idField,
  type: notificationTypeSchema,
  entityType: z.string().max(50),
  entityId: idField,
});
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

/**
 * Query params for fetching notifications
 */
export const getNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  cursor: z.coerce.number().int().optional(),
  grouped: z.coerce.boolean().default(true),
});
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
