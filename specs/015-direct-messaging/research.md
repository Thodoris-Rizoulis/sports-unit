# Research: Direct Messaging

**Feature**: 015-direct-messaging  
**Date**: 2025-12-03

## Research Questions & Findings

### 1. WebSocket Implementation for Next.js App Router

**Question**: What is the best approach for WebSocket integration with Next.js 14+ App Router?

**Finding**: Socket.io with a custom server approach is recommended.

**Decision**: Use Socket.io with Next.js custom server integration
**Rationale**:

- Socket.io provides built-in reconnection, room support, and authentication middleware
- Works well with existing NextAuth.js session validation
- Supports namespaces for separating messaging from future real-time features
- Native WebSocket requires more boilerplate for reconnection logic

**Alternatives Considered**:

- Native WebSocket API: Rejected - requires manual reconnection and room management
- Pusher/Ably: Rejected - adds external dependency and cost
- SSE (like notifications): Rejected - not ideal for bidirectional chat where client needs to signal events

**Implementation Approach**:

- Create a separate WebSocket server that runs alongside Next.js
- Use Socket.io client in React hooks
- Authenticate connections using NextAuth session token
- Use rooms per conversation for efficient message broadcasting

### 2. Unread Message Tracking Mechanism

**Question**: How to efficiently track and query unread messages?

**Finding**: Per-conversation `lastReadAt` timestamp is most efficient.

**Decision**: Use ConversationParticipant join table with `lastReadAt` per user
**Rationale**:

- Single timestamp update when user opens conversation (vs. updating every message)
- Efficient query: `COUNT(messages WHERE createdAt > lastReadAt)`
- Scales well with message volume
- Matches industry patterns (Messenger, WhatsApp)

**Schema Approach**:

```
ConversationParticipant {
  conversationId
  userId
  lastReadAt (timestamp)
  joinedAt (timestamp)
}
```

### 3. Media Upload for Messages

**Question**: Can we reuse the existing upload service?

**Finding**: Yes, with minor path modification.

**Decision**: Reuse `/api/upload` with path prefix change from `posts/` to `messages/`
**Rationale**:

- Same file type validation (images/videos)
- Same size limits (100MB)
- Same R2 bucket infrastructure
- Reduces code duplication

**Changes Required**:

- Accept optional `purpose` parameter in upload API
- Use `messages/{userId}/{timestamp}-{filename}` path for messaging uploads

### 4. Conversation Model Design

**Question**: How to model conversations between exactly two users?

**Finding**: Use a Conversation entity with a ConversationParticipant join table.

**Decision**: Conversation + ConversationParticipant pattern
**Rationale**:

- Allows future extension to group messaging (if needed)
- Clean separation between conversation metadata and participants
- Efficient queries for "my conversations" via participant table
- Supports per-user read tracking

**Uniqueness Constraint**:

- Create unique index on sorted participant pair to prevent duplicate conversations
- Service layer enforces "get or create" pattern

### 5. Real-time Badge Updates

**Question**: How to update header badge when receiving new messages?

**Finding**: Use Socket.io event emission with React Query cache invalidation.

**Decision**: Socket.io event → React Query cache update
**Rationale**:

- Consistent with SSE notification pattern in existing codebase
- Socket.io already connected for message delivery
- Single connection serves both message delivery and badge updates
- `queryClient.setQueryData` for immediate UI update

### 6. Mobile/Desktop Responsive Layout

**Question**: Best pattern for split view (desktop) vs. list-detail (mobile)?

**Finding**: Use responsive hybrid with URL-based conversation selection.

**Decision**:

- Desktop: Split view with conversation list + selected conversation
- Mobile: List view → `/inbox/[conversationId]` navigation

**Implementation**:

- Use `useMediaQuery` or Tailwind breakpoint detection
- Desktop renders both panels
- Mobile renders only list or only conversation based on route
- URL parameter `?conversation=<id>` for desktop deep-linking

## Dependencies Analysis

### New Dependencies Required

| Package          | Reason           | Risk Level                    |
| ---------------- | ---------------- | ----------------------------- |
| socket.io        | WebSocket server | Low - Mature, well-maintained |
| socket.io-client | React client     | Low - Paired with server      |

### Existing Dependencies Leveraged

| Package               | Usage                     |
| --------------------- | ------------------------- |
| @tanstack/react-query | State management, caching |
| next-auth             | Session authentication    |
| zod                   | Input validation          |
| Prisma                | Database operations       |

## Performance Considerations

1. **Message Pagination**: Load 20 messages initially, infinite scroll for history
2. **Conversation List**: Load 20 conversations, sorted by lastMessageAt
3. **Optimistic Updates**: Show sent message immediately, confirm via WebSocket echo
4. **Connection Pooling**: Single WebSocket connection per tab, multiplexed for all conversations

## Security Considerations

1. **Connection Verification**: Validate user is participant before allowing message send
2. **WebSocket Auth**: Validate session token on connection, reject unauthorized
3. **Message Access**: Only participants can read conversation messages
4. **Rate Limiting**: Consider adding rate limits for message sending (future)

## Logging Strategy

**Question**: How should messaging events be logged for debugging?

**Decision**: Use console logging at service layer with structured format
**Rationale**:

- Matches existing codebase patterns (no logging library in use)
- Service layer is single point for business logic
- Structured messages enable future log aggregation

**Log Events**:
| Event | Level | Data |
|-------|-------|------|
| Message sent | info | conversationId, senderId, hasMedia |
| Message delivery error | error | conversationId, senderId, error |
| WebSocket connect | info | userId |
| WebSocket disconnect | info | userId, reason |
| Connection validation failed | warn | userId, targetUserId |

**Format**: `[messaging] {event}: {JSON data}`
