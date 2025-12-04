# Quickstart: Notifications Feature

**Date**: 2025-12-03  
**Feature**: 014-notifications

## Overview

This document provides a quick reference for implementing the Notifications feature.

## Prerequisites

1. PostgreSQL database with existing schema
2. Prisma ORM configured (`lib/prisma.ts`)
3. NextAuth.js authentication (`services/auth.ts`)
4. React Query configured (`QueryProvider.tsx`)

## Implementation Order

### Phase 1: Database & Types

1. **Add enum to Prisma schema** (`prisma/schema.prisma`)

   ```prisma
   enum NotificationType {
     CONNECTION_REQUEST
     POST_LIKE
     POST_COMMENT
     @@map("notification_type_enum")
   }
   ```

2. **Add Notification model** to Prisma schema

3. **Update User model** with notification relations

4. **Create migration** (`migrations/019_add_notifications_table.ts`)

5. **Run migration** and regenerate Prisma client:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. **Create types** (`types/notifications.ts`) - Zod schemas

7. **Update prisma types** (`types/prisma.ts`) - Output types & mappers

### Phase 2: Service Layer

1. **Create NotificationService** (`services/notifications.ts`)

   - `create(input)` - Create notification
   - `getByUserId(userId, options)` - Paginated fetch
   - `getUnreadCount(userId)` - Count unread
   - `markAllAsRead(userId)` - Mark all read
   - `deleteByAction(actorId, type, entityId)` - Delete on undo
   - `groupNotifications(notifications)` - Group for display

2. **Update existing services** to create notifications:
   - `ConnectionService.sendRequest()` → create CONNECTION_REQUEST
   - `PostService.toggleLike()` → create/delete POST_LIKE
   - `PostService.addComment()` → create POST_COMMENT

### Phase 3: API Routes

1. **GET /api/notifications** - Fetch notifications
2. **GET /api/notifications/unread-count** - Get badge count
3. **POST /api/notifications/mark-read** - Mark all as read
4. **GET /api/notifications/stream** - SSE endpoint

### Phase 4: React Query Hooks

Create `hooks/useNotifications.ts`:

- `useNotifications()` - Fetch paginated
- `useUnreadCount()` - Badge count
- `useMarkAllAsRead()` - Mutation
- `useNotificationStream()` - SSE connection

### Phase 5: UI Components

Create `components/notifications/`:

1. `NotificationBell.tsx` - Header bell with badge
2. `NotificationDropdown.tsx` - Dropdown container
3. `NotificationItem.tsx` - Single notification
4. `NotificationList.tsx` - List with grouping
5. `NotificationEmptyState.tsx` - Empty state
6. `index.ts` - Barrel exports

### Phase 6: Integration

1. **Update Header.tsx** - Replace static bell with NotificationBell
2. **Create /notifications page** - Full history view

## Key Files Reference

| File                                            | Purpose                |
| ----------------------------------------------- | ---------------------- |
| `prisma/schema.prisma`                          | Add Notification model |
| `types/notifications.ts`                        | Zod input schemas      |
| `types/prisma.ts`                               | Output types & mappers |
| `services/notifications.ts`                     | Business logic         |
| `app/api/notifications/route.ts`                | Main API endpoint      |
| `hooks/useNotifications.ts`                     | React Query hooks      |
| `components/notifications/NotificationBell.tsx` | Header component       |

## Testing Checklist

- [ ] Create notification when connection request sent
- [ ] Create notification when post liked
- [ ] Create notification when post commented
- [ ] Delete notification when post unliked
- [ ] Badge shows correct unread count
- [ ] Badge shows "99+" for > 99 unread
- [ ] Dropdown opens and shows grouped notifications
- [ ] Clicking bell marks all as read
- [ ] Notification click navigates to correct page
- [ ] /notifications page shows full history
- [ ] Infinite scroll works on history page
- [ ] SSE updates badge in real-time
- [ ] Mobile responsive design works

## Common Patterns

### Creating a Notification (in service)

```typescript
// In ConnectionService.sendRequest()
await NotificationService.create({
  recipientId: recipientId,
  actorId: requesterId,
  type: "CONNECTION_REQUEST",
  entityType: "connection",
  entityId: connection.id,
});
```

### Deleting a Notification (on undo)

```typescript
// In PostService.toggleLike() when unliking
await NotificationService.deleteByAction(userId, "POST_LIKE", postId);
```

### Checking Self-Action

```typescript
// Don't notify for own actions
if (post.userId === userId) {
  // Skip notification creation
  return;
}
```

## Navigation URLs

| Notification Type  | URL Pattern                                    |
| ------------------ | ---------------------------------------------- |
| CONNECTION_REQUEST | `/profile/[actor.publicUuid]/[actor.username]` |
| POST_LIKE          | `/post/[entityPublicUuid]`                     |
| POST_COMMENT       | `/post/[entityPublicUuid]`                     |
