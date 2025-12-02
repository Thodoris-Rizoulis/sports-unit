# Research: Enhanced User Profile Sections

**Feature**: 012-enhanced-profile-sections  
**Date**: December 2, 2025

## Technical Decisions

### 1. Role Detection Strategy

**Decision**: Query `profile_roles` table via user's `roleId` to determine role name.

**Rationale**:

- The `profile_roles` table already exists with roles: `athlete`, `coach`, `scout`
- User's `roleId` is stored in `users` table
- Role name comparison is simple and maintainable

**Alternatives Considered**:

- Hardcoding role IDs (rejected: fragile if IDs change)
- Caching roles in session (rejected: adds complexity, roles rarely change)

**Implementation**:

```typescript
// Extend UserProfile type to include roleName
type UserProfile = {
  // ... existing fields
  roleId: number | null;
  roleName: string | null; // 'athlete' | 'coach' | 'scout'
};
```

### 2. Database Schema for New Tables

**Decision**: Create 6 new tables with consistent naming and structure.

**Rationale**:

- Follow existing patterns (snake_case table names, timestamps)
- One-to-many relationships for most entities
- One-to-one for athlete_metrics (single record per user)

**Tables**:

1. `athlete_metrics` - One per user, all fields nullable
2. `user_experiences` - Many per user, FK to teams
3. `user_education` - Many per user
4. `user_certifications` - Many per user (coach only at UI level)
5. `user_languages` - Many per user, level as enum
6. `user_awards` - Many per user

### 3. Validation Constants for Metrics

**Decision**: Add new validation constants to `lib/constants.ts`.

**Rationale**: Centralized validation rules, reusable across forms and API.

**Values**:

```typescript
ATHLETE_METRICS: {
  SPRINT_SPEED_30M: { MIN: 3.0, MAX: 8.0 },    // seconds
  AGILITY_T_TEST: { MIN: 8.0, MAX: 20.0 },     // seconds
  BEEP_TEST_LEVEL: { MIN: 1, MAX: 21 },
  BEEP_TEST_SHUTTLE: { MIN: 1, MAX: 16 },
  VERTICAL_JUMP: { MIN: 10, MAX: 150 },        // cm
}
```

### 4. API Route Structure

**Decision**: Use `/api/profile/[uuid]/` prefix for all new endpoints.

**Rationale**:

- Consistent with existing pattern (`/api/profile/[uuid]/visit`)
- UUID in path for profile identification
- Separate routes for each entity with nested `[id]` for updates/deletes

**Authentication Pattern**:

- All routes require authentication via `getServerSession(authOptions)`
- Write operations require ownership check (session.user.id === profile.userId)
- Read operations allowed for any authenticated user

### 5. Component Architecture

**Decision**: Self-contained section components with embedded edit modals.

**Rationale**:

- Each section manages its own state and data fetching
- Modals are children of their respective sections
- Follows existing patterns (ProfileHero, ProfileAbout)

**Edit State Management**:

- Use existing `currentlyEditing` pattern from ProfilePageWrapper
- Only one modal open at a time
- Edit buttons disabled when another section is being edited

### 6. Sidebar Modularity

**Decision**: Create `ProfileSidebar` wrapper component accepting children.

**Rationale**:

- Reusable on other pages (future: team profiles, etc.)
- Responsive behavior (right side on desktop, below content on mobile)
- Clean composition pattern

**Implementation**:

```tsx
<ProfileSidebar>
  <LanguagesWidget userId={userId} isOwner={isOwner} />
  <AwardsWidget userId={userId} isOwner={isOwner} />
</ProfileSidebar>
```

### 7. Year Picker Implementation

**Decision**: Use Select component with generated year range.

**Rationale**:

- Simpler than date picker for year-only selection
- Range: 1950 to current year + 5 (for future projections)
- Consistent with form input patterns

### 8. Teams Dropdown for Experience

**Decision**: Searchable Combobox filtered by user's sportId.

**Rationale**:

- Existing teams are sport-specific
- Combobox pattern from shadcn for search functionality
- Cannot add new teams (per spec requirement)

### 9. Beep Test Display Format

**Decision**: Store as two integers (level, shuttle), display as "Level X.Y".

**Rationale**:

- Level 11, Shuttle 4 displays as "Level 11.4"
- Simple transformation in UI
- Separate storage allows individual validation

### 10. Delete Confirmation Pattern

**Decision**: Use AlertDialog from shadcn for delete confirmations.

**Rationale**:

- Consistent with platform UX patterns
- Prevents accidental deletions
- Already available in shadcn/ui

## Dependency Analysis

### Existing Dependencies (No Changes)

- shadcn/ui: Dialog, AlertDialog, Select, Input, Button, Badge, Card
- React Hook Form: Form handling
- Zod: Validation schemas
- @tanstack/react-query: Data fetching (if used in hooks)

### New Shadcn Components Needed

- Combobox (for team search dropdown)
- May need to install via: `npx shadcn-ui@latest add combobox`

## Risk Assessment

### Low Risk

- Database schema changes (well-defined, follows existing patterns)
- API routes (straightforward CRUD operations)
- Service layer (follows existing patterns)

### Medium Risk

- Component integration (multiple new sections in ProfilePageWrapper)
- Responsive sidebar layout (new pattern for profile page)
- Data fetching coordination (multiple API calls on profile load)

### Mitigation

- Implement incrementally by section
- Test responsive layout early
- Consider parallel data fetching with Promise.all or React Query
