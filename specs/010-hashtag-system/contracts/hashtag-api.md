# API Contracts: Hashtag System

**Feature**: 010-hashtag-system  
**Date**: 2025-12-02

## Endpoints Overview

| Method | Path                              | Description                                 | Auth     |
| ------ | --------------------------------- | ------------------------------------------- | -------- |
| GET    | `/api/hashtags/popular`           | Get top 5 popular hashtags from last 7 days | Required |
| GET    | `/api/posts/by-hashtag/[hashtag]` | Get posts containing a specific hashtag     | Required |

---

## GET /api/hashtags/popular

Returns the top 5 most-used hashtags from the last 7 days.

### Request

```http
GET /api/hashtags/popular
Authorization: Bearer <session_token>
```

**Query Parameters**: None

### Response

**Success (200)**:

```json
{
  "hashtags": [
    { "id": 1, "name": "training" },
    { "id": 2, "name": "sports" },
    { "id": 3, "name": "fitness" },
    { "id": 4, "name": "workout" },
    { "id": 5, "name": "soccer" }
  ]
}
```

**Unauthorized (401)**:

```json
{
  "error": "Unauthorized"
}
```

### Notes

- Returns up to 5 hashtags
- Empty array if no hashtags used in last 7 days
- Hashtag names are lowercase, without # prefix

---

## GET /api/posts/by-hashtag/[hashtag]

Returns paginated posts containing a specific hashtag, ordered newest first.

### Request

```http
GET /api/posts/by-hashtag/training?limit=20&cursor=123
Authorization: Bearer <session_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hashtag | string | Yes | Hashtag name (without #, case-insensitive) |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Number of posts to return (max 50) |
| cursor | number | - | Last post ID for pagination (posts with ID < cursor) |

### Response

**Success (200)**:

```json
{
  "hashtag": "training",
  "posts": [
    {
      "id": 456,
      "publicUuid": "abc-123-def",
      "content": "Great #training session today!",
      "createdAt": "2025-12-02T10:00:00Z",
      "updatedAt": "2025-12-02T10:00:00Z",
      "likeCount": 15,
      "commentCount": 3,
      "isLiked": false,
      "isSaved": false,
      "media": [],
      "user": {
        "id": 1,
        "publicUuid": "user-uuid",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "profileImageUrl": "https://..."
      }
    }
  ],
  "nextCursor": 455,
  "hasMore": true
}
```

**Hashtag Not Found (200 with empty posts)**:

```json
{
  "hashtag": "nonexistent",
  "posts": [],
  "nextCursor": null,
  "hasMore": false
}
```

**Unauthorized (401)**:

```json
{
  "error": "Unauthorized"
}
```

**Invalid Request (400)**:

```json
{
  "error": "Invalid hashtag format"
}
```

### Notes

- Hashtag lookup is case-insensitive (searches lowercase)
- Returns standard `Post` type used by `PostFeed` component
- `nextCursor` is null when no more posts available
- `hasMore` indicates if more posts can be loaded

---

## Zod Validation Schemas

### Popular Hashtags Response (types/prisma.ts)

```typescript
// Output type - no Zod needed (Prisma types)
export type PopularHashtag = {
  id: number;
  name: string;
};

export type PopularHashtagsResponse = {
  hashtags: PopularHashtag[];
};
```

### Hashtag Posts Query (types/posts.ts)

```typescript
import { z } from "zod";
import { idField } from "./common";

// Input validation for hashtag posts query
export const hashtagPostsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(20),
  cursor: z.coerce.number().int().positive().optional(),
});

export type HashtagPostsQuery = z.infer<typeof hashtagPostsQuerySchema>;
```

### Hashtag Path Parameter

```typescript
// Hashtag name validation
export const hashtagNameSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z0-9_]+$/, "Invalid hashtag format")
  .transform((s) => s.toLowerCase());
```

---

## Error Codes

| Status | Code            | Description            |
| ------ | --------------- | ---------------------- |
| 200    | -               | Success                |
| 400    | INVALID_HASHTAG | Hashtag format invalid |
| 401    | UNAUTHORIZED    | User not authenticated |
| 500    | SERVER_ERROR    | Internal server error  |
