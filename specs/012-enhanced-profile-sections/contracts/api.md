# API Contracts: Enhanced User Profile Sections

**Feature**: 012-enhanced-profile-sections  
**Base Path**: `/api/profile/[uuid]`

## Authentication

All endpoints require authentication via NextAuth session.
Write operations (POST, PUT, DELETE) require ownership verification.

```typescript
// Common auth check pattern
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return createErrorResponse("Unauthorized", 401);
}

// Ownership check for write operations
const userId = await getUserIdByUuid(uuid);
if (userId !== parseInt(session.user.id)) {
  return createErrorResponse("Forbidden", 403);
}
```

---

## 1. Athlete Metrics

### GET /api/profile/[uuid]/metrics

Retrieve athlete metrics for a user.

**Response 200:**

```json
{
  "id": 1,
  "userId": 123,
  "sprintSpeed30m": 4.5,
  "agilityTTest": 10.2,
  "beepTestLevel": 11,
  "beepTestShuttle": 4,
  "verticalJump": 65
}
```

**Response 404:** User has no metrics recorded (returns null/empty)

### PUT /api/profile/[uuid]/metrics

Create or update athlete metrics. Requires ownership.

**Request Body:**

```json
{
  "sprintSpeed30m": 4.5,
  "agilityTTest": 10.2,
  "beepTestLevel": 11,
  "beepTestShuttle": 4,
  "verticalJump": 65
}
```

**Validation:**

- sprintSpeed30m: number, 3.0-8.0, optional
- agilityTTest: number, 8.0-20.0, optional
- beepTestLevel: integer, 1-21, optional
- beepTestShuttle: integer, 1-16, optional
- verticalJump: integer, 10-150, optional

**Response 200:** Updated metrics object

---

## 2. Key Information

### PUT /api/profile/[uuid]/key-info

Update athlete key information (DOB, height, positions, strong foot). Requires ownership.

**Request Body:**

```json
{
  "dateOfBirth": "1998-03-15",
  "height": 185,
  "positionIds": [1, 3, 5],
  "strongFoot": "right"
}
```

**Validation:**

- dateOfBirth: ISO date string, optional
- height: integer, 100-250 cm
- positionIds: array of integers, max 3 positions
- strongFoot: "left" | "right" | "both"

**Response 200:** Updated user attributes

---

## 3. Experience

### GET /api/profile/[uuid]/experience

Retrieve all experience entries for a user, ordered by yearFrom DESC.

**Response 200:**

```json
{
  "experiences": [
    {
      "id": 1,
      "title": "Professional Player",
      "teamId": 5,
      "teamName": "Olympiacos FC",
      "yearFrom": 2020,
      "yearTo": null,
      "location": "Piraeus, Greece"
    }
  ]
}
```

### POST /api/profile/[uuid]/experience

Add new experience entry. Requires ownership.

**Request Body:**

```json
{
  "title": "Youth Academy",
  "teamId": 3,
  "yearFrom": 2015,
  "yearTo": 2018,
  "location": "Athens, Greece"
}
```

**Validation:**

- title: string, required, max 255 chars
- teamId: integer, required, must exist in teams table
- yearFrom: integer, required, >= 1950
- yearTo: integer, optional (null = Present), >= yearFrom
- location: string, optional, max 255 chars

**Response 201:** Created experience object

### PUT /api/profile/[uuid]/experience/[id]

Update experience entry. Requires ownership.

**Request Body:** Same as POST

**Response 200:** Updated experience object

### DELETE /api/profile/[uuid]/experience/[id]

Delete experience entry. Requires ownership.

**Response 200:** `{ "success": true }`

---

## 4. Education

### GET /api/profile/[uuid]/education

Retrieve all education entries for a user, ordered by yearFrom DESC.

**Response 200:**

```json
{
  "education": [
    {
      "id": 1,
      "title": "University of Athens",
      "subtitle": "Bachelor of Sports Science",
      "yearFrom": 2016,
      "yearTo": 2020
    }
  ]
}
```

### POST /api/profile/[uuid]/education

Add new education entry. Requires ownership.

**Request Body:**

```json
{
  "title": "University of Athens",
  "subtitle": "Bachelor of Sports Science",
  "yearFrom": 2016,
  "yearTo": 2020
}
```

**Validation:**

- title: string, required, max 255 chars
- subtitle: string, optional, max 255 chars
- yearFrom: integer, required, >= 1950
- yearTo: integer, optional (null = Present), >= yearFrom

**Response 201:** Created education object

### PUT /api/profile/[uuid]/education/[id]

Update education entry. Requires ownership.

**Response 200:** Updated education object

### DELETE /api/profile/[uuid]/education/[id]

Delete education entry. Requires ownership.

**Response 200:** `{ "success": true }`

---

## 5. Certifications

### GET /api/profile/[uuid]/certifications

Retrieve all certification entries for a user, ordered by year DESC.

**Response 200:**

```json
{
  "certifications": [
    {
      "id": 1,
      "title": "UEFA Pro License",
      "organization": "UEFA",
      "year": 2022,
      "description": "Highest coaching qualification"
    }
  ]
}
```

### POST /api/profile/[uuid]/certifications

Add new certification entry. Requires ownership.

**Request Body:**

```json
{
  "title": "UEFA Pro License",
  "organization": "UEFA",
  "year": 2022,
  "description": "Highest coaching qualification"
}
```

**Validation:**

- title: string, required, max 255 chars
- organization: string, optional, max 255 chars
- year: integer, required, >= 1950
- description: string, optional

**Response 201:** Created certification object

### PUT /api/profile/[uuid]/certifications/[id]

Update certification entry. Requires ownership.

**Response 200:** Updated certification object

### DELETE /api/profile/[uuid]/certifications/[id]

Delete certification entry. Requires ownership.

**Response 200:** `{ "success": true }`

---

## 6. Languages

### GET /api/profile/[uuid]/languages

Retrieve all language entries for a user.

**Response 200:**

```json
{
  "languages": [
    {
      "id": 1,
      "language": "Greek",
      "level": "native"
    },
    {
      "id": 2,
      "language": "English",
      "level": "fluent"
    }
  ]
}
```

### POST /api/profile/[uuid]/languages

Add new language entry. Requires ownership.

**Request Body:**

```json
{
  "language": "Spanish",
  "level": "intermediate"
}
```

**Validation:**

- language: string, required, max 100 chars
- level: enum, required, one of: "native", "fluent", "proficient", "intermediate", "basic"

**Response 201:** Created language object

### PUT /api/profile/[uuid]/languages/[id]

Update language entry. Requires ownership.

**Response 200:** Updated language object

### DELETE /api/profile/[uuid]/languages/[id]

Delete language entry. Requires ownership.

**Response 200:** `{ "success": true }`

---

## 7. Awards

### GET /api/profile/[uuid]/awards

Retrieve all award entries for a user, ordered by year DESC.

**Response 200:**

```json
{
  "awards": [
    {
      "id": 1,
      "title": "Best Player 2023",
      "year": 2023,
      "description": "Awarded by Greek Football Federation"
    }
  ]
}
```

### POST /api/profile/[uuid]/awards

Add new award entry. Requires ownership.

**Request Body:**

```json
{
  "title": "Top Scorer",
  "year": 2022,
  "description": "League top scorer with 25 goals"
}
```

**Validation:**

- title: string, required, max 255 chars
- year: integer, required, >= 1950
- description: string, optional

**Response 201:** Created award object

### PUT /api/profile/[uuid]/awards/[id]

Update award entry. Requires ownership.

**Response 200:** Updated award object

### DELETE /api/profile/[uuid]/awards/[id]

Delete award entry. Requires ownership.

**Response 200:** `{ "success": true }`

---

## 8. User Posts

### GET /api/profile/[uuid]/posts

Retrieve paginated posts for a user.

**Query Parameters:**

- limit: integer, default 20, max 50
- offset: integer, default 0

**Response 200:**

```json
{
  "posts": [
    {
      "id": 1,
      "publicUuid": "abc-123",
      "content": "Post content...",
      "createdAt": "2024-12-01T10:00:00Z",
      "updatedAt": "2024-12-01T10:00:00Z",
      "likeCount": 15,
      "commentCount": 3,
      "isLiked": false,
      "isSaved": false,
      "media": [],
      "user": {
        "id": 123,
        "publicUuid": "user-uuid",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe",
        "profileImageUrl": null
      }
    }
  ],
  "total": 25,
  "hasMore": true
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message",
  "details": {} // Optional validation details
}
```

**Common Status Codes:**

- 400: Bad Request (validation failed)
- 401: Unauthorized (not logged in)
- 403: Forbidden (not owner)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error
