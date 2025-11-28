# Implementation Plan: DB Services Refactor

**Branch**: `005-db-services-refactor` | **Date**: November 26, 2025 | **Spec**: specs/005-db-services-refactor/spec.md
**Input**: Feature specification from `/specs/005-db-services-refactor/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the database layer to use a reusable pool in `lib/db-connection.ts` and introduce service/repository layers in `services/` directory. Services encapsulate DB operations, maintaining existing API functionality with no breaking changes.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

## Technical Context

**Language/Version**: TypeScript with strict mode  
**Primary Dependencies**: pg (PostgreSQL client), Next.js, Zod  
**Storage**: PostgreSQL  
**Testing**: Manual testing via API calls; no automated tests yet  
**Target Platform**: Node.js server (Next.js)  
**Performance Goals**: Maintain existing performance; pool reuse ensures efficiency  
**Constraints**: No breaking changes to API responses; services throw exceptions for error handling  
**Scale/Scope**: Refactor existing codebase; ~10 API routes, 6 services

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: Ensure TypeScript with strict mode enabled, avoid `any` type, use explicit interfaces, clean and readable code, consistent naming, no duplicated logic extracted to `/lib` or `/components`.
- **Testing**: No unit or e2e tests for pre-MVP; testing may be added later.
- **Performance / UX**: Optimize data fetching with server-side in `app/api`, lazy-load components/routes, implement exception handling everywhere, provide meaningful and safe user errors, no caching.
- **Project Structure**: Follow specified folder structure (`/lib`, `/repositories`, `/services`, `/app/api`, `/components`, `/ui`, `/types`, `/styles/global.css`).
- **Reusability**: All utilities, services, components must be reusable; avoid code duplication; reuse shadcn components.
- **Error Handling**: Implement proper exception handling in all functions, services, API endpoints; use try/catch; return structured, meaningful errors.
- **Dependencies**: Keep minimal; prefer native TS/JS; allowed: Tailwind CSS, shadcn, Zod; extra dependencies may be allowed when justified.
- **Design / Responsiveness**: Mobile-first responsive; colors/design tokens from `global.css`; components adapt to all screen sizes.
- **Extensibility / Maintainability**: Constitution extensible; code modular, organized, maintainable; follow repository/service patterns; use Zod for API validation.

## Project Structure

### Documentation (this feature)

```text
specs/005-db-services-refactor/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
lib/
├── db-connection.ts     # NEW: Reusable PostgreSQL pool
├── db.ts                # MODIFIED: Remove pool and helpers
├── auth.ts              # MODIFIED: Use AuthService
└── roles.ts             # MODIFIED: Use RolesService

services/                # NEW: Service/repository layers
├── sports-service.ts
├── positions-service.ts
├── teams-service.ts
├── user-service.ts
├── auth-service.ts
└── roles-service.ts

app/api/                 # MODIFIED: Update imports to use services
├── sports/route.ts
├── positions/route.ts
├── teams/route.ts
├── profile/route.ts
├── auth/register/route.ts
├── onboarding/route.ts
└── profile/check-username/route.ts
```

│ └── api/
└── tests/

frontend/
├── src/
│ ├── components/
│ ├── pages/
│ └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)

api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]

```

**Structure Decision**: Single Next.js project with new services/ directory for repository layers, modified lib/ for connection, and updated app/api/ routes.

## Complexity Tracking

No violations; refactoring aligns with constitution by introducing service/repository patterns.

## Implementation Plan

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**: All clarified in spec; no research needed.
2. **Generate and dispatch research agents**: None required.
3. **Consolidate findings** in `research.md`: Note that all clarifications resolved; no additional research.

**Output**: research.md with confirmation of no research needed.

### Phase 1: Design & Contracts

**Prerequisites:** research.md complete (no research).

1. **Extract entities from feature spec** → `data-model.md`:
   - DB Pool: PostgreSQL connection pool.
   - SportsService: Repository for sports.
   - PositionsService: Repository for positions.
   - TeamsService: Repository for teams.
   - UserService: Repository for users.
   - AuthService: Repository for auth.
   - RolesService: Repository for roles.

2. **Generate API contracts** from functional requirements:
   - Contracts for existing API endpoints, ensuring no changes to request/response formats.
   - Output OpenAPI/GraphQL schema to `/contracts/`.

3. **Agent context update**:
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
   - Add new technology: Service/repository layers, reusable DB pool.

**Output**: data-model.md, /contracts/*, quickstart.md, updated agent context.

### Constitution Check (Post-Design)

_GATE: Re-check after Phase 1 design. ERROR if violations unjustified._

- **Code Quality**: TypeScript strict mode; explicit interfaces; clean code; no duplication.
- **Testing**: No tests added.
- **Performance / UX**: Server-side fetching maintained; exception handling in services.
- **Project Structure**: New services/ directory; lib/ updated; app/api/ thin.
- **Reusability**: Services reusable; no duplication.
- **Error Handling**: Exceptions thrown in services; try/catch in API.
- **Dependencies**: pg already used; no new deps.
- **Design / Responsiveness**: N/A (backend).
- **Extensibility / Maintainability**: Modular services; repository pattern followed.

**Result**: PASSES - Refactoring enforces constitution compliance.
```
