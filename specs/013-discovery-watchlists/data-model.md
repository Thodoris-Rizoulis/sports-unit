# Data Model: Discovery Page & Watchlists

**Feature**: 013-discovery-watchlists  
**Date**: 2025-12-03

## New Entities

### Watchlist

A named collection of athletes owned by a user.

| Field       | Type        | Constraints             | Description            |
| ----------- | ----------- | ----------------------- | ---------------------- |
| id          | integer     | PK, auto-increment      | Unique identifier      |
| userId      | integer     | FK → users.id, NOT NULL | Owner of the watchlist |
| name        | string(100) | NOT NULL                | Watchlist name         |
| description | string(500) | nullable                | Optional description   |
| createdAt   | timestamp   | DEFAULT NOW()           | Creation timestamp     |
| updatedAt   | timestamp   | DEFAULT NOW()           | Last update timestamp  |

**Indexes**:

- `idx_watchlists_user_id` on (userId) - for fetching user's watchlists

**Relationships**:

- Belongs to User (many-to-one)
- Has many WatchlistAthletes (one-to-many)

---

### WatchlistAthlete

Junction table linking watchlists to athletes (users).

| Field       | Type      | Constraints                  | Description            |
| ----------- | --------- | ---------------------------- | ---------------------- |
| id          | integer   | PK, auto-increment           | Unique identifier      |
| watchlistId | integer   | FK → watchlists.id, NOT NULL | Parent watchlist       |
| athleteId   | integer   | FK → users.id, NOT NULL      | Athlete being watched  |
| addedAt     | timestamp | DEFAULT NOW()                | When athlete was added |

**Constraints**:

- UNIQUE (watchlistId, athleteId) - prevent duplicates

**Indexes**:

- `idx_watchlist_athletes_watchlist_id` on (watchlistId)
- `idx_watchlist_athletes_athlete_id` on (athleteId)

**Relationships**:

- Belongs to Watchlist (many-to-one)
- Belongs to User as athlete (many-to-one)

**Cascade Behavior**:

- ON DELETE CASCADE from Watchlist (delete watchlist → delete all entries)
- ON DELETE CASCADE from User (delete athlete → remove from all watchlists)

---

## Prisma Schema Additions

```prisma
model Watchlist {
  id          Int       @id @default(autoincrement())
  name        String    @db.VarChar(100)
  description String?   @db.VarChar(500)
  createdAt   DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime? @default(now()) @map("updated_at") @db.Timestamptz(6)

  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  athletes WatchlistAthlete[]

  @@index([userId], map: "idx_watchlists_user_id")
  @@map("watchlists")
}

model WatchlistAthlete {
  id      Int       @id @default(autoincrement())
  addedAt DateTime? @default(now()) @map("added_at") @db.Timestamptz(6)

  watchlistId Int       @map("watchlist_id")
  watchlist   Watchlist @relation(fields: [watchlistId], references: [id], onDelete: Cascade)

  athleteId Int  @map("athlete_id")
  athlete   User @relation("WatchedAthletes", fields: [athleteId], references: [id], onDelete: Cascade)

  @@unique([watchlistId, athleteId])
  @@index([watchlistId], map: "idx_watchlist_athletes_watchlist_id")
  @@index([athleteId], map: "idx_watchlist_athletes_athlete_id")
  @@map("watchlist_athletes")
}
```

**User Model Additions**:

```prisma
model User {
  // ... existing fields ...

  // Watchlists owned by this user
  watchlists Watchlist[]

  // Watchlist entries where this user is the athlete
  watchedBy WatchlistAthlete[] @relation("WatchedAthletes")
}
```

---

## Discovery Filter Entity (Type Only - No DB Table)

Used for validating and passing filter criteria. Not persisted.

| Field               | Type                                   | Description                        |
| ------------------- | -------------------------------------- | ---------------------------------- |
| sportId             | number?                                | Filter by sport                    |
| positionId          | number?                                | Filter by position                 |
| strongFoot          | 'left' \| 'right' \| 'both'?           | Filter by dominant foot            |
| openToOpportunities | boolean?                               | Filter by availability status      |
| heightMin           | number?                                | Minimum height in cm               |
| heightMax           | number?                                | Maximum height in cm               |
| ageMin              | number?                                | Minimum age in years               |
| ageMax              | number?                                | Maximum age in years               |
| location            | string?                                | Filter by location (partial match) |
| sprintSpeed30mMin   | number?                                | Min sprint speed                   |
| sprintSpeed30mMax   | number?                                | Max sprint speed                   |
| agilityTTestMin     | number?                                | Min agility time                   |
| agilityTTestMax     | number?                                | Max agility time                   |
| beepTestLevelMin    | number?                                | Min beep test level                |
| beepTestLevelMax    | number?                                | Max beep test level                |
| verticalJumpMin     | number?                                | Min vertical jump                  |
| verticalJumpMax     | number?                                | Max vertical jump                  |
| sort                | 'recent' \| 'alphabetical' \| 'newest' | Sort order (default: recent)       |
| page                | number                                 | Page number (default: 1)           |
| limit               | number                                 | Results per page (default: 20)     |

---

## State Transitions

### Watchlist Lifecycle

```
[Not Exists] --create--> [Created] --update--> [Updated] --delete--> [Deleted]
```

### WatchlistAthlete Lifecycle

```
[Not in watchlist] --add--> [In watchlist] --remove--> [Not in watchlist]
```

**Validation Rules**:

- Cannot add same athlete to same watchlist twice (unique constraint)
- Only watchlist owner can add/remove athletes
- Deleting watchlist removes all athlete associations

---

## Validation Rules

### Watchlist

- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters

### Discovery Filters

- Height range: 100-250 cm (from VALIDATION_CONSTANTS)
- Age range: Practical bounds (e.g., 10-100)
- Metric ranges: As defined in VALIDATION_CONSTANTS.ATHLETE_METRICS
- Sort: Must be one of 'recent', 'alphabetical', 'newest'
- Page: Positive integer
- Limit: 1-100 (default 20)
