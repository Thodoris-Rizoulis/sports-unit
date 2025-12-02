# Implementation Plan: Shared Layout with Widgets

**Branch**: `007-shared-layout-widgets` | **Date**: November 30, 2025 | **Spec**: specs/007-shared-layout-widgets/spec.md
**Input**: Feature specification from `/specs/007-shared-layout-widgets/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a shared layout component for dashboard and discovery pages with left and right widget sidebars, starting with a profile widget displaying authenticated user details. Use Next.js App Router route groups for shared layout, shadcn/ui for components, and existing UserService for data fetching.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 14+)  
**Primary Dependencies**: Next.js 14+, React 18+, NextAuth.js, shadcn/ui, Tailwind CSS, Zod  
**Storage**: PostgreSQL (via existing db-connection)  
**Testing**: Manual testing, TypeScript compilation  
**Target Platform**: Web browsers (desktop and mobile)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Layout loads in under 2 seconds  
**Constraints**: Mobile-first responsive, no breaking changes to existing routes  
**Scale/Scope**: 2 pages (dashboard, discovery), 1 widget initially, extensible for more

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: ✅ TypeScript with strict mode enabled, prefer `type` over `interface`, avoid `any` type, follow DRY principle, clean and readable code, consistent naming, no duplicated logic.
- **TypeScript & Type Safety**: ✅ Use Zod for validation, centralize types in `/types`, no types outside `/types`, use reusable fields from `common.ts`.
- **Project Structure**: ✅ Use Next.js App Router, maintain folder organization (`/app`, `/components`, `/types`, `/services`, `/lib`), use barrel exports.
- **API & Data Layer**: ✅ Use `api-utils` for responses, business logic in `/services`, validate inputs with Zod, proper error handling.
- **Component Development**: ✅ Use Server Components by default, proper prop types from `types/components.ts`, use shadcn/ui.
- **Styling & Theming**: ✅ Use Tailwind with theme variables in `globals.css`, semantic color tokens.
- **Validation & Best Practices**: ✅ All inputs validated with Zod, use established naming conventions, remove unused exports.
- **Performance & Optimization**: ✅ Use `next/image`, proper code splitting, `React.memo` when appropriate.
- **Error Handling**: ✅ Implement exception handling everywhere, use try/catch, meaningful user errors.
- **Reusability**: ✅ All code reusable, avoid duplication, use existing common fields.
- **Dependencies**: ✅ Keep minimal; allowed: Tailwind CSS, shadcn, Zod, NextAuth.js, React Hook Form.
- **Design / Responsiveness**: ✅ Mobile-first responsive; colors from `globals.css`; components adapt to all screen sizes.
- **Extensibility / Maintainability**: ✅ Code modular and maintainable; follow service → API → component pattern; update types first.

## Project Structure

### Documentation (this feature)

```text
specs/007-shared-layout-widgets/
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
├── (main)/              # New route group for shared layout
│   ├── layout.tsx       # Shared layout component
│   ├── dashboard/
│   │   └── page.tsx     # Moved from app/dashboard/page.tsx
│   └── discovery/
│       └── page.tsx     # New page
├── api/                 # Existing API routes
├── dashboard/           # Will be removed after move
├── onboarding/
└── profile/

components/
├── widgets/             # New directory
│   └── ProfileWidget.tsx
├── landing/
├── onboarding/
├── profile/
└── ui/                  # shadcn components

types/
├── auth.ts
├── common.ts
├── components.ts
├── profile.ts
└── sports.ts

services/
├── auth.ts
├── profile.ts
└── sports.ts

lib/
├── api-utils.ts
├── constants.ts
└── db-connection.ts
```

**Structure Decision**: Using Next.js App Router with route group `(main)` to share layout between dashboard and discovery pages. ProfileWidget placed in new `/components/widgets/` directory for organization. Existing structure maintained for other components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution principles followed.
