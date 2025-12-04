# API Contracts: Watchlists

## Endpoints Overview

| Method | Endpoint                                  | Description                        |
| ------ | ----------------------------------------- | ---------------------------------- |
| GET    | /api/watchlists                           | List all user's watchlists         |
| POST   | /api/watchlists                           | Create new watchlist               |
| GET    | /api/watchlists/[id]                      | Get single watchlist with athletes |
| PATCH  | /api/watchlists/[id]                      | Update watchlist details           |
| DELETE | /api/watchlists/[id]                      | Delete watchlist                   |
| POST   | /api/watchlists/[id]/athletes             | Add athlete to watchlist           |
| DELETE | /api/watchlists/[id]/athletes/[athleteId] | Remove athlete from watchlist      |
| GET    | /api/watchlists/containing/[athleteId]    | Get watchlists containing athlete  |

---

## GET /api/watchlists

List all watchlists for the current user.

### Response (200 OK)

```typescript
{
  watchlists: WatchlistSummary[];
}

type WatchlistSummary = {
  id: number;
  name: string;
  description: string | null;
  athleteCount: number;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
};
```

### Example Response

```json
{
  "watchlists": [
    {
      "id": 1,
      "name": "Top Prospects",
      "description": "High potential players for next season",
      "athleteCount": 12,
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-03T15:30:00Z"
    },
    {
      "id": 2,
      "name": "Goalkeepers",
      "description": null,
      "athleteCount": 5,
      "createdAt": "2025-12-02T14:00:00Z",
      "updatedAt": "2025-12-02T14:00:00Z"
    }
  ]
}
```

---

## POST /api/watchlists

Create a new watchlist.

### Request Body

```typescript
{
  name: string;         // Required, 1-100 chars
  description?: string; // Optional, max 500 chars
}
```

### Example Request

```json
{
  "name": "Midfield Targets",
  "description": "Central midfielders for recruitment"
}
```

### Response (201 Created)

```typescript
{
  id: number;
  name: string;
  description: string | null;
  athleteCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### Error (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": ["name is required", "name must be at most 100 characters"]
}
```

---

## GET /api/watchlists/[id]

Get a single watchlist with its athletes.

### Query Parameters

| Parameter | Type   | Required | Default | Description              |
| --------- | ------ | -------- | ------- | ------------------------ |
| page      | number | No       | 1       | Page number for athletes |
| limit     | number | No       | 20      | Athletes per page        |

### Response (200 OK)

```typescript
{
  watchlist: {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
  athletes: WatchlistAthleteItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

type WatchlistAthleteItem = {
  id: number;
  publicUuid: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  location: string | null;
  openToOpportunities: boolean;
  strongFoot: string | null;
  height: number | null;
  age: number | null;
  sportId: number | null;
  sportName: string | null;
  positions: number[] | null;
  metrics: {
    sprintSpeed30m: number | null;
    agilityTTest: number | null;
    beepTestLevel: number | null;
    beepTestShuttle: number | null;
    verticalJump: number | null;
  } | null;
  addedAt: string; // When added to this watchlist
};
```

### Error (404 Not Found)

```json
{
  "error": "Watchlist not found"
}
```

---

## PATCH /api/watchlists/[id]

Update watchlist name and/or description.

### Request Body

```typescript
{
  name?: string;        // Optional, 1-100 chars
  description?: string; // Optional, max 500 chars (null to clear)
}
```

### Example Request

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Response (200 OK)

```typescript
{
  id: number;
  name: string;
  description: string | null;
  athleteCount: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## DELETE /api/watchlists/[id]

Delete a watchlist and all its athlete associations.

### Response (200 OK)

```json
{
  "success": true
}
```

### Error (404 Not Found)

```json
{
  "error": "Watchlist not found"
}
```

---

## POST /api/watchlists/[id]/athletes

Add an athlete to a watchlist.

### Request Body

```typescript
{
  athleteId: number; // User ID of the athlete
}
```

### Example Request

```json
{
  "athleteId": 42
}
```

### Response (201 Created)

```json
{
  "success": true,
  "addedAt": "2025-12-03T16:00:00Z"
}
```

### Error (400 Bad Request) - Already in watchlist

```json
{
  "error": "Athlete already in watchlist"
}
```

### Error (404 Not Found)

```json
{
  "error": "Watchlist not found"
}
```

---

## DELETE /api/watchlists/[id]/athletes/[athleteId]

Remove an athlete from a watchlist.

### Response (200 OK)

```json
{
  "success": true
}
```

### Error (404 Not Found)

```json
{
  "error": "Athlete not in watchlist"
}
```

---

## GET /api/watchlists/containing/[athleteId]

Get IDs of current user's watchlists that contain a specific athlete.

### Response (200 OK)

```typescript
{
  watchlistIds: number[];
}
```

### Example Response

```json
{
  "watchlistIds": [1, 3, 7]
}
```

---

## Common Error Responses

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden (not owner)

```json
{
  "error": "Not authorized to access this watchlist"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Notes

- All endpoints require authentication via NextAuth session
- Watchlist ownership is verified on all operations (FR-012)
- Duplicate athlete entries are prevented by unique constraint (FR-014)
- Deleting watchlist cascades to athlete associations
- `athleteCount` is computed from WatchlistAthlete count
