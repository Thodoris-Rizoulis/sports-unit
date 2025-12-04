# Implementation Tasks: Discovery Page & Watchlists

**Feature**: 013-discovery-watchlists  
**Generated**: 2025-12-03  
**Based on**: spec.md, plan.md, data-model.md, contracts/

---

## Phase 1: Setup

Project initialization and type system foundation.

- [x] T001 Create discovery filter schemas and types in `types/discovery.ts`
- [x] T002 [P] Create watchlist schemas and types in `types/watchlists.ts`
- [x] T003 Update type exports in `types/index.ts` to include discovery and watchlists types

---

## Phase 2: Foundational

Core database and service layer setup required by all user stories.

- [x] T004 Add Watchlist and WatchlistAthlete models to `prisma/schema.prisma` with User relations
- [x] T005 Create migration file `migrations/018_add_watchlists_tables.ts` for new tables
- [x] T006 Run migration to create watchlists tables in database
- [x] T007 Add Watchlist and WatchlistAthlete include patterns and mapper functions to `types/prisma.ts`
- [x] T008 Create `services/discovery.ts` with DiscoveryService class and searchAthletes method
- [x] T009 [P] Create `services/watchlists.ts` with WatchlistService class and all CRUD methods
- [x] T010 Install shadcn Sheet component for mobile filter drawer (if not installed)

**Checkpoint**: Services can be tested via direct invocation. Prisma types available.

---

## Phase 3: User Story 1 - Filter and Discover Athletes (P1)

**Story Goal**: Users can search for athletes using multiple combinable filters with AND logic.

**Independent Test Criteria**: Apply various filter combinations via URL params or filter UI; verify results match ALL selected criteria.

### Implementation Tasks

- [x] T011 [US1] Create `app/api/discovery/route.ts` with GET handler for athlete search
- [x] T012 [P] [US1] Create `components/discovery/DiscoveryFilters.tsx` client component with all filter controls
- [x] T013 [P] [US1] Create `components/discovery/FilterDrawer.tsx` for mobile filter panel using shadcn Sheet
- [x] T014 [P] [US1] Create `components/discovery/SortDropdown.tsx` for sort order selection
- [x] T015 [US1] Create `hooks/useDiscovery.ts` for filter state management and URL sync
- [x] T016 [US1] Create `app/(main)/discovery/page.tsx` server page that reads URL params and fetches initial data

**Story Checkpoint**: User can navigate to `/discovery`, apply filters, see URL update, share link with preserved filters.

---

## Phase 4: User Story 2 - View Athlete Discovery Results (P1)

**Story Goal**: Users see comprehensive athlete information in result cards with pagination.

**Independent Test Criteria**: View discovery results page; verify cards show all required fields (image, name, sport, position, location, metrics); verify pagination works.

### Implementation Tasks

- [x] T017 [US2] Create `components/discovery/AthleteCard.tsx` displaying all athlete info and metrics
- [x] T018 [P] [US2] Create `components/ui/pagination.tsx` reusable pagination component (if not exists)
- [x] T019 [US2] Create `components/discovery/DiscoveryResults.tsx` grid layout with pagination
- [x] T020 [US2] Update `app/(main)/discovery/page.tsx` to integrate DiscoveryResults with pagination state

**Story Checkpoint**: User sees athlete cards with all profile data and metrics; pagination controls navigate between result pages.

---

## Phase 5: User Story 3 - Create and Manage Watchlists (P2)

**Story Goal**: Users can create, view, edit, and delete private watchlists.

**Independent Test Criteria**: Create a watchlist with name/description; view it in list; edit name; delete with confirmation.

### Implementation Tasks

- [x] T021 [US3] Create `app/api/watchlists/route.ts` with GET (list) and POST (create) handlers
- [x] T022 [P] [US3] Create `app/api/watchlists/[id]/route.ts` with GET, PATCH, DELETE handlers
- [x] T023 [US3] Create `hooks/useWatchlists.ts` for fetching user's watchlists
- [x] T024 [P] [US3] Create `hooks/useWatchlistMutations.ts` for create/update/delete operations
- [x] T025 [US3] Create `components/watchlists/WatchlistForm.tsx` for create/edit form with React Hook Form
- [x] T026 [P] [US3] Create `components/watchlists/WatchlistCard.tsx` displaying name, description, athlete count
- [x] T027 [P] [US3] Create `components/watchlists/DeleteWatchlistDialog.tsx` confirmation dialog
- [x] T028 [US3] Create `components/watchlists/WatchlistList.tsx` displaying all user's watchlists
- [x] T029 [US3] Create `app/(main)/watchlists/page.tsx` with empty state and watchlist grid

**Story Checkpoint**: User can create watchlists, view them in a list, edit names, and delete with confirmation. Empty state shown when no watchlists.

---

## Phase 6: User Story 4 - Add Athletes to Watchlists (P2)

**Story Goal**: Users can add athletes to watchlists directly from discovery with visual feedback.

**Independent Test Criteria**: Click "Add to Watchlist" on athlete card; see modal with checkboxes; select watchlists; verify athlete added; see badge indicator.

### Implementation Tasks

- [x] T030 [US4] Create `app/api/watchlists/[id]/athletes/route.ts` with POST handler for adding athletes
- [x] T031 [P] [US4] Create `app/api/watchlists/containing/[athleteId]/route.ts` with GET handler
- [x] T032 [US4] Create `components/discovery/AddToWatchlistModal.tsx` with checkbox selection and Save button
- [x] T033 [US4] Update AthleteCard.tsx to show "Add to Watchlist" button with badge when athlete is in watchlists
- [x] T034 [US4] Update `hooks/useWatchlistMutations.ts` to add addAthleteToWatchlist mutation
- [x] T035 [US4] Add inline watchlist creation capability to AddToWatchlistModal

**Story Checkpoint**: User can add athletes to multiple watchlists from discovery; badge shows when athlete already in watchlists; inline watchlist creation works.

---

## Phase 7: User Story 5 - View and Manage Watchlist Athletes (P2)

**Story Goal**: Users can view all athletes in a watchlist and remove individuals.

**Independent Test Criteria**: Navigate to watchlist detail; see all athletes with full info; remove an athlete; verify removal.

### Implementation Tasks

- [x] T036 [US5] Create `app/api/watchlists/[id]/athletes/[athleteId]/route.ts` with DELETE handler
- [x] T037 [US5] Create `hooks/useWatchlist.ts` for fetching single watchlist with athletes
- [x] T038 [US5] Create `components/watchlists/WatchlistAthleteCard.tsx` with remove button
- [x] T039 [US5] Create `components/watchlists/WatchlistDetail.tsx` with athlete list and pagination
- [x] T040 [US5] Create `app/(main)/watchlists/[id]/page.tsx` watchlist detail page
- [x] T041 [US5] Update `hooks/useWatchlistMutations.ts` to add removeAthleteFromWatchlist mutation

**Story Checkpoint**: User can navigate to a watchlist, view all athletes with same info as discovery cards, remove athletes from the watchlist, and navigate to athlete profiles.

---

## Phase 8: User Story 6 - Navigate to Watchlists (P3)

**Story Goal**: Users can access watchlists from main navigation.

**Independent Test Criteria**: See "Watchlists" link in navigation after Network/Saved; click to navigate to watchlists page.

### Implementation Tasks

- [x] T042 [US6] Update `components/widgets/NavigationWidget.tsx` to add Watchlists link after Saved

**Story Checkpoint**: Watchlists link appears in navigation in correct position; clicking navigates to watchlists page.

---

## Phase 9: Polish & Validation

Cross-cutting concerns, error handling, empty states, and final validation.

- [x] T043 Add empty state component for discovery page when no results match filters
- [x] T044 [P] Add empty state component for watchlists page when user has no watchlists
- [x] T045 [P] Add empty state component for watchlist detail when no athletes in watchlist
- [x] T046 Add loading skeletons for discovery results and watchlist lists
- [x] T047 Add error boundary handling for discovery and watchlists pages
- [x] T048 Verify mobile responsiveness on all discovery and watchlist pages
- [x] T049 Run `npm run build` to validate TypeScript compilation
- [ ] T050 Manual testing: Execute all acceptance scenarios from spec.md; verify cascade delete (athlete deletion removes from watchlists; watchlist deletion removes all athlete associations)

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ────────────────────────────────────────┐
    │                                                          │
    ▼                                                          │
Phase 3 (US1: Filter) ◄───────────────────────────────┐        │
    │                                                 │        │
    ▼                                                 │        │
Phase 4 (US2: Results) ◄──────────────────────────────┤        │
    │                                                 │        │
    ├──────────────────────────────────────────┐      │        │
    │                                          │      │        │
    ▼                                          ▼      │        │
Phase 5 (US3: Manage Watchlists)         Phase 6 (US4: Add to Watchlists)
    │                                          │      │        │
    └──────────────────┬───────────────────────┘      │        │
                       │                              │        │
                       ▼                              │        │
              Phase 7 (US5: View Watchlist Athletes)──┘        │
                       │                                       │
                       ▼                                       │
              Phase 8 (US6: Navigation) ◄──────────────────────┘
                       │
                       ▼
              Phase 9 (Polish)
```

### Story Dependencies

| Story                         | Depends On | Can Run In Parallel With     |
| ----------------------------- | ---------- | ---------------------------- |
| US1 (Filter)                  | Phase 2    | -                            |
| US2 (Results)                 | US1        | -                            |
| US3 (Manage Watchlists)       | Phase 2    | US1, US2 (separate concerns) |
| US4 (Add to Watchlists)       | US2, US3   | -                            |
| US5 (View Watchlist Athletes) | US3, US4   | -                            |
| US6 (Navigation)              | Phase 2    | Any (independent)            |

---

## Parallel Execution Opportunities

### Within Phase 2 (Foundational)

- T008 (DiscoveryService) and T009 (WatchlistService) can run in parallel after T007

### Within Phase 3 (US1)

- T012, T013, T014 (UI components) can run in parallel once T011 (API) is done

### Within Phase 4 (US2)

- T017 and T018 can run in parallel

### Within Phase 5 (US3)

- T021 and T022 (API routes) can run after T009 (service) in parallel
- T025, T026, T027 (components) can run in parallel once hooks exist

### Within Phase 6 (US4)

- T030 and T031 (API routes) can run in parallel

### Within Phase 9 (Polish)

- T043, T044, T045 (empty states) can run in parallel
- T046 and T047 can run in parallel

---

## Implementation Strategy

### MVP Scope

**User Stories 1 + 2** (Filter & Results) provide immediate value: users can discover athletes with filters. This can ship independently.

### Incremental Delivery

1. **MVP**: US1 + US2 → Discovery page with filters and results
2. **Phase 2**: US3 + US4 + US5 → Full watchlist functionality
3. **Phase 3**: US6 + Polish → Navigation and final polish

### Risk Mitigation

- Prisma schema changes (T004-T006) must be verified before service work
- Mobile drawer (T010, T013) may require shadcn component installation
- Age calculation (T008) complexity handled by pre-filtering by year range

---

## Summary

| Metric                     | Value                                   |
| -------------------------- | --------------------------------------- |
| **Total Tasks**            | 50                                      |
| **Setup Phase**            | 3 tasks                                 |
| **Foundational Phase**     | 7 tasks                                 |
| **US1 Tasks**              | 6 tasks                                 |
| **US2 Tasks**              | 4 tasks                                 |
| **US3 Tasks**              | 9 tasks                                 |
| **US4 Tasks**              | 6 tasks                                 |
| **US5 Tasks**              | 6 tasks                                 |
| **US6 Tasks**              | 1 task                                  |
| **Polish Tasks**           | 8 tasks                                 |
| **Parallel Opportunities** | 18 tasks marked [P]                     |
| **MVP Scope**              | US1 + US2 (10 tasks after foundational) |
