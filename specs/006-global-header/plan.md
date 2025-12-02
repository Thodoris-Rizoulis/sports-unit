# Implementation Plan: Global Header

**Branch**: `006-global-header` | **Date**: November 29, 2025 | **Spec**: [link](../spec.md)
**Input**: Feature specification from `/specs/006-global-header/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a global header component for the Next.js app that appears on all pages except the homepage, featuring logo, navigation links with icons, and a search bar for finding users by name or username. Use client-side rendering with conditional display based on pathname, integrate with NextAuth for user data, and create a new API endpoint for search functionality.

## Technical Context

**Language/Version**: TypeScript with Next.js 14+ App Router  
**Primary Dependencies**: Next.js, React, Tailwind CSS, shadcn/ui, Zod, NextAuth.js, Heroicons  
**Storage**: PostgreSQL  
**Testing**: Jest or similar (NEEDS CLARIFICATION: current testing setup)  
**Target Platform**: Web browsers  
**Project Type**: Web application  
**Performance Goals**: Header loads in under 1 second, search returns results in under 500ms  
**Constraints**: Mobile-first responsive design, WCAG accessibility compliance, fixed positioning  
**Scale/Scope**: Global component affecting all authenticated pages

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: ✅ TypeScript strict mode, prefer type over interface, avoid any, DRY, clean code, consistent naming, no duplication.
- **TypeScript & Type Safety**: ✅ Use Zod for validation, centralize types in /types, reusable fields from common.ts.
- **Project Structure**: ✅ Next.js App Router, organized folders (/app, /components, /types, /services, /lib), barrel exports.
- **API & Data Layer**: ✅ Use api-utils for responses, business logic in /services, Zod validation, error handling.
- **Component Development**: ✅ Server Components default, Client Component for interactivity, prop types from types/components.ts, shadcn/ui.
- **Styling & Theming**: ✅ Tailwind with theme variables in globals.css, semantic tokens.
- **Validation & Best Practices**: ✅ Zod validation, naming conventions, remove unused exports.
- **Performance & Optimization**: ✅ next/image, code splitting, React.memo if needed.
- **Error Handling**: ✅ Exception handling in services and API, meaningful errors.
- **Reusability**: ✅ Reusable components, avoid duplication, use common fields.
- **Dependencies**: ✅ Minimal; uses allowed dependencies.
- **Design / Responsiveness**: ✅ Mobile-first, colors from globals.css, adaptive components.
- **Extensibility / Maintainability**: ✅ Modular code, service → API → component pattern, update types first.

## Project Structure

### Documentation (this feature)

```text
specs/006-global-header/
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
│   └── search/
│       └── people/
│           └── route.ts    # NEW: Search API endpoint
├── layout.tsx             # UPDATED: Import Header component conditionally
└── ...

components/
├── Header.tsx             # NEW: Global header component
└── ui/                    # Existing shadcn components

types/
├── common.ts              # Existing
├── components.ts          # UPDATED: Add Header props types
└── ...

services/
├── profile.ts             # UPDATED: Add search method
└── ...

lib/
├── api-utils.ts           # Existing
└── ...
```

**Structure Decision**: Follows existing Next.js App Router structure with new API route for search, new Header component in /components, and updates to existing files for integration.

**Structure Decision**: Follows existing Next.js App Router structure with new API route for search, new Header component in /components, and updates to existing files for integration.

## Phase 0: Outline & Research

### Research Tasks

1. **Research best practices for implementing user search API in Next.js with PostgreSQL** - For efficient querying of users by name or username.
2. **Research best practices for global navigation headers in React/Next.js apps** - For conditional rendering, performance, and accessibility.
3. **Research accessibility best practices for search components** - For ARIA labels, keyboard navigation, and screen reader support.
4. **Research autocomplete patterns using cmdk in React** - For implementing the search bar with Command component.

### Research Findings

- **Decision**: Use PostgreSQL full-text search with GIN indexes for user search by name and username.

  - **Rationale**: Provides efficient, scalable search with relevance ranking, better than simple LIKE queries for performance.
  - **Alternatives considered**: Simple ILIKE queries (rejected for scalability), Elasticsearch (overkill for this scope).

- **Decision**: Implement header as client component with usePathname for conditional rendering.

  - **Rationale**: Allows dynamic pathname checking without server-side rendering issues, follows Next.js best practices.
  - **Alternatives considered**: Server component with search params (not suitable for pathname-based logic).

- **Decision**: Use cmdk Command component for search autocomplete with proper ARIA attributes.

  - **Rationale**: Built-in accessibility, keyboard navigation, and integrates well with shadcn/ui.
  - **Alternatives considered**: Custom autocomplete (more maintenance), react-select (additional dependency).

- **Decision**: Cache search results client-side for 5 minutes to improve performance.
  - **Rationale**: Reduces API calls for repeated searches while keeping data fresh.
  - **Alternatives considered**: No caching (higher load), server-side caching (more complex).

## Phase 1: Design & Contracts

### Data Model

**User Entity**

- **Fields**:
  - id: number (primary key)
  - publicUuid: string (unique identifier for URLs)
  - firstName: string
  - lastName: string
  - username: string (unique)
  - profileImageUrl: string (optional)
- **Relationships**: None additional for this feature
- **Validation Rules**:
  - firstName/lastName: required, 2-50 chars
  - username: required, unique, 3-30 chars, alphanumeric + underscore
  - publicUuid: required, UUID format
- **State Transitions**: N/A (static entity for search)

### API Contracts

**Endpoint**: GET /api/search/people

- **Purpose**: Search users by name or username
- **Request**:
  - Query parameter: q (string, required) - search term
  - Optional: limit (number, default 10, max 50)
- **Response**:
  - Success: { users: [{ id, publicUuid, firstName, lastName, username, profileImageUrl }] }
  - Error: { error: string }
- **Authentication**: Required (user must be logged in)
- **Rate Limiting**: 10 requests per minute per user

### Quickstart

1. The header automatically appears on all pages except '/'.
2. Click navigation links to navigate to respective pages.
3. Type in the search bar to find users; select a result to visit their profile.
4. On mobile, the header stacks vertically for better usability.

### Agent Context Update

Updated Copilot context with new technologies: cmdk for autocomplete, PostgreSQL full-text search patterns.
