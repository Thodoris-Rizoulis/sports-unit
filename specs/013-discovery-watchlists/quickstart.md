# Quickstart: Discovery Page & Watchlists

**Feature**: 013-discovery-watchlists  
**Date**: 2025-12-03

## Prerequisites

- Node.js 18+
- PostgreSQL database running
- Environment variables configured (.env.local)
- Project dependencies installed (`npm install`)

## Implementation Order

### Phase 1: Database & Types (Foundation)

```bash
# 1. Update Prisma schema
# Edit prisma/schema.prisma - add Watchlist and WatchlistAthlete models

# 2. Create migration
npx tsx migrations/018_add_watchlists_tables.ts

# 3. Regenerate Prisma client
npx prisma generate

# 4. Create type files
# - types/discovery.ts (Zod schemas for filters)
# - types/watchlists.ts (Zod schemas for CRUD)
# - Update types/prisma.ts (include patterns, mappers)
# - Update types/index.ts (exports)
```

### Phase 2: Services Layer

```bash
# Create service files:
# - services/discovery.ts (DiscoveryService)
# - services/watchlists.ts (WatchlistService)
```

### Phase 3: API Routes

```bash
# Create API routes in order:
# 1. app/api/discovery/route.ts
# 2. app/api/watchlists/route.ts
# 3. app/api/watchlists/[id]/route.ts
# 4. app/api/watchlists/[id]/athletes/route.ts
# 5. app/api/watchlists/[id]/athletes/[athleteId]/route.ts
# 6. app/api/watchlists/containing/[athleteId]/route.ts
```

### Phase 4: Hooks

```bash
# Create React hooks:
# - hooks/useDiscovery.ts
# - hooks/useWatchlists.ts
# - hooks/useWatchlist.ts
# - hooks/useWatchlistMutations.ts
```

### Phase 5: Components

```bash
# Create components in order:

# Discovery components (components/discovery/):
# 1. AthleteCard.tsx (single result card)
# 2. DiscoveryFilters.tsx (filter controls)
# 3. FilterDrawer.tsx (mobile drawer)
# 4. SortDropdown.tsx (sort selector)
# 5. AddToWatchlistModal.tsx (watchlist picker)
# 6. DiscoveryResults.tsx (results grid)

# Watchlist components (components/watchlists/):
# 1. WatchlistCard.tsx (preview card)
# 2. WatchlistList.tsx (all watchlists)
# 3. WatchlistForm.tsx (create/edit)
# 4. DeleteWatchlistDialog.tsx (confirm delete)
# 5. WatchlistAthleteCard.tsx (athlete in watchlist)
# 6. WatchlistDetail.tsx (single watchlist view)

# Optional: components/ui/pagination.tsx (if not exists)
```

### Phase 6: Pages

```bash
# Create pages:
# 1. app/(main)/discovery/page.tsx
# 2. app/(main)/watchlists/page.tsx
# 3. app/(main)/watchlists/[id]/page.tsx
```

### Phase 7: Navigation Update

```bash
# Update components/widgets/NavigationWidget.tsx
# Add Watchlists link after Saved
```

## Validation Commands

```bash
# After each phase:
npm run build          # TypeScript compilation check
npm run dev            # Manual testing

# Full validation:
npm run build && npm run dev
```

## Key Files Reference

| File                     | Purpose                               |
| ------------------------ | ------------------------------------- |
| `types/discovery.ts`     | Filter schemas, DiscoveryFilters type |
| `types/watchlists.ts`    | CRUD schemas, Watchlist types         |
| `types/prisma.ts`        | Include patterns, mappers, UI types   |
| `services/discovery.ts`  | DiscoveryService.searchAthletes()     |
| `services/watchlists.ts` | WatchlistService CRUD methods         |
| `lib/constants.ts`       | Validation constants (existing)       |

## Common Patterns to Follow

### Service Method Pattern (from ConnectionService)

```typescript
export class WatchlistService {
  static async methodName(params): Promise<ReturnType> {
    // Validate ownership where needed
    // Use Prisma client
    // Return typed data
  }
}
```

### API Route Pattern

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }
    // ... logic
    return createSuccessResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Component Pattern

```typescript
// Client component for interactivity
"use client";

import { useState } from "react";
import { ComponentProps } from "@/types/components";

export function MyComponent({ prop }: ComponentProps) {
  // ... component logic
}
```

## Testing Checklist

- [ ] Filter by single attribute works
- [ ] Multiple filters combine with AND logic
- [ ] Range filters (height, age, metrics) work correctly
- [ ] Sort options change result order
- [ ] Pagination works (page navigation, total count)
- [ ] URL reflects filter state (shareable)
- [ ] Create watchlist works
- [ ] Add athlete to watchlist works
- [ ] Remove athlete from watchlist works
- [ ] Delete watchlist works (with confirmation)
- [ ] Watchlist privacy enforced (cannot access others')
- [ ] Mobile filter drawer works
- [ ] Navigation shows Watchlists link
- [ ] Empty states display correctly
