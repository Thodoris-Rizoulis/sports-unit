# Feature Specification: Enhanced User Profile Sections

**Feature Branch**: `012-enhanced-profile-sections`  
**Created**: December 2, 2025  
**Status**: Draft  
**Input**: User description: "Implement additional sections for user profile pages to provide a comprehensive athlete/coach profile. Add Key Information (athlete only), Athlete Metrics (athlete only), Recent Activity, Experience, Education, Licenses & Certifications (coach only), and a right sidebar with Languages and Awards widgets. Profile type detection based on roleId from profile_roles table (athlete, coach, scout)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Enhanced Profile (Priority: P1)

As a logged-in user, I want to view comprehensive profile information for any user, including their key information, metrics (if athlete), recent activity, experience, education, certifications (if coach), languages, and awards.

**Why this priority**: This is the core read functionality that enables users to discover comprehensive information about athletes and coaches on the platform.

**Independent Test**: Can be fully tested by navigating to any user's profile page and verifying all applicable sections display with their data or appropriate empty states.

**Acceptance Scenarios**:

1. **Given** I am logged in and viewing an athlete's profile, **When** the page loads, **Then** I see Hero, Key Information, About, Athlete Metrics, Recent Activity, Experience, Education sections in the main content, and Languages/Awards widgets in the right sidebar.
2. **Given** I am logged in and viewing a coach's profile, **When** the page loads, **Then** I see Hero, About, Recent Activity, Experience, Education, Licenses & Certifications sections (no Key Information or Metrics), and Languages/Awards widgets in the right sidebar.
3. **Given** I am viewing a profile on mobile, **When** the page loads, **Then** the sidebar widgets appear below the main content sections.
4. **Given** a user has no experience entries, **When** I view their profile, **Then** I see "No experience added yet" message in the Experience section.

---

### User Story 2 - Edit Key Information (Priority: P2)

As an athlete viewing my own profile, I want to edit my key information (date of birth, height, positions, strong foot) so I can keep my athletic details up to date.

**Why this priority**: Allows athletes to maintain accurate physical and positional information which is critical for scouts and coaches evaluating them.

**Independent Test**: Can be fully tested by an athlete user clicking edit on Key Information section, modifying fields, saving, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** I am an athlete viewing my own profile, **When** I click the edit button on Key Information section, **Then** a modal opens with date picker, height input, positions multi-select, and strong foot dropdown.
2. **Given** I am in the Key Information edit modal, **When** I change my height to 190cm and save, **Then** the modal closes and the Key Information section shows "190 cm".
3. **Given** I am in the Key Information edit modal, **When** I add a new position from the dropdown, **Then** the position is added to my selections.
4. **Given** I am in the Key Information edit modal, **When** I enter an invalid height (e.g., 300cm), **Then** I see a validation error and cannot save.

---

### User Story 3 - Manage Athlete Metrics (Priority: P2)

As an athlete, I want to record and update my performance metrics (sprint speed, agility, beep test, vertical jump) so scouts and coaches can evaluate my physical capabilities.

**Why this priority**: Performance metrics are key differentiators for athletes and essential data for talent evaluation.

**Independent Test**: Can be fully tested by an athlete user adding/editing their metrics and verifying the values display correctly.

**Acceptance Scenarios**:

1. **Given** I am an athlete with no metrics recorded, **When** I view my profile, **Then** the Metrics section shows "-" or "Not recorded" for all fields.
2. **Given** I am an athlete viewing my own profile, **When** I click edit on Metrics section, **Then** a modal opens with inputs for sprint speed, agility t-test, beep test (level and shuttle), and vertical jump.
3. **Given** I am editing metrics, **When** I enter sprint speed as 4.5 seconds and save, **Then** the Metrics section shows "4.5s" for Sprint Speed.
4. **Given** I am editing metrics, **When** I enter beep test level 11 and shuttle 4, **Then** the Metrics section displays "Level 11.4".
5. **Given** I am editing metrics, **When** I enter sprint speed as 2.0 seconds (below minimum), **Then** I see a validation error.

---

### User Story 4 - View Recent Activity (Priority: P2)

As a user, I want to see the 2 most recent posts on any profile and navigate to see all posts, so I can quickly understand someone's activity.

**Why this priority**: Recent activity provides quick insight into user engagement and content.

**Independent Test**: Can be fully tested by viewing a profile with posts and verifying 2 most recent show, then clicking "See All" to view full post history.

**Acceptance Scenarios**:

1. **Given** I am viewing a user's profile who has 5 posts, **When** the page loads, **Then** I see the 2 most recent posts displayed as cards.
2. **Given** I am viewing a user's profile with posts, **When** I click "See All", **Then** I am navigated to /profile/{uuid}/{username}/posts.
3. **Given** I am on the user's posts page, **Then** I see all their posts in a feed format with the (main) layout.
4. **Given** I am viewing a user's profile with no posts, **When** the page loads, **Then** I see "No posts yet" message.

---

### User Story 5 - Manage Experience (Priority: P3)

As a user, I want to add, edit, and delete my career experience entries so visitors can see my professional history.

**Why this priority**: Experience history is important for professional credibility but is additive to the core profile.

**Independent Test**: Can be fully tested by adding an experience entry, editing it, and deleting it, verifying each operation persists correctly.

**Acceptance Scenarios**:

1. **Given** I am viewing my own profile with no experience, **When** I click "Add" on Experience section, **Then** a modal opens with title input, team searchable dropdown (filtered by my sport), year from picker, year to picker with "Present" checkbox, and location input.
2. **Given** I am adding experience, **When** I check "Present" checkbox, **Then** the Year To field is disabled.
3. **Given** I have 3 experience entries, **When** I view the Experience section, **Then** entries are ordered by start year descending (most recent first).
4. **Given** I am viewing my experience entry, **When** I click edit, **Then** I can modify all fields and save changes.
5. **Given** I am viewing my experience entry, **When** I click delete, **Then** I see a confirmation dialog and the entry is removed upon confirmation.

---

### User Story 6 - Manage Education (Priority: P3)

As a user, I want to add, edit, and delete my education entries so visitors can see my educational background.

**Why this priority**: Education is supplementary profile information that adds credibility.

**Independent Test**: Can be fully tested by CRUD operations on education entries.

**Acceptance Scenarios**:

1. **Given** I am viewing my own profile, **When** I click "Add" on Education section, **Then** a modal opens with title (institution), subtitle (degree), year from, year to with "Present" checkbox.
2. **Given** I have education entries, **When** I view Education section, **Then** entries show institution name, degree, and year range ordered by start year descending.
3. **Given** I am currently enrolled, **When** I check "Present" for year to, **Then** the display shows "2022 - Present".

---

### User Story 7 - Manage Licenses & Certifications (Priority: P3)

As a coach, I want to add, edit, and delete my licenses and certifications so visitors can verify my qualifications.

**Why this priority**: Certifications are important for coach credibility but only applicable to coach role.

**Independent Test**: Can be fully tested by a coach user performing CRUD operations on certifications.

**Acceptance Scenarios**:

1. **Given** I am a coach viewing my own profile, **When** I click "Add" on Certifications section, **Then** a modal opens with title, organization, year, and description fields.
2. **Given** I am an athlete viewing my own profile, **When** the page loads, **Then** I do not see the Licenses & Certifications section.
3. **Given** I am viewing a coach's profile, **When** the page loads, **Then** I see their certifications ordered by year descending.

---

### User Story 8 - Manage Languages (Priority: P4)

As a user, I want to add, edit, and delete my language proficiencies so visitors know what languages I speak.

**Why this priority**: Languages are sidebar information that adds context but is less critical than main profile sections.

**Independent Test**: Can be fully tested by CRUD operations on language entries in the sidebar widget.

**Acceptance Scenarios**:

1. **Given** I am viewing my own profile, **When** I click "Add" on Languages widget, **Then** a modal opens with language text input and level dropdown (Native, Fluent, Proficient, Intermediate, Basic).
2. **Given** I have languages added, **When** I view the Languages widget, **Then** each language shows with a level badge.

---

### User Story 9 - Manage Awards (Priority: P4)

As a user, I want to add, edit, and delete my awards so visitors can see my achievements.

**Why this priority**: Awards are sidebar information that showcases achievements but is supplementary.

**Independent Test**: Can be fully tested by CRUD operations on award entries in the sidebar widget.

**Acceptance Scenarios**:

1. **Given** I am viewing my own profile, **When** I click "Add" on Awards widget, **Then** a modal opens with title, year, and optional description fields.
2. **Given** I have awards added, **When** I view the Awards widget, **Then** awards are ordered by year descending.

---

### Edge Cases

- What happens when a user switches roles (e.g., athlete to coach)? Role-specific sections should dynamically appear/disappear based on current role. Existing data remains in database.
- What happens when team dropdown has no teams for user's sport? Show empty dropdown with message "No teams available".
- What happens when positions dropdown returns no positions? Show empty dropdown with message "No positions available for this sport".
- How does the system handle concurrent edits? Last write wins - standard optimistic concurrency.
- What happens if user has no sport selected? Key Information and Experience team dropdown may be limited. Show appropriate empty states.
- What if validation fails on save? Display validation errors inline in the modal without closing it.
- What happens when deleting an experience entry that references a team that was deleted? Foreign key constraint - teams referenced by experiences cannot be deleted (handled at DB level).

## Requirements _(mandatory)_

### Functional Requirements

**Profile Display**

- **FR-001**: System MUST detect user role from `profile_roles` table via `users.roleId` to determine which sections to display.
- **FR-002**: System MUST display Key Information section only for users with role "athlete".
- **FR-003**: System MUST display Athlete Metrics section only for users with role "athlete".
- **FR-004**: System MUST display Licenses & Certifications section only for users with role "coach".
- **FR-005**: System MUST display Recent Activity, Experience, Education, Languages, and Awards sections for all users.
- **FR-006**: System MUST show edit buttons only to profile owners (session user matches profile user).
- **FR-007**: System MUST display empty state messages with "Add" button for owners when sections have no data.

**Key Information Section**

- **FR-008**: System MUST display date of birth formatted as full date (e.g., "March 15, 1998").
- **FR-009**: System MUST display height in centimeters (e.g., "185 cm").
- **FR-010**: System MUST display positions as badges/tags from the positions table.
- **FR-011**: System MUST display strong foot value (Left/Right/Both).
- **FR-012**: System MUST allow editing via modal with date picker, height input, positions multi-select, and strong foot dropdown.
- **FR-013**: System MUST filter positions dropdown by user's sport from `positions` table where `sportId` matches.
- **FR-014**: System MUST validate height using same rules as onboarding (100-250 cm from constants).

**Athlete Metrics Section**

- **FR-015**: System MUST store and display sprint speed (30m) in seconds with validation range 3.0-8.0.
- **FR-016**: System MUST store and display agility t-test in seconds with validation range 8.0-20.0.
- **FR-017**: System MUST store beep test as two fields (level 1-21, shuttle 1-16) and display as "Level X.Y".
- **FR-018**: System MUST store and display vertical jump in cm with validation range 10-150.
- **FR-019**: All metrics fields MUST be optional.
- **FR-020**: System MUST display "-" or "Not recorded" for empty metric values.

**Recent Activity Section**

- **FR-021**: System MUST display the 2 most recent posts using existing PostCard component.
- **FR-022**: System MUST display "No posts yet" when user has no posts.
- **FR-023**: System MUST provide "See All" button navigating to /profile/{uuid}/{username}/posts.
- **FR-024**: Posts page MUST use (main) layout and display all user's posts with pagination.

**Experience Section**

- **FR-025**: System MUST allow adding experience with title (required), team (required, from user's sport), year from (required), year to (optional), location (optional).
- **FR-026**: System MUST provide "Present" checkbox that disables year to field and stores null.
- **FR-027**: System MUST filter teams dropdown by user's sportId.
- **FR-028**: System MUST order experience entries by start year descending.
- **FR-029**: System MUST allow edit and delete operations with confirmation for delete.

**Education Section**

- **FR-030**: System MUST allow adding education with title/institution (required), subtitle/degree (optional), year from (required), year to (optional with Present option).
- **FR-031**: System MUST order education entries by start year descending.
- **FR-032**: System MUST allow edit and delete operations with confirmation for delete.

**Licenses & Certifications Section (Coach)**

- **FR-033**: System MUST allow adding certification with title (required), organization (optional), year (required), description (optional).
- **FR-034**: System MUST order certifications by year descending.
- **FR-035**: System MUST allow edit and delete operations with confirmation for delete.

**Languages Widget**

- **FR-036**: System MUST allow adding language with name (required) and level (required: Native/Fluent/Proficient/Intermediate/Basic).
- **FR-037**: System MUST display languages with level badges.
- **FR-038**: System MUST allow edit and delete operations.

**Awards Widget**

- **FR-039**: System MUST allow adding award with title (required), year (required), description (optional).
- **FR-040**: System MUST order awards by year descending.
- **FR-041**: System MUST allow edit and delete operations.

**Layout**

- **FR-042**: Desktop layout MUST show main content on left (max-width 4xl) and sidebar on right (~280px).
- **FR-043**: Mobile layout MUST show full-width content with sidebar sections below main content.
- **FR-044**: Sidebar component MUST be modular and reusable for other pages.

### Key Entities

- **Athlete Metrics**: Performance measurements for athletes. One record per user. Attributes: sprint speed, agility, beep test (level/shuttle), vertical jump. Related to users.

- **User Experience**: Career/playing history entries. Multiple per user. Attributes: title, team, years, location. Related to users and teams.

- **User Education**: Educational background entries. Multiple per user. Attributes: institution, degree, years. Related to users.

- **User Certification**: Professional licenses for coaches. Multiple per user. Attributes: title, organization, year, description. Related to users.

- **User Language**: Language proficiencies. Multiple per user. Attributes: language name, proficiency level. Related to users.

- **User Award**: Achievements and recognitions. Multiple per user. Attributes: title, year, description. Related to users.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view a complete enhanced profile page in under 3 seconds on desktop.
- **SC-002**: Users can add a new experience/education entry in under 1 minute.
- **SC-003**: All profile sections display correctly on mobile devices with proper responsive layout.
- **SC-004**: 95% of profile page loads complete without errors.
- **SC-005**: Profile owners can successfully edit their Key Information on first attempt.
- **SC-006**: All form validation errors are displayed clearly and users can correct them without confusion.
- **SC-007**: Empty states clearly communicate what data is missing and provide action for owners to add it.
