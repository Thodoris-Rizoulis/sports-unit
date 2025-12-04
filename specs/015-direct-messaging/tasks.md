````markdown
# Tasks: Direct Messaging

**Input**: Design documents from `/specs/015-direct-messaging/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested - test tasks are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and database setup

- [x] T001 Install socket.io and socket.io-client dependencies via npm
- [x] T002 Add Prisma schema models (Conversation, ConversationParticipant, Message, MessageMedia) to prisma/schema.prisma
- [x] T003 Update User model with messaging relations in prisma/schema.prisma
- [x] T004 Create and run database migration in migrations/020_add_messaging_tables.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, service layer, and real-time infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

> **Note**: This phase consolidates plan.md Phases 2-5 (Service, API, WebSocket, Hooks) as they are interdependent blocking prerequisites. User story implementation requires all foundational components.

### Types Foundation

- [x] T005 [P] Create Zod schemas for messaging input validation in types/messaging.ts
- [x] T006 [P] Create messaging output types and mappers in types/prisma.ts

### Service Layer

- [x] T007 Create MessagingService class with static methods in services/messaging.ts
- [x] T008 Implement getOrCreateConversation(userId1, userId2) in services/messaging.ts
- [x] T009 Implement getConversations(userId, options) with search and pagination in services/messaging.ts
- [x] T010 Implement getMessages(conversationId, userId, options) with pagination in services/messaging.ts
- [x] T011 Implement sendMessage(conversationId, senderId, input) in services/messaging.ts
- [x] T012 Implement getUnreadCount(userId) in services/messaging.ts
- [x] T013 Implement markAsRead(conversationId, userId) in services/messaging.ts
- [x] T014 Implement getRecentMessages(userId, limit) for dropdown in services/messaging.ts
- [x] T015 Add validateConnection helper for connection status checks in services/messaging.ts

### WebSocket Infrastructure

- [x] T016 Create Socket.io server configuration in lib/socket-server.ts
- [x] T017 Implement session authentication middleware for WebSocket in lib/socket-server.ts
- [x] T018 Implement conversation room management (join/leave) in lib/socket-server.ts
- [x] T019 Implement message broadcasting to participants in lib/socket-server.ts
- [x] T020 Implement unread count update events in lib/socket-server.ts

### API Routes

- [x] T021 [P] Create GET /api/messages/conversations endpoint in app/api/messages/conversations/route.ts
- [x] T022 [P] Create POST /api/messages/conversations endpoint in app/api/messages/conversations/route.ts
- [x] T023 [P] Create GET /api/messages/conversations/[id] endpoint in app/api/messages/conversations/[id]/route.ts
- [x] T024 [P] Create POST /api/messages/conversations/[id] endpoint in app/api/messages/conversations/[id]/route.ts
- [x] T025 [P] Create POST /api/messages/conversations/[id]/read endpoint in app/api/messages/conversations/[id]/read/route.ts
- [x] T026 [P] Create GET /api/messages/unread-count endpoint in app/api/messages/unread-count/route.ts
- [x] T027 [P] Create GET /api/messages/recent endpoint in app/api/messages/recent/route.ts

### React Hooks

- [x] T028 [P] Create useConversations hook with React Query in hooks/useConversations.ts
- [x] T029 [P] Create useConversation hook for single conversation with messages in hooks/useConversation.ts
- [x] T030 [P] Create useUnreadMessageCount hook for header badge in hooks/useUnreadMessageCount.ts
- [x] T031 [P] Create useSendMessage mutation hook with optimistic update in hooks/useSendMessage.ts
- [x] T032 Create useMessageSocket hook for WebSocket connection in hooks/useMessageSocket.ts
- [x] T033 [P] Create query key constants for message cache management in hooks/useConversations.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Send and Receive Messages (Priority: P1) 🎯 MVP

**Goal**: Enable connected users to send and receive private messages with text content (up to 500 characters) and media attachments

**Independent Test**: Two connected users can exchange messages; messages appear in both users' conversation views immediately via WebSocket

### UI Components for User Story 1

- [x] T034 [P] [US1] Create MessageBubble component with left/right alignment in components/messaging/MessageBubble.tsx
- [x] T035 [P] [US1] Create MessageInput component with character counter (0/500) in components/messaging/MessageInput.tsx
- [x] T036 [P] [US1] Create MessageMediaUpload component using hooks/useImageUpload.ts in components/messaging/MessageMediaUpload.tsx
- [x] T037 [US1] Create ConversationView component with message list and input in components/messaging/ConversationView.tsx

**Checkpoint**: User Story 1 core functionality complete - users can send/receive messages in a conversation view

---

## Phase 4: User Story 2 - View Conversation List (Priority: P1)

**Goal**: Display all conversations in an inbox sorted by most recent, with conversation previews and search functionality

**Independent Test**: User navigates to /inbox, sees list of all conversations with correct previews, can filter by search query

### UI Components for User Story 2

- [x] T038 [P] [US2] Create ConversationItem component with avatar, name, preview, timestamp in components/messaging/ConversationItem.tsx
- [x] T039 [P] [US2] Create EmptyInbox component with "Connect with users to start messaging" in components/messaging/EmptyInbox.tsx
- [x] T040 [US2] Create ConversationList component with search input in components/messaging/ConversationList.tsx

### Pages for User Story 2

- [x] T041 [US2] Create inbox page with responsive split/list view in app/inbox/page.tsx
- [x] T042 [US2] Create mobile conversation detail page in app/inbox/[conversationId]/page.tsx
- [x] T043 [US2] Implement conversation selection state for desktop split view in app/inbox/page.tsx
- [x] T044 [US2] Handle URL-based conversation deep-linking in app/inbox/page.tsx

**Checkpoint**: User Story 2 complete - inbox page functional with conversation list and responsive layout

---

## Phase 5: User Story 3 - Initiate Conversation from Profile (Priority: P1)

**Goal**: Add "Send message" button to connected user profiles that navigates to the conversation

**Independent Test**: Visit connected user profile, click "Send message", verify navigation to correct conversation in /inbox

### Profile Integration for User Story 3

- [x] T045 [US3] Add "Send message" button to ProfileHero.tsx for connected users
- [x] T046 [US3] Implement navigation to conversation on button click in components/profile/ProfileHero.tsx
- [x] T047 [US3] Handle get-or-create conversation flow on button click in components/profile/ProfileHero.tsx

**Checkpoint**: User Story 3 complete - users can initiate conversations from profile pages

---

## Phase 6: User Story 4 - View Unread Message Count in Header (Priority: P2)

**Goal**: Display unread message count badge on the Inbox icon in the header, updating in real-time

**Independent Test**: Receive messages, verify badge count appears on header Inbox icon and updates without page refresh

### Header Integration for User Story 4

- [x] T048 [P] [US4] Create InboxBadge component showing unread count in components/messaging/InboxBadge.tsx
- [x] T049 [US4] Integrate InboxBadge with Inbox navigation item in components/Header.tsx
- [x] T050 [US4] Connect WebSocket for real-time badge updates in components/Header.tsx
- [x] T051 [US4] Implement "99+" display when count exceeds 99 in components/messaging/InboxBadge.tsx

**Checkpoint**: User Story 4 complete - header shows real-time unread message count

---

## Phase 7: User Story 5 - View Recent Messages in Header Dropdown (Priority: P2)

**Goal**: Show dropdown with recent messages when clicking Inbox icon, with navigation to conversations

**Independent Test**: Click Inbox icon, dropdown shows recent messages with sender info, clicking message navigates to conversation

### Dropdown Components for User Story 5

- [x] T052 [US5] Create InboxDropdown component with recent messages in components/messaging/InboxDropdown.tsx
- [x] T053 [US5] Implement dropdown empty state in components/messaging/InboxDropdown.tsx
- [x] T054 [US5] Integrate InboxDropdown in Header.tsx replacing simple link
- [x] T055 [US5] Implement badge-hide behavior when dropdown opens (local state, no API call) in components/messaging/InboxDropdown.tsx

**Checkpoint**: User Story 5 complete - header dropdown shows recent messages

---

## Phase 8: User Story 6 - Real-time Message Delivery (Priority: P2)

**Goal**: Messages delivered instantly via WebSocket without page refresh, with auto-reconnection

**Independent Test**: User A sends message while User B has conversation open, message appears within 3 seconds without refresh

### Real-time Integration for User Story 6

- [x] T056 [US6] Integrate WebSocket message receiving in ConversationView in components/messaging/ConversationView.tsx
- [x] T057 [US6] Implement auto-scroll to new messages in ConversationView in components/messaging/ConversationView.tsx
- [x] T058 [US6] Implement WebSocket reconnection with exponential backoff in hooks/useMessageSocket.ts
- [x] T059 [US6] Add "Reconnecting..." indicator for connection status in components/messaging/ConversationView.tsx

**Checkpoint**: User Story 6 complete - messages delivered in real-time with reliable connections

---

## Phase 9: User Story 7 - Load Message History (Priority: P3)

**Goal**: Infinite scroll to load older messages when scrolling to top of conversation

**Independent Test**: Create conversation with 50+ messages, scroll to top, verify older messages load without position jump

### Pagination for User Story 7

- [x] T060 [US7] Implement infinite scroll for older messages in ConversationView in components/messaging/ConversationView.tsx
- [x] T061 [US7] Maintain scroll position when loading older messages in components/messaging/ConversationView.tsx
- [x] T062 [US7] Add "No more messages" indicator at conversation start in components/messaging/ConversationView.tsx

**Checkpoint**: User Story 7 complete - full conversation history accessible via infinite scroll

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Finalization, exports, and validation

- [x] T063 [P] Create barrel export for messaging components in components/messaging/index.ts
- [x] T064 [P] Add error handling for connection-removed scenario (disable send button, show message)
- [x] T065 [P] Add retry option for failed message sends in components/messaging/MessageBubble.tsx
- [x] T066 [P] Validate media upload errors (size limit, unsupported type) in components/messaging/MessageMediaUpload.tsx
- [x] T067 Run TypeScript build to validate all types in project root
- [x] T068 Test responsive layout on mobile (320px+) and desktop (768px+)
- [x] T069 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all user stories
- **Phase 3-9 (User Stories)**: All depend on Phase 2 completion
  - User stories can proceed in priority order (P1 → P2 → P3)
  - P1 stories (US1, US2, US3) can run in parallel if staffed
  - P2 stories (US4, US5, US6) can run in parallel after P1
- **Phase 10 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2 - No dependencies on other stories
- **User Story 2 (P1)**: After Phase 2 - Uses ConversationView from US1 (optional integration)
- **User Story 3 (P1)**: After Phase 2 - Uses conversation flow from US1
- **User Story 4 (P2)**: After Phase 2 - Standalone header component
- **User Story 5 (P2)**: After Phase 2 - Can integrate with US4 badge but independently testable
- **User Story 6 (P2)**: After US1 - Enhances ConversationView with real-time
- **User Story 7 (P3)**: After US1 - Enhances ConversationView with pagination

### Within Each User Story

- Components before page integration
- Core implementation before enhancements
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 1 tasks can run sequentially (dependency chain)
- Phase 2 types (T005, T006) can run in parallel
- Phase 2 API routes (T021-T027) can run in parallel after service layer
- Phase 2 hooks (T028-T031, T033) can run in parallel
- US1 components (T034-T036) can run in parallel
- US2 components (T038-T039) can run in parallel
- US4 badge (T048) can run in parallel with US5 dropdown (T052)
- Phase 10 polish tasks can run in parallel

---

## Parallel Example: Phase 2 API Routes

```bash
# Launch all API route tasks together after service layer is complete:
Task: "T021 [P] Create GET /api/messages/conversations endpoint"
Task: "T022 [P] Create POST /api/messages/conversations endpoint"
Task: "T023 [P] Create GET /api/messages/conversations/[id] endpoint"
Task: "T024 [P] Create POST /api/messages/conversations/[id] endpoint"
Task: "T025 [P] Create POST /api/messages/conversations/[id]/read endpoint"
Task: "T026 [P] Create GET /api/messages/unread-count endpoint"
Task: "T027 [P] Create GET /api/messages/recent endpoint"
```

---

## Parallel Example: User Story 1 Components

```bash
# Launch all US1 component tasks together:
Task: "T034 [P] [US1] Create MessageBubble component"
Task: "T035 [P] [US1] Create MessageInput component"
Task: "T036 [P] [US1] Create MessageMediaUpload component"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Send and Receive Messages
4. Complete Phase 4: User Story 2 - View Conversation List
5. Complete Phase 5: User Story 3 - Initiate from Profile
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo MVP - users can now message each other!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Send/Receive) → Core messaging works → **MVP v1**
3. Add US2 (Inbox) → Full inbox experience → **MVP v2**
4. Add US3 (Profile Button) → Easy message initiation → **MVP v3**
5. Add US4 (Badge) → Unread visibility → Enhancement
6. Add US5 (Dropdown) → Quick preview → Enhancement
7. Add US6 (Real-time) → Instant delivery → Enhancement
8. Add US7 (History) → Full scroll → Enhancement
9. Polish → Production ready

### Parallel Team Strategy

With multiple developers after Phase 2 completion:

- **Developer A**: User Stories 1, 6, 7 (ConversationView focus)
- **Developer B**: User Stories 2, 3 (Inbox and Profile focus)
- **Developer C**: User Stories 4, 5 (Header focus)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- WebSocket tasks require sequential execution (T016 → T17 → T18 → T19 → T20)
- Service layer tasks require sequential execution (T07 → T08-T15)
````
