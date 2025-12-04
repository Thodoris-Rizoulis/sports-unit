# API Contracts: Direct Messaging

**Feature**: 015-direct-messaging  
**Date**: 2025-12-03  
**Base Path**: `/api/messages`

## REST Endpoints

### 1. List Conversations

**GET** `/api/messages/conversations`

List all conversations for the authenticated user, sorted by most recent activity.

**Query Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| limit | number | No | 20 | Max conversations to return |
| cursor | number | No | - | Conversation ID for cursor-based pagination |
| search | string | No | - | Filter by other participant's name |

**Response**: `200 OK`

```typescript
{
  conversations: Array<{
    id: number;
    otherUser: {
      id: number;
      publicUuid: string;
      username: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
    };
    lastMessage: {
      id: number;
      content: string | null;
      senderId: number;
      createdAt: string; // ISO timestamp
      hasMedia: boolean;
    } | null;
    unreadCount: number;
    updatedAt: string; // ISO timestamp
  }>;
  nextCursor: number | null;
  hasMore: boolean;
}
```

**Errors**:

- `401 Unauthorized`: Not authenticated

---

### 2. Get or Create Conversation

**POST** `/api/messages/conversations`

Get an existing conversation with a user, or create one if it doesn't exist.
Validates that users are connected before creating.

**Request Body**:

```typescript
{
  userId: number; // The other user's ID
}
```

**Response**: `200 OK` (existing) or `201 Created` (new)

```typescript
{
  id: number;
  otherUser: {
    id: number;
    publicUuid: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  }
  isNew: boolean;
}
```

**Errors**:

- `400 Bad Request`: Invalid userId
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Users are not connected
- `404 Not Found`: User not found

---

### 3. Get Conversation with Messages

**GET** `/api/messages/conversations/[id]`

Get a single conversation with paginated messages.

**Path Parameters**:
| Name | Type | Description |
|------|------|-------------|
| id | number | Conversation ID |

**Query Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| limit | number | No | 20 | Max messages to return |
| cursor | number | No | - | Message ID for cursor-based pagination |

**Response**: `200 OK`

```typescript
{
  id: number;
  otherUser: {
    id: number;
    publicUuid: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  }
  messages: Array<{
    id: number;
    content: string | null;
    senderId: number;
    createdAt: string; // ISO timestamp
    media: Array<{
      id: number;
      mediaType: string;
      url: string | null;
    }>;
  }>;
  nextCursor: number | null;
  hasMore: boolean;
}
```

**Errors**:

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not a participant
- `404 Not Found`: Conversation not found

---

### 4. Send Message

**POST** `/api/messages/conversations/[id]`

Send a message to a conversation. Either content or mediaUrl must be provided.

**Path Parameters**:
| Name | Type | Description |
|------|------|-------------|
| id | number | Conversation ID |

**Request Body**:

```typescript
{
  content?: string;     // Max 500 characters
  mediaUrl?: string;    // Pre-uploaded media URL
  mediaKey?: string;    // R2 storage key
  mediaType?: string;   // "image" or "video"
}
```

**Response**: `201 Created`

```typescript
{
  id: number;
  content: string | null;
  senderId: number;
  createdAt: string; // ISO timestamp
  media: Array<{
    id: number;
    mediaType: string;
    url: string | null;
  }>;
}
```

**Errors**:

- `400 Bad Request`: Invalid content (too long) or missing content/media
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not a participant or users no longer connected
- `404 Not Found`: Conversation not found

---

### 5. Get Unread Count

**GET** `/api/messages/unread-count`

Get total unread message count for the authenticated user.

**Response**: `200 OK`

```typescript
{
  count: number;
}
```

**Errors**:

- `401 Unauthorized`: Not authenticated

---

### 6. Mark Conversation as Read

**POST** `/api/messages/conversations/[id]/read`

Mark all messages in a conversation as read (updates lastReadAt).

**Path Parameters**:
| Name | Type | Description |
|------|------|-------------|
| id | number | Conversation ID |

**Response**: `200 OK`

```typescript
{
  success: boolean;
}
```

**Errors**:

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not a participant
- `404 Not Found`: Conversation not found

---

### 7. Get Recent Messages (for Dropdown)

**GET** `/api/messages/recent`

Get most recent messages across all conversations for header dropdown.

**Query Parameters**:
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| limit | number | No | 10 | Max messages to return |

**Response**: `200 OK`

```typescript
{
  messages: Array<{
    id: number;
    conversationId: number;
    content: string | null;
    hasMedia: boolean;
    createdAt: string; // ISO timestamp
    sender: {
      id: number;
      publicUuid: string;
      username: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string | null;
    };
  }>;
}
```

**Errors**:

- `401 Unauthorized`: Not authenticated

---

## WebSocket Events

### Connection

**Namespace**: `/messaging`

**Authentication**:

- Send NextAuth session token in handshake auth
- Server validates and attaches userId to socket

### Client → Server Events

#### join-conversation

Join a conversation room to receive messages.

```typescript
{
  conversationId: number;
}
```

#### leave-conversation

Leave a conversation room.

```typescript
{
  conversationId: number;
}
```

#### send-message

Send a new message (alternative to REST API).

```typescript
{
  conversationId: number;
  content?: string;
  mediaUrl?: string;
  mediaKey?: string;
  mediaType?: string;
}
```

### Server → Client Events

#### new-message

Received when a new message is sent in a joined conversation.

```typescript
{
  id: number;
  conversationId: number;
  content: string | null;
  senderId: number;
  createdAt: string;
  media: Array<{
    id: number;
    mediaType: string;
    url: string | null;
  }>;
}
```

#### unread-count

Received when unread count changes (new message or marked as read elsewhere).

```typescript
{
  count: number;
}
```

> **Note on Badge Behavior**: The unread badge reflects actual unread message count from the database. Opening the dropdown does NOT call an API to mark messages as read - it only hides the badge visually. The badge reappears when `unread-count` events indicate new messages. Users must open specific conversations (triggering `POST /conversations/[id]/read`) to actually mark messages as read.

#### message-error

Received when message send fails.

```typescript
{
  error: string;
  conversationId: number;
}
```

#### connection-status-changed

Received when connection with other user changes (for disabling send).

```typescript
{
  conversationId: number;
  isConnected: boolean;
}
```
