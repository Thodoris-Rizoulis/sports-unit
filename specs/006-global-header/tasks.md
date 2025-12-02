# Tasks: Global Header

**Input**: Design documents from `/specs/006-global-header/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks included as not requested in feature specification.

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

**Purpose**: Initialize component and type definitions for the global header feature

- [x] T001 [P] Create Header component file in components/Header.tsx
- [x] T002 [P] Add Header component types in types/components.ts
- [x] T003 [P] Update navigation types if needed in types/common.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for search functionality that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create search API route in app/api/search/people/route.ts
- [x] T005 Add search method to profile service in services/profile.ts
- [x] T006 [P] Add GIN index for full-text search on users table (migration)
- [x] T007 [P] Update profile service types if needed in types/profile.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Global Header on Authenticated Pages (Priority: P1) 🎯 MVP

**Goal**: Users can see the global header with logo on all pages except homepage

**Independent Test**: Navigate to /dashboard and verify header appears with logo, navigation area, and search area

### Implementation for User Story 1

- [x] T008 Create basic Header component structure with logo in components/Header.tsx
- [x] T009 Add conditional rendering logic using usePathname in components/Header.tsx
- [x] T010 Integrate Header component into app/layout.tsx inside Providers wrapper
- [x] T011 Style header layout with Tailwind (fixed top, shadow, responsive) in components/Header.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Navigate Using Header Links (Priority: P1)

**Goal**: Users can click navigation links to access different app sections

**Independent Test**: Click each navigation link and verify correct page navigation

### Implementation for User Story 2

- [x] T012 Add navigation links array with icons in components/Header.tsx
- [x] T013 Implement dynamic profile link using session data in components/Header.tsx
- [x] T014 Style navigation links with hover effects in components/Header.tsx
- [x] T015 Add session check to hide profile link when not authenticated in components/Header.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Search for People (Priority: P2)

**Goal**: Users can search for other users by name or username

**Independent Test**: Type in search bar and verify autocomplete shows matching users as clickable links

### Implementation for User Story 3

- [x] T016 Add search input with MagnifyingGlassIcon in components/Header.tsx
- [x] T017 Implement debounced search with useState and useEffect in components/Header.tsx
- [x] T018 Add Command component for autocomplete dropdown in components/Header.tsx
- [x] T019 Implement search API call with error handling in components/Header.tsx
- [x] T020 Add loading spinner during search in components/Header.tsx
- [x] T021 Style search results as profile links in components/Header.tsx
- [x] T022 Add client-side caching for search results in components/Header.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and accessibility enhancements

- [x] T023 [P] Add ARIA labels and keyboard navigation support in components/Header.tsx
- [x] T024 [P] Ensure mobile responsiveness and touch targets in components/Header.tsx
- [x] T025 [P] Add proper focus management for search in components/Header.tsx
- [x] T026 [P] Performance optimization with React.memo if needed in components/Header.tsx
- [x] T027 [P] Validate quickstart.md instructions work correctly

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
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on search API from foundational

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1 and 2 can start in parallel (if team capacity allows)
- User Story 3 depends on foundational search API
- All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Stories 1 & 2

```bash
# Developer A works on User Story 1:
Task: "Create basic Header component structure with logo in components/Header.tsx"
Task: "Add conditional rendering logic using usePathname in components/Header.tsx"
Task: "Integrate Header component into app/layout.tsx inside Providers wrapper"
Task: "Style header layout with Tailwind (fixed top, shadow, responsive) in components/Header.tsx"

# Developer B works on User Story 2:
Task: "Add navigation links array with icons in components/Header.tsx"
Task: "Implement dynamic profile link using session data in components/Header.tsx"
Task: "Style navigation links with hover effects in components/Header.tsx"
Task: "Add session check to hide profile link when not authenticated in components/Header.tsx"
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
3. Add User Stories 2 → Test independently → Deploy/Demo
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
