# Tasks: Enhanced User Profile Sections

**Input**: Design documents from `/specs/012-enhanced-profile-sections/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested - implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, database schema, types, and validation

- [x] T001 Create database migration in `migrations/017_add_enhanced_profile_tables.ts` with all 6 tables (athlete_metrics, user_experiences, user_education, user_certifications, user_languages, user_awards)
- [x] T002 Run migration to create database tables
- [x] T003 Update Prisma schema in `prisma/schema.prisma` with 6 new models (AthleteMetrics, UserExperience, UserEducation, UserCertification, UserLanguage, UserAward) and User/Team relations
- [x] T004 Run `npx prisma generate` to regenerate Prisma client
- [x] T004b [P] Install Combobox shadcn component if not present: `npx shadcn-ui@latest add combobox` (command.tsx and popover.tsx already present)
- [x] T005 [P] Add ATHLETE_METRICS validation constants to `lib/constants.ts`
- [x] T006 [P] Create Zod validation schemas in `types/enhanced-profile.ts` (athleteMetricsSchema, keyInfoSchema, experienceSchema, educationSchema, certificationSchema, languageSchema, awardSchema)
- [x] T007 [P] Add enhanced profile UI types to `types/prisma.ts` (AthleteMetricsUI, ExperienceUI, EducationUI, CertificationUI, LanguageUI, AwardUI)
- [x] T008 [P] Add mapper functions to `types/prisma.ts` (toAthleteMetrics, toExperience, toEducation, toCertification, toLanguage, toAward)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services that MUST be complete before ANY user story components

**⚠️ CRITICAL**: No UI components can be built until this phase is complete

- [x] T009 Create AthleteMetricsService in `services/athlete-metrics.ts` with get(), upsert() methods
- [x] T010 [P] Create ExperienceService in `services/experience.ts` with getAll(), create(), update(), delete() methods
- [x] T011 [P] Create EducationService in `services/education.ts` with getAll(), create(), update(), delete() methods
- [x] T012 [P] Create CertificationService in `services/certifications.ts` with getAll(), create(), update(), delete() methods
- [x] T013 [P] Create LanguageService in `services/languages.ts` with getAll(), create(), update(), delete() methods
- [x] T014 [P] Create AwardService in `services/awards.ts` with getAll(), create(), update(), delete() methods
- [x] T015 Extend UserService in `services/profile.ts` to include roleName lookup from profile_roles table
- [x] T016 Extend UserService in `services/profile.ts` with updateKeyInfo() method for DOB, height, positions, strongFoot
- [x] T017 [P] Create GET/PUT route in `app/api/profile/[uuid]/metrics/route.ts`
- [x] T018 [P] Create PUT route in `app/api/profile/[uuid]/key-info/route.ts`
- [x] T019 [P] Create GET/POST route in `app/api/profile/[uuid]/experience/route.ts`
- [x] T020 [P] Create PUT/DELETE route in `app/api/profile/[uuid]/experience/[id]/route.ts`
- [x] T021 [P] Create GET/POST route in `app/api/profile/[uuid]/education/route.ts`
- [x] T022 [P] Create PUT/DELETE route in `app/api/profile/[uuid]/education/[id]/route.ts`
- [x] T023 [P] Create GET/POST route in `app/api/profile/[uuid]/certifications/route.ts`
- [x] T024 [P] Create PUT/DELETE route in `app/api/profile/[uuid]/certifications/[id]/route.ts`
- [x] T025 [P] Create GET/POST route in `app/api/profile/[uuid]/languages/route.ts`
- [x] T026 [P] Create PUT/DELETE route in `app/api/profile/[uuid]/languages/[id]/route.ts`
- [x] T027 [P] Create GET/POST route in `app/api/profile/[uuid]/awards/route.ts`
- [x] T028 [P] Create PUT/DELETE route in `app/api/profile/[uuid]/awards/[id]/route.ts`
- [x] T029 [P] Create GET route in `app/api/profile/[uuid]/posts/route.ts` with pagination (limit, offset)

**Checkpoint**: Foundation ready - all API endpoints functional, user story UI implementation can begin

---

## Phase 3: User Story 1 - View Enhanced Profile (Priority: P1) 🎯 MVP

**Goal**: Display comprehensive profile information with role-based sections for all users

**Independent Test**: Navigate to any user's profile page and verify all applicable sections display with data or empty states. Athlete profiles show Key Info + Metrics, coach profiles show Certifications.

### Hooks for User Story 1

- [x] T030 [P] [US1] Create useAthleteMetrics hook in `hooks/useAthleteMetrics.ts` with React Query
- [x] T031 [P] [US1] Create useExperience hook in `hooks/useExperience.ts` with React Query CRUD
- [x] T032 [P] [US1] Create useEducation hook in `hooks/useEducation.ts` with React Query CRUD
- [x] T033 [P] [US1] Create useCertifications hook in `hooks/useCertifications.ts` with React Query CRUD
- [x] T034 [P] [US1] Create useLanguages hook in `hooks/useLanguages.ts` with React Query CRUD
- [x] T035 [P] [US1] Create useAwards hook in `hooks/useAwards.ts` with React Query CRUD
- [x] T036 [P] [US1] Create useUserPosts hook in `hooks/useUserPosts.ts` with React Query and pagination

### Display Components for User Story 1

- [x] T037 [P] [US1] Create KeyInformationSection component in `components/profile/KeyInformationSection.tsx` (display only, athlete-only)
- [x] T038 [P] [US1] Create AthleteMetricsSection component in `components/profile/AthleteMetricsSection.tsx` (display only, athlete-only)
- [x] T039 [P] [US1] Create RecentActivitySection component in `components/profile/RecentActivitySection.tsx` showing 2 recent posts with "See All" link
- [x] T040 [P] [US1] Create ExperienceSection component in `components/profile/ExperienceSection.tsx` (display only)
- [x] T041 [P] [US1] Create EducationSection component in `components/profile/EducationSection.tsx` (display only)
- [x] T042 [P] [US1] Create CertificationsSection component in `components/profile/CertificationsSection.tsx` (display only, coach-only)
- [x] T043 [P] [US1] Create ProfileSidebar wrapper component in `components/profile/ProfileSidebar.tsx` (responsive: right on desktop, below on mobile)
- [x] T044 [P] [US1] Create LanguagesWidget component in `components/profile/LanguagesWidget.tsx` (display only)
- [x] T045 [P] [US1] Create AwardsWidget component in `components/profile/AwardsWidget.tsx` (display only)

### Integration for User Story 1

- [x] T046 [US1] Update ProfilePageWrapper in `components/profile/ProfilePageWrapper.tsx` to include all new sections with role-based visibility
- [x] T047 [US1] Create user posts page at `app/(main)/profile/[uuid]/[slug]/posts/page.tsx` using (main) layout

**Checkpoint**: User Story 1 complete - all users can view comprehensive profiles with role-appropriate sections

---

## Phase 4: User Story 2 - Edit Key Information (Priority: P2)

**Goal**: Athletes can edit their DOB, height, positions, and strong foot

**Independent Test**: As an athlete, click edit on Key Information, modify fields, save, verify changes persist

- [x] T048 [US2] Create KeyInfoEditModal component in `components/profile/KeyInfoEditModal.tsx` with form for DOB, height, positions multi-select, strong foot dropdown
- [x] T049 [US2] Add edit button and modal trigger to KeyInformationSection in `components/profile/KeyInformationSection.tsx`
- [x] T050 [US2] Add positions dropdown filter by user's sportId using existing positions API
- [x] T050b [US2] Handle missing sportId edge case in KeyInfoEditModal: show "Please select a sport in your profile first" message when positions dropdown cannot load

**Checkpoint**: User Story 2 complete - athletes can edit their key information

---

## Phase 5: User Story 3 - Manage Athlete Metrics (Priority: P2)

**Goal**: Athletes can record and update performance metrics

**Independent Test**: As an athlete, add/edit metrics (sprint, agility, beep test, vertical jump), verify values display correctly

- [x] T051 [US3] Create MetricsEditModal component in `components/profile/MetricsEditModal.tsx` with form for all 5 metric fields with validation
- [x] T052 [US3] Add edit button and modal trigger to AthleteMetricsSection in `components/profile/AthleteMetricsSection.tsx`
- [x] T053 [US3] Implement beep test display formatting as "Level X.Y" in AthleteMetricsSection

**Checkpoint**: User Story 3 complete - athletes can manage their performance metrics

---

## Phase 6: User Story 4 - View Recent Activity (Priority: P2)

**Goal**: Users can see 2 most recent posts and navigate to full post history

**Independent Test**: View profile with posts, verify 2 most recent show, click "See All" to view all posts

- [x] T054 [US4] Implement PostCard integration in RecentActivitySection showing 2 most recent posts in `components/profile/RecentActivitySection.tsx`
- [x] T055 [US4] Add "No posts yet" empty state to RecentActivitySection
- [x] T056 [US4] Add pagination to user posts page at `app/(main)/profile/[uuid]/[slug]/posts/page.tsx`

**Checkpoint**: User Story 4 complete - users can view recent activity and full post history

---

## Phase 7: User Story 5 - Manage Experience (Priority: P3)

**Goal**: Users can add, edit, and delete career experience entries

**Independent Test**: Add an experience entry, edit it, delete it, verify each operation persists correctly

- [x] T057 [US5] Create ExperienceModal component in `components/profile/ExperienceModal.tsx` with form for title, team combobox (filtered by sport), years, location, "Present" checkbox
- [x] T058 [US5] Add add/edit/delete buttons to ExperienceSection in `components/profile/ExperienceSection.tsx`
- [x] T059 [US5] Add delete confirmation AlertDialog to ExperienceSection (via DeleteConfirmationDialog + ProfilePageWrapper)
- [x] T060 [US5] Implement team combobox with search filtered by user's sportId in ExperienceModal
- [x] T060b [US5] Handle missing sportId edge case in ExperienceModal: show "Please select a sport in your profile first" message when team dropdown cannot load

**Checkpoint**: User Story 5 complete - users can manage their experience entries

---

## Phase 8: User Story 6 - Manage Education (Priority: P3)

**Goal**: Users can add, edit, and delete education entries

**Independent Test**: Add an education entry, edit it, delete it, verify each operation persists correctly

- [x] T061 [US6] Create EducationModal component in `components/profile/EducationModal.tsx` with form for title (institution), subtitle (degree), years, "Present" checkbox
- [x] T062 [US6] Add add/edit/delete buttons to EducationSection in `components/profile/EducationSection.tsx`
- [x] T063 [US6] Add delete confirmation AlertDialog to EducationSection (via DeleteConfirmationDialog + ProfilePageWrapper)

**Checkpoint**: User Story 6 complete - users can manage their education entries

---

## Phase 9: User Story 7 - Manage Certifications (Priority: P3)

**Goal**: Coaches can add, edit, and delete licenses and certifications

**Independent Test**: As a coach, add a certification, edit it, delete it, verify each operation persists

- [x] T064 [US7] Create CertificationModal component in `components/profile/CertificationModal.tsx` with form for title, organization, year, description
- [x] T065 [US7] Add add/edit/delete buttons to CertificationsSection in `components/profile/CertificationsSection.tsx`
- [x] T066 [US7] Add delete confirmation AlertDialog to CertificationsSection (via DeleteConfirmationDialog + ProfilePageWrapper)

**Checkpoint**: User Story 7 complete - coaches can manage their certifications

---

## Phase 10: User Story 8 - Manage Languages (Priority: P4)

**Goal**: Users can add, edit, and delete language proficiencies

**Independent Test**: Add a language entry, edit it, delete it, verify each operation persists

- [x] T067 [US8] Create LanguageModal component in `components/profile/LanguageModal.tsx` with form for language name and level dropdown (Native/Fluent/Proficient/Intermediate/Basic)
- [x] T068 [US8] Add add/edit/delete buttons to LanguagesWidget in `components/profile/LanguagesWidget.tsx`
- [x] T069 [US8] Add level badge styling to LanguagesWidget

**Checkpoint**: User Story 8 complete - users can manage their languages

---

## Phase 11: User Story 9 - Manage Awards (Priority: P4)

**Goal**: Users can add, edit, and delete awards

**Independent Test**: Add an award entry, edit it, delete it, verify each operation persists

- [x] T070 [US9] Create AwardModal component in `components/profile/AwardModal.tsx` with form for title, year, optional description
- [x] T071 [US9] Add add/edit/delete buttons to AwardsWidget in `components/profile/AwardsWidget.tsx`
- [x] T072 [US9] Order awards by year descending in AwardsWidget display

**Checkpoint**: User Story 9 complete - users can manage their awards

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements that affect multiple user stories

- [x] T073 [P] Add loading skeletons to all new section components
- [x] T074 [P] Ensure all modals disable other edit buttons when open (currentlyEditing pattern)
- [x] T075 [P] Add error toast notifications for failed API operations
- [x] T076 [P] Verify mobile responsive layout for ProfileSidebar
- [x] T077 [P] Verify empty states show appropriate messages with "Add" button for owners
- [x] T078 Run `npm run build` to validate TypeScript compilation
- [x] T079 Run quickstart.md validation checklist (ready for manual testing)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all UI work
- **Phases 3-11 (User Stories)**: All depend on Phase 2 completion
- **Phase 12 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story                   | Priority | Can Start After | Notes                             |
| ----------------------- | -------- | --------------- | --------------------------------- |
| US1 - View Profile      | P1       | Phase 2         | 🎯 MVP - read-only display        |
| US2 - Edit Key Info     | P2       | Phase 2         | Extends US1 KeyInformationSection |
| US3 - Manage Metrics    | P2       | Phase 2         | Extends US1 AthleteMetricsSection |
| US4 - View Activity     | P2       | Phase 2         | Extends US1 RecentActivitySection |
| US5 - Manage Experience | P3       | Phase 2         | Extends US1 ExperienceSection     |
| US6 - Manage Education  | P3       | Phase 2         | Extends US1 EducationSection      |
| US7 - Manage Certs      | P3       | Phase 2         | Extends US1 CertificationsSection |
| US8 - Manage Languages  | P4       | Phase 2         | Extends US1 LanguagesWidget       |
| US9 - Manage Awards     | P4       | Phase 2         | Extends US1 AwardsWidget          |

### Within Each Phase

- Tasks marked [P] can run in parallel
- Sequential tasks depend on preceding tasks
- Service → API route → Hook → Component order

### Parallel Opportunities by Phase

**Phase 1 (Setup)**: T005, T006, T007, T008 can run in parallel after T004

**Phase 2 (Foundational)**: T010-T029 (all API routes and services) can run in parallel after T009

**Phase 3 (US1)**: All hooks (T030-T036) in parallel, all display components (T037-T045) in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# After T009 (AthleteMetricsService), launch all other services in parallel:
T010: ExperienceService in services/experience.ts
T011: EducationService in services/education.ts
T012: CertificationService in services/certifications.ts
T013: LanguageService in services/languages.ts
T014: AwardService in services/awards.ts

# Then all API routes in parallel:
T017-T029: All route.ts files can be created simultaneously
```

## Parallel Example: Phase 3 User Story 1

```bash
# All hooks in parallel:
T030: useAthleteMetrics hook
T031: useExperience hook
T032: useEducation hook
T033: useCertifications hook
T034: useLanguages hook
T035: useAwards hook
T036: useUserPosts hook

# All display components in parallel:
T037: KeyInformationSection.tsx
T038: AthleteMetricsSection.tsx
T039: RecentActivitySection.tsx
T040: ExperienceSection.tsx
T041: EducationSection.tsx
T042: CertificationsSection.tsx
T043: ProfileSidebar.tsx
T044: LanguagesWidget.tsx
T045: AwardsWidget.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T029)
3. Complete Phase 3: User Story 1 (T030-T047)
4. **STOP and VALIDATE**: Profile page displays all sections with data
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (View Profile) → Test → Deploy (MVP!)
3. Add US2-US4 (P2 stories) → Test → Deploy
4. Add US5-US7 (P3 stories) → Test → Deploy
5. Add US8-US9 (P4 stories) → Test → Deploy
6. Polish phase → Final release

---

## Summary

| Metric                   | Value           |
| ------------------------ | --------------- |
| **Total Tasks**          | 82              |
| **Setup Tasks**          | 9               |
| **Foundational Tasks**   | 21              |
| **User Story Tasks**     | 45              |
| **Polish Tasks**         | 7               |
| **Parallelizable Tasks** | 53 (marked [P]) |

### Tasks per User Story

| Story                   | Count | Priority |
| ----------------------- | ----- | -------- |
| US1 - View Profile      | 18    | P1 🎯    |
| US2 - Edit Key Info     | 4     | P2       |
| US3 - Manage Metrics    | 3     | P2       |
| US4 - View Activity     | 3     | P2       |
| US5 - Manage Experience | 5     | P3       |
| US6 - Manage Education  | 3     | P3       |
| US7 - Manage Certs      | 3     | P3       |
| US8 - Manage Languages  | 3     | P4       |
| US9 - Manage Awards     | 3     | P4       |

### Suggested MVP Scope

**Phase 1 + Phase 2 + Phase 3 (US1)** = 47 tasks for complete read-only profile view with all sections displaying data.
