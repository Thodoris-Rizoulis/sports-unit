# Data Model: Global Header

## Overview

The global header feature primarily interacts with the existing User entity for search functionality. No new entities are required.

## User Entity

### Core Fields

- `id`: number (primary key, auto-increment)
- `publicUuid`: string (UUID v4, unique, used in profile URLs)
- `firstName`: string (required, 2-50 characters)
- `lastName`: string (required, 2-50 characters)
- `username`: string (required, unique, 3-30 characters, alphanumeric + underscore)

### Search-Relevant Fields

- `profileImageUrl`: string (optional, for search result display)

### Relationships

- None additional required for this feature

### Validation Rules

- **firstName/lastName**: Required, 2-50 characters, alphabetic characters and spaces only
- **username**: Required, unique, 3-30 characters, starts with letter, contains only alphanumeric and underscore
- **publicUuid**: Required, valid UUID v4 format

### Search Implementation

- Full-text search vector: `to_tsvector('english', first_name || ' ' || last_name || ' ' || username)`
- Search query: `@@ plainto_tsquery('english', :searchTerm)`
- Results ordered by relevance (ts_rank) and limited to 10 by default

### Indexes

- Existing unique index on `username`
- Existing unique index on `publicUuid`
- **New**: GIN index on full-text search vector for performance

## Data Flow

1. User types in search bar → debounced API call
2. API validates query parameter with Zod
3. Service executes full-text search query
4. Results transformed to match expected format
5. Client displays results as profile links

## Schema Updates

No schema changes required - leverages existing user table structure.
