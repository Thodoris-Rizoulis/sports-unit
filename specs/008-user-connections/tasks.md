# Tasks: Add a connections feature to the sports social platform

**Input**: Design documents from `/specs/008-user-connections/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not requested in the feature specification, so none included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` for routes, `components/` for UI, `types/` for definitions, `services/` for business logic, `lib/` for utilities
- API routes: `app/api/`
- Components: `components/[domain]/` (e.g., `components/landing/`, `components/profile/`)
- Types: `types/[domain].ts`
- Services: `services/[domain].ts`
- Adjust paths based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration setup for the new connections feature

- [x] T001 Create database migration for connections table in migrations/[new-migration].ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and schemas that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Create connection types and schemas in types/connections.ts
- [x] T003 [P] Create connection service class in services/connections.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Send and Respond to Connection Requests (Priority: P1) 🎯 MVP

**Goal**: Enable users to send connection requests and respond to received requests

**Independent Test**: Send a request from one user to another, accept it, and verify both users see each other as connected

### Implementation for User Story 1

- [x] T004 [US1] Implement POST /api/connections/request endpoint in app/api/connections/request/route.ts
- [x] T005 [US1] Implement POST /api/connections/[id]/respond endpoint in app/api/connections/[id]/respond/route.ts
- [x] T006 [US1] Create ConnectionButton component in components/connections/ConnectionButton.tsx
- [x] T007 [US1] Create ConnectionRequestsModal component in components/connections/ConnectionRequestsModal.tsx
- [x] T008 [US1] Create useConnectionStatus hook in hooks/useConnectionStatus.ts
- [x] T009 [US1] Update profile page to include connection button in app/profile/[uuid]/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View and Manage Connections (Priority: P2)

**Goal**: Allow users to view their connections list and remove connections

**Independent Test**: View connections list with pagination, remove a connection, verify it's no longer visible

### Implementation for User Story 2

- [x] T010 [US2] Implement GET /api/connections endpoint in app/api/connections/route.ts
- [x] T011 [US2] Implement DELETE /api/connections/[id] endpoint in app/api/connections/[id]/route.ts
- [x] T012 [US2] Create ConnectionsList component in components/connections/ConnectionsList.tsx
- [x] T013 [US2] Create useConnections hook in hooks/useConnections.ts
- [x] T014 [US2] Add connections management to network page in app/(main)/network/page.tsx
- [x] T015 [US2] Add Network navigation link to header in components/Header.tsx
- [x] T016 [US2] Add response buttons to pending requests in ConnectionsList component (simplified to only show incoming requests)
- [x] T017 [US2] Add pagination support to network page for scalability

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Connection Status in Search (Priority: P3)

**Goal**: Show connection status indicators in user search results

**Independent Test**: Search for users and verify connection status badges appear correctly for connected, pending, and available users

### Implementation for User Story 3

- [x] T018 [US3] Implement GET /api/connections/status/[userId] endpoint in app/api/connections/status/[userId]/route.ts
- [ ] T019 [US3] Create ConnectionStatusBadge component in components/connections/ConnectionStatusBadge.tsx
- [ ] T020 [US3] Update search API to include connection status in app/api/search/people/route.ts
- [ ] T021 [US3] Update search results UI to show status badges in components/search/SearchResults.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and integrations

- [ ] T022 [P] Add real-time WebSocket updates for connection status changes
- [ ] T023 [P] Implement polling fallback for WebSocket connections
- [ ] T024 [P] Add comprehensive error handling and user feedback
- [ ] T025 [P] Optimize database queries and add proper indexing
- [ ] T026 [P] Add mobile-responsive styling to all connection components
- [ ] T027 [P] Update quickstart documentation validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Models before services (but services already in foundational)
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all API endpoints for User Story 1 together:
Task: "Implement POST /api/connections/request endpoint in app/api/connections/request/route.ts"
Task: "Implement POST /api/connections/[id]/respond endpoint in app/api/connections/[id]/respond/route.ts"

# Launch all components for User Story 1 together:
Task: "Create ConnectionButton component in components/connections/ConnectionButton.tsx"
Task: "Create ConnectionRequestsModal component in components/connections/ConnectionRequestsModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
