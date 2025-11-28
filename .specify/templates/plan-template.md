# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

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

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# Option 1: Next.js App Router (DEFAULT for this project)
app/
├── api/                 # API routes
├── dashboard/           # App routes
├── onboarding/
└── profile/

components/
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

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
