# Quickstart: Profile Analytics Widget

**Feature**: 011-profile-analytics  
**Date**: 2024-12-02

## Overview

This feature adds a Profile Analytics Widget to the left sidebar showing:

1. **Profile Views**: Unique visitors to your profile in the last 7 days
2. **Post Impressions**: Total likes received on your posts in the last 7 days

## Implementation Order

### Phase 1: Database Schema

1. Create migration file `migrations/016_add_profile_visits_table.ts`
2. Run migration to create `profile_visits` table
3. Update Prisma schema with `ProfileVisit` model
4. Generate Prisma client

### Phase 2: Types

1. Create `types/analytics.ts` with:
   - `ProfileAnalyticsData` type
   - Zod schemas for API validation
2. Add `ProfileAnalyticsData` export to `types/prisma.ts`

### Phase 3: Service Layer

1. Create `services/analytics.ts` with `AnalyticsService` class:
   - `recordProfileVisit(visitorId, visitedId)` - saves visit
   - `getProfileAnalytics(userId)` - returns aggregated data

### Phase 4: API Routes

1. Create `app/api/profile/analytics/route.ts` - GET analytics
2. Create `app/api/profile/[uuid]/visit/route.ts` - POST visit

### Phase 5: Profile Visit Recording

1. Update `ProfilePageWrapper.tsx` to call visit API on mount
2. Add self-view check before calling API

### Phase 6: Widget Component

1. Create `components/widgets/ProfileAnalyticsWidget.tsx`
2. Add to `app/(main)/layout.tsx` in left sidebar

### Phase 7: Validation

1. Run `npm run build` to validate types
2. Test visit recording manually
3. Verify widget displays

## Key Files to Create

| File                                            | Purpose                          |
| ----------------------------------------------- | -------------------------------- |
| `migrations/016_add_profile_visits_table.ts`    | Database migration               |
| `types/analytics.ts`                            | Type definitions and Zod schemas |
| `services/analytics.ts`                         | Business logic                   |
| `app/api/profile/analytics/route.ts`            | GET analytics endpoint           |
| `app/api/profile/[uuid]/visit/route.ts`         | POST visit endpoint              |
| `components/widgets/ProfileAnalyticsWidget.tsx` | Widget component                 |

## Key Files to Modify

| File                                        | Change                                        |
| ------------------------------------------- | --------------------------------------------- |
| `prisma/schema.prisma`                      | Add ProfileVisit model, update User relations |
| `types/prisma.ts`                           | Add ProfileAnalyticsData type                 |
| `components/profile/ProfilePageWrapper.tsx` | Add visit recording on mount                  |
| `app/(main)/layout.tsx`                     | Add ProfileAnalyticsWidget to sidebar         |

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Prisma client generates without errors
- [ ] Visit API records visit in database
- [ ] Visit API rejects self-views
- [ ] Analytics API returns correct counts
- [ ] Widget displays in sidebar
- [ ] Widget shows loading state
- [ ] Widget handles errors gracefully
- [ ] Build passes with no TypeScript errors

## Quick Commands

```bash
# Run migration
npx ts-node migrations/016_add_profile_visits_table.ts

# Regenerate Prisma client
npx prisma generate

# Validate build
npm run build
```
