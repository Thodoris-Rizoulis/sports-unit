# Research: Notifications Feature

**Date**: 2025-12-03  
**Feature**: 014-notifications

## Research Tasks

### 1. Server-Sent Events (SSE) in Next.js App Router

**Decision**: Use Next.js Route Handlers with streaming response for SSE

**Rationale**:

- Next.js App Router supports streaming responses via `ReadableStream`
- SSE is simpler than WebSocket for one-way server-to-client communication
- Works with existing NextAuth.js session cookies for authentication
- No additional dependencies required

**Implementation Pattern**:

```typescript
// app/api/notifications/stream/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const stream = new ReadableStream({
    async start(controller) {
      // Poll database or use pub/sub for new notifications
      // Send SSE formatted messages
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

**Alternatives Considered**:

- WebSocket: More complex, requires separate server, overkill for notifications
- Polling: Simpler but less efficient, higher latency
- Pusher/Ably: External dependency, cost, overkill for MVP

### 2. Notification Grouping Algorithm

**Decision**: Group at API level by post ID and notification type for unread notifications

**Rationale**:

- Grouping in the service layer allows consistent behavior across dropdown and page
- Group key = `${notificationType}-${entityId}` for post-related notifications
- Connection requests are never grouped (always individual)
- Most recent actor shown first in grouped notifications

**Algorithm**:

```typescript
function groupNotifications(
  notifications: Notification[]
): GroupedNotification[] {
  const groups = new Map<string, Notification[]>();

  for (const n of notifications) {
    if (n.type === "CONNECTION_REQUEST" || n.isRead) {
      // Don't group connection requests or read notifications
      groups.set(`single-${n.id}`, [n]);
    } else {
      const key = `${n.type}-${n.entityId}`;
      const existing = groups.get(key) || [];
      groups.set(key, [...existing, n]);
    }
  }

  return Array.from(groups.values()).map(toGroupedNotification);
}
```

**Alternatives Considered**:

- Client-side grouping: Inconsistent between dropdown and page
- Time-based grouping: More complex, harder to understand for users

### 3. Real-time Notification Delivery Architecture

**Decision**: Polling-based SSE with 5-second interval

**Rationale**:

- True push notifications require pub/sub infrastructure (Redis, etc.)
- For MVP, polling SSE is simpler and sufficient
- 5-second interval balances responsiveness with server load
- Can upgrade to true push later without API changes

**Flow**:

1. Client connects to `/api/notifications/stream`
2. Server validates session
3. Server polls DB every 5 seconds for new notifications
4. New notifications streamed to client
5. Client updates React Query cache

**Alternatives Considered**:

- Redis Pub/Sub: Better scalability but adds infrastructure complexity
- Database triggers: PostgreSQL NOTIFY/LISTEN - more complex setup

### 4. Notification Deletion on Undo Actions

**Decision**: Delete notification immediately when action is undone

**Rationale**:

- Spec requirement: "Delete the notification when action is undone"
- Simpler than soft-delete for MVP
- Services already have access to notification creation context

**Implementation**:

- `PostService.toggleLike()` - if unliking, delete notification
- `PostService.addComment()` when deleting - delete notification
- Add `NotificationService.deleteByAction()` method

### 5. Database Indexing Strategy

**Decision**: Create composite indexes for common query patterns

**Indexes**:

- `(recipientId, isRead, createdAt DESC)` - Primary query for unread notifications
- `(recipientId, createdAt DESC)` - For paginated history
- `(actorId, type, entityId)` - For finding/deleting specific notifications

**Rationale**:

- Badge count query: `WHERE recipientId = ? AND isRead = false`
- Dropdown query: `WHERE recipientId = ? ORDER BY createdAt DESC LIMIT 15`
- Delete on unlike: `WHERE actorId = ? AND type = 'POST_LIKE' AND entityId = ?`

## Summary

| Topic               | Decision                      | Confidence |
| ------------------- | ----------------------------- | ---------- |
| Real-time transport | SSE with polling (5s)         | High       |
| Grouping location   | API/Service layer             | High       |
| Grouping strategy   | By type + entityId for unread | High       |
| SSE auth            | Session cookie                | High       |
| Undo behavior       | Hard delete                   | High       |
| DB indexing         | Composite indexes             | High       |

All research items resolved. Ready for Phase 1 design.
