# Feature Specification: Hashtag System

**Feature Branch**: `010-hashtag-system`  
**Created**: 2025-12-02  
**Status**: Draft  
**Input**: User description: "Users can add hashtags in their posts which are auto-extracted from post content. Clicking on a hashtag redirects to a dedicated hashtag page showing all posts with that hashtag."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Hashtag Auto-Extraction and Display (Priority: P1)

When a user creates a post containing hashtags (e.g., "Great #training session today! #sports #fitness"), the system automatically detects and extracts these hashtags from the post content. Hashtags follow standard format (# followed by alphanumeric characters and underscores). The system treats hashtags as case-insensitive, so #Sports and #sports are considered the same hashtag (normalized to lowercase). When viewing posts, hashtags within the content are rendered as clickable links that navigate users to the hashtag page.

**Why this priority**: This is the foundational functionality - without hashtag extraction and storage, no other hashtag features can work. It enables content categorization and discoverability.

**Independent Test**: Can be fully tested by creating a post with hashtags and verifying they are extracted, stored, and rendered as clickable links in the post content.

**Acceptance Scenarios**:

1. **Given** a user is creating a new post, **When** they include "#training" in the content, **Then** the hashtag is automatically extracted and stored (normalized to lowercase)
2. **Given** a user creates a post with "#Sports" and another user creates a post with "#sports", **When** the hashtags are stored, **Then** both posts are linked to the same hashtag "sports"
3. **Given** a post contains multiple hashtags like "#fitness #training #sports", **When** the post is saved, **Then** all hashtags are extracted and linked to the post
4. **Given** a user views a post with hashtags, **When** the post content is rendered, **Then** hashtags appear as clickable links styled distinctly from regular text
5. **Given** a user clicks on a hashtag link in a post, **When** they click, **Then** they are navigated to /hashtag/[hashtag] page

---

### User Story 2 - Hashtag Page with Post Feed (Priority: P1)

When a user clicks on a hashtag (from a post or widget), they are redirected to a dedicated hashtag page at /hashtag/[hashtag]. This page displays all posts containing that specific hashtag, ordered from newest to oldest. The page uses infinite scroll pagination to load more posts as the user scrolls. The page is part of the main application layout and requires authentication to access.

**Why this priority**: This delivers the core value proposition - users can discover and browse content by topic. Without this page, clickable hashtags have no destination.

**Independent Test**: Can be tested by navigating to /hashtag/sports and verifying that only posts containing #sports are displayed, in reverse chronological order, with infinite scroll working correctly.

**Acceptance Scenarios**:

1. **Given** a user clicks on "#training" hashtag, **When** the page loads, **Then** they see the hashtag page at /hashtag/training showing all posts with #training
2. **Given** there are 50 posts with #sports hashtag, **When** user visits /hashtag/sports, **Then** posts are displayed newest first with initial batch loaded
3. **Given** user is on a hashtag page with more posts available, **When** they scroll to the bottom, **Then** more posts are automatically loaded (infinite scroll)
4. **Given** a user is not authenticated, **When** they try to access /hashtag/[hashtag], **Then** they are redirected to login
5. **Given** a user searches for a hashtag that doesn't exist, **When** the page loads, **Then** they see an appropriate empty state message

---

### User Story 3 - Popular Hashtags Widget (Priority: P2)

A widget displayed in the right sidebar of the main application layout shows the top 5 most-used hashtags from the last 7 days. Each hashtag in the widget is clickable and navigates the user to the corresponding hashtag page. The widget displays only the hashtag names without post counts.

**Why this priority**: This is an enhancement that improves discoverability but is not essential for the core hashtag functionality. Users can still use hashtags fully without this widget.

**Independent Test**: Can be tested by verifying the widget appears in the right sidebar, displays 5 hashtags based on 7-day popularity, and each hashtag links to the correct hashtag page.

**Acceptance Scenarios**:

1. **Given** a user is on any page with the main layout, **When** the page loads, **Then** they see the Popular Hashtags widget in the right sidebar
2. **Given** hashtags have been used in posts over the last 7 days, **When** the widget renders, **Then** it displays the top 5 most-used hashtags
3. **Given** the widget is displaying hashtags, **When** user clicks on a hashtag, **Then** they are navigated to /hashtag/[hashtag]
4. **Given** no hashtags have been used in the last 7 days, **When** the widget renders, **Then** it shows an appropriate empty state or is hidden
5. **Given** hashtag popularity changes over time, **When** the widget data refreshes, **Then** it reflects the current top 5 from the last 7 days

---

### Edge Cases

- What happens when a post contains only hashtags with no other text? → Post should be valid and hashtags extracted normally
- What happens when a hashtag contains special characters like #test@123? → Only alphanumeric characters and underscores after # are included (extracts "test")
- What happens when there are duplicate hashtags in a single post like "#sports #sports"? → Deduplicate and store only one link to the hashtag
- How does the system handle very long hashtags? → Standard hashtag length limits apply (reasonable max length, e.g., 50 characters)
- What happens when hashtag appears mid-word like "super#hero"? → Only extract valid hashtags that start with # preceded by whitespace or start of string
- What happens when user visits /hashtag/ without a hashtag? → Redirect to dashboard or show 404

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST automatically extract hashtags from post content when a post is created
- **FR-002**: System MUST normalize hashtags to lowercase for case-insensitive matching
- **FR-003**: System MUST store hashtags and their relationship to posts in the database
- **FR-004**: System MUST render hashtags in post content as clickable links
- **FR-005**: System MUST provide a hashtag page at /hashtag/[hashtag] showing posts with that hashtag
- **FR-006**: System MUST order posts on hashtag page from newest to oldest
- **FR-007**: System MUST implement infinite scroll pagination on the hashtag page
- **FR-008**: System MUST require authentication to access the hashtag page
- **FR-009**: System MUST display a Popular Hashtags Widget in the right sidebar of main layout
- **FR-010**: System MUST show top 5 hashtags based on usage in the last 7 days
- **FR-011**: System MUST make hashtags in the widget clickable, navigating to /hashtag/[hashtag]
- **FR-012**: System MUST use the existing (main) layout for the hashtag page
- **FR-013**: System MUST reuse existing PostFeed/PostItem components for displaying posts
- **FR-014**: Hashtags MUST follow standard format: # followed by alphanumeric characters and underscores
- **FR-015**: System MUST display appropriate loading and empty states for the Popular Hashtags Widget

### Key Entities

- **Hashtag**: Represents a unique hashtag tag. Key attributes: unique name (lowercase), creation timestamp
- **Post-Hashtag Relationship**: Links posts to hashtags (many-to-many). Key attributes: post reference, hashtag reference, timestamp when link was created (for time-based queries)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create posts with hashtags and see them rendered as clickable links immediately after posting
- **SC-002**: Users can navigate from a hashtag link to the hashtag page and see relevant posts within 2 seconds
- **SC-003**: Hashtag page loads initial posts and supports infinite scroll without page refresh
- **SC-004**: Popular Hashtags widget displays current top 5 hashtags from the last 7 days accurately
- **SC-005**: 100% of hashtag links (in posts and widget) successfully navigate to the correct hashtag page
- **SC-006**: Case variations of the same hashtag (e.g., #Sports, #SPORTS, #sports) all resolve to the same hashtag page

## Assumptions

- Existing PostFeed and PostItem components can be reused with minimal modifications
- The (main) layout already has a right sidebar structure that can accommodate the widget
- Post creation flow already exists and can be extended to include hashtag extraction
- Authentication middleware is already in place for the (main) layout routes
