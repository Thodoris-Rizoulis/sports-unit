# Feature Specification: Direct Messaging

**Feature Branch**: `015-direct-messaging`  
**Created**: 2025-12-03  
**Status**: Draft  
**Input**: User description: "Create a Direct Messaging feature for the Sports Unit platform that allows connected users to send private messages to each other"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Send and Receive Messages (Priority: P1)

As a logged-in user with an accepted connection, I want to send and receive private messages with my connection so that we can communicate directly within the platform.

**Why this priority**: This is the core functionality of the messaging feature. Without the ability to send and receive messages, no other messaging features have value.

**Independent Test**: Can be fully tested by having two connected users exchange messages and verifying messages appear in both users' conversation views. Delivers immediate communication value.

**Acceptance Scenarios**:

1. **Given** I am connected with another user (status: accepted), **When** I navigate to our conversation and type a message (up to 500 characters) and click send, **Then** the message is delivered and appears in the conversation for both users
2. **Given** I am in a conversation, **When** I attach an image or video using the media button and send, **Then** the media is uploaded and the message with media appears in the conversation
3. **Given** I am viewing a conversation, **When** a new message arrives, **Then** it appears at the bottom of the conversation automatically without page refresh
4. **Given** I am typing a message, **When** the character count reaches 500, **Then** I cannot type additional characters and a counter shows "500/500"
5. **Given** I have an existing conversation with a user, **When** I send a new message, **Then** the conversation moves to the top of my conversation list

---

### User Story 2 - View Conversation List (Priority: P1)

As a logged-in user, I want to see all my conversations in my inbox so that I can manage and navigate between different message threads.

**Why this priority**: Users need to see their conversations to access messages. This is foundational for the messaging experience.

**Independent Test**: Can be fully tested by creating multiple conversations and verifying they all appear in the inbox with correct previews and sorting.

**Acceptance Scenarios**:

1. **Given** I am a logged-in user with existing conversations, **When** I navigate to /inbox, **Then** I see a list of all my conversations sorted by most recent message
2. **Given** I am viewing the inbox on desktop, **When** the page loads, **Then** I see a split view with conversation list on the left and the selected conversation on the right
3. **Given** I am viewing the inbox on mobile, **When** I click on a conversation, **Then** I navigate to a full-screen conversation detail view
4. **Given** I have conversations, **When** I view the conversation list, **Then** each item shows the other user's avatar, name, last message preview (truncated), timestamp, and unread indicator if applicable
5. **Given** I have no conversations yet, **When** I view the inbox, **Then** I see an empty state with the message "Connect with users to start messaging"
6. **Given** I have conversations, **When** I type in the search bar, **Then** the list filters to show only conversations with users whose names match the search query

---

### User Story 3 - Initiate Conversation from Profile (Priority: P1)

As a logged-in user viewing a connected user's profile, I want to click a "Send message" button to start or continue a conversation with them so that I can easily reach out to my connections.

**Why this priority**: This is the primary entry point for initiating conversations. Without it, users would have no intuitive way to start messaging a connection.

**Independent Test**: Can be fully tested by visiting a connected user's profile, clicking "Send message", and verifying navigation to the correct conversation.

**Acceptance Scenarios**:

1. **Given** I am viewing the profile of a user I am connected with (status: accepted), **When** I view their profile hero section, **Then** I see a "Send message" button next to the connection button
2. **Given** I see the "Send message" button on a connected user's profile, **When** I click it, **Then** I am redirected to /inbox with that user's conversation opened/selected
3. **Given** I am viewing a profile of a user I am NOT connected with, **When** I view their profile, **Then** I do NOT see the "Send message" button
4. **Given** I have never messaged this connected user before, **When** I click "Send message", **Then** a new conversation is created and I can immediately start typing

---

### User Story 4 - View Unread Message Count in Header (Priority: P2)

As a logged-in user, I want to see an unread message count on the Inbox icon in the header so that I know when I have new messages without navigating to the inbox.

**Why this priority**: Visual indicators for unread messages drive user engagement but the core messaging works without them.

**Independent Test**: Can be tested by receiving messages and verifying the badge count updates correctly without page refresh.

**Acceptance Scenarios**:

1. **Given** I have unread messages, **When** I view any page with the header, **Then** I see the Inbox icon with a badge showing the count of unread messages
2. **Given** I have no unread messages, **When** I view the header, **Then** the Inbox icon has no badge
3. **Given** I have more than 99 unread messages, **When** I view the header, **Then** the badge shows "99+"
4. **Given** I am on the site and receive a new message, **When** the message arrives, **Then** the badge count increments in real-time without page refresh

---

### User Story 5 - View Recent Messages in Header Dropdown (Priority: P2)

As a logged-in user, I want to click the Inbox icon to see my most recent messages in a dropdown so that I can quickly preview new messages without leaving my current page.

**Why this priority**: The dropdown provides quick access to messages but users can still access messages via the full inbox page.

**Independent Test**: Can be tested by clicking the Inbox icon and verifying the dropdown shows recent messages with correct sender info and navigation.

**Acceptance Scenarios**:

1. **Given** I have messages, **When** I click the Inbox icon in the header, **Then** a dropdown opens showing my 5-10 most recent messages from all conversations
2. **Given** I am viewing the dropdown, **When** I see a message, **Then** it shows the sender's avatar, name, message preview (truncated), and timestamp
3. **Given** I click on a message in the dropdown, **When** the click is processed, **Then** I am redirected to /inbox with that specific conversation selected
4. **Given** I open the Inbox dropdown, **When** it opens, **Then** the unread badge is temporarily hidden (visual acknowledgment that user saw the dropdown; badge reappears if new messages arrive before user reads conversations)
5. **Given** I have no messages, **When** I open the dropdown, **Then** I see an empty state message

---

### User Story 6 - Real-time Message Delivery (Priority: P2)

As a logged-in user in a conversation, I want to receive new messages instantly without refreshing the page so that I can have a seamless chat experience.

**Why this priority**: Real-time updates significantly enhance user experience but basic messaging works with manual refresh.

**Independent Test**: Can be tested by having User A send a message while User B has the conversation open and verifying immediate delivery.

**Acceptance Scenarios**:

1. **Given** I am viewing a conversation, **When** the other user sends me a message, **Then** the message appears at the bottom of my conversation within 3 seconds
2. **Given** I am on any page of the application, **When** I receive a new message, **Then** my Inbox badge count updates in real-time
3. **Given** I am viewing a conversation that receives a new message, **When** the message appears, **Then** the view auto-scrolls to show the new message
4. **Given** I close and reopen the browser, **When** I return to the site, **Then** the real-time connection is re-established automatically

---

### User Story 7 - Load Message History (Priority: P3)

As a logged-in user in a conversation, I want to scroll up to load older messages so that I can view the full conversation history.

**Why this priority**: Viewing history is valuable but most users primarily interact with recent messages.

**Independent Test**: Can be tested by creating a conversation with many messages and verifying scroll-up loads older messages.

**Acceptance Scenarios**:

1. **Given** I am viewing a conversation with more than 20 messages, **When** I scroll to the top of the conversation, **Then** older messages are loaded automatically (infinite scroll)
2. **Given** older messages are being loaded, **When** the loading completes, **Then** my scroll position is maintained and I can continue reading
3. **Given** I have loaded all messages in a conversation, **When** I scroll to the top, **Then** I see an indicator that there are no more messages to load

---

### Edge Cases

- What happens when a user tries to message someone they are no longer connected with (connection removed)? → Show error message "You can only message users you are connected with" and disable the send button
- What happens when a message fails to send due to network issues? → Show error indicator on the message with a "Retry" option
- What happens when a user uploads a media file that exceeds size limits? → Show error "File size exceeds maximum limit of 100MB"
- What happens when a user uploads an unsupported file type? → Show error "Only images (JPEG, PNG, WebP) and videos (MP4, WebM) are supported"
- What happens if WebSocket connection is lost? → Automatically attempt reconnection with exponential backoff; show "Reconnecting..." indicator
- What happens when a user opens the inbox in multiple browser tabs? → Each tab maintains its own connection; messages sync across all tabs
- What happens when searching for a user with no matching conversations? → Show "No conversations found matching '[query]'"

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST only allow messaging between users with an accepted connection status
- **FR-002**: System MUST store messages with text content limited to 500 characters
- **FR-003**: System MUST support media attachments (images: JPEG, PNG, WebP; videos: MP4, WebM) up to 100MB per file
- **FR-004**: System MUST organize messages into conversations/threads between exactly two users
- **FR-005**: System MUST display a "Send message" button on connected users' profiles that navigates to the conversation
- **FR-006**: System MUST provide an inbox page at /inbox showing all user conversations
- **FR-007**: System MUST implement a responsive layout: split view on desktop (≥768px), list-detail navigation on mobile (<768px)
- **FR-008**: System MUST provide a search bar in the inbox to filter conversations by user name
- **FR-009**: System MUST sort conversations by most recent message timestamp (newest first)
- **FR-010**: System MUST display conversation previews with: other user's avatar, name, last message preview, timestamp, unread indicator
- **FR-011**: System MUST show an empty state "Connect with users to start messaging" when user has no conversations
- **FR-012**: System MUST display messages in chronological order (oldest at top, newest at bottom)
- **FR-013**: System MUST provide a message input with character counter showing current/max (e.g., "0/500")
- **FR-014**: System MUST auto-scroll to newest messages when viewing a conversation
- **FR-015**: System MUST load older messages when user scrolls to top (pagination/infinite scroll)
- **FR-016**: System MUST display an unread message count badge on the Inbox icon in the header
- **FR-017**: System MUST show "99+" when unread count exceeds 99
- **FR-018**: System MUST provide an Inbox dropdown showing 5-10 most recent messages from all conversations
- **FR-019**: System MUST visually hide the unread badge indicator when the Inbox dropdown is opened (badge reappears on new messages; actual read status unchanged until user opens specific conversations)
- **FR-020**: System MUST deliver new messages in real-time using WebSocket connections
- **FR-021**: System MUST update the unread badge count in real-time when new messages arrive
- **FR-022**: System MUST re-establish WebSocket connection automatically after disconnection
- **FR-023**: System MUST create a new conversation automatically when a user initiates messaging with a connection for the first time
- **FR-024**: System MUST authenticate WebSocket connections using the existing session mechanism
- **FR-025**: System MUST log key messaging events (message sent, received, delivery errors, WebSocket connection lifecycle) at the service layer for debugging

### Key Entities

- **Conversation**: Represents a message thread between exactly two connected users. Contains references to both participants, timestamp of last message for sorting, and a `lastReadAt` timestamp per participant for tracking unread messages. Each conversation is unique per user pair.

- **Message**: Represents a single message within a conversation. Contains the sender reference, text content (max 500 chars), optional media URL/key, and creation timestamp. Messages are ordered chronologically within their conversation. Unread status is derived by comparing message createdAt against the recipient's lastReadAt in the conversation.

- **MessageMedia**: Represents an attached media file in a message. Contains the media type (image/video), storage URL/key, and reference to the parent message. Reuses existing upload infrastructure.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can send a text message and have it delivered to the recipient within 3 seconds
- **SC-002**: Users can view their conversation list within 2 seconds of navigating to /inbox
- **SC-003**: Users can initiate a new conversation from a profile page in a single click
- **SC-004**: Users see their unread message count badge update within 3 seconds of receiving a new message
- **SC-005**: 95% of message deliveries succeed on first attempt without retry
- **SC-006**: Users can load and view conversation history of 100+ messages without performance degradation
- **SC-007**: Mobile users can access all messaging features with proper responsive design on screens 320px and wider
- **SC-008**: Media attachments upload and display within 10 seconds for files under 10MB on standard connections
- **SC-009**: Search results appear within 1 second of typing in the conversation search bar
- **SC-010**: WebSocket reconnection occurs automatically within 5 seconds of connection loss

## Clarifications

### Session 2025-12-03

- Q: How should "unread" status be tracked for messages in a conversation? → A: Per-conversation timestamp - track `lastReadAt` per user per conversation; messages newer than this are unread
- Q: Should message/conversation events be logged for observability and debugging purposes? → A: Basic logging - log key events (message sent, received, errors) at service layer for debugging

## Assumptions

- Users are authenticated via NextAuth.js session before accessing messaging features
- The Connection model already exists and tracks connection status between users
- The existing media upload service (/api/upload) can be reused with a different storage path prefix
- The header component is present on all authenticated pages and can host the Inbox dropdown
- Users have profile pages where the "Send message" button can be added
- The platform uses React Query for client-side data fetching and caching
- WebSocket server can be integrated with the Next.js application
