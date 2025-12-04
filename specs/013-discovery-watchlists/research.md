# Research: Discovery Page & Watchlists

**Feature**: 013-discovery-watchlists  
**Date**: 2025-12-03  
**Status**: Complete

## Research Tasks

### 1. Dynamic Prisma Query Building for Multi-Filter Search

**Decision**: Use Prisma's conditional `where` clause building with optional chaining

**Rationale**: Prisma natively supports dynamic query construction by conditionally adding filter properties. This is the idiomatic approach for Prisma and doesn't require raw SQL.

**Pattern**:

```typescript
const where: Prisma.UserWhereInput = {
  id: { not: currentUserId }, // Exclude self
  ...(filters.sportId && { attributes: { sportId: filters.sportId } }),
  ...(filters.heightMin && {
    attributes: { height: { gte: filters.heightMin } },
  }),
  // etc.
};
```

**Alternatives Considered**:

- Raw SQL with `prisma.$queryRaw` - Rejected: Loses type safety, more complex
- Query builder libraries - Rejected: Adds dependency, Prisma already handles this

---

### 2. URL State Synchronization for Filters

**Decision**: Use `nuqs` or native `useSearchParams` + `useRouter` for URL sync

**Rationale**: The project already uses Next.js App Router. `useSearchParams` provides native support for reading URL params, and `router.push` with query params handles updates. No additional dependencies needed.

**Pattern**:

```typescript
// Read filters from URL
const searchParams = useSearchParams();
const sportId = searchParams.get("sportId");

// Update URL when filters change
const router = useRouter();
router.push(`/discovery?${new URLSearchParams(filters).toString()}`);
```

**Alternatives Considered**:

- `nuqs` library - Nice but adds dependency, native approach sufficient
- Local state only - Rejected: Loses shareability requirement (FR-007)

---

### 3. Pagination Pattern

**Decision**: Offset-based pagination with page numbers

**Rationale**:

- Simpler than cursor-based for this use case
- Allows direct navigation to any page
- Filter changes reset to page 1 (specified in acceptance scenarios)
- Consistent with existing patterns in the codebase (see `ConnectionService.getConnections`)

**Pattern**:

```typescript
// API: /api/discovery?page=1&limit=20
const skip = (page - 1) * limit;
const results = await prisma.user.findMany({
  skip,
  take: limit,
  where,
  orderBy,
});
const total = await prisma.user.count({ where });
```

---

### 4. Mobile Filter Drawer Implementation

**Decision**: Use shadcn Sheet component for bottom drawer

**Rationale**: shadcn provides a Sheet component that works as a drawer/modal. Configure it to slide from bottom on mobile for filter panel.

**Implementation**:

- Use Sheet from shadcn/ui
- Trigger with "Filters" button visible on mobile
- Filter controls render inside Sheet content

---

### 5. Watchlist Privacy Enforcement

**Decision**: Service-layer ownership validation on all operations

**Rationale**: Every watchlist operation must verify `userId` matches the current user. This is enforced in the service layer, consistent with how `ConnectionService` handles authorization.

**Pattern**:

```typescript
static async getWatchlistById(id: number, userId: number) {
  const watchlist = await prisma.watchlist.findFirst({
    where: { id, userId }, // Ownership check in query
  });
  if (!watchlist) throw new Error('Watchlist not found');
  return watchlist;
}
```

---

### 6. Age Calculation from Date of Birth

**Decision**: Calculate age dynamically in query using raw SQL fragment or post-query filter

**Rationale**: Prisma doesn't support computed fields in queries directly. Options:

1. Calculate in application after fetching (simpler)
2. Use raw SQL for date calculation (performant for large datasets)

**Decision**: Use application-side filtering for simplicity, with database-side pre-filtering by year range.

**Pattern**:

```typescript
// Pre-filter by birth year range (database)
const minBirthYear = new Date().getFullYear() - filters.ageMax;
const maxBirthYear = new Date().getFullYear() - filters.ageMin;

// Then exact age calc in application if needed
const age = Math.floor(
  (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
);
```

---

### 7. Sort Order Implementation

**Decision**: Support three sort options with URL parameter

**Sort Options**:

1. `recent` (default): `updated_at DESC` on user_attributes
2. `alphabetical`: `firstName ASC, lastName ASC` on user_attributes
3. `newest`: `created_at DESC` on users

**URL**: `/discovery?sort=recent|alphabetical|newest`

---

### 8. Athlete Card Data Requirements

**Decision**: Single query with includes to fetch all needed data

**Required Data** (from spec FR-009):

- Profile: image, firstName, lastName, location, openToOpportunities, strongFoot, height
- Sport & Position: sportName, positions (JSON array of position IDs)
- Metrics: all from athlete_metrics table
- Calculated: age from dateOfBirth

**Prisma Include Pattern**:

```typescript
const includeAthleteDiscovery = {
  attributes: {
    include: { sport: true },
  },
  athleteMetrics: true,
};
```

---

## Decisions Summary

| Topic          | Decision                           | Key Rationale                     |
| -------------- | ---------------------------------- | --------------------------------- |
| Query building | Prisma conditional where           | Type-safe, idiomatic              |
| URL sync       | Native useSearchParams + router    | No new dependencies               |
| Pagination     | Offset-based with page numbers     | Simple, allows direct page access |
| Mobile filters | shadcn Sheet (bottom drawer)       | Existing component library        |
| Privacy        | Service-layer userId validation    | Consistent with ConnectionService |
| Age filter     | App-side calc with year pre-filter | Simpler than raw SQL              |
| Sorting        | Three options via URL param        | Covers all spec requirements      |
| Athlete data   | Single query with includes         | Efficient, type-safe              |

## No Remaining Unknowns

All technical decisions have been made. Ready for Phase 1 design.
