# Quickstart: Direct Messaging

**Feature**: 015-direct-messaging  
**Date**: 2025-12-03

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Project dependencies installed (`npm install`)
- Environment variables configured (`.env`)

## Quick Setup

### 1. Install New Dependencies

```bash
npm install socket.io socket.io-client
```

### 2. Run Database Migration

```bash
npx prisma migrate dev --name add_messaging_tables
npx prisma generate
```

### 3. Create Core Files

Create the following files in order:

1. **Types** (`types/messaging.ts`) - Zod schemas and input types
2. **Prisma Types** (update `types/prisma.ts`) - Output types and mappers
3. **Service** (`services/messaging.ts`) - Business logic
4. **API Routes** (`app/api/messages/...`) - REST endpoints
5. **WebSocket Server** (`lib/socket-server.ts`) - Socket.io setup
6. **React Hooks** (`hooks/useMessaging.ts`) - Client state management
7. **Components** (`components/messaging/...`) - UI components
8. **Pages** (`app/inbox/...`) - Inbox pages

### 4. Start Development Server

```bash
npm run dev
```

## Key Implementation Steps

### Step 1: Database Schema

Add to `prisma/schema.prisma`:

- Conversation model
- ConversationParticipant model
- Message model
- MessageMedia model
- Update User model with relations

### Step 2: Type Definitions

Create `types/messaging.ts`:

```typescript
// Zod schemas for API validation
export const sendMessageSchema = z
  .object({
    content: z.string().max(500).optional(),
    mediaUrl: z.string().url().optional(),
    mediaKey: z.string().optional(),
    mediaType: z.enum(["image", "video"]).optional(),
  })
  .refine((data) => data.content || data.mediaUrl, {
    message: "Either content or media is required",
  });
```

Update `types/prisma.ts`:

- Add include patterns for messaging queries
- Add UI types (ConversationUI, MessageUI)
- Add mapper functions

### Step 3: Service Layer

Create `services/messaging.ts` with:

- `getOrCreateConversation(userId1, userId2)`
- `getConversations(userId, options)`
- `getMessages(conversationId, userId, options)`
- `sendMessage(conversationId, senderId, input)`
- `getUnreadCount(userId)`
- `markAsRead(conversationId, userId)`

### Step 4: API Routes

Create routes under `app/api/messages/`:

- `conversations/route.ts` - GET list, POST create
- `conversations/[id]/route.ts` - GET with messages, POST send
- `conversations/[id]/read/route.ts` - POST mark as read
- `unread-count/route.ts` - GET count
- `recent/route.ts` - GET for dropdown

### Step 5: WebSocket Setup

Create `lib/socket-server.ts`:

```typescript
import { Server } from "socket.io";
// Authentication middleware
// Room management for conversations
// Message broadcasting
```

### Step 6: React Hooks

Create hooks in `hooks/`:

- `useConversations.ts` - List with search
- `useConversation.ts` - Single conversation with messages
- `useUnreadMessageCount.ts` - For header badge
- `useSendMessage.ts` - Mutation
- `useMessageSocket.ts` - WebSocket connection

### Step 7: UI Components

Create components in `components/messaging/`:

- `ConversationList.tsx`
- `ConversationItem.tsx`
- `ConversationView.tsx`
- `MessageBubble.tsx`
- `MessageInput.tsx`
- `InboxDropdown.tsx`
- `InboxBadge.tsx`

### Step 8: Pages

Create pages:

- `app/inbox/page.tsx` - Main inbox with responsive layout
- `app/inbox/[conversationId]/page.tsx` - Mobile conversation view

### Step 9: Integration

- Update `Header.tsx` - Add InboxDropdown
- Update `ProfileHero.tsx` - Add "Send message" button

## Testing Checklist

- [ ] Create conversation between two connected users
- [ ] Send text message
- [ ] Send message with media
- [ ] Verify real-time message delivery
- [ ] Verify unread count badge updates
- [ ] Test search in conversation list
- [ ] Test message history pagination
- [ ] Verify "Send message" button on profile (connected users only)
- [ ] Test responsive layout (desktop/mobile)
- [ ] Test WebSocket reconnection

## Common Issues

### WebSocket Not Connecting

- Verify session token is being passed
- Check CORS configuration
- Ensure socket server is running

### Messages Not Appearing in Real-time

- Verify user joined conversation room
- Check WebSocket event handlers
- Verify React Query cache invalidation

### Unread Count Not Updating

- Check lastReadAt update on conversation open
- Verify unread-count API calculation
- Check WebSocket event emission
