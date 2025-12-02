# Feature Specification: Global Header

**Feature Branch**: `006-global-header`  
**Created**: November 29, 2025  
**Status**: Draft  
**Input**: User description: "Create a global header component for a Next.js 13+ app using the app router. The header must be a client component that conditionally renders on all pages except the homepage ('/'). Use usePathname from next/navigation to check the current route and hide the header on '/'. The header should be styled with Tailwind CSS and split into three parts: Left section: Display the logo from logo.png as a clickable link to the homepage ('/'). Make it responsive (e.g., smaller on mobile). Middle section: Navigation links with icons from @heroicons/react (v2.2.0). Each link should use next/link for client-side navigation. Style them as a horizontal list, centered, with hover effects. Links: Dashboard: /dashboard with HomeIcon (solid). Discovery: /discovery with MagnifyingGlassIcon (solid, or CompassIcon if preferred). Inbox: /inbox with InboxIcon (solid). Notifications: /notifications with BellIcon (solid). Profile: /profile/{uuid}/{username} with UserIcon (solid). Dynamically generate the URL using the current user's publicUuid and username from the NextAuth session (via useSession from next-auth/react). If no session, hide or disable this link. Right section: A search bar for searching people by name or username. Use the existing Command component from command.tsx (built on cmdk) for autocomplete functionality. The search should query a new API endpoint (e.g., /api/search/people) that accepts a query parameter and returns a list of users with name and username. Display results as links to their profiles (/profile/{uuid}/{username}). Include a search icon (MagnifyingGlassIcon) in the input. Make it responsive (e.g., full-width on mobile). Key requirements: The header should be fixed at the top of the page with a shadow and background color (e.g., white or dark mode compatible). Ensure accessibility: ARIA labels, keyboard navigation, and screen reader support. Handle loading states for the search (e.g., show a spinner from @/components/ui/spinner.tsx). Integrate with the existing SessionProvider and QueryProvider in the app. Place the component in /components/Header.tsx and import it into layout.tsx inside the <Providers> wrapper, but conditionally render it based on pathname. If the search API doesn't exist, suggest creating it in /app/api/search/people/route.ts using the profile service. Use existing UI components like Button, Input, etc., from ui for consistency. Test for responsiveness: Stack vertically on small screens if needed. Generate the complete code for Header.tsx, the API route if needed, and updates to layout.tsx. Include TypeScript types and error handling."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Global Header on Authenticated Pages (Priority: P1)

Users can see the global header when navigating to any page except the homepage, providing consistent navigation and search functionality across the app.

**Why this priority**: This is the core functionality of the global header, enabling users to access key features from any page.

**Independent Test**: Can be fully tested by navigating to /dashboard and verifying the header appears at the top with logo, navigation links, and search bar.

**Acceptance Scenarios**:

1. **Given** a user navigates to /dashboard, **When** the page loads, **Then** the header is visible at the top with three sections: logo on left, navigation links in middle, search bar on right.
2. **Given** a user navigates to /profile/some-uuid/some-username, **When** the page loads, **Then** the header is visible.
3. **Given** a user navigates to /, **When** the page loads, **Then** the header is not visible.

---

### User Story 2 - Navigate Using Header Links (Priority: P1)

Users can click navigation links in the header to quickly access different sections of the app.

**Why this priority**: Navigation is essential for user experience and app usability.

**Independent Test**: Can be fully tested by clicking each navigation link and verifying correct page navigation.

**Acceptance Scenarios**:

1. **Given** the header is visible, **When** user clicks Dashboard link, **Then** navigates to /dashboard.
2. **Given** the header is visible, **When** user clicks Discovery link, **Then** navigates to /discovery.
3. **Given** the header is visible, **When** user clicks Inbox link, **Then** navigates to /inbox.
4. **Given** the header is visible, **When** user clicks Notifications link, **Then** navigates to /notifications.
5. **Given** user is logged in with profile data, **When** user clicks Profile link, **Then** navigates to /profile/{uuid}/{username} using current user's data.

---

### User Story 3 - Search for People (Priority: P2)

Users can search for other users by name or username to find and visit their profiles.

**Why this priority**: Search functionality enhances discoverability and social features of the app.

**Independent Test**: Can be fully tested by typing in the search bar and verifying autocomplete results appear with links to user profiles.

**Acceptance Scenarios**:

1. **Given** the header is visible, **When** user types in search bar, **Then** autocomplete shows matching users by name or username.
2. **Given** search results are shown, **When** user clicks a result, **Then** navigates to that user's profile page.
3. **Given** no matching users, **When** user searches, **Then** no results shown or appropriate message displayed.

### Edge Cases

- What happens when user is not logged in? Profile link should be hidden or disabled.
- How does system handle search with no internet connection? Show error state.
- What happens when search API returns error? Display user-friendly error message.
- How does header behave on very small screens? Should stack or adjust layout appropriately.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display the global header on all pages except the homepage ('/').
- **FR-002**: Header MUST be implemented as a client component using usePathname to conditionally render.
- **FR-003**: Left section MUST display the logo from /public/logo.png as a clickable link to '/'.
- **FR-004**: Middle section MUST contain navigation links with appropriate icons from @heroicons/react.
- **FR-005**: Navigation links MUST include Dashboard (/dashboard), Discovery (/discovery), Inbox (/inbox), Notifications (/notifications), and Profile (/profile/{uuid}/{username}).
- **FR-006**: Profile link MUST dynamically use current user's publicUuid and username from NextAuth session.
- **FR-007**: If no user session, Profile link MUST be hidden or disabled.
- **FR-008**: Right section MUST contain a search bar for searching people by name or username.
- **FR-009**: Search MUST use the Command component for autocomplete functionality.
- **FR-010**: Search MUST query /api/search/people endpoint with query parameter.
- **FR-011**: Search results MUST display as links to user profiles (/profile/{uuid}/{username}).
- **FR-012**: Header MUST be fixed at top with shadow and appropriate background.
- **FR-013**: Header MUST be accessible with ARIA labels and keyboard navigation.
- **FR-014**: Search MUST show loading states during API calls.
- **FR-015**: Header MUST be responsive, adjusting layout on mobile devices.

### Key Entities _(include if feature involves data)_

- **User**: Represents app users with attributes like name, username, and publicUuid for profile linking and search.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Header loads and renders in under 1 second on authenticated pages.
- **SC-002**: All navigation links work correctly without broken links or errors.
- **SC-003**: Search returns relevant results in under 500ms for queries with matches.
- **SC-004**: Header passes accessibility audits with 100% compliance for ARIA and keyboard navigation.
- **SC-005**: Header displays correctly on mobile devices with appropriate responsive behavior.

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

_Example of marking unclear requirements:_

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities _(include if feature involves data)_

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
