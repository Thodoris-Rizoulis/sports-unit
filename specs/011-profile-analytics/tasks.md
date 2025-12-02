# Tasks: Profile Analytics Widget

**Input**: Design documents from `/specs/011-profile-analytics/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅

**Tests**: Not explicitly requested - omitting test tasks.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included

---

## Phase 1: Setup (Database Infrastructure)

**Purpose**: Create database schema and generate Prisma client

- [x] T001 Create migration file `migrations/016_add_profile_visits_table.ts` with profile_visits table, indexes, and foreign keys
- [x] T002 Run migration to create profile_visits table in PostgreSQL
- [x] T003 Update Prisma schema with ProfileVisit model in `prisma/schema.prisma`
- [x] T004 Add User model relations (profileVisitsMade, profileVisitsReceived) in `prisma/schema.prisma`
- [x] T005 Generate Prisma client with `npx prisma generate`

**Checkpoint**: Database ready with ProfileVisit table and Prisma types available ✅

---

## Phase 2: Foundational (Types & Service Layer)

**Purpose**: Core types and service that all API routes and components depend on

**⚠️ CRITICAL**: No API or component work can begin until this phase is complete

- [x] T006 [P] Create `types/analytics.ts` with ProfileAnalyticsData type and Zod schemas (profileAnalyticsSchema, profileVisitResponseSchema)
- [x] T007 [P] Export ProfileAnalyticsData type from `types/prisma.ts`
- [x] T008 Create `services/analytics.ts` with AnalyticsService class containing:
  - `recordProfileVisit(visitorId: number, visitedId: number)` method
  - `getProfileAnalytics(userId: number)` method returning ProfileAnalyticsData

**Checkpoint**: Foundation ready - API routes and components can now be implemented ✅

---

## Phase 3: User Story 2 - Profile Visit Tracking (Priority: P1) 🎯 MVP

**Goal**: Track when users visit other users' profiles

**Independent Test**: Visit User B's profile as User A, verify record created in database

### Implementation for User Story 2

- [x] T009 [US2] Create `app/api/profile/[uuid]/visit/route.ts` with POST handler:
  - Get session, return 401 if unauthorized
  - Resolve UUID to user ID
  - Validate visitor ≠ visited (return 400 for self-view)
  - Call AnalyticsService.recordProfileVisit()
  - Return { success: true }
- [x] T010 [US2] Update `components/profile/ProfilePageWrapper.tsx` to call visit API on mount:
  - Add useEffect hook
  - Check if profile.userId !== session.user.id (skip self-view)
  - Call POST /api/profile/[uuid]/visit (fire-and-forget)
- [ ] T011 [US2] Verify visit recording works by manually testing profile page visit

**Checkpoint**: Profile visits are being tracked in database

---

## Phase 4: User Story 1 - View Profile Analytics Summary (Priority: P1) 🎯 MVP

**Goal**: Display profile views and post impressions widget in left sidebar

**Independent Test**: Log in, navigate to dashboard, verify widget shows in sidebar with two metrics

**Depends on**: US2 (for profile views data), Foundational phase (for service)

### Implementation for User Story 1

- [x] T012 [US1] Create `app/api/profile/analytics/route.ts` with GET handler:
  - Get session, return 401 if unauthorized
  - Call AnalyticsService.getProfileAnalytics(userId)
  - Return ProfileAnalyticsData JSON
- [x] T013 [US1] Create `components/widgets/ProfileAnalyticsWidget.tsx`:
  - Client component with "use client"
  - useEffect to fetch /api/profile/analytics
  - Loading skeleton state (match ProfileWidget pattern)
  - Error state with friendly message
  - Display profile views and post impressions counts
  - Card-based styling matching existing widgets
- [x] T014 [US1] Update `app/(main)/layout.tsx`:
  - Add dynamic import for ProfileAnalyticsWidget
  - Add widget to left sidebar below NavigationWidget

**Checkpoint**: Widget displays in sidebar with loading/error/data states ✅

---

## Phase 5: User Story 3 - Unique Visitor Count Calculation (Priority: P2)

**Goal**: Profile views count shows unique visitors, not total visits

**Independent Test**: Same user visits profile 5 times, count shows 1

**Depends on**: US2 (visit tracking must exist)

### Implementation for User Story 3

- [x] T015 [US3] Update `services/analytics.ts` getProfileAnalytics() method:
  - Use Prisma groupBy with distinct visitorId
  - Filter by visitedId = userId AND createdAt >= 7 days ago
  - Return result.length as profileViews (unique count)

**Checkpoint**: Profile views shows unique visitors within 7-day window ✅

---

## Phase 6: User Story 4 - Post Impressions Calculation (Priority: P2)

**Goal**: Post impressions = total likes received in last 7 days

**Independent Test**: Receive like on old post, verify it counts in impressions

**Depends on**: Foundational phase (service exists)

### Implementation for User Story 4

- [x] T016 [US4] Update `services/analytics.ts` getProfileAnalytics() method:
  - Query PostLike where post.userId = current user
  - Filter createdAt >= 7 days ago
  - Return count as postImpressions

**Checkpoint**: Post impressions shows correct like count for 7-day window ✅

---

## Phase 7: Polish & Validation

**Purpose**: Final validation and cleanup

- [x] T017 Run `npm run build` to validate TypeScript compilation
- [ ] T018 Test complete flow: visit profile → check analytics widget → verify counts
- [ ] T019 Verify widget hidden on mobile (resize browser)
- [ ] T020 Verify self-views are NOT recorded (visit own profile)
- [ ] T021 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all API/component work
- **User Story 2 (Phase 3)**: Depends on Foundational - Visit tracking
- **User Story 1 (Phase 4)**: Depends on Foundational + US2 for meaningful data
- **User Story 3 (Phase 5)**: Depends on US2 (refines profile views count)
- **User Story 4 (Phase 6)**: Depends on Foundational only (parallel with US2/US3)
- **Polish (Phase 7)**: Depends on all user stories

### Task Dependencies (Critical Path)

```
T001 → T002 → T003 → T004 → T005 (sequential: migration → schema → generate)
      ↓
T006, T007 (parallel: types)
      ↓
T008 (service - needs Prisma types)
      ↓
T009, T010, T011 (US2: visit tracking)
T012, T013, T014 (US1: widget - can start after T008)
      ↓
T015 (US3: unique counts - after T009)
T016 (US4: impressions - after T008, parallel with US2/US3)
      ↓
T017 → T018 → T019 → T020 → T021 (validation)
```

### Parallel Opportunities

**Phase 2 - Types (after T005)**:

```
T006: types/analytics.ts
T007: types/prisma.ts export
```

**After Foundation (T008) - User Stories can parallelize**:

```
US2: T009, T010, T011 (visit tracking)
US4: T016 (post impressions - no dependency on US2)
```

**After US2 Complete**:

```
US1: T012, T013, T014 (widget display)
US3: T015 (unique count refinement)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008)
3. Complete Phase 3: User Story 2 - Visit Tracking (T009-T011)
4. Complete Phase 4: User Story 1 - Widget Display (T012-T014)
5. **STOP and VALIDATE**: Widget should show profile views
6. Deploy/demo if ready - users can see their analytics

### Full Feature

Continue with: 7. Complete Phase 5: User Story 3 - Unique Counts (T015) 8. Complete Phase 6: User Story 4 - Post Impressions (T016) 9. Complete Phase 7: Polish & Validation (T017-T021)

---

## Summary

| Phase        | Tasks     | Purpose                  |
| ------------ | --------- | ------------------------ |
| Setup        | T001-T005 | Database infrastructure  |
| Foundational | T006-T008 | Types and service layer  |
| US2 (P1)     | T009-T011 | Profile visit tracking   |
| US1 (P1)     | T012-T014 | Analytics widget display |
| US3 (P2)     | T015      | Unique visitor counts    |
| US4 (P2)     | T016      | Post impressions counts  |
| Polish       | T017-T021 | Validation and cleanup   |

**Total Tasks**: 21
**Parallel Opportunities**: T006/T007, T009-T011 with T016
**MVP Scope**: T001-T014 (14 tasks)
