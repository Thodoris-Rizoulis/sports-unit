# API Contracts: Discovery

**Endpoint**: `GET /api/discovery`

## Request

### Query Parameters

| Parameter           | Type    | Required | Default | Description                              |
| ------------------- | ------- | -------- | ------- | ---------------------------------------- |
| sportId             | number  | No       | -       | Filter by sport ID                       |
| positionId          | number  | No       | -       | Filter by position ID                    |
| strongFoot          | string  | No       | -       | Filter: 'left', 'right', or 'both'       |
| openToOpportunities | boolean | No       | -       | Filter by availability                   |
| heightMin           | number  | No       | -       | Minimum height (cm)                      |
| heightMax           | number  | No       | -       | Maximum height (cm)                      |
| ageMin              | number  | No       | -       | Minimum age (years)                      |
| ageMax              | number  | No       | -       | Maximum age (years)                      |
| location            | string  | No       | -       | Location filter (partial match)          |
| sprintSpeed30mMin   | number  | No       | -       | Min sprint speed (seconds)               |
| sprintSpeed30mMax   | number  | No       | -       | Max sprint speed (seconds)               |
| agilityTTestMin     | number  | No       | -       | Min agility T-test (seconds)             |
| agilityTTestMax     | number  | No       | -       | Max agility T-test (seconds)             |
| beepTestLevelMin    | number  | No       | -       | Min beep test level                      |
| beepTestLevelMax    | number  | No       | -       | Max beep test level                      |
| verticalJumpMin     | number  | No       | -       | Min vertical jump (cm)                   |
| verticalJumpMax     | number  | No       | -       | Max vertical jump (cm)                   |
| sort                | string  | No       | recent  | Sort: 'recent', 'alphabetical', 'newest' |
| page                | number  | No       | 1       | Page number                              |
| limit               | number  | No       | 20      | Results per page (max 100)               |

### Example Request

```
GET /api/discovery?sportId=1&heightMin=175&heightMax=190&openToOpportunities=true&sort=recent&page=1&limit=20
```

---

## Response

### Success (200 OK)

```typescript
{
  athletes: AthleteDiscoveryResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

### AthleteDiscoveryResult Type

```typescript
type AthleteDiscoveryResult = {
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
  inWatchlistIds: number[]; // IDs of current user's watchlists containing this athlete
};
```

### Example Response

```json
{
  "athletes": [
    {
      "id": 42,
      "publicUuid": "abc123-def456-...",
      "username": "john_athlete",
      "firstName": "John",
      "lastName": "Doe",
      "profileImageUrl": "https://example.com/image.jpg",
      "location": "London, UK",
      "openToOpportunities": true,
      "strongFoot": "right",
      "height": 182,
      "age": 24,
      "sportId": 1,
      "sportName": "Football",
      "positions": [2, 5],
      "metrics": {
        "sprintSpeed30m": 4.2,
        "agilityTTest": 9.5,
        "beepTestLevel": 12,
        "beepTestShuttle": 8,
        "verticalJump": 65
      },
      "inWatchlistIds": [1, 3]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

## Error Responses

### 400 Bad Request - Invalid Parameters

```json
{
  "error": "Invalid filter parameters",
  "details": [
    "heightMin must be a positive number",
    "sort must be one of: recent, alphabetical, newest"
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
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

- Current user is always excluded from results (FR-010)
- All filters use AND logic when combined (FR-003)
- Empty filter returns all athletes (paginated)
- Age is calculated from dateOfBirth, not stored
- `inWatchlistIds` helps show visual indicator on athlete cards
- `beepTestShuttle` is included in response for display purposes only; filtering is done by `beepTestLevel` (the primary indicator of aerobic capacity)
