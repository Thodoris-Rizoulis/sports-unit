# API Contracts: Notifications

**Date**: 2025-12-03  
**Feature**: 014-notifications

## Base URL

```
/api/notifications
```

## Authentication

All endpoints require authentication via NextAuth.js session cookie.

---

## GET /api/notifications

Fetch paginated notifications for the authenticated user.

### Query Parameters

| Parameter | Type    | Required | Default | Description                                         |
| --------- | ------- | -------- | ------- | --------------------------------------------------- |
| limit     | number  | No       | 15      | Number of notifications to return (1-50)            |
| cursor    | number  | No       | -       | ID of last notification for cursor-based pagination |
| grouped   | boolean | No       | true    | Whether to group similar notifications              |

### Response

**Status**: 200 OK

```typescript
{
  notifications: GroupedNotification[];
  nextCursor: number | null;
  hasMore: boolean;
}
```

### GroupedNotification Schema

```typescript
{
  id: number;
  type: 'CONNECTION_REQUEST' | 'POST_LIKE' | 'POST_COMMENT';
  entityType: string;
  entityId: number;
  entityPublicUuid?: string; // For posts
  isRead: boolean;
  createdAt: string; // ISO 8601
  actor: {
    id: number;
    publicUuid: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
  };
  otherActors: UserSummary[]; // Additional actors if grouped
  count: number; // Total in group (1 if not grouped)
}
```

### Error Responses

| Status | Description                     |
| ------ | ------------------------------- |
| 401    | Unauthorized - no valid session |
| 500    | Internal server error           |

---

## GET /api/notifications/unread-count

Get the count of unread notifications for the authenticated user.

### Response

**Status**: 200 OK

```typescript
{
  count: number;
}
```

### Error Responses

| Status | Description                     |
| ------ | ------------------------------- |
| 401    | Unauthorized - no valid session |
| 500    | Internal server error           |

---

## POST /api/notifications/mark-read

Mark all notifications as read for the authenticated user.

### Request Body

None required.

### Response

**Status**: 200 OK

```typescript
{
  success: true;
  markedCount: number;
}
```

### Error Responses

| Status | Description                     |
| ------ | ------------------------------- |
| 401    | Unauthorized - no valid session |
| 500    | Internal server error           |

---

## GET /api/notifications/stream

Server-Sent Events endpoint for real-time notification updates.

### Headers

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### Event Types

#### `notification`

Sent when a new notification is created for the user.

```typescript
event: notification;
data: {
  notification: GroupedNotification;
  unreadCount: number;
}
```

#### `ping`

Sent every 30 seconds to keep connection alive.

```typescript
event: ping;
data: {
}
```

### Connection Behavior

- Connection requires valid session cookie
- Server polls for new notifications every 5 seconds
- Client should reconnect on disconnect with exponential backoff
- Connection closes if session expires

### Error Responses

| Status | Description                                         |
| ------ | --------------------------------------------------- |
| 401    | Unauthorized - no valid session (connection closed) |

---

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Notifications API
  version: 1.0.0
  description: API for managing user notifications

paths:
  /api/notifications:
    get:
      summary: Get paginated notifications
      operationId: getNotifications
      security:
        - sessionAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 15
        - name: cursor
          in: query
          schema:
            type: integer
        - name: grouped
          in: query
          schema:
            type: boolean
            default: true
      responses:
        "200":
          description: Notifications retrieved successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/NotificationsResponse"
        "401":
          $ref: "#/components/responses/Unauthorized"

  /api/notifications/unread-count:
    get:
      summary: Get unread notification count
      operationId: getUnreadCount
      security:
        - sessionAuth: []
      responses:
        "200":
          description: Count retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  count:
                    type: integer
        "401":
          $ref: "#/components/responses/Unauthorized"

  /api/notifications/mark-read:
    post:
      summary: Mark all notifications as read
      operationId: markAllAsRead
      security:
        - sessionAuth: []
      responses:
        "200":
          description: Notifications marked as read
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  markedCount:
                    type: integer
        "401":
          $ref: "#/components/responses/Unauthorized"

  /api/notifications/stream:
    get:
      summary: SSE stream for real-time notifications
      operationId: streamNotifications
      security:
        - sessionAuth: []
      responses:
        "200":
          description: SSE stream established
          content:
            text/event-stream:
              schema:
                type: string
        "401":
          $ref: "#/components/responses/Unauthorized"

components:
  securitySchemes:
    sessionAuth:
      type: apiKey
      in: cookie
      name: next-auth.session-token

  schemas:
    UserSummary:
      type: object
      properties:
        id:
          type: integer
        publicUuid:
          type: string
        username:
          type: string
        firstName:
          type: string
        lastName:
          type: string
        profileImageUrl:
          type: string
          nullable: true

    GroupedNotification:
      type: object
      properties:
        id:
          type: integer
        type:
          type: string
          enum: [CONNECTION_REQUEST, POST_LIKE, POST_COMMENT]
        entityType:
          type: string
        entityId:
          type: integer
        entityPublicUuid:
          type: string
        isRead:
          type: boolean
        createdAt:
          type: string
          format: date-time
        actor:
          $ref: "#/components/schemas/UserSummary"
        otherActors:
          type: array
          items:
            $ref: "#/components/schemas/UserSummary"
        count:
          type: integer

    NotificationsResponse:
      type: object
      properties:
        notifications:
          type: array
          items:
            $ref: "#/components/schemas/GroupedNotification"
        nextCursor:
          type: integer
          nullable: true
        hasMore:
          type: boolean

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
                example: Unauthorized
```
