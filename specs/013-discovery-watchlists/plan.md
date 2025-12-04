# Implementation Plan: Discovery Page & Watchlists

**Branch**: `013-discovery-watchlists` | **Date**: 2025-12-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-discovery-watchlists/spec.md`

## Summary

Implement a Discovery page with advanced athlete filtering (AND logic across profile attributes and metrics) with URL-persisted state, combined with a private Watchlist system for organizing discovered athletes. Includes navigation update, CRUD for watchlists, and paginated athlete views with sorting options.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)  
**Primary Dependencies**: Next.js 14+ App Router, Prisma ORM, Zod, shadcn/ui, React Hook Form, NextAuth.js  
**Storage**: PostgreSQL via Prisma ORM  
**Testing**: Manual testing via npm run build and browser verification  
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Next.js App Router web application  
**Performance Goals**: Filter results within 3 seconds (SC-001), add to watchlist under 30 seconds (SC-004)  
**Constraints**: Mobile-first responsive, URL shareability for filters  
**Scale/Scope**: Single-user private watchlists, paginated discovery results (10-20 per page)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: ✅ TypeScript strict mode, prefer `type`, avoid `any`, DRY, clean/readable
- **TypeScript & Type Safety**: ✅ Two-layer: Zod for input (discovery filters, watchlist create/update), Prisma types for output. Types in `/types/discovery.ts` and `/types/watchlists.ts`. Output mappers defined.
- **Project Structure**: ✅ Next.js App Router, folders: `/app/api/discovery`, `/app/api/watchlists`, `/components/discovery`, `/components/watchlists`, `/services/discovery.ts`, `/services/watchlists.ts`
- **API & Data Layer**: ✅ Use `api-utils` for responses, Prisma for queries, services for business logic, Zod validation at API boundaries
- **Component Development**: ✅ Server Components for pages, Client Components for filters/modals with `'use client'`, shadcn/ui
- **Styling & Theming**: ✅ Tailwind with theme variables, semantic tokens, mobile-first
- **Validation & Best Practices**: ✅ Zod schemas for all inputs, established naming conventions
- **Performance & Optimization**: ✅ Pagination for large result sets, debounced filter updates
- **Error Handling**: ✅ try/catch in services and API routes, meaningful user errors
- **Reusability**: ✅ Shared AthleteCard component, reusable Pagination component, existing common fields
- **Dependencies**: ✅ No new dependencies needed beyond allowed list (shadcn Slider may need installation)
- **Design / Responsiveness**: ✅ Mobile drawer for filters, responsive cards
- **Extensibility / Maintainability**: ✅ Service pattern, types first, modular components

## Project Structure

### Documentation (this feature)

```text
specs/013-discovery-watchlists/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# New/Modified files for this feature

app/
├── api/
│   ├── discovery/
│   │   └── route.ts                    # GET: Search athletes with filters
│   └── watchlists/
│       ├── route.ts                    # GET: List, POST: Create
│       ├── [id]/
│       │   ├── route.ts                # GET: Single, PATCH: Update, DELETE: Delete
│       │   └── athletes/
│       │       ├── route.ts            # POST: Add athlete
│       │       └── [athleteId]/
│       │           └── route.ts        # DELETE: Remove athlete
│       └── containing/
│           └── [athleteId]/
│               └── route.ts            # GET: Which watchlists contain athlete
├── (main)/
│   ├── discovery/
│   │   └── page.tsx                    # Discovery page
│   └── watchlists/
│       ├── page.tsx                    # All watchlists
│       └── [id]/
│           └── page.tsx                # Single watchlist detail

components/
├── discovery/
│   ├── DiscoveryFilters.tsx            # Filter controls (client)
│   ├── DiscoveryResults.tsx            # Results grid (server/client hybrid)
│   ├── AthleteCard.tsx                 # Athlete result card
│   ├── AddToWatchlistModal.tsx         # Modal for watchlist selection
│   ├── FilterDrawer.tsx                # Mobile filter drawer
│   └── SortDropdown.tsx                # Sort order selector
├── watchlists/
│   ├── WatchlistList.tsx               # All watchlists display
│   ├── WatchlistCard.tsx               # Single watchlist preview
│   ├── WatchlistDetail.tsx             # Watchlist with athletes
│   ├── WatchlistForm.tsx               # Create/edit form
│   ├── WatchlistAthleteCard.tsx        # Athlete in watchlist
│   └── DeleteWatchlistDialog.tsx       # Delete confirmation
├── ui/
│   └── pagination.tsx                  # Reusable pagination (if not exists)
└── widgets/
    └── NavigationWidget.tsx            # Modified: Add Watchlists link

types/
├── discovery.ts                        # Discovery filter schemas & types
├── watchlists.ts                       # Watchlist schemas & types
├── prisma.ts                           # Add Watchlist include patterns & mappers
└── index.ts                            # Export new types

services/
├── discovery.ts                        # DiscoveryService class
└── watchlists.ts                       # WatchlistService class

hooks/
├── useDiscovery.ts                     # Discovery state & API
├── useWatchlists.ts                    # List watchlists
├── useWatchlist.ts                     # Single watchlist
└── useWatchlistMutations.ts            # Add/remove athletes

migrations/
└── 018_add_watchlists_tables.ts        # Create watchlist tables

prisma/
└── schema.prisma                       # Add Watchlist & WatchlistAthlete models
```

**Structure Decision**: Follow existing Next.js App Router structure with feature-based component folders. Services use static class pattern consistent with `ConnectionService`. Types split by domain (discovery, watchlists) with output types and mappers in `types/prisma.ts`.

## Complexity Tracking

> No constitution violations - all requirements align with existing patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |
