# Tasks: Post Creation System

**Input**: Design documents from `/specs/009-post-creation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not requested in specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/` for routes, `components/` for UI, `types/` for definitions, `services/` for business logic, `lib/` for utilities
- API routes: `app/api/`
- Components: `components/posts/` (new domain)
- Types: `types/posts.ts`
- Services: `services/posts.ts`
- Adjust paths based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project setup and environment for post creation feature

- [x] T001 Verify Cloudflare R2 credentials in .env.local
- [x] T002 Verify PostgreSQL connection and database setup
- [x] T003 Run npm run build to ensure TypeScript compilation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create types/posts.ts with Zod schemas for Post, PostMedia, PostLike, PostComment, PostShare, PostSave
- [x] T005 Create migrations/010_add_posts_tables.ts with tables and indexes
- [x] T006 Extend app/api/upload/route.ts for video support (MP4/WebM/MOV, 100MB)
- [x] T007 Update types/index.ts to export new post types

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create a Post (Priority: P1) 🎯 MVP

**Goal**: Allow users to create posts with text and optional media (images/videos/links)

**Independent Test**: Create a post via API and verify it saves to database with correct data

### Implementation for User Story 1

- [x] T008 [US1] Create services/posts.ts with PostService class and createPost method
- [x] T009 [US1] Create app/api/posts/route.ts for POST endpoint with validation
- [x] T010 [US1] Create components/posts/PostCreationForm.tsx with form, media upload, submit
- [x] T011 [US1] Update app/(main)/dashboard/page.tsx to include PostCreationForm

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Posts from Connections (Priority: P1)

**Goal**: Display posts from accepted connections and own posts in chronological order

**Independent Test**: Create posts from connections and verify they appear in feed for connected users

### Implementation for User Story 2

- [x] T012 [US2] Add getFeed method to services/posts.ts with connection filtering
- [x] T013 [US2] Create app/api/posts/route.ts for GET endpoint with pagination
- [x] T014 [US2] Create components/posts/PostFeed.tsx to display posts list
- [x] T015 [US2] Create components/posts/PostItem.tsx for individual post display
- [x] T016 [US2] Update app/(main)/dashboard/page.tsx to include PostFeed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Like a Post (Priority: P2)

**Goal**: Allow users to like posts with toggle functionality

**Independent Test**: Like a post and verify like count increases, unlike removes it

### Implementation for User Story 3

- [x] T017 [US3] Add toggleLike method to services/posts.ts
- [x] T018 [US3] Create app/api/posts/[id]/like/route.ts for POST endpoint
- [x] T019 [US3] Create components/posts/PostInteractions.tsx with like button
- [x] T020 [US3] Update components/posts/PostItem.tsx to include interactions

**Checkpoint**: User Story 3 works independently

---

## Phase 6: User Story 4 - Comment on a Post (Priority: P2)

**Goal**: Allow users to add comments to posts

**Independent Test**: Add comment to post and verify it appears under the post

### Implementation for User Story 4

- [x] T021 [US4] Add addComment method to services/posts.ts
- [x] T022 [US4] Create app/api/posts/[id]/comment/route.ts for POST endpoint
- [x] T023 [US4] Update components/posts/PostInteractions.tsx with comment button
- [x] T024 [US4] Create components/posts/CommentSection.tsx for displaying comments

**Checkpoint**: User Story 4 works independently

---

## Phase 7: User Story 5 - Reply to Comments (Priority: P3)

**Goal**: Allow nested replies to comments

**Independent Test**: Reply to a comment and verify it nests correctly

### Implementation for User Story 5

- [x] T025 [US5] Update addComment method in services/posts.ts to handle parent_comment_id
- [x] T026 [US5] Update app/api/posts/[id]/comment/route.ts to accept parentCommentId
- [x] T027 [US5] Update components/posts/CommentSection.tsx for nested display and reply UI

**Checkpoint**: User Story 5 works independently

---

## Phase 8: User Story 6 - Share a Post (Priority: P3)

**Goal**: Allow users to share posts via link copying

**Independent Test**: Share a post and verify link copies to clipboard

### Implementation for User Story 6

- [x] T028 [US6] Add sharePost method to services/posts.ts
- [x] T029 [US6] Create app/api/posts/[id]/share/route.ts for POST endpoint
- [x] T030 [US6] Update components/posts/PostInteractions.tsx with share button

**Checkpoint**: User Story 6 works independently

---

## Phase 9: User Story 7 - Save a Post (Priority: P3)

**Goal**: Allow users to save posts as bookmarks

**Independent Test**: Save a post and verify it can be retrieved as saved

### Implementation for User Story 7

- [x] T031 [US7] Add toggleSave method to services/posts.ts
- [x] T032 [US7] Create app/api/posts/[id]/save/route.ts for POST endpoint
- [x] T033 [US7] Update components/posts/PostInteractions.tsx with save button
- [x] T034 [US6] Add public_uuid to posts table and schema
- [x] T035 [US6] Create app/post/[uuid]/page.tsx with same layout as dashboard
- [x] T036 [US6] Create app/api/posts/by-uuid/[uuid]/route.ts for fetching post by UUID
- [x] T037 [US7] Create app/saved/page.tsx with same layout as dashboard
- [x] T038 [US7] Create app/api/saved/route.ts for fetching saved posts
- [x] T039 [US7] Update Header.tsx to include Saved navigation item

**Checkpoint**: All user stories should now be independently functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T034 [P] Update README.md with post creation features
- [ ] T035 Code cleanup and remove unused imports
- [ ] T036 Performance optimization for feed queries
- [ ] T037 Security review and input sanitization
- [ ] T038 Run quickstart.md validation

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
- **User Story 3-7 (P2/P3)**: Can start after Foundational (Phase 2) - May integrate with previous but should be independently testable

### Within Each User Story

- Models before services
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
# Launch service and API together:
Task: "Create services/posts.ts with PostService class and createPost method"
Task: "Create app/api/posts/route.ts for POST endpoint with validation"

# Launch component tasks together:
Task: "Create components/posts/PostCreationForm.tsx with form, media upload, submit"
Task: "Update app/(main)/dashboard/page.tsx to include PostCreationForm"
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
4. Add User Stories 3-7 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Stories 1-2 (core post functionality)
   - Developer B: User Stories 3-4 (interactions)
   - Developer C: User Stories 5-7 (advanced features)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
