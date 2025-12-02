# Quickstart: Hashtag System

**Feature**: 010-hashtag-system  
**Date**: 2025-12-02

## Prerequisites

- Node.js 18+
- PostgreSQL database running
- Existing Sports Unit project with Prisma configured

## Setup Steps

### 1. Apply Database Migration

```bash
# Run the migration
npx ts-node migrations/015_add_hashtags_table.ts

# Regenerate Prisma client
npx prisma generate
```

### 2. Verify Schema

```bash
# Check Prisma schema is valid
npx prisma validate

# View the database schema
npx prisma db pull --print
```

### 3. Test API Endpoints

```bash
# Start dev server
npm run dev

# Test popular hashtags (requires auth cookie)
curl -X GET http://localhost:3000/api/hashtags/popular \
  -H "Cookie: next-auth.session-token=<your-session>"

# Test posts by hashtag
curl -X GET "http://localhost:3000/api/posts/by-hashtag/training?limit=10" \
  -H "Cookie: next-auth.session-token=<your-session>"
```

### 4. Create Test Data

```typescript
// Quick test in Prisma Studio
// npx prisma studio

// Or via API - create a post with hashtags:
fetch("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Testing the hashtag system! #training #sports #fitness",
  }),
});
```

## Verification Checklist

- [ ] Database tables created (`hashtags`, `post_hashtags`)
- [ ] Indexes created for performance
- [ ] Prisma client regenerated
- [ ] Popular hashtags endpoint returns data
- [ ] Posts by hashtag endpoint returns filtered posts
- [ ] Creating a post extracts and stores hashtags
- [ ] Hashtags render as clickable links in posts
- [ ] Clicking hashtag navigates to `/hashtag/[name]`
- [ ] Popular hashtags widget displays in sidebar

## Common Issues

### Hashtags not extracting

Check that:

1. Post content contains valid hashtags (e.g., `#training`)
2. `PostService.createPost` calls hashtag extraction
3. Regex pattern matches your hashtag format

### Popular hashtags empty

Check that:

1. Posts with hashtags were created in the last 7 days
2. `PostHashtag.createdAt` is being set correctly
3. Query date filter uses correct timezone

### Build errors after schema change

```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run build
```

## Key Files

| File                                           | Purpose                             |
| ---------------------------------------------- | ----------------------------------- |
| `prisma/schema.prisma`                         | Hashtag and PostHashtag models      |
| `services/hashtags.ts`                         | HashtagService class                |
| `app/api/hashtags/popular/route.ts`            | Popular hashtags endpoint           |
| `app/api/posts/by-hashtag/[hashtag]/route.ts`  | Posts by hashtag endpoint           |
| `app/(main)/hashtag/[hashtag]/page.tsx`        | Hashtag page                        |
| `components/widgets/PopularHashtagsWidget.tsx` | Sidebar widget                      |
| `lib/utils.ts`                                 | Hashtag extraction and text parsing |
| `types/prisma.ts`                              | Hashtag and PopularHashtag types    |
