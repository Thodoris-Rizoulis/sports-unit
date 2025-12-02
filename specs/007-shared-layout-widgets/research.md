# Research & Technical Decisions

**Feature**: Shared Layout with Widgets  
**Date**: November 30, 2025  
**Phase**: 0 (Research)

## Overview

No explicit NEEDS CLARIFICATION in specification, but researched best practices for Next.js shared layouts, profile widgets, and responsive design patterns.

## Decisions

### Decision: Route Group Naming

**What**: Use `(main)` as the route group name for shared layout.  
**Rationale**: Clear, concise, and follows Next.js conventions. Alternative `(authenticated-pages)` was considered but rejected as too verbose.  
**Alternatives Considered**: `(shared)`, `(app)`, `(dashboard-group)` - `(main)` is most semantic.

### Decision: Layout Responsiveness

**What**: Hide sidebars completely on screens < md (768px) using Tailwind's `hidden md:block`.  
**Rationale**: Mobile-first approach prioritizes content. Collapsible option considered but adds complexity without clear benefit.  
**Alternatives Considered**: Collapsible sidebars, stacking sidebars - hidden is simpler and follows mobile-first principle.

### Decision: Profile Widget Data Fetching

**What**: Use existing `UserService.getUserProfile()` with `session.user.username`.  
**Rationale**: Leverages existing service layer, maintains consistency with project patterns.  
**Alternatives Considered**: Direct API call, custom hook - service layer is preferred per constitution.

### Decision: Profile Widget Styling

**What**: Use shadcn/ui Card with minimal custom styling.  
**Rationale**: Consistent with project UI library, semantic tokens from globals.css.  
**Alternatives Considered**: Custom div styling - shadcn provides better accessibility and consistency.

### Decision: Error Handling Pattern

**What**: Show "Unable to load profile" message on error, with skeleton during loading.  
**Rationale**: User-friendly, matches spec requirements, graceful degradation.  
**Alternatives Considered**: Retry logic, detailed error messages - simple fallback is sufficient for MVP.

### Decision: Navigation on Click

**What**: Use Next.js `router.push()` to `/profile/[publicUuid]`.  
**Rationale**: Follows existing routing patterns, uses publicUuid for privacy.  
**Alternatives Considered**: Link component, direct href - router.push allows programmatic navigation.

## Best Practices Applied

- **Next.js App Router**: Route groups for shared layouts without URL impact.
- **Server Components**: Layout as Server Component, widget as Client Component only when needed.
- **TypeScript**: Strict typing, existing types reused.
- **Performance**: next/image for profile pictures, lazy loading considerations.
- **Accessibility**: Semantic HTML, keyboard navigation support.
- **Mobile Responsiveness**: Tailwind breakpoints, touch-friendly interactions.

## Dependencies & Compatibility

- Compatible with existing NextAuth.js setup.
- Uses existing database schema and UserService.
- No new dependencies required - leverages shadcn/ui and Tailwind.
- Follows project constitution for error handling and validation.
