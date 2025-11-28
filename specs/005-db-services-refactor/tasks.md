# Tasks: DB Services Refactor

**Input**: Design documents from `/specs/005-db-services-refactor/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks included as not requested in specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js project: `lib/`, `services/`, `app/api/` at repository root

## Phase 1: Setup (P1 Stories)

**Purpose**: Establish reusable DB connection and core user service

- [x] T001 Create reusable PostgreSQL pool in lib/db-connection.ts
- [x] T002 [US5] Create UserService class in services/user-service.ts with getUserAttributes, updateUserProfile, getUserProfile, getUserIdByUsername methods
- [x] T003 [US8] Update profile API routes to use UserService in app/api/profile/route.ts and app/api/profile/[username]/route.ts

## Phase 2: Services (P2 Stories)

**Purpose**: Implement remaining service layers

- [x] T004 [P] [US2] Create SportsService class in services/sports-service.ts with getSports method
- [x] T005 [P] [US3] Create PositionsService class in services/positions-service.ts with getPositionsBySport method
- [x] T006 [P] [US4] Create TeamsService class in services/teams-service.ts with getTeamsBySport method
- [x] T007 [P] [US6] Create AuthService class in services/auth-service.ts with getUserByEmail method
- [x] T008 [P] [US7] Create RolesService class in services/roles-service.ts with getRoles method

## Phase 3: Integration (P1 Stories Continuation)

**Purpose**: Update remaining API routes and clean up

- [ ] T009 [US8] Update sports API route to use SportsService in app/api/sports/route.ts
- [ ] T010 [US8] Update positions API route to use PositionsService in app/api/positions/route.ts
- [ ] T011 [US8] Update teams API route to use TeamsService in app/api/teams/route.ts
- [ ] T012 [US8] Update auth register route to use AuthService in app/api/auth/register/route.ts
- [x] T013 [US8] Update auth complete-onboarding route to use AuthService in app/api/auth/complete-onboarding/route.ts
- [ ] T014 [US8] Update onboarding route to use UserService in app/api/onboarding/route.ts
- [ ] T015 [US8] Update profile check-username route to use UserService in app/api/profile/check-username/route.ts
- [ ] T016 [US8] Update roles in lib/roles.ts to use RolesService
- [ ] T017 [US8] Update auth in lib/auth.ts to use AuthService
- [ ] T018 Remove helper functions from lib/db.ts and keep only query if needed
- [ ] T019 Test all API endpoints to ensure no breaking changes

## Dependencies

- Phase 1 must complete before Phase 2
- Phase 2 can run in parallel for services
- Phase 3 depends on Phase 1 and 2

## MVP Scope

- Minimum: Phase 1 (DB pool and user service with profile APIs)
- Full: All phases

## Implementation Strategy

- Start with Phase 1 for core functionality
- Implement services in Phase 2 in parallel
- Integrate in Phase 3, testing each endpoint
