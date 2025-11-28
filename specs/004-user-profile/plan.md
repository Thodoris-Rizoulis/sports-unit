# Implementation Plan: User Profile

**Branch**: `004-user-profile` | **Date**: November 26, 2025 | **Spec**: specs/004-user-profile/spec.md
**Input**: Feature specification from `/specs/004-user-profile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement user profile pages with hero and about sections, supporting view and edit modes, image uploads (cover and profile pictures) to Cloudflare R2, and responsive design using Next.js, shadcn/ui, and server-side data fetching.

## Technical Context

**Language/Version**: TypeScript (Next.js 14)  
**Primary Dependencies**: Next.js, TypeScript, shadcn/ui, Tailwind CSS, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner  
**Storage**: PostgreSQL (existing users, user_attributes tables)  
**Testing**: Manual testing (no unit/e2e for pre-MVP)  
**Target Platform**: Web browsers (desktop, tablet, mobile)
**Project Type**: Web application  
**Performance Goals**: Page load under 3 seconds, update in under 2 minutes  
**Constraints**: Mobile-first responsive, authentication required, Cloudflare R2 for images  
**Scale/Scope**: Single page per user, support 10k concurrent users

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
specs/004-user-profile/
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
├── profile/
│   └── [userId]/
│       └── page.tsx          # Profile page component
├── api/
│   ├── profile/
│   │   └── [userId]/
│   │       └── route.ts      # API for fetch/update profile
│   └── upload/
│       └── route.ts          # API for presigned URLs
components/
├── ProfileHero.tsx           # Hero section with profile picture and cover
├── ProfileAbout.tsx          # About section component
└── ProfileImageUpload.tsx    # Image upload component
lib/
├── repositories/
│   └── profile.ts            # DB queries for profiles
└── services/
    └── profile.ts            # Business logic for profiles
types/
└── profile.ts                # TypeScript interfaces
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
