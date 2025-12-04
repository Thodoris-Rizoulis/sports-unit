# Data Model: Notifications

**Date**: 2025-12-03  
**Feature**: 014-notifications

## Entity: Notification

Represents a single notification event sent to a user about activity on the platform.

### Fields

| Field       | Type             | Constraints                     | Description                                              |
| ----------- | ---------------- | ------------------------------- | -------------------------------------------------------- |
| id          | Int              | Primary Key, Auto-increment     | Unique identifier                                        |
| recipientId | Int              | Foreign Key → User.id, NOT NULL | User who receives the notification                       |
| actorId     | Int              | Foreign Key → User.id, NOT NULL | User who triggered the notification                      |
| type        | NotificationType | Enum, NOT NULL                  | Type of notification                                     |
| entityType  | String           | VARCHAR(50), NOT NULL           | Type of related entity ('post', 'connection', 'comment') |
| entityId    | Int              | NOT NULL                        | ID of the related entity                                 |
| isRead      | Boolean          | Default: false                  | Whether notification has been read                       |
| createdAt   | DateTime         | Default: now()                  | When notification was created                            |
| updatedAt   | DateTime         | Default: now()                  | When notification was last updated                       |

### Relationships

- **recipient** → User (many-to-one): The user receiving this notification
- **actor** → User (many-to-one): The user who performed the action

### Indexes

| Name                                | Columns                               | Purpose                  |
| ----------------------------------- | ------------------------------------- | ------------------------ |
| idx_notifications_recipient_unread  | (recipientId, isRead, createdAt DESC) | Badge count, unread list |
| idx_notifications_recipient_created | (recipientId, createdAt DESC)         | Paginated history        |
| idx_notifications_actor_entity      | (actorId, type, entityId)             | Find/delete by action    |

### Validation Rules

- `recipientId` must reference existing User
- `actorId` must reference existing User
- `actorId` must not equal `recipientId` (no self-notifications)
- `type` must be valid NotificationType enum value
- `entityId` must reference valid entity based on `entityType`

### State Transitions

```
[Created] ──(mark as read)──> [Read]
[Created] ──(action undone)──> [Deleted]
[Read] ──(no transitions)──> [Read]
```

## Enum: NotificationType

Enumeration of supported notification types.

| Value              | Description                       | Entity Type | Navigation          |
| ------------------ | --------------------------------- | ----------- | ------------------- |
| CONNECTION_REQUEST | Someone sent a connection request | connection  | /profile/[username] |
| POST_LIKE          | Someone liked your post           | post        | /post/[postId]      |
| POST_COMMENT       | Someone commented on your post    | post        | /post/[postId]      |

### Future Values (schema ready)

| Value        | Description                     | Entity Type |
| ------------ | ------------------------------- | ----------- |
| MENTION      | Someone mentioned you in a post | post        |
| PROFILE_VIEW | Someone viewed your profile     | user        |

## Prisma Schema Addition

```prisma
// Add to prisma/schema.prisma

enum NotificationType {
  CONNECTION_REQUEST
  POST_LIKE
  POST_COMMENT

  @@map("notification_type_enum")
}

model Notification {
  id          Int              @id @default(autoincrement())
  type        NotificationType
  entityType  String           @map("entity_type") @db.VarChar(50)
  entityId    Int              @map("entity_id")
  isRead      Boolean          @default(false) @map("is_read")
  createdAt   DateTime?        @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime?        @default(now()) @map("updated_at") @db.Timestamptz(6)

  recipientId Int  @map("recipient_id")
  recipient   User @relation("NotificationsReceived", fields: [recipientId], references: [id], onDelete: Cascade)

  actorId     Int  @map("actor_id")
  actor       User @relation("NotificationsSent", fields: [actorId], references: [id], onDelete: Cascade)

  @@index([recipientId, isRead, createdAt(sort: Desc)], map: "idx_notifications_recipient_unread")
  @@index([recipientId, createdAt(sort: Desc)], map: "idx_notifications_recipient_created")
  @@index([actorId, type, entityId], map: "idx_notifications_actor_entity")
  @@map("notifications")
}
```

## User Model Updates

```prisma
// Add to User model in prisma/schema.prisma

model User {
  // ... existing fields ...

  // Notifications
  notificationsReceived Notification[] @relation("NotificationsReceived")
  notificationsSent     Notification[] @relation("NotificationsSent")
}
```

## TypeScript Types

### Output Types (types/prisma.ts)

```typescript
// Notification include pattern
// Note: profilePictureUrl from Prisma maps to profileImageUrl in UserSummary via toUserSummary()
export const includeNotificationWithActor = {
  actor: {
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
} satisfies Prisma.NotificationInclude;

// UI output type
export type NotificationUI = {
  id: number;
  type: "CONNECTION_REQUEST" | "POST_LIKE" | "POST_COMMENT";
  entityType: string;
  entityId: number;
  isRead: boolean;
  createdAt: Date;
  actor: UserSummary;
};

// Grouped notification for dropdown display
export type GroupedNotification = {
  id: number; // ID of most recent notification in group
  type: "CONNECTION_REQUEST" | "POST_LIKE" | "POST_COMMENT";
  entityType: string;
  entityId: number;
  entityPublicUuid?: string; // For post navigation (posts use publicUuid in URLs)
  isRead: boolean;
  createdAt: Date;
  actor: UserSummary; // Most recent actor
  otherActors: UserSummary[]; // Other actors in group
  count: number; // Total count in group
};
```

### Input Types (types/notifications.ts)

```typescript
import { z } from "zod";
import { idField } from "./common";

// Notification type enum
export const notificationTypeSchema = z.enum([
  "CONNECTION_REQUEST",
  "POST_LIKE",
  "POST_COMMENT",
]);
export type NotificationTypeValue = z.infer<typeof notificationTypeSchema>;

// Create notification input (internal use)
export const createNotificationSchema = z.object({
  recipientId: idField,
  actorId: idField,
  type: notificationTypeSchema,
  entityType: z.string().max(50),
  entityId: idField,
});
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// Query params for fetching notifications
export const getNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(15),
  cursor: z.coerce.number().int().optional(),
  grouped: z.coerce.boolean().default(true),
});
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
```

## Migration SQL

```sql
-- Migration: 019_add_notifications_table

-- Create enum type
CREATE TYPE notification_type_enum AS ENUM ('CONNECTION_REQUEST', 'POST_LIKE', 'POST_COMMENT');

-- Create notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notifications_recipient_unread
  ON notifications (recipient_id, is_read, created_at DESC);

CREATE INDEX idx_notifications_recipient_created
  ON notifications (recipient_id, created_at DESC);

CREATE INDEX idx_notifications_actor_entity
  ON notifications (actor_id, type, entity_id);

-- Add constraint: actor cannot be recipient
ALTER TABLE notifications
  ADD CONSTRAINT chk_no_self_notification CHECK (actor_id != recipient_id);
```
