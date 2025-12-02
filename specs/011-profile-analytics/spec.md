# Feature Specification: Profile Analytics Widget

**Feature Branch**: `011-profile-analytics`  
**Created**: 2024-12-02  
**Status**: Draft  
**Input**: User description: "Create a Profile Analytics Widget that displays profile views and post impressions for the last 7 days. Track all profile visits in the database (who visited whom) but display only unique visitor count. Post impressions = likes received in the last 7 days on any user posts."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Profile Analytics Summary (Priority: P1)

As an authenticated user, I want to see a summary of my profile analytics (profile views and post impressions) in the left sidebar so that I can understand my visibility and engagement on the platform.

**Why this priority**: This is the core value proposition of the feature - giving users insight into their platform engagement. Without this display, the entire feature has no user-facing value.

**Independent Test**: Can be fully tested by logging in, navigating to the dashboard, and verifying the analytics widget displays in the left sidebar with two metrics (profile views and post impressions for last 7 days).

**Acceptance Scenarios**:

1. **Given** I am logged in and on any page with the main layout, **When** I view the left sidebar, **Then** I see a Profile Analytics Widget displaying my "Profile Views" count for the last 7 days
2. **Given** I am logged in and on any page with the main layout, **When** I view the left sidebar, **Then** I see my "Post Impressions" (likes received) count for the last 7 days
3. **Given** I am logged in and have received no profile views or post likes in the last 7 days, **When** I view the analytics widget, **Then** I see "0" for both metrics
4. **Given** the analytics data is loading, **When** I view the widget area, **Then** I see a loading skeleton matching the widget's layout

---

### User Story 2 - Profile Visit Tracking (Priority: P1)

As a platform, I want to track when users visit other users' profiles so that I can provide accurate profile view analytics.

**Why this priority**: Without tracking visits, the profile views metric cannot exist. This is foundational infrastructure for Story 1.

**Independent Test**: Can be tested by having User A visit User B's profile, then querying the database to verify the visit was recorded with correct visitor/visited IDs and timestamp.

**Acceptance Scenarios**:

1. **Given** I am logged in as User A, **When** I visit User B's profile page, **Then** a profile visit is recorded in the database with my user ID, User B's user ID, and the current timestamp
2. **Given** I am logged in, **When** I visit my own profile page, **Then** no profile visit is recorded (self-views are not tracked)
3. **Given** I am logged in as User A, **When** I visit User B's profile multiple times, **Then** each visit is recorded as a separate entry (total views stored)
4. **Given** I am not logged in, **When** I attempt to visit any profile page, **Then** I am redirected to login (unauthenticated users cannot view profiles)

---

### User Story 3 - Unique Visitor Count Calculation (Priority: P2)

As a user viewing my analytics, I want the profile views count to show unique visitors (not total visits) so that I understand how many different people viewed my profile.

**Why this priority**: This refines the display logic but depends on Story 1 and 2 being complete. The widget can initially show total views and be refined to unique counts.

**Independent Test**: Can be tested by having the same user visit a profile 5 times, then verifying the displayed count shows 1 (not 5).

**Acceptance Scenarios**:

1. **Given** User A has visited my profile 3 times in the last 7 days and User B visited once, **When** I view my analytics widget, **Then** the profile views count shows "2" (unique visitors)
2. **Given** User A visited my profile 10 days ago and again yesterday, **When** I view my analytics widget, **Then** only the visit from yesterday is counted (within 7-day window)

---

### User Story 4 - Post Impressions Calculation (Priority: P2)

As a user, I want post impressions to accurately reflect all likes I received in the last 7 days, regardless of when the posts were created.

**Why this priority**: Provides the second key metric. Can be developed in parallel with visit tracking once the widget infrastructure exists.

**Independent Test**: Can be tested by creating a post last month, receiving a like today, and verifying the like counts toward impressions.

**Acceptance Scenarios**:

1. **Given** I have posts from various dates and received 5 likes total in the last 7 days, **When** I view my analytics widget, **Then** post impressions shows "5"
2. **Given** I received 10 likes 8 days ago and 3 likes yesterday, **When** I view my analytics widget, **Then** post impressions shows "3" (only within 7-day window)
3. **Given** I have no posts, **When** I view my analytics widget, **Then** post impressions shows "0"

---

### Edge Cases

- What happens when a user has never received any profile visits or post likes? → Display "0" for both metrics
- What happens when the API fails to fetch analytics data? → Display an error state with a friendly message
- What happens on mobile devices? → Widget is hidden (consistent with other sidebar widgets)
- What happens if a user deletes their account after visiting a profile? → Visit records may reference non-existent users; handle gracefully in queries
- What happens if the 7-day window crosses into data before tracking was implemented? → Show available data; no special handling needed

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST record a profile visit when an authenticated user visits another user's profile page
- **FR-002**: System MUST NOT record a profile visit when a user views their own profile (self-views excluded)
- **FR-003**: System MUST store all profile visits (every visit recorded, no deduplication at write time)
- **FR-004**: System MUST store the visitor user ID, visited profile user ID, and timestamp for each visit
- **FR-005**: System MUST provide an analytics endpoint returning the current user's profile statistics
- **FR-006**: System MUST calculate unique profile views by counting distinct visitors within the last 7 days
- **FR-007**: System MUST calculate post impressions as total likes received on any of the user's posts within the last 7 days
- **FR-008**: System MUST display the analytics widget in the left sidebar of the main layout, below the NavigationWidget
- **FR-009**: System MUST show loading state while fetching analytics data
- **FR-010**: System MUST handle API errors gracefully with user-friendly error display
- **FR-011**: Widget MUST be hidden on mobile devices (following existing sidebar behavior)
- **FR-012**: Widget MUST match the visual styling of existing sidebar widgets (Card-based, consistent spacing)

### Key Entities

- **ProfileVisit**: Represents a single profile page visit

  - Visitor (who viewed the profile)
  - Visited (whose profile was viewed)
  - Timestamp (when the visit occurred)
  - Relationship: Many-to-one with User (both visitor and visited)

- **ProfileAnalyticsData**: Aggregated analytics for display
  - Profile Views (unique visitor count for last 7 days)
  - Post Impressions (total likes received in last 7 days)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view their profile analytics (views + impressions) within 2 seconds of page load
- **SC-002**: Profile visit is recorded within 1 second of visiting a profile page
- **SC-003**: Analytics widget correctly displays unique visitor count (not total visits) for the 7-day period
- **SC-004**: Analytics widget correctly aggregates all post likes received in the 7-day window
- **SC-005**: Widget displays consistently across all pages using the main layout
- **SC-006**: Zero self-view visits are recorded in the database (100% compliance)

## Assumptions

- Authenticated users can view other users' profiles (existing functionality)
- PostLike model with `createdAt` timestamp already exists and is used for counting impressions
- The main layout with left sidebar is already implemented with other widgets
- 7-day window is calculated as "now minus 7 days" using server time
- Widget data refreshes on page navigation (no real-time updates required)

## Out of Scope

- Displaying who viewed your profile (data stored but not shown in this iteration)
- Trend indicators showing comparison to previous periods
- Clickable stats navigating to detailed analytics pages
- Post impression tracking beyond likes (views, comments, shares)
- Real-time/live updates of analytics data
- Historical analytics beyond 7 days
- Export or download of analytics data
