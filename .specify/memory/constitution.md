<!--
Sync Impact Report
Version change: 1.2.0 → 2.0.0
List of modified principles: All principles updated to reflect current Next.js TypeScript best practices
Added sections: TypeScript & Type Safety, API & Data Layer, Component Development, Styling & Theming, Validation & Best Practices, Performance & Optimization, Migration & Updates, Quality Assurance
Removed sections: Old outdated principles (repositories, testing pre-MVP)
Templates requiring updates: .specify/templates/plan-template.md (✅ updated) / .specify/templates/spec-template.md (not required) / .specify/templates/tasks-template.md (✅ updated) / README.md (not required)
Follow-up TODOs: None - templates aligned with new constitution
-->

# Sports Unit Constitution

## Core Principles

### Code Quality

- Project must use TypeScript with `strict` mode enabled.
- Prefer `type` over `interface` for all type definitions.
- Avoid `any` type; use proper unions or generics.
- Code must be clean, readable, and consistent with naming conventions.
- Follow DRY principle: check for existing utilities/types before creating new ones.
- No duplicated logic; all reusable code must be extracted into `/lib` or `/components`.
- Keep schemas and types minimal - remove unused exports.

### TypeScript & Type Safety

- Enable strict TypeScript mode in `tsconfig.json`.
- Use Zod for runtime validation and type inference: `export type MyType = z.infer<typeof mySchema>`.
- Create reusable Zod field schemas in `types/common.ts` (emailField, passwordField, etc.).
- Do not create duplicate schemas; use `usernameBase` for all username validations.
- Export inferred types from Zod schemas consistently.
- Centralize ALL types in `/types` folder by domain (auth, profile, sports, etc.).
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
- Business logic and database queries belong in `/services`, never in `/app/api`.
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
- Allowed dependencies: Tailwind CSS, shadcn components, Zod, NextAuth.js, React Hook Form.
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

**Version**: 2.0.0 | **Ratified**: TODO(RATIFICATION_DATE): Original adoption date unknown | **Last Amended**: 2025-11-28
