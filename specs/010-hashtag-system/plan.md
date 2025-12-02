# Implementation Plan: Hashtag System

**Branch**: `010-hashtag-system` | **Date**: 2025-12-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-hashtag-system/spec.md`

## Summary

Implement a hashtag system that auto-extracts hashtags from post content, stores them in the database, renders them as clickable links navigating to `/hashtag/[hashtag]`, and displays popular hashtags in a sidebar widget. Uses Prisma for database operations with new `Hashtag` and `PostHashtag` models, extends `TextWithLinks` component for hashtag rendering, and adds new API endpoints for hashtag queries.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16  
**Primary Dependencies**: Prisma ORM, Zod, NextAuth.js, React Query (TanStack Query)  
**Storage**: PostgreSQL via Prisma  
**Testing**: Manual testing (no automated tests pre-MVP)  
**Target Platform**: Web (Next.js App Router)  
**Project Type**: Web application  
**Performance Goals**: < 2 seconds page load for hashtag page  
**Constraints**: Must integrate with existing post creation flow, reuse PostFeed/PostItem components  
**Scale/Scope**: Standard social platform scale, infinite scroll pagination

## Constitution Check

_GATE: ✅ PASSED - All principles satisfied_

- **Code Quality**: ✅ TypeScript strict mode, `type` over `interface`, no `any`, DRY principle followed
- **TypeScript & Type Safety**: ✅ Two-layer system: Zod for input validation, Prisma types for output in `types/prisma.ts`
- **Project Structure**: ✅ Next.js App Router, proper folder organization maintained
- **API & Data Layer**: ✅ Prisma ORM via `lib/prisma.ts`, services in `/services`, `api-utils` for responses
- **Component Development**: ✅ Server Components by default, shadcn/ui, proper prop types
- **Styling & Theming**: ✅ Tailwind CSS with theme variables from `globals.css`
- **Validation & Best Practices**: ✅ Zod validation at API boundaries
- **Performance & Optimization**: ✅ Infinite scroll, proper pagination
- **Error Handling**: ✅ try/catch in services and API routes
- **Reusability**: ✅ Reuses PostFeed, PostItem, extends TextWithLinks
- **Dependencies**: ✅ No new dependencies required
- **Design / Responsiveness**: ✅ Mobile-first responsive design
- **Extensibility / Maintainability**: ✅ Service → API → Component pattern followed

## Project Structure

### Documentation (this feature)

```text
specs/010-hashtag-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   └── hashtag-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── hashtags/
│       └── popular/
│           └── route.ts         # GET /api/hashtags/popular
│   └── posts/
│       └── by-hashtag/
│           └── [hashtag]/
│               └── route.ts     # GET /api/posts/by-hashtag/[hashtag]
├── (main)/
│   └── hashtag/
│       └── [hashtag]/
│           └── page.tsx         # Hashtag page with post feed

components/
├── posts/
│   └── HashtagLink.tsx          # Clickable hashtag component
├── widgets/
│   └── PopularHashtagsWidget.tsx # Sidebar widget

services/
└── hashtags.ts                  # HashtagService class

types/
└── prisma.ts                    # Add Hashtag type and PopularHashtag type

lib/
└── utils.ts                     # Extend parseTextWithLinks for hashtags

prisma/
└── schema.prisma                # Add Hashtag and PostHashtag models

migrations/
└── 015_add_hashtags_table.ts    # Migration script
```

**Structure Decision**: Follows existing Next.js App Router structure. New hashtag route under `(main)` layout for authentication. New widget in `components/widgets/` alongside existing `ProfileWidget` and `NavigationWidget`. Service follows existing pattern in `services/posts.ts`.

## Complexity Tracking

> No constitution violations - no complexity justification needed.
