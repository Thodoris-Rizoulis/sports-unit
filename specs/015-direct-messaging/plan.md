# Implementation Plan: Direct Messaging

**Branch**: `015-direct-messaging` | **Date**: 2025-12-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-direct-messaging/spec.md`

## Summary

Implement a direct messaging feature that allows connected users to send private messages to each other. The feature includes real-time message delivery via WebSockets, an inbox page with responsive split/detail views, conversation search, media attachments, and header integration with unread badge and dropdown. Messages are organized into conversations/threads between exactly two users, with unread tracking via per-conversation timestamps.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode  
**Primary Dependencies**: Next.js 14+ (App Router), React Query, Prisma ORM, NextAuth.js, Zod, shadcn/ui, Socket.io  
**Storage**: PostgreSQL via Prisma ORM, Cloudflare R2 for media  
**Testing**: Manual testing via browser, TypeScript compilation validation  
**Target Platform**: Web (responsive, mobile-first)  
**Project Type**: Next.js App Router web application  
**Performance Goals**: Message delivery <3s, conversation list load <2s, badge update <3s  
**Constraints**: WebSocket for real-time, session-based auth, connected users only  
**Scale/Scope**: Handle 100+ messages per conversation without degradation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: ✅ TypeScript strict mode, use `type` over `interface`, no `any`, follow DRY
- **TypeScript & Type Safety**: ✅ Zod schemas for input validation in `types/messaging.ts`, output types in `types/prisma.ts`, reuse common fields from `types/common.ts`
- **Project Structure**: ✅ Next.js App Router, `/services/messaging.ts`, `/app/api/messages/`, `/components/messaging/`, `/types/messaging.ts`
- **API & Data Layer**: ✅ Use `api-utils` for responses, Prisma ORM via `lib/prisma.ts`, business logic in service layer, Zod validation at API boundaries
- **Component Development**: ✅ Server Components for page wrappers, Client Components for interactive chat/dropdown, shadcn/ui components
- **Styling & Theming**: ✅ Tailwind with theme variables from `globals.css`, semantic color tokens
- **Validation & Best Practices**: ✅ All API inputs validated with Zod, naming convention `SendMessageInput` for form types
- **Performance & Optimization**: ✅ React Query caching, optimistic updates, paginated queries, indexed database queries
- **Error Handling**: ✅ try/catch in services and API routes, meaningful user errors, WebSocket error events
- **Reusability**: ✅ `MessagingService` with static methods, reusable `MessageBubble` component, shared `UserSummary` type
- **Dependencies**: ⚠️ Requires new dependencies: `socket.io`, `socket.io-client` - justified for WebSocket functionality
- **Design / Responsiveness**: ✅ Mobile-first responsive inbox, split view on desktop, list-detail on mobile
- **Extensibility / Maintainability**: ✅ Conversation model supports future group messaging extension, service → API → component pattern

## Project Structure

### Documentation (this feature)

```text
specs/015-direct-messaging/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - database schema
├── quickstart.md        # Phase 1 output - setup guide
├── contracts/           # Phase 1 output
│   └── api.md           # REST API and WebSocket contracts
├── checklists/
│   └── requirements.md  # Specification checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# New files for Direct Messaging feature

app/
├── api/
│   └── messages/
│       ├── conversations/
│       │   ├── route.ts                    # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts                # GET with messages, POST send
│       │       └── read/
│       │           └── route.ts            # POST mark as read
│       ├── unread-count/
│       │   └── route.ts                    # GET unread count
│       └── recent/
│           └── route.ts                    # GET recent messages for dropdown
└── inbox/
    ├── page.tsx                            # Main inbox page (responsive)
    └── [conversationId]/
        └── page.tsx                        # Mobile conversation detail

components/
└── messaging/
    ├── index.ts                            # Barrel exports
    ├── ConversationList.tsx                # List of conversations with search
    ├── ConversationItem.tsx                # Single conversation preview
    ├── ConversationView.tsx                # Full chat view
    ├── MessageBubble.tsx                   # Individual message display
    ├── MessageInput.tsx                    # Text + media input with counter
    ├── MessageMediaUpload.tsx              # Media attachment handling
    ├── InboxDropdown.tsx                   # Header dropdown component
    ├── InboxBadge.tsx                      # Unread count badge
    └── EmptyInbox.tsx                      # Empty state component

types/
├── messaging.ts                            # Zod schemas & input types
└── prisma.ts                               # + Messaging output types & mappers

services/
└── messaging.ts                            # MessagingService class

hooks/
├── useConversations.ts                     # List conversations with React Query
├── useConversation.ts                      # Single conversation with messages
├── useUnreadMessageCount.ts                # For header badge
├── useSendMessage.ts                       # Mutation for sending messages
└── useMessageSocket.ts                     # WebSocket connection hook

lib/
└── socket-server.ts                        # Socket.io server setup

migrations/
└── 020_add_messaging_tables.ts             # Database migration

prisma/
└── schema.prisma                           # + Conversation, Message models
```

**Structure Decision**: Following established project patterns - service layer for business logic, API routes for HTTP handling, React Query hooks for client state, shadcn/ui for components, Socket.io for real-time. WebSocket server integrated with Next.js custom server approach.

## Complexity Tracking

| Violation                   | Why Needed                                           | Simpler Alternative Rejected Because                                                   |
| --------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| socket.io dependency        | Real-time bidirectional messaging requires WebSocket | SSE (like notifications) is one-way; native WS requires manual reconnection/room logic |
| socket.io-client dependency | Pairs with socket.io server for React integration    | Required for socket.io server compatibility                                            |

## Implementation Phases

### Phase 1: Database & Types (Foundation)

**Goal**: Set up data layer and type definitions

**Tasks**:

1. Add Prisma schema models (Conversation, ConversationParticipant, Message, MessageMedia)
2. Update User model with messaging relations
3. Create and run database migration
4. Create `types/messaging.ts` with Zod schemas
5. Update `types/prisma.ts` with messaging types and mappers

**Deliverables**:

- Updated `prisma/schema.prisma`
- Migration file `migrations/020_add_messaging_tables.ts`
- `types/messaging.ts`
- Updated `types/prisma.ts`

### Phase 2: Service Layer

**Goal**: Implement business logic for messaging

**Tasks**:

1. Create `MessagingService` class with static methods
2. Implement `getOrCreateConversation(userId1, userId2)`
3. Implement `getConversations(userId, options)` with search and pagination
4. Implement `getMessages(conversationId, userId, options)` with pagination
5. Implement `sendMessage(conversationId, senderId, input)`
6. Implement `getUnreadCount(userId)`
7. Implement `markAsRead(conversationId, userId)`
8. Implement `getRecentMessages(userId, limit)` for dropdown
9. Add connection validation helper

**Deliverables**:

- `services/messaging.ts`

### Phase 3: API Routes

**Goal**: Create REST API endpoints

**Tasks**:

1. Create `GET /api/messages/conversations` - list conversations
2. Create `POST /api/messages/conversations` - get or create conversation
3. Create `GET /api/messages/conversations/[id]` - get conversation with messages
4. Create `POST /api/messages/conversations/[id]` - send message
5. Create `POST /api/messages/conversations/[id]/read` - mark as read
6. Create `GET /api/messages/unread-count` - get unread count
7. Create `GET /api/messages/recent` - get recent messages for dropdown

**Deliverables**:

- API route files under `app/api/messages/`

### Phase 4: WebSocket Setup

**Goal**: Implement real-time message delivery

**Tasks**:

1. Install socket.io and socket.io-client
2. Create Socket.io server configuration in `lib/socket-server.ts`
3. Implement session authentication middleware
4. Implement conversation room management (join/leave)
5. Implement message broadcasting to participants
6. Implement unread count update events
7. Integrate with Next.js server

**Deliverables**:

- `lib/socket-server.ts`
- Updated `package.json` with dependencies

### Phase 5: React Hooks

**Goal**: Create client-side state management

**Tasks**:

1. Create `useConversations(search?)` - list with React Query
2. Create `useConversation(id)` - single conversation with messages
3. Create `useUnreadMessageCount()` - for header badge
4. Create `useSendMessage()` - mutation with optimistic update
5. Create `useMessageSocket()` - WebSocket connection and event handling
6. Create query key constants for cache management

**Deliverables**:

- Hook files under `hooks/`

### Phase 6: UI Components

**Goal**: Build messaging UI components

**Tasks**:

1. Create `ConversationList.tsx` - list with search input
2. Create `ConversationItem.tsx` - preview with avatar, name, message, time
3. Create `ConversationView.tsx` - full chat with header and message list
4. Create `MessageBubble.tsx` - left/right alignment, media display
5. Create `MessageInput.tsx` - text input with character counter
6. Create `MessageMediaUpload.tsx` - media attachment button and preview
7. Create `InboxDropdown.tsx` - header dropdown with recent messages
8. Create `InboxBadge.tsx` - unread count badge component
9. Create `EmptyInbox.tsx` - empty state component
10. Create barrel export in `index.ts`

**Deliverables**:

- Component files under `components/messaging/`

### Phase 7: Pages

**Goal**: Build inbox pages with responsive layout

**Tasks**:

1. Create `app/inbox/page.tsx` - main inbox with responsive split/list view
2. Create `app/inbox/[conversationId]/page.tsx` - mobile conversation detail
3. Implement conversation selection state for desktop split view
4. Implement search functionality in inbox
5. Handle URL-based conversation deep-linking

**Deliverables**:

- Page files under `app/inbox/`

### Phase 8: Header Integration

**Goal**: Integrate messaging into global header

**Tasks**:

1. Create and integrate `InboxDropdown` in Header.tsx
2. Add unread badge to Inbox navigation item
3. Connect WebSocket for real-time badge updates
4. Implement dropdown mark-as-seen behavior

**Deliverables**:

- Updated `components/Header.tsx`

### Phase 9: Profile Integration

**Goal**: Add "Send message" button to profiles

**Tasks**:

1. Add "Send message" button to `ProfileHero.tsx`
2. Conditionally render only for connected users (status === "accepted")
3. Implement navigation to conversation on click
4. Handle get-or-create conversation flow

**Deliverables**:

- Updated `components/profile/ProfileHero.tsx`

## Key Considerations

### WebSocket Connection Lifecycle

- Connect on app mount (authenticated users only)
- Join conversation room when viewing a conversation
- Leave room when navigating away
- Reconnect automatically on disconnect with exponential backoff

### Optimistic Updates

- Show sent message immediately in UI
- Confirm with server response
- Handle failures with retry option

### Pagination

- Conversations: 20 per page, cursor-based
- Messages: 20 per page, cursor-based, reverse chronological

### Mobile-Responsive Layout

- Desktop (≥768px): Split view - list left, chat right
- Mobile (<768px): List view → navigate to `/inbox/[id]`

### Media Upload

- Reuse existing `/api/upload` with `purpose: "message"` parameter
- Store with path prefix `messages/{userId}/{timestamp}-{filename}`
- Same validation: images (JPEG, PNG, WebP), videos (MP4, WebM), max 100MB

### Connection Validation

- Check connection status before creating conversation
- Check connection status before sending message
- Show error if connection was removed

## Dependencies

### New (Requires Addition)

- `socket.io` - WebSocket server
- `socket.io-client` - WebSocket client for React

### Existing (Leveraged)

- `@tanstack/react-query` - State management
- `next-auth` - Session authentication
- `zod` - Input validation
- `@prisma/client` - Database operations
- `@radix-ui/react-dropdown-menu` - Dropdown component
- `lucide-react` - Icons
