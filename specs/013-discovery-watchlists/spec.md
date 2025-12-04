# Feature Specification: Discovery Page & Watchlists

**Feature Branch**: `013-discovery-watchlists`  
**Created**: 2025-12-03  
**Status**: Planned  
**Input**: User description: "Discovery Page & Watchlists - athlete search with filters and private watchlist management"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Filter and Discover Athletes (Priority: P1)

As a user (scout, coach, or athlete), I want to search for athletes using multiple filters so that I can find athletes matching specific criteria for recruitment, networking, or comparison purposes.

**Why this priority**: This is the core value proposition of the discovery feature. Without the ability to filter and find athletes, the entire feature has no purpose. Users need this to discover talent based on specific attributes and performance metrics.

**Independent Test**: Can be fully tested by applying various filter combinations and verifying that results match the criteria. Delivers immediate value by enabling athlete discovery.

**Acceptance Scenarios**:

1. **Given** I am a logged-in user on the Discovery page, **When** I select "Football" as sport and set height range 175-190cm, **Then** I see only athletes who play Football AND have height within that range.

2. **Given** I have applied multiple filters (sport, position, open to opportunities), **When** I view the results, **Then** all displayed athletes match ALL selected criteria (AND logic).

3. **Given** I have set age range filter to 18-25 years, **When** results are displayed, **Then** only athletes whose calculated age (from date of birth) falls within 18-25 are shown.

4. **Given** I have applied filters and received results, **When** I click "Reset All Filters", **Then** all filters are cleared and I see unfiltered results.

5. **Given** I have applied specific filters, **When** I copy the page URL and share it, **Then** the recipient sees the same filter state when opening the link.

---

### User Story 2 - View Athlete Discovery Results (Priority: P1)

As a user browsing discovery results, I want to see comprehensive athlete information in each result card so that I can quickly assess if an athlete matches my needs without visiting their full profile.

**Why this priority**: Displaying meaningful results is essential to the discovery experience. Users need to see enough information to make decisions about which athletes to investigate further or add to watchlists.

**Independent Test**: Can be tested by viewing result cards and verifying all required information is displayed correctly.

**Acceptance Scenarios**:

1. **Given** I am viewing discovery results, **When** I look at an athlete card, **Then** I see their profile image, first name, last name, sport, and position.

2. **Given** I am viewing an athlete card, **When** I examine the card details, **Then** I see all their key profile information (location, open to opportunities status, strong foot, height, age).

3. **Given** I am viewing an athlete card with metrics, **When** I examine the card, **Then** I see all their athlete metrics (sprint speed, agility, beep test, vertical jump) where available.

4. **Given** there are more than 10 results, **When** I view the results page, **Then** I see pagination controls to navigate between pages.

5. **Given** I am on page 2 of results, **When** I apply a new filter, **Then** I am returned to page 1 of the new filtered results.

---

### User Story 3 - Create and Manage Watchlists (Priority: P2)

As a user, I want to create multiple named watchlists so that I can organize athletes I'm interested in into different categories for easy reference.

**Why this priority**: Watchlists provide the "save for later" functionality that makes discovery actionable. Without watchlists, users would need to remember or manually track interesting athletes, reducing the feature's utility.

**Independent Test**: Can be tested by creating watchlists with names and descriptions, then viewing them in the watchlists management area.

**Acceptance Scenarios**:

1. **Given** I am on the Watchlists page with no watchlists, **When** I click "Create Watchlist", **Then** I can enter a name and optional description to create a new watchlist.

2. **Given** I have existing watchlists, **When** I view the Watchlists page, **Then** I see all my watchlists with their names, descriptions, and athlete counts.

3. **Given** I am viewing my watchlists, **When** I click edit on a watchlist, **Then** I can rename it or update its description.

4. **Given** I want to delete a watchlist, **When** I click delete and confirm, **Then** the watchlist and all its athlete associations are removed.

5. **Given** I have watchlists, **When** another user tries to access my watchlists, **Then** they cannot see or access them (watchlists are private).

---

### User Story 4 - Add Athletes to Watchlists (Priority: P2)

As a user viewing discovery results, I want to quickly add athletes to my watchlists so that I can save interesting athletes for later review without leaving the discovery page.

**Why this priority**: This connects the discovery feature to the watchlist feature, enabling users to take action on their discoveries. It's the key interaction that makes both features work together.

**Independent Test**: Can be tested by clicking "Add to Watchlist" on an athlete card and selecting a watchlist.

**Acceptance Scenarios**:

1. **Given** I am viewing an athlete card, **When** I click "Add to Watchlist", **Then** I see a modal/dropdown showing all my existing watchlists.

2. **Given** I have no watchlists yet, **When** I click "Add to Watchlist" on an athlete, **Then** I can create a new watchlist inline and add the athlete to it.

3. **Given** I am adding an athlete to watchlists, **When** I select multiple watchlists, **Then** the athlete is added to all selected watchlists.

4. **Given** I have added an athlete to a watchlist, **When** I view that athlete's card again, **Then** I see visual indication that they are already in one or more of my watchlists.

5. **Given** an athlete is already in a watchlist, **When** I try to add them again, **Then** the system handles this gracefully (either prevents duplicate or shows already added status).

---

### User Story 5 - View and Manage Watchlist Athletes (Priority: P2)

As a user, I want to view all athletes in a specific watchlist and manage them so that I can review my saved athletes and remove those no longer relevant.

**Why this priority**: Users need to access and manage the athletes they've saved. This completes the watchlist workflow by allowing review and curation of saved athletes.

**Independent Test**: Can be tested by navigating to a watchlist detail page and viewing/removing athletes.

**Acceptance Scenarios**:

1. **Given** I am on the Watchlists page, **When** I click on a specific watchlist, **Then** I navigate to a detail view showing all athletes in that watchlist.

2. **Given** I am viewing a watchlist detail page, **When** I look at an athlete card, **Then** I see the same comprehensive information as in discovery results.

3. **Given** I am viewing a watchlist with athletes, **When** I click "Remove" on an athlete, **Then** that athlete is removed from this watchlist only.

4. **Given** I am viewing an athlete in my watchlist, **When** I click on their profile, **Then** I navigate to their full profile page.

5. **Given** a watchlist has many athletes, **When** I view the watchlist, **Then** results are paginated for easy navigation.

---

### User Story 6 - Navigate to Watchlists (Priority: P3)

As a user, I want easy access to my watchlists from the main navigation so that I can quickly review my saved athletes at any time.

**Why this priority**: Navigation is important for discoverability but the feature is functional without it (users could bookmark the URL). It enhances user experience but is not core functionality.

**Independent Test**: Can be tested by clicking the Watchlists link in navigation and verifying it goes to the correct page.

**Acceptance Scenarios**:

1. **Given** I am logged in on any page in the main app, **When** I look at the navigation menu, **Then** I see a "Watchlists" link as the last item (after Network and Saved).

2. **Given** I click on the Watchlists navigation link, **When** the page loads, **Then** I am taken to the watchlists management page.

---

### Edge Cases

- What happens when a user searches with filters that return zero results? → Display a friendly "No athletes found" message with suggestion to adjust filters.
- How does the system handle an athlete being deleted after being added to watchlists? → The athlete should be automatically removed from all watchlists (cascade delete).
- What happens if a user tries to create a watchlist with an empty name? → Validation error prevents creation; name is required.
- What happens when viewing a watchlist that was deleted? → 404 page or redirect to watchlists list.
- How does the system handle very large filter result sets? → Pagination limits results per page; total count is shown.
- What if the athlete metrics are incomplete (some null values)? → Display available metrics; indicate "Not recorded" for missing values.

## Requirements _(mandatory)_

### Functional Requirements

#### Discovery Page

- **FR-001**: System MUST provide filter controls for all user profile attributes: sport, position, strong foot, open to opportunities, height (range), age (range), location.
- **FR-002**: System MUST provide filter controls for all athlete metrics: sprint speed 30m (range), agility T-test (range), beep test level (range), vertical jump (range).
- **FR-003**: System MUST apply filters using AND logic (all selected filters must match).
- **FR-004**: System MUST calculate age from date of birth for age filtering.
- **FR-005**: System MUST support range inputs (min/max) for numeric filters.
- **FR-006**: System MUST allow clearing individual filters or resetting all filters.
- **FR-007**: System MUST reflect filter state in URL query parameters for shareability.
- **FR-008**: System MUST paginate discovery results with clear page navigation.
- **FR-008a**: System MUST sort discovery results by most recently updated (updated_at) by default.
- **FR-008b**: System MUST allow users to change sort order: Recently Updated (updated_at desc), Alphabetically (name A-Z), or Newest Accounts (created_at desc).
- **FR-009**: System MUST display athlete cards with: profile image, name, sport, position, key attributes, and all available metrics.
- **FR-009a**: System MUST display filters in a collapsible drawer/bottom sheet on mobile devices, triggered by a "Filters" button.
- **FR-010**: System MUST exclude the current user from discovery results (users should not discover themselves).

#### Watchlists

- **FR-011**: System MUST allow users to create multiple watchlists with a required name and optional description.
- **FR-012**: System MUST ensure watchlists are private and visible only to the owner.
- **FR-013**: System MUST allow adding the same athlete to multiple watchlists.
- **FR-014**: System MUST prevent duplicate athlete entries in the same watchlist.
- **FR-015**: System MUST allow renaming and editing watchlist descriptions.
- **FR-016**: System MUST allow deleting watchlists with confirmation.
- **FR-017**: System MUST allow removing individual athletes from watchlists.
- **FR-018**: System MUST display athlete count for each watchlist in the list view.
- **FR-019**: System MUST provide inline watchlist creation when adding athletes from discovery.
- **FR-020**: System MUST show visual feedback when an athlete is added to a watchlist.
- **FR-020a**: System MUST display a badge/icon on the "Add to Watchlist" button indicating when an athlete is already in one or more watchlists (e.g., checkmark or count).

#### Navigation

- **FR-021**: System MUST add "Watchlists" link to main navigation as the last item.
- **FR-022**: Watchlists link MUST appear after "Network" and "Saved" in the navigation order.

### Key Entities

- **Watchlist**: A named collection of athletes created by a user. Contains id, userId (owner), name (required), description (optional), timestamps. Each user can have multiple watchlists.

- **WatchlistAthlete**: Junction entity linking watchlists to athletes. Contains watchlistId, athleteId, addedAt timestamp. Unique constraint ensures an athlete appears only once per watchlist.

- **DiscoveryFilter**: Represents the filter criteria for athlete search. Includes all filterable attributes (sport, position, strong foot, etc.) and metrics (sprint speed, vertical jump, etc.) with support for ranges on numeric values.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can apply any combination of available filters and receive matching results within 3 seconds.
- **SC-002**: Filter state persists in URL, allowing users to share filtered views via link.
- **SC-003**: Paginated results display correctly with users able to navigate between pages.
- **SC-004**: Users can create a new watchlist and add an athlete to it in under 30 seconds.
- **SC-005**: Users can view all their watchlists and see accurate athlete counts for each.
- **SC-006**: Users can remove an athlete from a watchlist with immediate visual feedback.
- **SC-007**: Watchlist privacy is enforced; users cannot access others' watchlists.
- **SC-008**: All discovery and watchlist pages are fully functional on mobile devices.
- **SC-009**: Empty states provide clear guidance (no results, no watchlists, empty watchlist).
- **SC-010**: Watchlists navigation link is visible and correctly positioned in the main navigation.

## Assumptions

- All filterable attributes and metrics are already present in the database schema (confirmed from Prisma schema review).
- Age will be calculated dynamically from the `dateOfBirth` field in `user_attributes`.
- The current user will be excluded from discovery results to prevent self-discovery.
- Watchlist sharing functionality is explicitly deferred for future implementation.
- Default pagination size will follow existing application patterns (assumed 10-20 items per page).
- Filter dropdowns for sport and position will be populated from existing database tables.

## Clarifications

### Session 2025-12-03

- Q: Default sort order for discovery results? → A: Most recently updated (updated_at desc), with user option to sort alphabetically or by newest accounts (created_at desc).
- Q: Max limits on watchlists or athletes per watchlist? → A: No hard limits; rely on pagination to handle large lists.
- Q: Add to Watchlist interaction pattern? → A: Checkboxes with "Save" button allowing multi-select, then confirm.
- Q: Mobile filter panel display? → A: Collapsible drawer/bottom sheet triggered by "Filters" button.
- Q: Visual indication for athletes already in watchlists? → A: Badge/icon on button showing checkmark or count (e.g., "In 2 lists").
- Q: Inline watchlist creation behavior in modal? → A: After creating a new watchlist inline, the new watchlist appears in the list with its checkbox auto-selected; the modal stays open so the user can save their selection.
