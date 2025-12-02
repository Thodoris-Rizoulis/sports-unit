# Data Model: Add a connections feature to the sports social platform

**Date**: November 30, 2025
**Feature**: specs/008-user-connections/spec.md

## Overview

The connections feature introduces a new `connections` table to track user relationships, following a LinkedIn-style mutual connection model with request/accept flow.

## Entities

### User (Existing)

- **Purpose**: Platform users who can send/receive connection requests
- **Key Fields**: id, email, username, role_id, public_uuid
- **Relationships**: One-to-many with connections (as requester or recipient)

### Connection (New)

- **Purpose**: Represents a connection relationship between two users
- **Status Lifecycle**: pending → accepted | declined
- **Uniqueness**: Unique constraint on (requester_id, recipient_id) prevents duplicate requests
- **Directionality**: requester sends request, recipient receives and responds

## Schema Design

### connections table

```sql
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status connection_status_enum NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, recipient_id)
);

-- Enum for connection status
CREATE TYPE connection_status_enum AS ENUM ('pending', 'accepted', 'declined');

-- Indexes for performance
CREATE INDEX idx_connections_requester_status ON connections(requester_id, status);
CREATE INDEX idx_connections_recipient_status ON connections(recipient_id, status);
CREATE INDEX idx_connections_status ON connections(status);
```

## Relationships

### User ↔ Connection

- **One-to-Many**: Each user can have multiple connections as requester
- **One-to-Many**: Each user can have multiple connections as recipient
- **Mutual**: When status = 'accepted', both users are "connected"
- **Cascade Delete**: Deleting a user removes all their connections

## Data Integrity Rules

1. **No Self-Connections**: requester_id ≠ recipient_id (enforced in application logic)
2. **Unique Pairs**: Only one connection record per user pair
3. **Status Transitions**: pending → accepted OR pending → declined (no reversals)
4. **Mutual Connections**: accepted status creates bidirectional relationship

## Query Patterns

### Get User's Connections

```sql
SELECT c.*, u.username, u.public_uuid
FROM connections c
JOIN users u ON (c.recipient_id = u.id OR c.requester_id = u.id)
WHERE (c.requester_id = $userId OR c.recipient_id = $userId)
  AND c.status = 'accepted'
  AND u.id != $userId
ORDER BY c.created_at DESC
LIMIT $limit OFFSET $offset;
```

### Check Connection Status

```sql
SELECT status,
       CASE WHEN requester_id = $userId THEN 'sent' ELSE 'received' END as direction
FROM connections
WHERE (requester_id = $userId AND recipient_id = $targetId)
   OR (requester_id = $targetId AND recipient_id = $userId);
```

### Get Pending Requests

```sql
SELECT c.*, u.username, u.public_uuid
FROM connections c
JOIN users u ON c.requester_id = u.id
WHERE c.recipient_id = $userId AND c.status = 'pending'
ORDER BY c.created_at DESC;
```

## Migration Strategy

1. Create enum type
2. Create connections table with constraints
3. Add indexes
4. Update existing user search queries to include connection status
5. Backfill any existing implicit connections (if applicable)

## Performance Considerations

- Indexes on frequently queried fields (requester_id, recipient_id, status)
- Pagination for connections lists (default 20 per page)
- Connection status caching in application layer
- Avoid N+1 queries by joining user data in connection queries
