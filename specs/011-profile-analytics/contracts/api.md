# API Contracts: Profile Analytics Widget

**Feature**: 011-profile-analytics  
**Date**: 2024-12-02

## Endpoints

### GET /api/profile/analytics

Retrieve the current authenticated user's profile analytics for the last 7 days.

**Authentication**: Required (NextAuth session)

**Request**: No body required

**Response 200 OK**:

```json
{
  "profileViews": 42,
  "postImpressions": 156
}
```

**Response 401 Unauthorized**:

```json
{
  "error": "Unauthorized"
}
```

**Response 500 Internal Server Error**:

```json
{
  "error": "Failed to fetch analytics"
}
```

**Business Logic**:

- `profileViews`: COUNT DISTINCT of visitors to user's profile in last 7 days
- `postImpressions`: COUNT of likes received on any of user's posts in last 7 days

---

### POST /api/profile/[uuid]/visit

Record a profile visit when an authenticated user views another user's profile.

**Authentication**: Required (NextAuth session)

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| uuid | string | Public UUID of the profile being visited |

**Request**: No body required

**Response 200 OK**:

```json
{
  "success": true
}
```

**Response 400 Bad Request** (self-view):

```json
{
  "error": "Cannot record self-view"
}
```

**Response 401 Unauthorized**:

```json
{
  "error": "Unauthorized"
}
```

**Response 404 Not Found** (invalid UUID):

```json
{
  "error": "Profile not found"
}
```

**Response 500 Internal Server Error**:

```json
{
  "error": "Failed to record visit"
}
```

**Business Logic**:

- Resolve UUID to user ID
- Validate visitor ≠ visited (no self-views)
- Insert ProfileVisit record with current timestamp
- Fire-and-forget (no need to wait for confirmation in UI)

---

## TypeScript Types

### Request/Response Types (types/analytics.ts)

```typescript
import { z } from "zod";

// API Response schema
export const profileAnalyticsSchema = z.object({
  profileViews: z.number().int().nonnegative(),
  postImpressions: z.number().int().nonnegative(),
});

// Inferred type for API response
export type ProfileAnalyticsData = z.infer<typeof profileAnalyticsSchema>;

// Visit recording response
export const profileVisitResponseSchema = z.object({
  success: z.boolean(),
});

export type ProfileVisitResponse = z.infer<typeof profileVisitResponseSchema>;
```

---

## Error Handling

| Scenario               | HTTP Status | Error Message                                          |
| ---------------------- | ----------- | ------------------------------------------------------ |
| Not authenticated      | 401         | "Unauthorized"                                         |
| Self-view attempt      | 400         | "Cannot record self-view"                              |
| Profile UUID not found | 404         | "Profile not found"                                    |
| Database error         | 500         | "Failed to fetch analytics" / "Failed to record visit" |

---

## Rate Limiting (Future)

Not implemented in MVP, but consider:

- Visit recording: 1 per profile per minute per user (debounce)
- Analytics fetch: 10 per minute per user
