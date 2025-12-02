# Tasks: Shared Layout with Widgets

**Input**: Design documents from `/specs/007-shared-layout-widgets/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks included - tests not requested in feature specification.

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

**Purpose**: Project initialization and basic structure

- [x] T001 Create route group structure app/(main)/ per implementation plan
- [x] T002 Move existing dashboard page to app/(main)/dashboard/page.tsx
- [x] T003 Create discovery page placeholder in app/(main)/discovery/page.tsx
- [x] T004 Create widgets directory components/widgets/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create ProfileWidget component in components/widgets/ProfileWidget.tsx
- [x] T006 Create shared layout component in app/(main)/layout.tsx
- [x] T007 Update navigation references if needed (e.g., in Header component)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Dashboard with Profile Widget (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to view dashboard with profile widget in left sidebar

**Independent Test**: Login, navigate to /dashboard, verify profile widget displays user details in left sidebar

### Implementation for User Story 1

- [x] T008 [US1] Integrate shared layout into dashboard page app/(main)/dashboard/page.tsx
- [x] T009 [US1] Add ProfileWidget to left sidebar in app/(main)/layout.tsx
- [x] T010 [US1] Test dashboard page loads with profile widget displaying user data

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Discovery Page with Shared Layout (Priority: P2)

**Goal**: Enable authenticated users to view discovery page with same shared layout

**Independent Test**: Navigate to /discovery, verify same layout structure with profile widget

### Implementation for User Story 2

- [x] T011 [US2] Integrate shared layout into discovery page app/(main)/discovery/page.tsx
- [x] T012 [US2] Test discovery page loads with shared layout and profile widget

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Responsive Layout on Mobile Devices (Priority: P3)

**Goal**: Ensure layout adapts responsively on mobile devices

**Independent Test**: Resize browser to < 768px, verify sidebars hide and main content is accessible

### Implementation for User Story 3

- [x] T013 [US3] Add responsive classes to hide sidebars on mobile in app/(main)/layout.tsx
- [x] T014 [US3] Test layout responsiveness on mobile devices

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T015 [P] Documentation updates in README.md or quickstart.md
- [x] T016 Code cleanup and JSDoc comments in components/widgets/ProfileWidget.tsx
- [x] T017 Performance optimization (next/image for profile pictures)
- [x] T018 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories proceed in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after User Story 1 - Uses same layout components
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Modifies existing layout

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks can run in parallel
- Foundational tasks can run in parallel
- Once Foundational completes, User Stories 1 and 3 can start in parallel
- User Story 2 depends on User Story 1 completion
- Polish tasks can run in parallel

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together:
Task: "Create route group structure app/(main)/ per implementation plan"
Task: "Move existing dashboard page to app/(main)/dashboard/page.tsx"
Task: "Create discovery page placeholder in app/(main)/discovery/page.tsx"
Task: "Create widgets directory components/widgets/"
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
   - Developer B: User Stories 2 + 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
