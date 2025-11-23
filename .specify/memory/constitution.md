<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0
List of modified principles: Dependencies (expanded to allow extra dependencies when justified)
Added sections: None
Removed sections: None
Templates requiring updates: .specify/templates/plan-template.md (✅ updated) / README.md (✅ updated)
Follow-up TODOs: None
-->

# Sports Unit Constitution

## Core Principles

### Code Quality

- Project must use TypeScript with `strict` mode enabled.
- Avoid `any` type; always use explicit interfaces.
- Code must be clean, readable, and consistent with naming conventions.
- No duplicated logic; all reusable code must be extracted into `/lib` or `/components`.

### Testing

- No unit tests or e2e tests for pre-MVP.
- Testing may be added in future iterations.

### Performance / UX

- Optimize data fetching; use server-side fetching in `app/api` endpoints.
- Lazy-load components and routes where applicable.
- Exception handling must be implemented everywhere to prevent crashes.
- User-facing errors must be meaningful and safe.
- Do not implement caching for pre-MVP.

### Project Structure

- `/lib` → Shared utilities, database connections (e.g., `/lib/db.ts`), and helper functions.
- `/repositories` → All database queries organized by domain; no queries in API routes.
- `/services` → Business logic layer that calls repositories; API routes in `/app/api` call services, not repositories directly.
- `/app/api` → API endpoints; each endpoint is thin, calls services, and handles request/response validation.
- `/components` → Reusable UI components, using installed shadcn components and Tailwind for styling.
- `/ui` → Optional subfolder for shared design primitives.
- `/types` → Global TypeScript interfaces and types.
- `/styles/global.css` → All color definitions and shared Tailwind utilities.

### Reusability

- All utilities, services, and components must be reusable.
- Avoid duplicating code across endpoints or components.
- Reuse shadcn components whenever possible.

### Error Handling

- All functions, services, and API endpoints must implement proper exception handling.
- Use try/catch in services and API endpoints.
- Return structured, meaningful errors to users.

### Dependencies

- Keep dependencies minimal; prefer native TypeScript/JavaScript features.
- Allowed dependencies: Tailwind CSS, shadcn components, Zod (for schema validation and request validation).
- Extra dependencies may be allowed when justified.

### Design / Responsiveness

- Mobile-first responsive design is required.
- All colors and design tokens must come from `global.css`.
- Components must adapt to all screen sizes.

### Extensibility / Maintainability

- Constitution may be extended in future iterations.
- Code must remain modular, organized, and maintainable.
- Repository and service patterns must be followed for scalability.
- Zod must be used for request validation in `/app/api` endpoints.

## Additional Constraints

## Development Workflow

## Governance

Constitution supersedes all other practices; Amendments require documentation, approval, migration plan

All PRs/reviews must verify compliance; Complexity must be justified;

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-11-23
