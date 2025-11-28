# Tasks: User Profile

**Input**: Design documents from `/specs/004-user-profile/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests requested for MVP - focus on implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `app/`, `api/`, `components/`, `lib/`, `types/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure environment and types

- [x] T001 Configure Cloudflare R2 environment variables in .env.local (use existing CLOUDFLARE*R2*\* vars)
- [x] T002 [P] Create TypeScript interfaces in types/profile.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Validation schemas setup

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement Zod validation schemas for profile data in lib/validations/profile.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Own Profile (Priority: P1) 🎯 MVP

**Goal**: Enable logged-in users to view their own profile page with hero and about sections displaying their information, including rounded profile picture on the left.

**Independent Test**: Start session, navigate to /profile/{my-username}, verify hero section shows cover image, rounded profile picture on left, and user info lines, about section shows bio, page loads in <3 seconds

### Implementation for User Story 1

- [x] T004 [P] [US1] Create profile page component in app/profile/[userId]/page.tsx
- [x] T005 [P] [US1] Create hero section component with profile picture on left in components/ProfileHero.tsx
- [x] T006 [P] [US1] Create about section component in components/ProfileAbout.tsx
- [x] T007 [US1] Implement GET profile API endpoint in app/api/profile/[userId]/route.ts (hit DB directly)
- [x] T008 [US1] Add authentication checks and ownership logic to profile page

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Edit Profile Information (Priority: P2)

**Goal**: Allow profile owners to edit all profile fields including name, username, team, location, bio, cover image, profile picture, and opportunities status

**Independent Test**: On own profile, click edit, update any fields including upload new cover image and profile picture, save changes, verify updates persist and display correctly in <2 minutes

### Implementation for User Story 2

- [x] T009 [P] [US2] Add edit mode toggle to ProfileHero component
- [x] T010 [P] [US2] Add edit mode toggle to ProfileAbout component
- [x] T011 [P] [US2] Create image upload component for cover and profile pictures in components/ProfileImageUpload.tsx
- [x] T012 [US2] Implement PUT profile API endpoint in app/api/profile/[userId]/route.ts (hit DB directly, update all fields)
- [x] T013 [US2] Update existing upload API in app/api/upload/route.ts to handle profile-specific uploads (use profiles/ folder)
- [x] T014 [US2] Integrate image upload with profile updates and revalidation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View Other Users' Profiles (Priority: P3)

**Goal**: Allow logged-in users to view other users' profile pages

**Independent Test**: Navigate to /profile/{another-username}, verify display of their hero and about sections with their data, including profile picture, confirm no edit options available

### Implementation for User Story 3

- [x] T015 [US3] Update profile page to handle viewing other users' profiles
- [x] T016 [US3] Add conditional rendering for edit options based on ownership
- [x] T017 [US3] Implement username to userId resolution if needed

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling and performance improvements

- [x] T018 [P] Add 404 error page for invalid usernames in app/profile/[userId]/not-found.tsx
- [x] T019 [P] Implement error boundaries and user-friendly error messages
- [x] T020 Optimize image loading with Next.js Image component and lazy loading
- [x] T021 Add loading states and skeletons for better UX

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent but may reuse US1 components

### Within Each User Story

- Components before API endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- Once Foundational completes, user stories can start in parallel
- Components within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create profile page component in app/profile/[userId]/page.tsx"
Task: "Create hero section component in components/ProfileHero.tsx"
Task: "Create about section component in components/ProfileAbout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
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

## Phase 4: Polish and Visual Enhancements

**Purpose**: Improve visual design and user experience

- [x] T020 [P] Enhance ProfileHero component with modern card layout, overlapping avatar, gradient overlays, and improved typography
- [x] T021 [P] Enhance ProfileAbout component with card layout, better spacing, icons, and improved form styling
- [x] T022 [P] Implement hover-to-edit functionality for cover and profile images with streamlined edit mode

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Existing upload API can be updated for profile-specific use (profiles/ folder)
- APIs hit DB directly (no services/repositories layers for MVP)
- Editing allows all profile fields: name, username, team, location, bio, cover, opportunities
