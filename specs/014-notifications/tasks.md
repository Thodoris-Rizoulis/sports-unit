# Tasks: Notifications

**Input**: Design documents from `/specs/014-notifications/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not explicitly requested - skipped.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema, types, and core service layer

- [x] T001 Add NotificationType enum to prisma/schema.prisma
- [x] T002 Add Notification model to prisma/schema.prisma with indexes
- [x] T003 Add notification relations to User model in prisma/schema.prisma
- [x] T004 Create migration file migrations/019_add_notifications_table.ts
- [x] T005 Run `npx prisma db push` and `npx prisma generate` to apply schema
- [x] T006 [P] Create Zod input schemas in types/notifications.ts
- [x] T007 [P] Add Notification output types and mappers to types/prisma.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: NotificationService and integration with existing services - MUST complete before UI

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create NotificationService class in services/notifications.ts with create() method
- [x] T009 Add getByUserId() method to NotificationService with pagination and grouping
- [x] T010 Add getUnreadCount() method to NotificationService
- [x] T011 Add markAllAsRead() method to NotificationService
- [x] T012 Add deleteByAction() method to NotificationService for undo operations
- [x] T013 Add groupNotifications() helper method to NotificationService
- [x] T014 Update ConnectionService.sendRequest() in services/connections.ts to create CONNECTION_REQUEST notification
- [x] T015 Update PostService.toggleLike() in services/posts.ts to create/delete POST_LIKE notification
- [x] T016 Update PostService.addComment() in services/posts.ts to create POST_COMMENT notification

**Checkpoint**: Foundation ready - notifications are being created, API/UI work can begin

---

## Phase 3: User Story 1 - View Unread Notification Count (Priority: P1) 🎯 MVP

**Goal**: Display bell icon with unread count badge in header

**Independent Test**: Trigger notifications via connection request or post like, verify badge count shows correctly

### Implementation for User Story 1

- [x] T017 [US1] Create GET /api/notifications/unread-count/route.ts endpoint
- [x] T018 [US1] Create useUnreadCount() hook in hooks/useNotifications.ts
- [x] T019 [US1] Create NotificationBell.tsx component in components/notifications/
- [x] T020 [US1] Update Header.tsx to use NotificationBell instead of static bell icon

**Checkpoint**: Bell icon shows unread count, updates on page refresh

---

## Phase 4: User Story 2 - View Notification Dropdown (Priority: P1)

**Goal**: Clicking bell opens dropdown with recent grouped notifications and marks all as read

**Independent Test**: Click bell, verify dropdown shows notifications grouped by post, badge resets to 0

### Implementation for User Story 2

- [x] T021 [US2] Create GET /api/notifications/route.ts endpoint with grouping
- [x] T022 [US2] Create POST /api/notifications/mark-read/route.ts endpoint
- [x] T023 [US2] Add useNotifications() hook in hooks/useNotifications.ts
- [x] T024 [US2] Add useMarkAllAsRead() mutation hook in hooks/useNotifications.ts
- [x] T025 [P] [US2] Create NotificationItem.tsx component in components/notifications/
- [x] T026 [P] [US2] Create NotificationEmptyState.tsx component in components/notifications/
- [x] T027 [US2] Create NotificationList.tsx component in components/notifications/
- [x] T028 [US2] Create NotificationDropdown.tsx component in components/notifications/
- [x] T029 [US2] Update NotificationBell.tsx to open dropdown and mark all as read on click
- [x] T030 [US2] Create barrel exports in components/notifications/index.ts

**Checkpoint**: Dropdown opens with grouped notifications, clicking bell marks all as read

---

## Phase 5: User Story 3 - Navigate from Notification (Priority: P1)

**Goal**: Clicking a notification navigates to relevant content (profile or post)

**Independent Test**: Click connection request notification → navigates to profile; click like notification → navigates to post

### Implementation for User Story 3

- [x] T031 [US3] Add getNavigationUrl() helper function to components/notifications/NotificationItem.tsx
- [x] T032 [US3] Update NotificationItem.tsx to be clickable with proper navigation
- [x] T033 [US3] Close dropdown on notification click in NotificationDropdown.tsx

**Checkpoint**: All notification types navigate to correct destination

---

## Phase 6: User Stories 6, 7, 8 - Receive Notifications (Priority: P1)

**Goal**: Notifications are created when connection requests sent, posts liked, posts commented

**Independent Test**: Already covered by T014-T016, verify via badge count and dropdown

**Note**: Implementation completed in Phase 2 (Foundational). This phase validates integration.

- [x] T034 [US6/7/8] Verify connection request creates notification (manual test)
- [x] T035 [US6/7/8] Verify post like creates/deletes notification on toggle (manual test)
- [x] T036 [US6/7/8] Verify post comment creates notification (manual test)
- [x] T037 [US6/7/8] Verify self-actions don't create notifications (manual test)

**Checkpoint**: All notification types are being created correctly

---

## Phase 7: User Story 4 - Receive Real-time Notifications (Priority: P2)

**Goal**: New notifications appear without page refresh via SSE

**Independent Test**: Open site in two browsers, trigger notification from one, see badge update in other without refresh

### Implementation for User Story 4

- [x] T038 [US4] Create GET /api/notifications/stream/route.ts SSE endpoint
- [x] T039 [US4] Add useNotificationStream() hook in hooks/useNotifications.ts
- [x] T040 [US4] Integrate SSE stream with NotificationBell to update count in real-time (include React Query refetchOnWindowFocus for multi-tab sync)
- [x] T041 [US4] Add reconnection logic with exponential backoff to useNotificationStream

**Checkpoint**: Badge updates in real-time when new notifications arrive

---

## Phase 8: User Story 5 - View Full Notification History (Priority: P2)

**Goal**: Dedicated /notifications page with infinite scroll showing all notifications

**Independent Test**: Navigate to /notifications, scroll to bottom, more notifications load

### Implementation for User Story 5

- [x] T042 [US5] Add useInfiniteNotifications() hook with cursor-based pagination in hooks/useNotifications.ts
- [x] T043 [US5] Create NotificationsPage.tsx client component in components/notifications/
- [x] T044 [US5] Create app/notifications/page.tsx server component wrapper
- [x] T045 [US5] Add "See all notifications" link to NotificationDropdown.tsx
- [x] T046 [US5] Add visual distinction for read/unread notifications in NotificationItem.tsx

**Checkpoint**: Full notification history page with infinite scroll working

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, loading states, mobile responsiveness

- [x] T047 [P] Add loading states to NotificationBell.tsx
- [x] T048 [P] Add loading states to NotificationDropdown.tsx
- [x] T049 [P] Add loading states to NotificationsPage.tsx
- [x] T050 [P] Add error handling and fallback UI to notification components
- [x] T051 Verify mobile responsiveness of dropdown (320px+ screens)
- [x] T052 Verify mobile responsiveness of notifications page
- [x] T053 Run TypeScript compilation check: `npx tsc --noEmit`
- [x] T054 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - provides badge count
- **User Story 2 (Phase 4)**: Depends on Foundational + User Story 1 for NotificationBell
- **User Story 3 (Phase 5)**: Depends on User Story 2 for NotificationItem
- **User Stories 6/7/8 (Phase 6)**: Validation only - covered by Foundational
- **User Story 4 (Phase 7)**: Depends on User Story 1 for NotificationBell SSE integration
- **User Story 5 (Phase 8)**: Depends on User Story 2 for shared components
- **Polish (Phase 9)**: Depends on all user stories being complete

### Within Each User Story

- Models/types before services
- Services before API routes
- API routes before hooks
- Hooks before components
- Core implementation before integration

### Parallel Opportunities

**Phase 1 (Setup)**:

- T006 and T007 can run in parallel (different files)

**Phase 2 (Foundational)**:

- T014, T015, T016 can run in parallel after T008-T013 (different services)

**Phase 4 (User Story 2)**:

- T025 and T026 can run in parallel (different components)

**Phase 9 (Polish)**:

- T047, T048, T049, T050 can all run in parallel (different files)

---

## Parallel Example: User Story 2

```bash
# Launch these UI components in parallel:
Task T025: "Create NotificationItem.tsx component"
Task T026: "Create NotificationEmptyState.tsx component"

# Then sequentially:
Task T027: "Create NotificationList.tsx" (depends on T025)
Task T028: "Create NotificationDropdown.tsx" (depends on T027)
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3)

1. Complete Phase 1: Setup (schema, types)
2. Complete Phase 2: Foundational (service, integrations)
3. Complete Phase 3: User Story 1 (badge count)
4. Complete Phase 4: User Story 2 (dropdown)
5. Complete Phase 5: User Story 3 (navigation)
6. **STOP and VALIDATE**: Core notification experience complete
7. Deploy/demo if ready

### Full Feature

1. MVP (Phases 1-5)
2. Phase 6: Validate notification creation
3. Phase 7: User Story 4 (real-time SSE)
4. Phase 8: User Story 5 (history page)
5. Phase 9: Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US6, US7, US8 are grouped because they share the same implementation (service integrations)
- SSE (US4) is P2 priority - MVP works without it
- History page (US5) is P2 priority - dropdown covers main use case
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
