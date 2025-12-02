# Tasks: Hashtag System

**Input**: Design documents from `/specs/010-hashtag-system/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested - no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and type definitions that all stories depend on

- [x] T001 Add Hashtag and PostHashtag models to prisma/schema.prisma
- [x] T002 Add hashtags relation to Post model in prisma/schema.prisma
- [x] T003 Create migration script in migrations/015_add_hashtags_table.ts
- [x] T004 Run migration and regenerate Prisma client

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, utilities, and service layer that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Add Hashtag and PopularHashtag types to types/prisma.ts
- [x] T006 [P] Add hashtagPostsQuerySchema and hashtagNameSchema to types/posts.ts
- [x] T007 Add extractHashtags function to lib/utils.ts (regex extraction, lowercase normalization) - used by HashtagService for database storage
- [x] T008 Create HashtagService class in services/hashtags.ts with methods:
  - extractAndLinkHashtags(postId, content)
  - getPopularHashtags(days, limit)
  - getPostsByHashtag(hashtag, userId, cursor, limit)
- [x] T009 Update PostService.createPost in services/posts.ts to call HashtagService.extractAndLinkHashtags

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Hashtag Auto-Extraction and Display (Priority: P1) 🎯 MVP

**Goal**: Hashtags are auto-extracted from posts and rendered as clickable links

**Independent Test**: Create a post with hashtags, verify they are stored and rendered as clickable links

### Implementation for User Story 1

- [x] T010 [US1] Extend parseTextWithLinks in lib/utils.ts to detect and parse hashtags - used by TextWithLinks for UI rendering (separate from T007's storage extraction)
- [x] T011 [US1] Create HashtagLink component in components/posts/HashtagLink.tsx
- [x] T012 [US1] Update TextWithLinks component in components/TextWithLinks.tsx to render HashtagLink for hashtags
- [x] T013 [US1] Verify PostItem renders hashtags as clickable links (no changes needed if TextWithLinks updated)

**Checkpoint**: User Story 1 complete - posts with hashtags render clickable links

---

## Phase 4: User Story 2 - Hashtag Page with Post Feed (Priority: P1)

**Goal**: Users can click hashtags to view all posts with that hashtag

**Independent Test**: Navigate to /hashtag/training and verify filtered posts display with infinite scroll

### Implementation for User Story 2

- [x] T014 [P] [US2] Create GET /api/posts/by-hashtag/[hashtag]/route.ts API endpoint
- [x] T015 [US2] Create hashtag page at app/(main)/hashtag/[hashtag]/page.tsx
- [x] T016 [US2] Create HashtagFeed component in components/posts/HashtagFeed.tsx (reuse PostItem, add infinite scroll)
- [x] T017 [US2] Add empty state handling for non-existent hashtags
- [x] T018 [US2] Verify authentication requirement - page is under app/(main)/ which provides auth via existing layout middleware

**Checkpoint**: User Story 2 complete - hashtag pages work with filtered posts and infinite scroll

---

## Phase 5: User Story 3 - Popular Hashtags Widget (Priority: P2)

**Goal**: Sidebar widget displays top 5 trending hashtags from last 7 days

**Independent Test**: Verify widget appears in right sidebar with clickable hashtags

### Implementation for User Story 3

- [x] T019 [P] [US3] Create GET /api/hashtags/popular/route.ts API endpoint
- [x] T020 [US3] Create PopularHashtagsWidget component in components/widgets/PopularHashtagsWidget.tsx
- [x] T021 [US3] Add PopularHashtagsWidget to right sidebar in app/(main)/layout.tsx
- [x] T022 [US3] Add empty state handling when no hashtags in last 7 days
- [x] T023 [US3] Add loading skeleton state for widget

**Checkpoint**: User Story 3 complete - popular hashtags widget displays in sidebar

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T024 Run npm run build to verify no TypeScript errors
- [ ] T025 Test full user flow: create post → view hashtag link → click → hashtag page
- [ ] T026 Run quickstart.md verification checklist
- [x] T027 [P] Update any JSDoc comments for new functions

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────────────────────────────────────────┐
                                                          │
Phase 2 (Foundational) ───────────────────────────────────┤
         │                                                │
         ├── Phase 3 (US1: Auto-Extraction) ──────────────┤
         │                                                │
         ├── Phase 4 (US2: Hashtag Page) ─────────────────┤
         │                                                │
         └── Phase 5 (US3: Widget) ───────────────────────┤
                                                          │
                                              Phase 6 (Polish)
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on Foundational (Phase 2) - Can start parallel to US1
- **User Story 3 (P2)**: Depends on Foundational (Phase 2) - Can start parallel to US1/US2

### Within Each User Story

- Types before services
- Services before API routes
- API routes before UI components
- Core implementation before integration

### Parallel Opportunities

**After Phase 2 completes, these can run in parallel:**

- T010-T013 (US1) - Hashtag rendering
- T014-T018 (US2) - Hashtag page
- T019-T023 (US3) - Widget

**Within User Story 2:**

- T014 (API) and T016 (component) can start together

**Within User Story 3:**

- T019 (API) and T020 (component) can start together

---

## Parallel Example: After Foundational Phase

```bash
# All three user stories can start in parallel:

# Developer A - User Story 1:
T010: Extend parseTextWithLinks in lib/utils.ts
T011: Create HashtagLink component
T012: Update TextWithLinks component

# Developer B - User Story 2:
T014: Create /api/posts/by-hashtag endpoint
T015: Create hashtag page
T016: Create HashtagFeed component

# Developer C - User Story 3:
T019: Create /api/hashtags/popular endpoint
T020: Create PopularHashtagsWidget
T021: Add widget to layout
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (database)
2. Complete Phase 2: Foundational (types, service)
3. Complete Phase 3: User Story 1 (hashtag extraction + rendering)
4. Complete Phase 4: User Story 2 (hashtag page)
5. **STOP and VALIDATE**: Full hashtag flow works
6. Deploy MVP if ready

### Full Feature

1. Complete MVP (above)
2. Add Phase 5: User Story 3 (widget)
3. Complete Phase 6: Polish
4. Final validation and deploy

---

## Task Summary

| Phase        | Tasks     | Parallel | Description           |
| ------------ | --------- | -------- | --------------------- |
| Setup        | T001-T004 | No       | Database schema       |
| Foundational | T005-T009 | Partial  | Types, utils, service |
| US1 (P1)     | T010-T013 | Partial  | Hashtag rendering     |
| US2 (P1)     | T014-T018 | Partial  | Hashtag page          |
| US3 (P2)     | T019-T023 | Partial  | Popular widget        |
| Polish       | T024-T027 | Partial  | Validation            |

**Total Tasks**: 27
**MVP Tasks** (US1 + US2): 18
**Full Feature Tasks**: 27

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after completion
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `npm run build` after schema/type changes to catch errors early
