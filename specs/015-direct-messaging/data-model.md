# Data Model: Direct Messaging

**Feature**: 015-direct-messaging  
**Date**: 2025-12-03

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────────────┐       ┌─────────────┐
│    User     │       │  ConversationParticipant │       │ Conversation│
├─────────────┤       ├──────────────────────────┤       ├─────────────┤
│ id (PK)     │◄──────┤ userId (FK)              │───────►│ id (PK)     │
│ username    │       │ conversationId (FK)      │       │ createdAt   │
│ ...         │       │ lastReadAt               │       │ updatedAt   │
└─────────────┘       │ joinedAt                 │       └──────┬──────┘
                      └──────────────────────────┘              │
                                                                │
                                                                ▼
                      ┌──────────────────────────┐       ┌─────────────┐
                      │      MessageMedia        │       │   Message   │
                      ├──────────────────────────┤       ├─────────────┤
                      │ id (PK)                  │◄──────┤ id (PK)     │
                      │ messageId (FK)           │       │ conversationId│
                      │ mediaType                │       │ senderId    │
                      │ url                      │       │ content     │
                      │ key                      │       │ createdAt   │
                      └──────────────────────────┘       └─────────────┘
```

## Prisma Schema Additions

```prisma
// ========================================
// Messaging Models
// ========================================

model Conversation {
  id        Int       @id @default(autoincrement())
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime? @default(now()) @map("updated_at") @db.Timestamptz(6)

  participants ConversationParticipant[]
  messages     Message[]

  @@index([updatedAt(sort: Desc)], map: "idx_conversations_updated_at")
  @@map("conversations")
}

model ConversationParticipant {
  id             Int       @id @default(autoincrement())
  lastReadAt     DateTime? @map("last_read_at") @db.Timestamptz(6)
  joinedAt       DateTime? @default(now()) @map("joined_at") @db.Timestamptz(6)

  conversationId Int          @map("conversation_id")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId         Int          @map("user_id")
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([conversationId, userId])
  @@index([userId], map: "idx_conversation_participants_user_id")
  @@index([conversationId], map: "idx_conversation_participants_conversation_id")
  @@map("conversation_participants")
}

model Message {
  id        Int       @id @default(autoincrement())
  content   String?   @db.VarChar(500)
  createdAt DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)

  conversationId Int          @map("conversation_id")
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       Int          @map("sender_id")
  sender         User         @relation(fields: [senderId], references: [id], onDelete: Cascade)

  media MessageMedia[]

  @@index([conversationId, createdAt(sort: Desc)], map: "idx_messages_conversation_created")
  @@index([senderId], map: "idx_messages_sender_id")
  @@map("messages")
}

model MessageMedia {
  id         Int     @id @default(autoincrement())
  mediaType  String  @map("media_type") @db.VarChar(10)
  url        String?
  key        String?
  orderIndex Int?    @default(0) @map("order_index")

  messageId Int     @map("message_id")
  message   Message @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@map("message_media")
}
```

## User Model Updates

Add to existing User model:

```prisma
model User {
  // ... existing fields ...

  // Messaging
  conversationParticipants ConversationParticipant[]
  messagesSent             Message[]

  // ... existing fields ...
}
```

## Field Specifications

### Conversation

| Field     | Type     | Constraints                 | Description                   |
| --------- | -------- | --------------------------- | ----------------------------- |
| id        | Int      | PK, auto-increment          | Unique identifier             |
| createdAt | DateTime | Default: now()              | When conversation was created |
| updatedAt | DateTime | Default: now(), auto-update | Last activity timestamp       |

### ConversationParticipant

| Field          | Type     | Constraints        | Description                   |
| -------------- | -------- | ------------------ | ----------------------------- |
| id             | Int      | PK, auto-increment | Unique identifier             |
| conversationId | Int      | FK → Conversation  | Parent conversation           |
| userId         | Int      | FK → User          | Participant user              |
| lastReadAt     | DateTime | Nullable           | When user last read messages  |
| joinedAt       | DateTime | Default: now()     | When user joined conversation |

**Unique Constraint**: (conversationId, userId) - prevents duplicate participants

### Message

| Field          | Type     | Constraints             | Description         |
| -------------- | -------- | ----------------------- | ------------------- |
| id             | Int      | PK, auto-increment      | Unique identifier   |
| conversationId | Int      | FK → Conversation       | Parent conversation |
| senderId       | Int      | FK → User               | Message sender      |
| content        | String   | Max 500 chars, nullable | Text content        |
| createdAt      | DateTime | Default: now()          | When sent           |

**Note**: Content is nullable to support media-only messages

### MessageMedia

| Field      | Type   | Constraints        | Description            |
| ---------- | ------ | ------------------ | ---------------------- |
| id         | Int    | PK, auto-increment | Unique identifier      |
| messageId  | Int    | FK → Message       | Parent message         |
| mediaType  | String | Max 10 chars       | "image" or "video"     |
| url        | String | Nullable           | Public URL for display |
| key        | String | Nullable           | R2 storage key         |
| orderIndex | Int    | Default: 0         | Display order          |

## Indexes

| Table                     | Index                            | Purpose                           |
| ------------------------- | -------------------------------- | --------------------------------- |
| conversations             | updatedAt DESC                   | Sort by recent activity           |
| conversation_participants | userId                           | Find user's conversations         |
| conversation_participants | conversationId                   | Find conversation participants    |
| messages                  | (conversationId, createdAt DESC) | Paginate messages in conversation |
| messages                  | senderId                         | Find user's sent messages         |

## Query Patterns

### Get User's Conversations (sorted by recent)

```sql
SELECT c.*,
       (SELECT m.* FROM messages m WHERE m.conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
       (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.created_at > cp.last_read_at) as unread_count
FROM conversations c
JOIN conversation_participants cp ON cp.conversation_id = c.id
WHERE cp.user_id = :userId
ORDER BY c.updated_at DESC
LIMIT 20;
```

### Get Unread Message Count (Total)

```sql
SELECT SUM(
  (SELECT COUNT(*) FROM messages m
   WHERE m.conversation_id = cp.conversation_id
   AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
   AND m.sender_id != :userId)
) as total_unread
FROM conversation_participants cp
WHERE cp.user_id = :userId;
```

### Get or Create Conversation Between Two Users

```sql
-- Find existing conversation
SELECT c.id FROM conversations c
WHERE (SELECT COUNT(*) FROM conversation_participants cp
       WHERE cp.conversation_id = c.id
       AND cp.user_id IN (:user1, :user2)) = 2
AND (SELECT COUNT(*) FROM conversation_participants cp
     WHERE cp.conversation_id = c.id) = 2
LIMIT 1;

-- If not found, create new
INSERT INTO conversations DEFAULT VALUES RETURNING id;
INSERT INTO conversation_participants (conversation_id, user_id) VALUES (:id, :user1), (:id, :user2);
```

## Validation Rules

1. **Message Content**: 0-500 characters (empty allowed for media-only)
2. **Media Files**: Max 100MB, types: JPEG, PNG, WebP, MP4, WebM
3. **Participants**: Exactly 2 users per conversation (for DM feature)
4. **Connection Required**: Both users must have accepted connection status
5. **Send Permission**: Only participants can send messages to a conversation
