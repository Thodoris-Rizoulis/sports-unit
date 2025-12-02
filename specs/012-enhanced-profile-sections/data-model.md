# Data Model: Enhanced User Profile Sections

**Feature**: 012-enhanced-profile-sections  
**Date**: December 2, 2025

## Entity Relationship Overview

```
┌──────────────────┐
│      User        │
│  (users table)   │
└────────┬─────────┘
         │
         │ 1:1
         ▼
┌──────────────────┐
│ AthleteMetrics   │
│(athlete_metrics) │
└──────────────────┘

┌──────────────────┐
│      User        │
└────────┬─────────┘
         │ 1:N
         ├─────────────────┬─────────────────┬─────────────────┬─────────────────┐
         ▼                 ▼                 ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ UserExperience   │ │  UserEducation   │ │UserCertification │ │  UserLanguage    │ │   UserAward      │
│(user_experiences)│ │ (user_education) │ │(user_certifications)│ │ (user_languages) │ │  (user_awards)   │
└────────┬─────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
         │
         │ N:1
         ▼
┌──────────────────┐
│      Team        │
│  (teams table)   │
└──────────────────┘
```

## New Tables

### 1. athlete_metrics

Stores performance metrics for athletes. One record per user.

| Column            | Type         | Nullable | Constraints                              | Description                    |
| ----------------- | ------------ | -------- | ---------------------------------------- | ------------------------------ |
| id                | SERIAL       | No       | PRIMARY KEY                              | Auto-increment ID              |
| user_id           | INTEGER      | No       | UNIQUE, FK → users(id) ON DELETE CASCADE | One-to-one with users          |
| sprint_speed_30m  | DECIMAL(4,2) | Yes      | CHECK (3.0 <= val <= 8.0)                | Sprint time in seconds         |
| agility_t_test    | DECIMAL(4,2) | Yes      | CHECK (8.0 <= val <= 20.0)               | T-test time in seconds         |
| beep_test_level   | INTEGER      | Yes      | CHECK (1 <= val <= 21)                   | Beep test level                |
| beep_test_shuttle | INTEGER      | Yes      | CHECK (1 <= val <= 16)                   | Beep test shuttle within level |
| vertical_jump     | INTEGER      | Yes      | CHECK (10 <= val <= 150)                 | Vertical jump in cm            |
| created_at        | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                            | Creation timestamp             |
| updated_at        | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                            | Last update timestamp          |

**Indexes**:

- `athlete_metrics_user_id_key` (UNIQUE) on user_id

### 2. user_experiences

Stores career/playing history entries.

| Column     | Type         | Nullable | Constraints                             | Description               |
| ---------- | ------------ | -------- | --------------------------------------- | ------------------------- |
| id         | SERIAL       | No       | PRIMARY KEY                             | Auto-increment ID         |
| user_id    | INTEGER      | No       | FK → users(id) ON DELETE CASCADE        | Owner of experience       |
| title      | VARCHAR(255) | No       |                                         | Job/role title            |
| team_id    | INTEGER      | No       | FK → teams(id) ON DELETE RESTRICT       | Associated team           |
| year_from  | INTEGER      | No       | CHECK (val >= 1950)                     | Start year                |
| year_to    | INTEGER      | Yes      | CHECK (val >= year_from OR val IS NULL) | End year (NULL = Present) |
| location   | VARCHAR(255) | Yes      |                                         | Location text             |
| created_at | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                           | Creation timestamp        |
| updated_at | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                           | Last update timestamp     |

**Indexes**:

- `idx_user_experiences_user_id` on user_id
- `idx_user_experiences_year_from` on year_from DESC

### 3. user_education

Stores educational background entries.

| Column     | Type         | Nullable | Constraints                             | Description               |
| ---------- | ------------ | -------- | --------------------------------------- | ------------------------- |
| id         | SERIAL       | No       | PRIMARY KEY                             | Auto-increment ID         |
| user_id    | INTEGER      | No       | FK → users(id) ON DELETE CASCADE        | Owner of education        |
| title      | VARCHAR(255) | No       |                                         | Institution name          |
| subtitle   | VARCHAR(255) | Yes      |                                         | Degree/program name       |
| year_from  | INTEGER      | No       | CHECK (val >= 1950)                     | Start year                |
| year_to    | INTEGER      | Yes      | CHECK (val >= year_from OR val IS NULL) | End year (NULL = Present) |
| created_at | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                           | Creation timestamp        |
| updated_at | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                           | Last update timestamp     |

**Indexes**:

- `idx_user_education_user_id` on user_id
- `idx_user_education_year_from` on year_from DESC

### 4. user_certifications

Stores professional licenses and certifications (primarily for coaches).

| Column       | Type         | Nullable | Constraints                      | Description            |
| ------------ | ------------ | -------- | -------------------------------- | ---------------------- |
| id           | SERIAL       | No       | PRIMARY KEY                      | Auto-increment ID      |
| user_id      | INTEGER      | No       | FK → users(id) ON DELETE CASCADE | Owner of certification |
| title        | VARCHAR(255) | No       |                                  | Certification name     |
| organization | VARCHAR(255) | Yes      |                                  | Issuing organization   |
| year         | INTEGER      | No       | CHECK (val >= 1950)              | Year obtained          |
| description  | TEXT         | Yes      |                                  | Additional details     |
| created_at   | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                    | Creation timestamp     |
| updated_at   | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                    | Last update timestamp  |

**Indexes**:

- `idx_user_certifications_user_id` on user_id
- `idx_user_certifications_year` on year DESC

### 5. user_languages

Stores language proficiency entries.

| Column     | Type         | Nullable | Constraints                                                              | Description        |
| ---------- | ------------ | -------- | ------------------------------------------------------------------------ | ------------------ |
| id         | SERIAL       | No       | PRIMARY KEY                                                              | Auto-increment ID  |
| user_id    | INTEGER      | No       | FK → users(id) ON DELETE CASCADE                                         | Owner of language  |
| language   | VARCHAR(100) | No       |                                                                          | Language name      |
| level      | VARCHAR(20)  | No       | CHECK (level IN ('native','fluent','proficient','intermediate','basic')) | Proficiency level  |
| created_at | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                                                            | Creation timestamp |

**Indexes**:

- `idx_user_languages_user_id` on user_id

### 6. user_awards

Stores awards and achievements.

| Column      | Type         | Nullable | Constraints                      | Description        |
| ----------- | ------------ | -------- | -------------------------------- | ------------------ |
| id          | SERIAL       | No       | PRIMARY KEY                      | Auto-increment ID  |
| user_id     | INTEGER      | No       | FK → users(id) ON DELETE CASCADE | Owner of award     |
| title       | VARCHAR(255) | No       |                                  | Award name         |
| year        | INTEGER      | No       | CHECK (val >= 1950)              | Year received      |
| description | TEXT         | Yes      |                                  | Additional details |
| created_at  | TIMESTAMPTZ  | Yes      | DEFAULT NOW()                    | Creation timestamp |

**Indexes**:

- `idx_user_awards_user_id` on user_id
- `idx_user_awards_year` on year DESC

## Prisma Schema Additions

```prisma
// ========================================
// Enhanced Profile Models
// ========================================

model AthleteMetrics {
  id              Int       @id @default(autoincrement())
  sprintSpeed30m  Decimal?  @map("sprint_speed_30m") @db.Decimal(4, 2)
  agilityTTest    Decimal?  @map("agility_t_test") @db.Decimal(4, 2)
  beepTestLevel   Int?      @map("beep_test_level")
  beepTestShuttle Int?      @map("beep_test_shuttle")
  verticalJump    Int?      @map("vertical_jump")
  createdAt       DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime? @default(now()) @map("updated_at") @db.Timestamptz(6)

  userId Int  @unique @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@map("athlete_metrics")
}

model UserExperience {
  id        Int       @id @default(autoincrement())
  title     String    @db.VarChar(255)
  yearFrom  Int       @map("year_from")
  yearTo    Int?      @map("year_to")
  location  String?   @db.VarChar(255)
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime? @default(now()) @map("updated_at") @db.Timestamptz(6)

  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  teamId Int  @map("team_id")
  team   Team @relation(fields: [teamId], references: [id], onDelete: Restrict, onUpdate: NoAction)

  @@index([userId], map: "idx_user_experiences_user_id")
  @@index([yearFrom(sort: Desc)], map: "idx_user_experiences_year_from")
  @@map("user_experiences")
}

model UserEducation {
  id        Int       @id @default(autoincrement())
  title     String    @db.VarChar(255)
  subtitle  String?   @db.VarChar(255)
  yearFrom  Int       @map("year_from")
  yearTo    Int?      @map("year_to")
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime? @default(now()) @map("updated_at") @db.Timestamptz(6)

  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([userId], map: "idx_user_education_user_id")
  @@index([yearFrom(sort: Desc)], map: "idx_user_education_year_from")
  @@map("user_education")
}

model UserCertification {
  id           Int       @id @default(autoincrement())
  title        String    @db.VarChar(255)
  organization String?   @db.VarChar(255)
  year         Int
  description  String?
  createdAt    DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime? @default(now()) @map("updated_at") @db.Timestamptz(6)

  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([userId], map: "idx_user_certifications_user_id")
  @@index([year(sort: Desc)], map: "idx_user_certifications_year")
  @@map("user_certifications")
}

enum LanguageLevel {
  native
  fluent
  proficient
  intermediate
  basic

  @@map("language_level_enum")
}

model UserLanguage {
  id        Int           @id @default(autoincrement())
  language  String        @db.VarChar(100)
  level     LanguageLevel
  createdAt DateTime?     @default(now()) @map("created_at") @db.Timestamptz(6)

  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([userId], map: "idx_user_languages_user_id")
  @@map("user_languages")
}

model UserAward {
  id          Int       @id @default(autoincrement())
  title       String    @db.VarChar(255)
  year        Int
  description String?
  createdAt   DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)

  userId Int  @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([userId], map: "idx_user_awards_user_id")
  @@index([year(sort: Desc)], map: "idx_user_awards_year")
  @@map("user_awards")
}
```

## User Model Updates

Add new relations to existing User model:

```prisma
model User {
  // ... existing fields ...

  // Enhanced Profile Relations (new)
  athleteMetrics  AthleteMetrics?
  experiences     UserExperience[]
  education       UserEducation[]
  certifications  UserCertification[]
  languages       UserLanguage[]
  awards          UserAward[]
}
```

## Team Model Updates

Add experience relation to existing Team model:

```prisma
model Team {
  // ... existing fields ...

  // Enhanced Profile Relations (new)
  experiences UserExperience[]
}
```

## TypeScript Types (types/prisma.ts additions)

```typescript
// ========================================
// Enhanced Profile UI Types
// ========================================

/**
 * Extended UserProfile with role information
 */
export type UserProfile = {
  // ... existing fields ...
  roleId: number | null;
  roleName: string | null; // 'athlete' | 'coach' | 'scout'

  // Key Information fields (for athlete)
  dateOfBirth: Date | null;
  height: number | null;
  positions: number[] | null; // Position IDs
  strongFoot: string | null;
};

/**
 * Athlete metrics for display
 */
export type AthleteMetricsUI = {
  id: number;
  userId: number;
  sprintSpeed30m: number | null;
  agilityTTest: number | null;
  beepTestLevel: number | null;
  beepTestShuttle: number | null;
  verticalJump: number | null;
};

/**
 * Experience entry for display
 */
export type ExperienceUI = {
  id: number;
  title: string;
  teamId: number;
  teamName: string;
  yearFrom: number;
  yearTo: number | null; // null = Present
  location: string | null;
};

/**
 * Education entry for display
 */
export type EducationUI = {
  id: number;
  title: string; // Institution name
  subtitle: string | null; // Degree/program
  yearFrom: number;
  yearTo: number | null; // null = Present
};

/**
 * Certification entry for display
 */
export type CertificationUI = {
  id: number;
  title: string;
  organization: string | null;
  year: number;
  description: string | null;
};

/**
 * Language entry for display
 */
export type LanguageUI = {
  id: number;
  language: string;
  level: "native" | "fluent" | "proficient" | "intermediate" | "basic";
};

/**
 * Award entry for display
 */
export type AwardUI = {
  id: number;
  title: string;
  year: number;
  description: string | null;
};
```

## Validation Considerations

- All foreign keys use ON DELETE CASCADE for user cleanup
- Team deletion restricted if referenced by experiences (ON DELETE RESTRICT)
- Year constraints prevent invalid ranges (year_to >= year_from when not null)
- Metric ranges enforced at API level via Zod (DB CHECK constraints optional)
- Language level enforced via enum
