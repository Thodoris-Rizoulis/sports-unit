# Feature Specification: Notifications

**Feature Branch**: `014-notifications`  
**Created**: 2025-12-03  
**Status**: Draft  
**Input**: User description: "Create a Notifications feature for the Sports Unit platform with real-time updates, bell icon with unread badge, dropdown, and dedicated notifications page"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Unread Notification Count (Priority: P1)

As a logged-in user, I want to see how many unread notifications I have at a glance so I can quickly know if there's activity requiring my attention.

**Why this priority**: The badge count is the primary visual indicator that drives user engagement with notifications. Without this, users have no way to know they have pending notifications.

**Independent Test**: Can be fully tested by triggering notification events (connection request, like, comment) and verifying the badge count increments. Delivers immediate visual feedback value.

**Acceptance Scenarios**:

1. **Given** I am a logged-in user with 5 unread notifications, **When** I view any page with the header, **Then** I see the bell icon with a badge showing "5"
2. **Given** I am a logged-in user with 0 unread notifications, **When** I view any page with the header, **Then** I see the bell icon without any badge
3. **Given** I am a logged-in user with 150 unread notifications, **When** I view any page with the header, **Then** I see the bell icon with a badge showing "99+"

---

### User Story 2 - View Notification Dropdown (Priority: P1)

As a logged-in user, I want to click the bell icon to see my recent notifications in a dropdown so I can quickly review activity without navigating away from my current page.

**Why this priority**: The dropdown is the primary interaction point for notifications and provides the core notification viewing experience.

**Independent Test**: Can be fully tested by clicking the bell icon and verifying the dropdown displays notifications with actor info, action text, and timestamps.

**Acceptance Scenarios**:

1. **Given** I am a logged-in user with notifications, **When** I click the bell icon, **Then** a dropdown opens showing my 10-15 most recent notifications
2. **Given** I am a logged-in user with no notifications, **When** I click the bell icon, **Then** a dropdown opens showing an empty state message
3. **Given** I have multiple likes on the same post from different users, **When** I view the dropdown, **Then** I see a grouped notification like "John and 3 others liked your post"
4. **Given** I click the bell icon, **When** the dropdown opens, **Then** all my notifications are marked as read and the badge count resets to 0

---

### User Story 3 - Navigate from Notification (Priority: P1)

As a logged-in user, I want to click on a notification to navigate to the relevant content so I can view and respond to the activity.

**Why this priority**: Navigation is the core purpose of notifications - alerting users to content they should see. Without clickable navigation, notifications have no utility.

**Independent Test**: Can be fully tested by clicking different notification types and verifying correct navigation to profile or post.

**Acceptance Scenarios**:

1. **Given** I have a connection request notification, **When** I click on it, **Then** I am navigated to the requester's profile page (`/profile/[username]`)
2. **Given** I have a post like notification, **When** I click on it, **Then** I am navigated to the post that was liked
3. **Given** I have a post comment notification, **When** I click on it, **Then** I am navigated to the post that was commented on
4. **Given** I have a grouped notification for multiple likes, **When** I click on it, **Then** I am navigated to the post that received the likes

---

### User Story 4 - Receive Real-time Notifications (Priority: P2)

As a logged-in user currently on the site, I want to receive new notifications in real-time without refreshing the page so I stay informed of activity as it happens.

**Why this priority**: Real-time updates enhance user experience but the core functionality works without them (users can refresh). Important but not blocking for MVP.

**Independent Test**: Can be tested by having another user trigger a notification and verifying the badge count updates and new notification appears without page refresh.

**Acceptance Scenarios**:

1. **Given** I am on the site and another user sends me a connection request, **When** the request is created, **Then** my notification badge count increments without page refresh
2. **Given** I am on the site with the notification dropdown open, **When** a new notification arrives, **Then** it appears at the top of my dropdown list
3. **Given** I am not logged in, **When** I view the site, **Then** no real-time notification connection is established

---

### User Story 5 - View Full Notification History (Priority: P2)

As a logged-in user, I want to access a dedicated notifications page to see my complete notification history so I can review past activity I may have missed.

**Why this priority**: Full history is valuable for users who want to review older notifications, but the dropdown covers the primary use case of recent notifications.

**Independent Test**: Can be fully tested by navigating to `/notifications` and verifying all notifications display with infinite scroll pagination.

**Acceptance Scenarios**:

1. **Given** I am on the notification dropdown, **When** I click "See all notifications", **Then** I am navigated to the `/notifications` page
2. **Given** I am on the notifications page with 50 notifications, **When** I scroll to the bottom, **Then** more notifications are loaded (infinite scroll)
3. **Given** I am on the notifications page, **When** I view the list, **Then** I can visually distinguish between read and unread notifications
4. **Given** I am on the notifications page with no notifications, **When** I view the page, **Then** I see an appropriate empty state message

---

### User Story 6 - Receive Connection Request Notification (Priority: P1)

As a user, I want to receive a notification when someone sends me a connection request so I can review their profile and respond.

**Why this priority**: Connection requests are a core social feature and users need to know when others want to connect.

**Independent Test**: Can be tested by having User A send a connection request to User B and verifying User B receives a notification.

**Acceptance Scenarios**:

1. **Given** User A sends me a connection request, **When** the request is created, **Then** I receive a notification showing User A's name/avatar with text like "sent you a connection request"
2. **Given** I receive a connection request notification, **When** I view it, **Then** I see the requester's avatar, name, and timestamp

---

### User Story 7 - Receive Post Like Notification (Priority: P1)

As a user, I want to receive a notification when someone likes my post so I know my content is being appreciated.

**Why this priority**: Post likes are a primary engagement metric and users expect to be notified of this activity.

**Independent Test**: Can be tested by having User A like User B's post and verifying User B receives a notification.

**Acceptance Scenarios**:

1. **Given** User A likes my post, **When** the like is created, **Then** I receive a notification showing User A's name/avatar with text like "liked your post"
2. **Given** multiple users like the same post, **When** I view unread notifications, **Then** they are grouped as "[Most Recent User] and [X] others liked your post"

---

### User Story 8 - Receive Post Comment Notification (Priority: P1)

As a user, I want to receive a notification when someone comments on my post so I can engage in the conversation.

**Why this priority**: Post comments are a primary engagement type and users expect to be notified to continue conversations.

**Independent Test**: Can be tested by having User A comment on User B's post and verifying User B receives a notification.

**Acceptance Scenarios**:

1. **Given** User A comments on my post, **When** the comment is created, **Then** I receive a notification showing User A's name/avatar with text like "commented on your post"
2. **Given** multiple users comment on the same post, **When** I view unread notifications, **Then** they are grouped as "[Most Recent User] and [X] others commented on your post"

---

### Edge Cases

- What happens when a user who triggered a notification deletes their account? → Show notification with "Deleted User" placeholder
- What happens when a post that was liked/commented is deleted? → Hide or show notification with "This post is no longer available" and disable click action
- What happens when a connection request is withdrawn after notification was sent? → Keep notification visible but update action (e.g., show "Connection request no longer available" on click)
- What happens if SSE connection drops? → Automatically attempt reconnection with exponential backoff
- What happens when user opens multiple browser tabs? → Each tab can have its own SSE connection; badge should sync across tabs
- What happens when notification data exceeds dropdown display limit? → Show most recent 10-15, with "See all" link for more
- What happens when a user unlikes a post or deletes their comment? → Delete the corresponding notification

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST store each notification as an individual record in the database
- **FR-002**: System MUST track for each notification: recipient, actor, type, related entity, read status, and timestamps
- **FR-003**: System MUST support notification types: CONNECTION_REQUEST, POST_LIKE, POST_COMMENT
- **FR-004**: System MUST display a bell icon in the header with unread notification count badge
- **FR-005**: System MUST show "99+" when unread count exceeds 99
- **FR-006**: System MUST mark ALL notifications as read when user clicks the bell icon
- **FR-007**: System MUST display a dropdown with 10-15 most recent notifications when bell is clicked
- **FR-008**: System MUST group unread notifications for the same post (likes grouped together, comments grouped together)
- **FR-009**: System MUST show grouping format as "[Most Recent Actor] and [X] others [action]"
- **FR-010**: System MUST navigate to requester's profile when connection request notification is clicked
- **FR-011**: System MUST navigate to the post detail page (`/post/[postId]`) when post like/comment notification is clicked
- **FR-012**: System MUST provide a dedicated `/notifications` page with full notification history
- **FR-013**: System MUST implement infinite scroll pagination on the notifications page
- **FR-014**: System MUST visually distinguish read from unread notifications on the history page
- **FR-015**: System MUST display actor avatar, action text, and relative timestamp for each notification
- **FR-016**: System MUST show appropriate empty state when user has no notifications
- **FR-017**: System MUST show loading states while fetching notifications
- **FR-018**: System MUST deliver real-time notifications via Server-Sent Events (SSE) for authenticated users
- **FR-019**: System MUST update badge count in real-time when new notifications arrive
- **FR-020**: System MUST create notifications when: connection requests are sent, posts are liked, posts are commented on
- **FR-021**: System MUST support schema extensibility for future notification types (mentions, profile views)
- **FR-022**: System MUST delete notifications when the triggering action is undone (unlike, comment deletion)
- **FR-023**: System MUST NOT create notifications for a user's own actions (e.g., liking or commenting on own post)
- **FR-024**: System MUST authenticate SSE connections using existing NextAuth.js session cookie

### Key Entities

- **Notification**: Represents a single notification event. Tracks recipient (who receives it), actor (who triggered it), notification type (enum), entity type (what was acted upon), entity ID (reference to the acted-upon item), read status, and creation timestamp. Related to User (recipient and actor) and optionally to Post or Connection entities.

- **NotificationType**: Enumeration of supported notification types. MVP includes CONNECTION_REQUEST, POST_LIKE, POST_COMMENT. Designed for extensibility to add MENTION, PROFILE_VIEW, etc.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view their unread notification count within 1 second of page load
- **SC-002**: Clicking the bell icon opens the notification dropdown and marks all as read within 2 seconds
- **SC-003**: New notifications appear in real-time (within 3 seconds of the triggering action) without page refresh
- **SC-004**: Users can navigate from notification to relevant content (profile or post) in a single click
- **SC-005**: Notifications page loads initial content within 2 seconds
- **SC-006**: Grouped notifications correctly combine all unread notifications for the same post
- **SC-007**: 100% of connection requests, post likes, and post comments generate corresponding notifications
- **SC-008**: Mobile users can access all notification features with proper responsive design
- **SC-009**: Notification dropdown displays correctly on screens 320px and wider
- **SC-010**: System handles 100+ unread notifications without performance degradation

## Clarifications

### Session 2025-12-03

- Q: When a user unlikes a post or deletes a comment after notification was created, what should happen? → A: Delete the notification (remove evidence of undone action)
- Q: Should users receive notifications from blocked users? → A: Not applicable - blocking feature doesn't exist yet, defer to future blocking feature spec
- Q: Should users receive notifications for their own actions? → A: Never notify users about their own actions (standard social platform behavior)
- Q: How should post like/comment notifications navigate to the post? → A: Navigate to dedicated post detail page (`/post/[postId]`)
- Q: How should the SSE endpoint authenticate connections? → A: Use existing session cookie (NextAuth.js session validated on SSE endpoint)

## Assumptions

- Users are authenticated via NextAuth.js session before accessing notifications
- The header component is present on all authenticated pages and can host the bell icon
- Post and Connection entities already exist with stable ID references
- Users have profile pages accessible at `/profile/[username]`
- Posts have dedicated views or are viewable in a feed context
- The platform uses React Query for client-side data fetching and caching
- Existing services (ConnectionService, PostService) can be extended to trigger notification creation
