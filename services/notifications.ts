/**
 * Notification Service
 *
 * Handles all notification-related business logic including creation,
 * retrieval, grouping, and deletion of notifications.
 */

import prisma from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";
import type { CreateNotificationInput } from "@/types/notifications";
import {
  type GroupedNotification,
  type NotificationUI,
  type UserSummary,
  includeNotificationWithActor,
  toNotificationUI,
  toUserSummary,
} from "@/types/prisma";

// ========================================
// Types for NotificationService
// ========================================

type GetNotificationsOptions = {
  limit?: number;
  cursor?: number;
  grouped?: boolean;
};

type NotificationsResult = {
  notifications: GroupedNotification[];
  nextCursor: number | null;
  hasMore: boolean;
};

// ========================================
// Notification Service
// ========================================

export class NotificationService {
  /**
   * Create a new notification
   * Validates that actor is not the same as recipient (no self-notifications)
   */
  static async create(input: CreateNotificationInput): Promise<void> {
    // Prevent self-notifications
    if (input.actorId === input.recipientId) {
      return;
    }

    try {
      await prisma.notification.create({
        data: {
          recipientId: input.recipientId,
          actorId: input.actorId,
          type: input.type as NotificationType,
          entityType: input.entityType,
          entityId: input.entityId,
        },
      });
    } catch (error) {
      // Log error but don't fail the parent operation
      console.error("Failed to create notification:", error);
    }
  }

  /**
   * Get notifications for a user with pagination and optional grouping
   */
  static async getByUserId(
    userId: number,
    options: GetNotificationsOptions = {}
  ): Promise<NotificationsResult> {
    const { limit = 15, cursor, grouped = true } = options;

    // Build where clause
    const where: { recipientId: number; id?: { lt: number } } = {
      recipientId: userId,
    };

    if (cursor) {
      where.id = { lt: cursor };
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where,
      include: includeNotificationWithActor,
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Fetch one extra to check if there are more
    });

    // Determine if there are more results
    const hasMore = notifications.length > limit;
    const items = hasMore ? notifications.slice(0, limit) : notifications;

    // Calculate next cursor
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    // Map to UI types with entity public UUIDs for navigation
    const notificationUIs = await Promise.all(
      items.map(async (n) => {
        let entityPublicUuid: string | undefined;

        // Get entity public UUID for posts
        if (n.entityType === "post") {
          const post = await prisma.post.findUnique({
            where: { id: n.entityId },
            select: { publicUuid: true },
          });
          entityPublicUuid = post?.publicUuid;
        }

        return toNotificationUI(n, entityPublicUuid);
      })
    );

    // Group if requested
    const groupedNotifications = grouped
      ? this.groupNotifications(notificationUIs)
      : notificationUIs.map((n) => ({
          ...n,
          otherActors: [] as UserSummary[],
          count: 1,
        }));

    return {
      notifications: groupedNotifications,
      nextCursor,
      hasMore,
    };
  }

  /**
   * Get count of unread notifications for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    return await prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   * Returns the number of notifications marked
   */
  static async markAllAsRead(userId: number): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Delete notification(s) by action (for undo operations like unlike)
   * Deletes all notifications matching the actor, type, and entityId
   */
  static async deleteByAction(
    actorId: number,
    type: NotificationType,
    entityId: number
  ): Promise<void> {
    try {
      await prisma.notification.deleteMany({
        where: {
          actorId,
          type,
          entityId,
        },
      });
    } catch (error) {
      // Log error but don't fail the parent operation
      console.error("Failed to delete notification:", error);
    }
  }

  /**
   * Group notifications by type and entity for unread items
   * Read notifications and CONNECTION_REQUEST are never grouped
   */
  static groupNotifications(
    notifications: NotificationUI[]
  ): GroupedNotification[] {
    const groups = new Map<string, NotificationUI[]>();

    for (const notification of notifications) {
      // Don't group connection requests or read notifications
      if (notification.type === "CONNECTION_REQUEST" || notification.isRead) {
        groups.set(`single-${notification.id}`, [notification]);
      } else {
        // Group by type + entityId
        const key = `${notification.type}-${notification.entityId}`;
        const existing = groups.get(key) || [];
        groups.set(key, [...existing, notification]);
      }
    }

    // Convert groups to GroupedNotification array
    const result: GroupedNotification[] = [];

    for (const group of groups.values()) {
      // Sort group by createdAt descending (most recent first)
      group.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const mostRecent = group[0];
      const otherActors = group.slice(1).map((n) => n.actor);

      result.push({
        id: mostRecent.id,
        type: mostRecent.type,
        entityType: mostRecent.entityType,
        entityId: mostRecent.entityId,
        entityPublicUuid: mostRecent.entityPublicUuid,
        isRead: mostRecent.isRead,
        createdAt: mostRecent.createdAt,
        actor: mostRecent.actor,
        otherActors,
        count: group.length,
      });
    }

    // Sort result by most recent createdAt
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return result;
  }

  /**
   * Get new notifications since a given ID (for SSE polling)
   */
  static async getNewSince(
    userId: number,
    sinceId: number
  ): Promise<NotificationUI[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: userId,
        id: { gt: sinceId },
      },
      include: includeNotificationWithActor,
      orderBy: { createdAt: "desc" },
    });

    return Promise.all(
      notifications.map(async (n) => {
        let entityPublicUuid: string | undefined;

        if (n.entityType === "post") {
          const post = await prisma.post.findUnique({
            where: { id: n.entityId },
            select: { publicUuid: true },
          });
          entityPublicUuid = post?.publicUuid;
        }

        return toNotificationUI(n, entityPublicUuid);
      })
    );
  }
}
