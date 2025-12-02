# Implementation Plan: Add a connections feature to the sports social platform

**Branch**: `008-user-connections` | **Date**: November 30, 2025 | **Spec**: specs/008-user-connections/spec.md
**Input**: Feature specification from `/specs/008-user-connections/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a LinkedIn-style connections system allowing users to send, accept, and manage connection requests with real-time updates and mobile-responsive UI, using WebSocket connections with polling fallback, PostgreSQL storage, and following Next.js App Router patterns with TypeScript strict mode and Zod validation.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.0.3  
**Primary Dependencies**: React 19.2.0, Zod 4.1.12, NextAuth.js 4.24.13, shadcn/ui components, React Query 5.90.11  
**Storage**: PostgreSQL  
**Testing**: Jest/Vitest (to be determined)  
**Target Platform**: Web browsers  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: <3 seconds for sending requests, <2 seconds for viewing connections list  
**Constraints**: Mobile-responsive, real-time updates via WebSocket with polling fallback, database transactions for atomic operations  
**Scale/Scope**: No specific data volume limits defined

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: Ensure TypeScript with strict mode enabled, prefer `type` over `interface`, avoid `any` type, follow DRY principle, clean and readable code, consistent naming, no duplicated logic.
- **TypeScript & Type Safety**: Use Zod for validation, centralize types in `/types`, no types outside `/types`, use reusable fields from `common.ts`.
- **Project Structure**: Use Next.js App Router, maintain folder organization (`/app`, `/components`, `/types`, `/services`, `/lib`), use barrel exports.
- **API & Data Layer**: Use `api-utils` for responses, business logic in `/services`, validate inputs with Zod, proper error handling.
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
app/
├── api/
│   ├── connections/          # NEW: Connection API routes
│   │   ├── request/
│   │   ├── [id]/
│   │   │   └── respond/
│   │   ├── requests/
│   │   ├── status/
│   │   │   └── [userId]/
│   │   └── route.ts
│   └── search/               # UPDATED: Add connection status to search results
├── dashboard/                # UPDATED: Add connections management UI
└── profile/                  # UPDATED: Add connection button to profiles

components/
├── connections/              # NEW: Connection-specific components
│   ├── ConnectionButton.tsx
│   ├── ConnectionRequestsModal.tsx
│   ├── ConnectionsList.tsx
│   └── ConnectionStatusBadge.tsx
└── ui/                       # EXISTING: shadcn components

types/
├── connections.ts            # NEW: Connection types and schemas
├── auth.ts                   # EXISTING
├── common.ts                 # EXISTING
├── components.ts             # EXISTING
├── profile.ts                # EXISTING
└── sports.ts                 # EXISTING

services/
├── connections.ts            # NEW: Connection business logic
├── auth.ts                   # EXISTING
├── profile.ts                # EXISTING
└── sports.ts                 # EXISTING

lib/
├── api-utils.ts              # EXISTING
├── constants.ts              # EXISTING
└── db-connection.ts          # EXISTING

hooks/
├── useConnections.ts         # NEW: Connection state management
├── useConnectionStatus.ts    # NEW: Status checking
└── [existing hooks]          # EXISTING

migrations/
├── [new migration].ts        # NEW: Database schema for connections
└── [existing migrations]     # EXISTING
```

**Structure Decision**: Following Next.js App Router patterns with centralized types in `/types`, services in `/services`, and components organized by feature. New connection-related files added while maintaining existing structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
