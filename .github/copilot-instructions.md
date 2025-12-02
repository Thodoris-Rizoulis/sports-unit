# Copilot Instructions for Sports Unit Project

## Project Overview

This is a Next.js 14+ application for a sports social platform using the App Router. It features user authentication, onboarding, profiles, teams, sports management, and search functionality.

## Core Principles (from Constitution v2.1.0)

- Use TypeScript with strict mode enabled.
- Prefer `type` over `interface`.
- Avoid `any`; use unions or generics.
- Code must be clean, readable, and consistent with naming conventions.
- Follow DRY principle: check for existing utilities/types before creating new ones.
- No duplicated logic; all reusable code must be extracted into `/lib` or `/components`.
- Keep schemas and types minimal - remove unused exports.

### TypeScript & Type Safety

- Enable strict TypeScript mode in `tsconfig.json`.
- Use a two-layer type system:
  - **Input validation**: Zod schemas for forms and API request validation. Infer types with `z.infer<typeof schema>`.
  - **Output types**: Prisma-generated types and mapped UI types defined in `types/prisma.ts`.
- Create reusable Zod field schemas in `types/common.ts` (emailField, passwordField, idField, etc.).
- Do not create duplicate schemas; reuse base fields (e.g., `usernameBase`, `idField`) across all schemas.
- When using `.partial()` on a schema, do not add `.optional()` to individual fields (redundant).
- Centralize ALL types in `/types` folder by domain (auth, profile, sports, etc.).
- Output types (Post, UserProfile, etc.) MUST be defined in `types/prisma.ts` as the single source of truth.
- No types or interfaces outside `/types` directory.

### Project Structure

- Use Next.js 14+ App Router exclusively (no Pages Router).
- Maintain strict folder organization: `/app` for routes, `/components` for UI, `/types` for TypeScript definitions, `/services` for business logic, `/lib` for utilities.
- Keep API routes in `/app/api` with proper HTTP method handlers.
- Use repository pattern in `/services` with static class methods.
- Import components from organized subfolders (e.g., `/components/landing`, `/components/profile`).
- Use barrel exports (index.ts) for clean imports.

### API & Data Layer

- All API routes must use `api-utils` for responses: `createSuccessResponse()`, `createErrorResponse()`.
- Use Prisma ORM for all database operations. The Prisma client is configured in `lib/prisma.ts`.
- Business logic and database queries belong in `/services`, never in `/app/api`.
- Services MUST use Prisma client and return properly typed data using types from `types/prisma.ts`.
- Use Prisma's include patterns (defined in `types/prisma.ts`) for consistent query shapes.
- Use mapper functions (`toUserProfile`, `toUserSummary`, `toPost`, etc.) to transform Prisma results to UI types.
- Validate all inputs with Zod schemas at API boundaries.
- Use proper error handling with try/catch blocks.
- Implement consistent authentication with NextAuth.js.

### Component Development

- Use Server Components by default, Client Components only with `'use client'` when needed.
- Use proper TypeScript prop interfaces from `types/components.ts`.
- Implement proper loading states and error boundaries.
- Use shadcn/ui components for consistency.
- Use `React Hook Form` with Zod resolver for forms.

### Styling & Theming

- Use Tailwind CSS with custom theme variables defined in `globals.css`.
- Utilize semantic color tokens: `text-foreground`, `bg-background`, `border-border`.
- Maintain consistent spacing and typography using theme values.
- Use `next/image` for optimized images.

### Validation & Best Practices

- All user inputs must be validated with Zod schemas.
- Use `registerSchema` for registration (unified for form and API).
- Follow established naming conventions: `SchemaNameInput` for form types.
- Add JSDoc comments for complex functions.
- Use meaningful commit messages and conventional commits.

### Performance & Optimization

- Use `next/image` with proper sizing and `fill` for responsive images.
- Implement proper code splitting and lazy loading.
- Use `React.memo` for expensive components when appropriate.
- Optimize bundle size by avoiding unnecessary dependencies.

### Error Handling

- All functions, services, and API endpoints must implement proper exception handling.
- Use try/catch in services and API endpoints.
- Return structured, meaningful errors to users.
- Exception handling must be implemented everywhere to prevent crashes.
- User-facing errors must be meaningful and safe.

### Reusability

- All utilities, services, and components must be reusable.
- Avoid duplicating code across endpoints or components.
- Reuse shadcn components whenever possible.
- Use existing common fields from `types/common.ts` instead of duplicating.

### Dependencies

- Keep dependencies minimal; prefer native TypeScript/JavaScript features.
- Allowed dependencies: Tailwind CSS, shadcn components, Zod, NextAuth.js, React Hook Form, Prisma ORM.
- Extra dependencies may be allowed when justified.

### Design / Responsiveness

- Mobile-first responsive design is required.
- All colors and design tokens must come from `globals.css`.
- Components must adapt to all screen sizes.

### Extensibility / Maintainability

- Constitution may be extended in future iterations.
- Code must remain modular, organized, and maintainable.
- Follow the service → API → component pattern.
- Validate data at service boundaries with Zod.
- Use Server Components unless client-side interactivity is required.
- Update types first when adding new functionality.

## Additional Constraints

## Development Workflow

- Run `npm run build` after any type/schema changes to validate.
- Use ESLint with Next.js and TypeScript rules.
- Follow the established patterns for new features.
- Test API routes and components after implementation.
- All code must pass TypeScript compilation.

## Governance

Constitution supersedes all other practices; Amendments require documentation, approval, migration plan.

All PRs/reviews must verify compliance; Complexity must be justified.

**Version**: 2.1.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-12-02

## Current Status

- Header component implemented with navigation, search.
- API routes for auth, profile, search, etc.
- Onboarding, dashboard, profile pages.
- Next features: Discovery page, Inbox, Notifications, Teams management.

## Instructions for Copilot Agent

When working on this project:

1. Always follow the constitution principles.
2. Use tools to verify existing code before creating new.
3. Implement features incrementally, validating with build/tests.
4. Update types first for new functionality.
5. Ensure reusability and no duplication.
6. Use Zod for validation, shadcn for UI.
7. Handle errors properly.
8. Mobile-responsive design.
9. Commit with conventional messages.
