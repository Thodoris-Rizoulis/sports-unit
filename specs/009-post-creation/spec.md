# Feature Specification: Post Creation System

**Feature Branch**: `009-post-creation`  
**Created**: November 30, 2025  
**Status**: Draft  
**Input**: User description: "Specify a detailed feature spec for implementing a post creation system in a Next.js 14+ sports social platform. The platform uses TypeScript, Zod for validation, shadcn/ui for components, PostgreSQL for DB, and Cloudflare R2 for media storage. Key requirements: Users on the dashboard can create posts with text, images, videos, or links. Posts are saved to DB and visible to connected users (accepted connections). Each post supports likes, comments (with replies), shares (link copying), and saves (bookmarks). Media uploads follow existing Cloudflare R2 structure (extend for videos/links). Include: Functional requirements, UI/UX wireframe descriptions, API endpoints (with Zod schemas), DB schema (new tables: posts, post_media, post_likes, post_comments, post_shares, post_saves), validation rules, error handling, security considerations, and integration with existing auth/connections. Ensure compliance with project constitution: types in /types, services in /services, components in /components, no duplication, mobile-responsive, strict TypeScript."

## Clarifications

### Session 2025-11-30

- Q: What video formats are supported besides MP4? → A: MP4, WebM, MOV
- Q: How are links displayed in posts? → A: As clickable text with URL preview
- Q: Does the feed include the user's own posts, or only connections'? → A: Include own posts
- Q: What are the specific rate limiting rules for post creation and interactions? → A: no limits for now
- Q: Are there any additional database indexes needed for performance? → A: Index on posts(created_at), post_likes(post_id,user_id)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create a Post (Priority: P1)

As a user on the dashboard, I want to create a post with text and optional media (images, videos, or links) so that I can share content with my network.

**Why this priority**: This is the core functionality enabling content creation, essential for the social platform.

**Independent Test**: Can be tested by creating a post and verifying it appears in the user's own feed.

**Acceptance Scenarios**:

1. **Given** I am logged in and on the dashboard, **When** I enter text and upload an image, **Then** the post is created and saved.
2. **Given** I am logged in, **When** I enter text and add a video link, **Then** the post is created with the link.
3. **Given** I am logged in, **When** I try to create a post without text, **Then** an error is shown.

---

### User Story 2 - View Posts from Connections (Priority: P1)

As a user, I want to see posts from my accepted connections so that I can stay engaged with my network.

**Why this priority**: Viewing content is fundamental to social interaction.

**Independent Test**: Can be tested by having connections create posts and verifying they appear in the feed.

**Acceptance Scenarios**:

1. **Given** I have accepted connections who have posts, **When** I view the dashboard, **Then** their posts are displayed in chronological order.
2. **Given** I have no connections, **When** I view the dashboard, **Then** no posts are shown.

---

### User Story 3 - Like a Post (Priority: P2)

As a user, I want to like posts from my connections to show appreciation.

**Why this priority**: Basic interaction to increase engagement.

**Independent Test**: Can be tested by liking a post and verifying the like count increases.

**Acceptance Scenarios**:

1. **Given** I see a post, **When** I click like, **Then** the like count increases and my like is recorded.
2. **Given** I have already liked a post, **When** I click like again, **Then** the like is removed.

---

### User Story 4 - Comment on a Post (Priority: P2)

As a user, I want to comment on posts to engage in discussions.

**Why this priority**: Comments enable deeper interaction.

**Independent Test**: Can be tested by adding a comment and verifying it appears under the post.

**Acceptance Scenarios**:

1. **Given** I see a post, **When** I add a comment, **Then** it appears under the post.
2. **Given** I try to comment with empty text, **Then** an error is shown.

---

### User Story 5 - Reply to Comments (Priority: P3)

As a user, I want to reply to comments to continue conversations.

**Why this priority**: Enhances threaded discussions.

**Independent Test**: Can be tested by replying to a comment and verifying the reply nests correctly.

**Acceptance Scenarios**:

1. **Given** I see a comment, **When** I reply, **Then** the reply appears nested under the comment.

---

### User Story 6 - Share a Post (Priority: P3)

As a user, I want to share a post link to spread content.

**Why this priority**: Allows content virality.

**Independent Test**: Can be tested by sharing and verifying the link copies correctly.

**Acceptance Scenarios**:

1. **Given** I see a post, **When** I click share, **Then** the post link is copied to clipboard.

---

### User Story 7 - Save a Post (Priority: P3)

As a user, I want to save posts for later viewing.

**Why this priority**: Allows bookmarking interesting content.

**Independent Test**: Can be tested by saving a post and verifying it appears in saved posts.

**Acceptance Scenarios**:

1. **Given** I see a post, **When** I click save, **Then** the post is saved to my bookmarks.

---

### Edge Cases

- What happens when media upload fails (e.g., invalid file type, size exceeded)?
- How does the system handle posts with no media?
- What if a user tries to interact with their own post?
- How are deleted posts handled in interactions?
- What happens if a connection is removed after posts exist?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create posts with text content.
- **FR-002**: System MUST support adding images, videos, or links to posts.
- **FR-003**: System MUST save posts to the database with user association.
- **FR-004**: System MUST display posts from accepted connections and own posts in reverse chronological order.
- **FR-005**: System MUST allow users to like posts (toggle functionality).
- **FR-006**: System MUST allow users to comment on posts.
- **FR-007**: System MUST support replies to comments (nested structure).
- **FR-008**: System MUST allow sharing posts via link copying.
- **FR-009**: System MUST allow saving posts as bookmarks.
- **FR-010**: System MUST validate media types and sizes.
- **FR-011**: System MUST handle errors gracefully with user-friendly messages.
- **FR-012**: System MUST ensure only accepted connections can view posts.

### Key Entities _(include if feature involves data)_

- **Post**: Represents user-generated content, attributes: id, user_id, content (text), created_at, updated_at.
- **PostMedia**: Links media to posts, attributes: id, post_id, media_type (image/video/link), url_or_key, order.
- **PostLike**: Records likes, attributes: id, post_id, user_id, created_at (unique per user/post).
- **PostComment**: Records comments, attributes: id, post_id, user_id, parent_comment_id, content, created_at.
- **PostShare**: Records shares, attributes: id, post_id, user_id, created_at.
- **PostSave**: Records saves, attributes: id, post_id, user_id, created_at (unique per user/post).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a post with media in under 30 seconds.
- **SC-002**: Posts load in the feed within 2 seconds for up to 50 posts.
- **SC-003**: 95% of post creation attempts succeed without errors.
- **SC-004**: Users can interact (like/comment) with posts in under 5 seconds.
- **SC-005**: System supports 1000 concurrent users viewing feeds without degradation.

## UI/UX Wireframe Descriptions

### Dashboard Page

- Top section: Post creation form (textarea for text, buttons for media upload/link input, submit button).
- Main feed: List of posts from connections and own posts, each post shows: user avatar/name, content, media (if any, links as clickable text with URL preview), timestamp, interaction buttons (like, comment, share, save).
- Comments: Expandable section under each post, with reply functionality.
- Mobile: Responsive layout, stacked elements, touch-friendly buttons.

### Post Creation Modal/Dialog

- Textarea for content (max 500 chars).
- Media upload: Drag-drop or file picker for images/videos, input for links.
- Preview of selected media.
- Submit button, cancel.

### Post Item Component

- Header: User info, timestamp.
- Content: Text and media display.
- Footer: Like count, comment count, buttons for interactions.

## API Endpoints (with Zod Schemas)

### POST /api/posts

Create a new post.

- Input Schema: z.object({ content: z.string().min(1).max(500), media: z.array(z.object({ type: z.enum(['image','video','link']), file: z.instanceof(File).optional(), url: z.string().url().optional() })).optional() })
- Response: { postId: number, success: true }

### GET /api/posts

Get feed posts for user.

- Query: ?limit=20&offset=0
- Response: Array of posts with media, likes, comments.

### POST /api/posts/{id}/like

Toggle like on post.

- Response: { liked: boolean, count: number }

### POST /api/posts/{id}/comment

Add comment to post.

- Input: z.object({ content: z.string().min(1).max(200), parentCommentId: z.number().optional() })
- Response: { commentId: number }

### POST /api/posts/{id}/share

Record share.

- Response: { shareUrl: string }

### POST /api/posts/{id}/save

Toggle save.

- Response: { saved: boolean }

### POST /api/upload (extended)

Extend for videos: fileType regex includes video/(mp4|webm|quicktime), max size 100MB.

## DB Schema

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_media (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image','video','link')),
  url TEXT,
  key TEXT,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE TABLE post_comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_shares (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_saves (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_post_likes_post_user ON post_likes(post_id, user_id);
```

## Validation Rules

- Content: 1-500 chars, no HTML.
- Media: Images: JPEG/PNG/WebP, 10MB; Videos: MP4/WebM/MOV, 100MB; Links: Valid URL.
- Comments: 1-200 chars.
- Auth required for all actions.
- Users can only interact with posts from accepted connections.

## Error Handling

- Invalid input: Return 400 with Zod errors.
- Auth failure: 401.
- Not found: 404.
- Server error: 500 with generic message.
- Media upload failure: Retry logic, user notification.

## Security Considerations

- Auth via NextAuth.js for all endpoints.
- Input sanitization to prevent XSS.
- Rate limiting: none for now.
- Media uploads via presigned URLs to prevent direct access.
- No SQL injection via parameterized queries.

## Integration with Existing Auth/Connections

- Use existing auth guards.
- Fetch connections via ConnectionService to filter posts.
- Reuse upload API logic for media.
