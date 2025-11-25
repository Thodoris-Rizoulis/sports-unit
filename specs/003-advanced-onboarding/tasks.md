# Tasks: Advanced Onboarding

**Input**: Design documents from `/specs/003-advanced-onboarding/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests requested for MVP - focus on implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App**: `app/`, `api/`, `components/`, `lib/`, `types/`
- Database: `lib/db.ts`, migrations in `migrations/`
- UI: `components/` with shadcn components

## Phase 0: Setup (Shared Infrastructure)

**Purpose**: Database schema and core constants setup

- [x] T001 Create database migrations for sports, positions, teams, user_attributes tables in migrations/ (4 hours)
- [x] T002 [P] Implement data seeding scripts for football positions and teams in migrations/seed/ (3 hours)
- [x] T003 [P] Update database schema definitions in lib/db.ts (2 hours)
- [x] T004 Define validation constants in lib/constants.ts (3 hours)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: API structure and authentication framework

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Setup Zod validation schemas framework in lib/validations/ (4 hours)
- [x] T006 [P] Implement media upload API for Cloudflare R2 in app/api/upload/ (3 hours)
- [x] T007 [P] Create base profile API endpoints structure in app/api/profile/ (4 hours)
- [x] T008 Configure NextAuth session updates for profile data (2 hours)
- [x] T009 Setup error handling and response utilities in lib/utils/ (2 hours)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: User Story 1 - Complete Required Profile Details (Priority: P1) 🎯 MVP

**Goal**: Enable users to complete required onboarding fields and gain full platform access

**Independent Test**: Start onboarding flow, complete required fields only, verify submission succeeds and grants access

### Implementation for User Story 1

- [x] T010 [P] [US1] Create role selection component in components/onboarding/RoleSelection.tsx (2 hours)
- [x] T011 [P] [US1] Create username input component with validation in components/onboarding/UsernameInput.tsx (2 hours)
- [x] T012 [P] [US1] Create basic profile form (name, bio, location) in components/onboarding/BasicProfile.tsx (3 hours)
- [x] T013 [P] [US1] Create sports details form (sport, positions, team) in components/onboarding/SportsDetails.tsx (3 hours)
- [x] T014 [US1] Implement multi-step wizard container in components/onboarding/OnboardingWizard.tsx (depends on T010-T013) (2 hours)
- [x] T015 [US1] Create review/submit step component in components/onboarding/ReviewSubmit.tsx (2 hours)
- [x] T016 [US1] Implement onboarding API endpoint for profile creation in app/api/onboarding/route.ts (4 hours)
- [x] T017 [US1] Add onboarding completion logic and session updates (2 hours)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 3: User Story 2 - Role-Based Onboarding Questions (Priority: P2)

**Goal**: Show relevant fields based on user role and selected sport

**Independent Test**: Select different roles, verify appropriate sports fields appear

### Implementation for User Story 2

- [x] T018 [US2] Add conditional rendering logic to sports details form based on role (2 hours)
- [x] T019 [US2] Implement role-based field validation in Zod schemas (2 hours)
- [x] T020 [US2] Update sports details component to show/hide fields by role (1 hour)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 4: User Story 3 - Onboarding Progress and Profile Editing (Priority: P3)

**Goal**: Show progress through onboarding and enable post-onboarding profile edits

**Independent Test**: Navigate wizard steps, verify progress indicator; edit profile after completion

### Implementation for User Story 3

- [x] T021 [P] [US3] Create progress indicator component in components/onboarding/ProgressIndicator.tsx (2 hours)
- [x] T022 [P] [US3] Add required/optional field indicators to all form components (2 hours)
- [x] T023 [US3] Integrate progress indicator into wizard container (1 hour)
- [x] T024 [US3] Create profile edit page reusing onboarding forms in app/profile/edit/page.tsx (2 hours)
- [x] T025 [US3] Implement profile update API endpoint in app/api/profile/route.ts (3 hours)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and production readiness

- [x] T026 [P] Implement responsive mobile-first styling across all components (2 hours)
- [x] T027 [P] Add WCAG 2.1 AA accessibility features (ARIA labels, keyboard navigation) (2 hours)
- [x] T028 Integrate onboarding wizard with existing app flow in app/onboarding/page.tsx (1 hour)
- [x] T029 Performance optimization for 2s/step target (2 hours)
- [x] T030 [P] Documentation updates in README.md and API docs (1 hour)
- [x] T031 [P] Implement username validation error handling (invalid format, uniqueness) (1 hour)
- [x] T032 [P] Add media upload error handling (network failures, retry logic) (2 hours)
- [x] T033 [P] Implement position limit validation (max 3 selection) (1 hour)
- [x] T034 [P] Add database unavailability error handling (1 hour)
- [x] T035 [P] Implement page refresh state persistence for onboarding (1 hour)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 0)**: No dependencies - can start immediately
- **Foundational (Phase 1)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 2-4)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 wizard but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but independently testable

### Within Each User Story

- Components before integration
- API before UI integration
- Core implementation before polish features
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create role selection component in components/onboarding/RoleSelection.tsx"
Task: "Create username input component with validation in components/onboarding/UsernameInput.tsx"
Task: "Create basic profile form (name, bio, location) in components/onboarding/BasicProfile.tsx"
Task: "Create sports details form (sport, positions, team) in components/onboarding/SportsDetails.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 0: Setup
2. Complete Phase 1: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 2: User Story 1
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
- File paths use Next.js conventions (app/, components/, lib/)
- Focus on required fields first, optional fields can be added later
