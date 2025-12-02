# Implementation Plan: Post Creation System

**Branch**: `009-post-creation` | **Date**: November 30, 2025 | **Spec**: specs/009-post-creation/spec.md
**Input**: Feature specification from `/specs/009-post-creation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a post creation system for a Next.js 14+ sports social platform, allowing authenticated users to create posts with text, images, videos, or links. Posts are stored in PostgreSQL and visible to accepted connections and own posts. Features include likes, comments (with replies), shares (link copying), and saves. Media is uploaded to Cloudflare R2. Follow strict TypeScript, Zod validation, shadcn/ui components, and project constitution.

## Technical Context

**Language/Version**: TypeScript 5  
**Primary Dependencies**: Next.js 14+, React 19, Zod 4.1, shadcn/ui, PostgreSQL 8.16, Cloudflare R2  
**Storage**: PostgreSQL  
**Testing**: npm run build (TypeScript compilation), manual testing  
**Target Platform**: Web browsers  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Post creation <30s, feed load <2s for 50 posts, interactions <5s  
**Constraints**: Mobile-first responsive, strict TypeScript, no `any`, DRY, reusable code  
**Scale/Scope**: 1000 concurrent users, 6 new DB tables, 5 API endpoints

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: ✅ PASS - TypeScript strict mode, prefer `type`, avoid `any`, DRY, clean code, consistent naming.
- **TypeScript & Type Safety**: ✅ PASS - Zod for validation, types in `/types`, reusable fields from `common.ts`.
- **Project Structure**: ✅ PASS - App Router, folder organization (`/app`, `/components`, `/types`, `/services`), barrel exports.
- **API & Data Layer**: ✅ PASS - `api-utils` for responses, logic in `/services`, Zod validation, try/catch.
- **Component Development**: ✅ PASS - Server Components default, prop types from `types/components.ts`, shadcn/ui.
- **Styling & Theming**: ✅ PASS - Tailwind, theme variables in `globals.css`, semantic tokens.
- **Validation & Best Practices**: ✅ PASS - Zod validation, naming conventions, remove unused exports.
- **Performance & Optimization**: ✅ PASS - `next/image`, code splitting, `React.memo` if needed.
- **Error Handling**: ✅ PASS - Exception handling everywhere, meaningful errors.
- **Reusability**: ✅ PASS - Reusable code, no duplication, common fields.
- **Dependencies**: ✅ PASS - Minimal, allowed dependencies only.
- **Design / Responsiveness**: ✅ PASS - Mobile-first, colors from `globals.css`, adaptive components.
- **Extensibility / Maintainability**: ✅ PASS - Modular, service → API → component, types first.

## Project Structure

### Documentation (this feature)

```text
specs/009-post-creation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── posts/
│   │   ├── route.ts          # GET /api/posts (feed)
│   │   └── [id]/
│   │       ├── like/
│   │       │   └── route.ts  # POST /api/posts/[id]/like
│   │       ├── comment/
│   │       │   └── route.ts  # POST /api/posts/[id]/comment
│   │       ├── share/
│   │       │   └── route.ts  # POST /api/posts/[id]/share
│   │       └── save/
│   │           └── route.ts  # POST /api/posts/[id]/save
│   └── upload/
│       └── route.ts          # Extended for videos
├── (main)/
│   └── dashboard/
│       └── page.tsx          # Updated with post creation and feed

components/
├── posts/
│   ├── PostCreationForm.tsx  # Form for creating posts
│   ├── PostFeed.tsx          # List of posts
│   ├── PostItem.tsx          # Individual post display
│   ├── PostInteractions.tsx  # Like, comment, share, save buttons
│   └── CommentSection.tsx    # Comments and replies

types/
├── posts.ts                 # Post-related types and schemas
└── common.ts                # Extended with post fields if needed

services/
├── posts.ts                 # PostService class

migrations/
├── 010_add_posts_tables.ts  # DB migration for new tables
```

**Structure Decision**: Follows Next.js App Router with dynamic routes for post interactions. Components organized in `/components/posts/` for reusability. Types centralized in `/types/posts.ts`. Services in `/services/posts.ts` with static methods.

## Complexity Tracking

> No violations - all constitution rules followed.

## Implementation Phases

### Phase 0: Research & Foundation (Prerequisites: Constitution Check PASS)

**Objective**: Resolve any remaining unknowns and establish technical foundation.

**Tasks**:

1. **Research Video Uploads**: Confirm Cloudflare R2 support for MP4/WebM/MOV, presigned URL generation.
2. **Research Feed Query Optimization**: Analyze query for posts from connections + own, with pagination.
3. **Research Comment Threading**: Design nested comment structure with parent_id.
4. **Generate research.md**: Document findings, decisions, alternatives.

**Output**: `research.md` with resolved unknowns.

**Gate**: All unknowns resolved. If not, ERROR and stop.

### Phase 1: Design & Contracts (Prerequisites: Phase 0 complete)

**Objective**: Define data models, API contracts, and quickstart guide.

**Tasks**:

1. **Data Model Design**: Create `data-model.md` with entity relationships, validation rules, state transitions.
2. **API Contracts**: Generate OpenAPI/GraphQL schemas in `/contracts/` for all endpoints.
3. **Quickstart Guide**: Create `quickstart.md` with setup, usage examples, troubleshooting.
4. **Agent Context Update**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot` to update context.

**Output**: `data-model.md`, `/contracts/*`, `quickstart.md`, updated agent context.

**Gate**: Design reviewed, constitution re-check PASS.

### Phase 2: Implementation Planning (Prerequisites: Phase 1 complete)

**Objective**: Detailed implementation steps, file-by-file breakdown.

**Tasks**:

1. **Types First**: Define Zod schemas and types in `types/posts.ts`.
2. **DB Migration**: Create `migrations/010_add_posts_tables.ts` with tables and indexes.
3. **Services**: Implement `PostService` with CRUD and interaction methods.
4. **API Routes**: Create `/api/posts` routes with validation and error handling.
5. **Components**: Build post-related components with shadcn/ui.
6. **Dashboard Integration**: Update dashboard page with post creation and feed.
7. **Testing/Validation**: Build tests, manual testing, performance checks.
8. **Generate tasks.md**: Detailed task list with dependencies and validation.

**Output**: `tasks.md` with step-by-step implementation.

**Gate**: Plan complete, ready for implementation.

## Dependencies

- **External**: Cloudflare R2 account, PostgreSQL database.
- **Internal**: Existing auth (NextAuth.js), connections (ConnectionService), upload API.
- **Order**: Types → DB → Services → API → Components → Integration.

## Risk Assessment

- **High**: Video upload failures - Mitigate with client-side validation and error handling.
- **Medium**: Feed performance with large connections - Mitigate with indexes and pagination.
- **Low**: Comment nesting complexity - Mitigate with recursive queries.

## Success Metrics

- **Technical**: All endpoints return 200, build passes, no TypeScript errors.
- **Functional**: Users can create posts, view feed, interact (like/comment/share/save).
- **Performance**: Meet spec goals (creation <30s, load <2s).
- **Quality**: Mobile responsive, no console errors, follows constitution.
