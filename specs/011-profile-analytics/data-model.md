# Data Model: Profile Analytics Widget

**Feature**: 011-profile-analytics  
**Date**: 2024-12-02

## Entities

### ProfileVisit (New)

Tracks individual profile page visits for analytics.

| Field     | Type     | Constraints            | Description                   |
| --------- | -------- | ---------------------- | ----------------------------- |
| id        | Int      | PK, auto-increment     | Unique identifier             |
| visitorId | Int      | FK → User.id, NOT NULL | User who viewed the profile   |
| visitedId | Int      | FK → User.id, NOT NULL | User whose profile was viewed |
| createdAt | DateTime | DEFAULT now()          | When the visit occurred       |

**Indexes**:

- `idx_profile_visits_visited_created`: (visitedId, createdAt DESC) - For counting unique visitors in time window
- `idx_profile_visits_visitor`: (visitorId) - For future "who viewed" feature

**Relationships**:

- `visitor` → User (many-to-one)
- `visited` → User (many-to-one)

**Business Rules**:

- visitorId ≠ visitedId (enforced at application layer, not DB constraint)
- No deduplication - every visit is recorded

### ProfileAnalyticsData (UI Type - Not persisted)

Aggregated analytics data for widget display.

| Field           | Type   | Description                                 |
| --------------- | ------ | ------------------------------------------- |
| profileViews    | number | Count of unique visitors in last 7 days     |
| postImpressions | number | Count of post likes received in last 7 days |

## Prisma Schema Addition

```prisma
model ProfileVisit {
  id        Int       @id @default(autoincrement())
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)

  visitorId Int  @map("visitor_id")
  visitor   User @relation("ProfileVisitor", fields: [visitorId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  visitedId Int  @map("visited_id")
  visited   User @relation("ProfileVisited", fields: [visitedId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([visitedId, createdAt(sort: Desc)], map: "idx_profile_visits_visited_created")
  @@index([visitorId], map: "idx_profile_visits_visitor")
  @@map("profile_visits")
}
```

**User Model Updates**:

```prisma
model User {
  // ... existing fields ...

  // Profile Visits
  profileVisitsMade     ProfileVisit[] @relation("ProfileVisitor")
  profileVisitsReceived ProfileVisit[] @relation("ProfileVisited")
}
```

## Existing Entities Used

### PostLike (Existing)

Used for calculating post impressions (likes received in last 7 days).

| Field     | Type     | Used For                      |
| --------- | -------- | ----------------------------- |
| postId    | Int      | Join to Post to find owner    |
| userId    | Int      | Who liked (not used directly) |
| createdAt | DateTime | Filter to 7-day window        |

### Post (Existing)

| Field  | Type | Used For                       |
| ------ | ---- | ------------------------------ |
| userId | Int  | Filter to current user's posts |

## Query Patterns

### Get Unique Profile Views (Last 7 Days)

```sql
SELECT COUNT(DISTINCT visitor_id)
FROM profile_visits
WHERE visited_id = $userId
  AND created_at > NOW() - INTERVAL '7 days'
```

**Prisma Equivalent**:

```typescript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const result = await prisma.profileVisit.groupBy({
  by: ["visitorId"],
  where: {
    visitedId: userId,
    createdAt: { gte: sevenDaysAgo },
  },
  _count: true,
});

return result.length; // Number of unique visitors
```

### Get Post Impressions (Last 7 Days)

```sql
SELECT COUNT(*)
FROM post_likes pl
JOIN posts p ON pl.post_id = p.id
WHERE p.user_id = $userId
  AND pl.created_at > NOW() - INTERVAL '7 days'
```

**Prisma Equivalent**:

```typescript
const count = await prisma.postLike.count({
  where: {
    post: { userId: userId },
    createdAt: { gte: sevenDaysAgo },
  },
});
```

## State Diagram

```
Profile Visit Recording:
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│ User visits │ ──── │ Is self-view?│ ──── │ No: Record visit│
│ profile page│      │              │      │                 │
└─────────────┘      └──────────────┘      └─────────────────┘
                            │
                            ▼ Yes
                     ┌──────────────┐
                     │ Skip recording│
                     └──────────────┘
```

## Validation Rules

| Entity          | Field     | Rule                                    |
| --------------- | --------- | --------------------------------------- |
| ProfileVisit    | visitorId | Must be valid user ID, must ≠ visitedId |
| ProfileVisit    | visitedId | Must be valid user ID                   |
| Analytics Query | userId    | Must be authenticated user's ID         |
