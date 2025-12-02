# Data Model: Hashtag System

**Feature**: 010-hashtag-system  
**Date**: 2025-12-02

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    Post     │───────│   PostHashtag    │───────│   Hashtag   │
│             │  1:N  │   (junction)     │  N:1  │             │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)          │       │ id (PK)     │
│ publicUuid  │       │ postId (FK)      │       │ name        │
│ content     │       │ hashtagId (FK)   │       │ createdAt   │
│ userId      │       │ createdAt        │       └─────────────┘
│ createdAt   │       └──────────────────┘
└─────────────┘
```

## Prisma Schema Additions

### Hashtag Model

```prisma
model Hashtag {
  id        Int       @id @default(autoincrement())
  name      String    @unique @db.VarChar(50)
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)

  posts PostHashtag[]

  @@index([name], map: "idx_hashtags_name")
  @@map("hashtags")
}
```

### PostHashtag Junction Model

```prisma
model PostHashtag {
  id        Int       @id @default(autoincrement())
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)

  postId    Int     @map("post_id")
  post      Post    @relation(fields: [postId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  hashtagId Int     @map("hashtag_id")
  hashtag   Hashtag @relation(fields: [hashtagId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@unique([postId, hashtagId])
  @@index([hashtagId, createdAt(sort: Desc)], map: "idx_post_hashtags_hashtag_created")
  @@index([createdAt], map: "idx_post_hashtags_created")
  @@map("post_hashtags")
}
```

### Post Model Update

Add relation to Post model:

```prisma
model Post {
  // ... existing fields ...

  hashtags PostHashtag[]  // Add this relation
}
```

## Field Specifications

### Hashtag

| Field       | Type       | Constraints        | Description                                    |
| ----------- | ---------- | ------------------ | ---------------------------------------------- |
| `id`        | Int        | PK, auto-increment | Unique identifier                              |
| `name`      | String(50) | Unique, not null   | Normalized hashtag name (lowercase, without #) |
| `createdAt` | DateTime   | Default: now()     | When hashtag was first created                 |

### PostHashtag

| Field       | Type     | Constraints                     | Description                                         |
| ----------- | -------- | ------------------------------- | --------------------------------------------------- |
| `id`        | Int      | PK, auto-increment              | Unique identifier                                   |
| `postId`    | Int      | FK → Post.id, cascade delete    | Reference to post                                   |
| `hashtagId` | Int      | FK → Hashtag.id, cascade delete | Reference to hashtag                                |
| `createdAt` | DateTime | Default: now()                  | When this link was created (for time-based queries) |

## Indexes

| Table         | Index                             | Columns                   | Purpose                                                    |
| ------------- | --------------------------------- | ------------------------- | ---------------------------------------------------------- |
| hashtags      | idx_hashtags_name                 | name                      | Fast hashtag lookup by name                                |
| post_hashtags | idx_post_hashtags_hashtag_created | hashtagId, createdAt DESC | Popular hashtags query (count by hashtag with date filter) |
| post_hashtags | idx_post_hashtags_created         | createdAt                 | Time-based filtering for "last 7 days"                     |

## Constraints

| Table         | Constraint         | Type   | Description                          |
| ------------- | ------------------ | ------ | ------------------------------------ |
| hashtags      | name               | UNIQUE | Prevent duplicate hashtags           |
| post_hashtags | postId + hashtagId | UNIQUE | Prevent duplicate post-hashtag links |

## Validation Rules

### Hashtag Name

- **Format**: Lowercase alphanumeric characters and underscores only
- **Length**: 1-50 characters (without the # symbol)
- **Storage**: Stored without the # prefix, lowercase normalized

### Business Rules

- Hashtags are case-insensitive (`#Sports` = `#sports` = `#SPORTS`)
- Duplicate hashtags in a single post are deduplicated
- Deleting a post cascades to delete its PostHashtag links
- Deleting a hashtag (admin action) cascades to delete all PostHashtag links

## Migration Strategy

### SQL Migration (015_add_hashtags_table.ts)

```sql
-- Create hashtags table
CREATE TABLE hashtags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table
CREATE TABLE post_hashtags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id INTEGER NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, hashtag_id)
);

-- Create indexes
CREATE INDEX idx_hashtags_name ON hashtags(name);
CREATE INDEX idx_post_hashtags_hashtag_created ON post_hashtags(hashtag_id, created_at DESC);
CREATE INDEX idx_post_hashtags_created ON post_hashtags(created_at);
```

## TypeScript Types (types/prisma.ts)

```typescript
/**
 * Hashtag for display
 */
export type Hashtag = {
  id: number;
  name: string;
  createdAt: Date;
};

/**
 * Popular hashtag with post count (for widget)
 */
export type PopularHashtag = {
  id: number;
  name: string;
  postCount: number;
};
```
