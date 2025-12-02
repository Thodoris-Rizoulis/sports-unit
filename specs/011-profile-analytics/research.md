# Research: Profile Analytics Widget

**Feature**: 011-profile-analytics  
**Date**: 2024-12-02

## Research Tasks

### 1. Database Schema Pattern for Profile Visits

**Decision**: Use a simple table with visitor/visited foreign keys and timestamp, following the existing Connection and PostLike patterns.

**Rationale**:

- Existing patterns (PostLike, PostSave, Connection) use similar FK relationships
- No deduplication at write time (store all visits per spec)
- Index on `visitedId` + `createdAt` for efficient 7-day queries
- Index on `visitorId` for future "who viewed" feature

**Alternatives Considered**:

- Aggregated daily counts table: Rejected - need raw data for unique visitor counts and future "who viewed" feature
- Redis for real-time counts: Rejected - overkill for MVP, adds dependency

### 2. Unique Visitor Counting Strategy

**Decision**: Use Prisma's `groupBy` with `count` or raw SQL `COUNT(DISTINCT visitor_id)` at query time.

**Rationale**:

- Spec requires storing all visits but displaying unique counts
- Prisma supports `distinct` in queries
- 7-day window is a reasonable dataset size for COUNT DISTINCT

**Alternatives Considered**:

- HyperLogLog for approximation: Rejected - exact counts needed, small dataset
- Pre-computed materialized view: Rejected - adds complexity, not needed for scale

### 3. Profile Visit Recording Trigger

**Decision**: Call visit recording API from the ProfilePageWrapper client component on mount.

**Rationale**:

- ProfilePageWrapper is already a client component that can use useEffect
- Can check session and compare visitor vs visited before calling API
- Follows existing patterns (no server-side tracking needed)

**Alternatives Considered**:

- Middleware-based tracking: Rejected - adds complexity, harder to filter self-views
- Server Component data fetching: Rejected - profile page already uses client wrapper

### 4. Widget Data Fetching Pattern

**Decision**: Use fetch in useEffect, similar to existing ProfileWidget pattern.

**Rationale**:

- Consistent with existing sidebar widgets
- Simple error and loading state handling
- No need for React Query/SWR for this simple use case

**Alternatives Considered**:

- Server Component with streaming: Rejected - layout is already client component
- SWR/React Query: Rejected - not used elsewhere, adds dependency

### 5. Post Impressions Query

**Decision**: Count PostLike records where the post's userId matches current user AND createdAt is within 7 days.

**Rationale**:

- PostLike model exists with `createdAt` timestamp
- Simple JOIN query: `Post.userId = currentUser AND PostLike.createdAt > 7 days ago`
- Efficient with existing indexes

**Query Pattern**:

```sql
SELECT COUNT(*) FROM post_likes pl
JOIN posts p ON pl.post_id = p.id
WHERE p.user_id = $userId
AND pl.created_at > NOW() - INTERVAL '7 days'
```

## Resolved Clarifications

| Item                     | Resolution                                                    |
| ------------------------ | ------------------------------------------------------------- |
| Profile Visit Trigger    | Client-side useEffect in ProfilePageWrapper                   |
| Self-view Detection      | Compare session.user.id with profile.userId before API call   |
| 7-day Window Calculation | Server-side: `new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)` |
| Widget Placement         | Below NavigationWidget in left sidebar                        |
| Error Display            | Simple text message matching other widgets                    |

## Technology Decisions

| Area              | Choice                          | Justification                      |
| ----------------- | ------------------------------- | ---------------------------------- |
| Visit Storage     | PostgreSQL table                | Consistent with existing patterns  |
| Unique Counting   | COUNT DISTINCT at query time    | Simple, accurate, sufficient scale |
| API Pattern       | REST endpoints using api-utils  | Project standard                   |
| Component Pattern | Client component with useEffect | Matches existing widgets           |
