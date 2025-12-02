# Implementation Plan: Profile Analytics Widget

**Branch**: `011-profile-analytics` | **Date**: 2024-12-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-profile-analytics/spec.md`

## Summary

Implement a Profile Analytics Widget that displays profile views (unique visitors) and post impressions (likes received) for the last 7 days. This requires:

1. New `ProfileVisit` database table to track profile page visits
2. Service layer for recording visits and calculating analytics
3. API endpoints for visit recording and analytics retrieval
4. Widget component in the left sidebar

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode  
**Primary Dependencies**: Next.js 14+ (App Router), React 18, Prisma ORM, NextAuth.js, Zod, shadcn/ui, Tailwind CSS  
**Storage**: PostgreSQL (existing database)  
**Testing**: Manual testing + TypeScript build validation  
**Target Platform**: Web (responsive, mobile-hidden sidebar)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Analytics load <2s, visit recording <1s (per SC-001, SC-002)  
**Constraints**: Follow existing widget patterns, no new dependencies  
**Scale/Scope**: Single feature, ~8 files to create/modify

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: Ensure TypeScript with strict mode enabled, prefer `type` over `interface`, avoid `any` type, follow DRY principle, clean and readable code, consistent naming, no duplicated logic.
- **TypeScript & Type Safety**: Use two-layer type system: Zod for input validation, Prisma types for output. Centralize types in `/types`. Output types in `types/prisma.ts`. Use reusable fields from `common.ts`. Avoid redundant `.optional()` with `.partial()`.
- **Project Structure**: Use Next.js App Router, maintain folder organization (`/app`, `/components`, `/types`, `/services`, `/lib`, `/prisma`), use barrel exports.
- **API & Data Layer**: Use `api-utils` for responses, Prisma ORM for database operations via `lib/prisma.ts`, business logic in `/services`, validate inputs with Zod, use mapper functions for Prisma→UI type conversion.
- **Component Development**: Use Server Components by default, proper prop types from `types/components.ts`, use shadcn/ui.
- **Styling & Theming**: Use Tailwind with theme variables in `globals.css`, semantic color tokens.
- **Validation & Best Practices**: All inputs validated with Zod, use established naming conventions, remove unused exports.
- **Performance & Optimization**: Use `next/image`, proper code splitting, `React.memo` when appropriate.
- **Error Handling**: Implement exception handling everywhere, use try/catch, meaningful user errors.
- **Reusability**: All code reusable, avoid duplication, use existing common fields.
- **Dependencies**: Keep minimal; allowed: Tailwind CSS, shadcn, Zod, NextAuth.js, React Hook Form.
- **Design / Responsiveness**: Mobile-first responsive; colors from `globals.css`; components adapt to all screen sizes.
- **Extensibility / Maintainability**: Code modular and maintainable; follow service → API → component pattern; update types first.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Files to CREATE
migrations/
└── 016_add_profile_visits_table.ts    # Database migration

types/
└── analytics.ts                        # ProfileAnalyticsData type + Zod schemas

services/
└── analytics.ts                        # AnalyticsService class

app/api/profile/
├── analytics/
│   └── route.ts                        # GET /api/profile/analytics
└── [uuid]/
    └── visit/
        └── route.ts                    # POST /api/profile/[uuid]/visit

components/widgets/
└── ProfileAnalyticsWidget.tsx          # New widget component

# Files to MODIFY
prisma/
└── schema.prisma                       # Add ProfileVisit model + User relations

types/
└── prisma.ts                           # Export ProfileAnalyticsData

components/profile/
└── ProfilePageWrapper.tsx              # Add visit recording on mount

app/(main)/
└── layout.tsx                          # Add ProfileAnalyticsWidget to sidebar
```

**Structure Decision**: Following existing Next.js App Router patterns with service layer. New analytics domain gets dedicated type file and service. Widget follows existing sidebar widget conventions.

## Complexity Tracking

> No constitution violations. All patterns follow existing codebase conventions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |

## Constitution Check - Post Design

✅ **Code Quality**: TypeScript strict mode, `type` keyword, no `any`, DRY patterns followed  
✅ **TypeScript & Type Safety**: Zod for API validation, Prisma types for DB, types in `/types`  
✅ **Project Structure**: Next.js App Router, proper folder organization  
✅ **API & Data Layer**: Using api-utils, Prisma ORM, services pattern, Zod validation  
✅ **Component Development**: Client component (widget needs useEffect), shadcn/ui Card  
✅ **Styling & Theming**: Tailwind CSS, semantic color tokens, matches existing widgets  
✅ **Error Handling**: try/catch in services and APIs, user-friendly error display  
✅ **Reusability**: Service methods reusable, widget self-contained  
✅ **Dependencies**: No new dependencies required  
✅ **Design / Responsiveness**: Widget hidden on mobile (existing sidebar behavior)  
✅ **Extensibility**: Modular service → API → component pattern

## Phase 2 Output

See the following generated artifacts:

- [research.md](./research.md) - Technical decisions and alternatives
- [data-model.md](./data-model.md) - Entity definitions and query patterns
- [contracts/api.md](./contracts/api.md) - API endpoint specifications
- [quickstart.md](./quickstart.md) - Implementation order and checklist

**Next Step**: Run `/speckit.tasks` to generate implementation tasks.
