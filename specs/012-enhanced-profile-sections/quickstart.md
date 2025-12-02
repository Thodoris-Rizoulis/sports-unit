# Quickstart: Enhanced User Profile Sections

**Feature**: 012-enhanced-profile-sections  
**Date**: December 2, 2025

## Prerequisites

- Node.js 18+
- PostgreSQL database (existing)
- Project dependencies installed (`npm install`)
- Prisma client generated (`npx prisma generate`)

## Quick Setup

### 1. Run Database Migration

```bash
npx ts-node migrations/017_add_enhanced_profile_tables.ts
```

This creates the 6 new tables:

- `athlete_metrics`
- `user_experiences`
- `user_education`
- `user_certifications`
- `user_languages`
- `user_awards`

### 2. Update Prisma Schema

Add the new models to `prisma/schema.prisma` (see data-model.md for full schema).

Then regenerate the Prisma client:

```bash
npx prisma generate
```

### 3. Install Combobox Component (if not present)

```bash
npx shadcn-ui@latest add combobox
```

### 4. Start Development Server

```bash
npm run dev
```

## File Creation Order

Follow this order to avoid import errors:

### Phase 0: Foundation

1. `migrations/017_add_enhanced_profile_tables.ts`
2. Update `prisma/schema.prisma`
3. `lib/constants.ts` - Add metric validation ranges
4. `types/enhanced-profile.ts` - Zod schemas
5. Update `types/prisma.ts` - New UI types and mappers

### Phase 1: Services

6. `services/athlete-metrics.ts`
7. `services/experience.ts`
8. `services/education.ts`
9. `services/certifications.ts`
10. `services/languages.ts`
11. `services/awards.ts`
12. Update `services/profile.ts` - Role detection

### Phase 2: API Routes

13. `app/api/profile/[uuid]/metrics/route.ts`
14. `app/api/profile/[uuid]/key-info/route.ts`
15. `app/api/profile/[uuid]/experience/route.ts`
16. `app/api/profile/[uuid]/experience/[id]/route.ts`
17. `app/api/profile/[uuid]/education/route.ts`
18. `app/api/profile/[uuid]/education/[id]/route.ts`
19. `app/api/profile/[uuid]/certifications/route.ts`
20. `app/api/profile/[uuid]/certifications/[id]/route.ts`
21. `app/api/profile/[uuid]/languages/route.ts`
22. `app/api/profile/[uuid]/languages/[id]/route.ts`
23. `app/api/profile/[uuid]/awards/route.ts`
24. `app/api/profile/[uuid]/awards/[id]/route.ts`
25. `app/api/profile/[uuid]/posts/route.ts`

### Phase 3: Hooks

26. `hooks/useAthleteMetrics.ts`
27. `hooks/useExperience.ts`
28. `hooks/useEducation.ts`
29. `hooks/useCertifications.ts`
30. `hooks/useLanguages.ts`
31. `hooks/useAwards.ts`
32. `hooks/useUserPosts.ts`

### Phase 4: Components

33. `components/profile/KeyInformationSection.tsx`
34. `components/profile/KeyInfoEditModal.tsx`
35. `components/profile/AthleteMetricsSection.tsx`
36. `components/profile/MetricsEditModal.tsx`
37. `components/profile/RecentActivitySection.tsx`
38. `components/profile/ExperienceSection.tsx`
39. `components/profile/ExperienceModal.tsx`
40. `components/profile/EducationSection.tsx`
41. `components/profile/EducationModal.tsx`
42. `components/profile/CertificationsSection.tsx`
43. `components/profile/CertificationModal.tsx`
44. `components/profile/ProfileSidebar.tsx`
45. `components/profile/LanguagesWidget.tsx`
46. `components/profile/LanguageModal.tsx`
47. `components/profile/AwardsWidget.tsx`
48. `components/profile/AwardModal.tsx`

### Phase 5: Integration

49. Update `components/profile/ProfilePageWrapper.tsx`
50. `app/(main)/profile/[uuid]/[slug]/posts/page.tsx`

## Testing Checklist

### Database

- [ ] All 6 tables created successfully
- [ ] Foreign key constraints work
- [ ] Indexes created

### API Routes

- [ ] GET /api/profile/[uuid]/metrics returns data
- [ ] PUT /api/profile/[uuid]/metrics updates data
- [ ] CRUD operations work for all entities
- [ ] Auth and ownership checks work

### UI

- [ ] Profile page shows all sections
- [ ] Athlete-only sections hidden for coaches
- [ ] Coach-only sections hidden for athletes
- [ ] Edit buttons only visible to owners
- [ ] All modals open/close correctly
- [ ] Form validation works
- [ ] Empty states display correctly

### Responsive

- [ ] Desktop: sidebar on right
- [ ] Mobile: sidebar below content
- [ ] All sections readable on mobile

## Validation Ranges Reference

```typescript
// Athlete Metrics
SPRINT_SPEED_30M: 3.0 - 8.0 seconds
AGILITY_T_TEST: 8.0 - 20.0 seconds
BEEP_TEST_LEVEL: 1 - 21
BEEP_TEST_SHUTTLE: 1 - 16
VERTICAL_JUMP: 10 - 150 cm

// Physical (existing)
HEIGHT: 100 - 250 cm

// Years
MIN_YEAR: 1950
MAX_YEAR: current year + 5
```

## Common Issues

### Prisma Client Not Updated

```bash
npx prisma generate
```

### Type Errors After Schema Change

```bash
npm run build
```

### Migration Fails

Check database connection in `.env.local`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASS=your_password
DB_NAME=sports_unit
```
