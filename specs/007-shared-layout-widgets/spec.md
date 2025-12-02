# Feature Specification: Shared Layout with Widgets

**Feature Branch**: `007-shared-layout-widgets`  
**Created**: November 30, 2025  
**Status**: Draft  
**Input**: User description: "Create a shared layout for dashboard and discovery pages with left and right widget sidebars, starting with a profile widget displaying current authenticated user details.

**Requirements:**

- **Shared Layout Structure:** Implement a new layout component that wraps the dashboard and discovery pages. Use Next.js App Router conventions by creating a route group (e.g., `(main)` or `(authenticated-pages)`) under `/app` to share the layout without affecting other routes. The layout should include:
  - A main content area (flexible, centered).
  - Left sidebar for widgets (fixed width, e.g., 300px, hidden on mobile or collapsible).
  - Right sidebar for widgets (fixed width, e.g., 300px, hidden on mobile or collapsible).
  - Ensure mobile-first responsiveness: sidebars should stack or hide on smaller screens using Tailwind CSS breakpoints.
  - Use semantic Tailwind classes from `globals.css` (e.g., `bg-background`, `text-foreground`).
- **Profile Widget:** Create a reusable profile widget component to place in the left sidebar initially. It should:
  - Display key details of the current authenticated user: username, full name (first + last), profile image (using `next/image`), bio snippet (truncated to 100 chars), and location.
  - Fetch user profile data using the existing `UserService.getUserProfile()` method (pass `session.user.username` as the parameter).
  - Handle loading states (e.g., skeleton) and errors gracefully (show a fallback message like "Unable to load profile").
  - Be a Client Component (`'use client'`) to access `useSession()` from NextAuth.js.
  - Use shadcn/ui `Card` component for styling.
  - Validate data with Zod if needed, but rely on existing `UserProfile` type.
  - Make it clickable to navigate to the user's profile page (using `session.user.publicUuid`).
- **Page Restructuring:**
  - Move the existing `dashboard/page.tsx` into the new route group (e.g., `app/(main)/dashboard/page.tsx`).
  - Create a new `discovery/page.tsx` in the same group with basic placeholder content (e.g., a heading and description, similar to dashboard).
  - Update any imports or references if needed (e.g., in navigation).
- **Integration and Best Practices:**
  - Follow project constitution: Use Server Components for the layout where possible; make the widget Client only as needed. Centralize types in `/types`. Use `React Hook Form` if forms are added later. Implement proper error handling (try/catch in data fetching).
  - Place the profile widget in `/components/widgets/ProfileWidget.tsx` (create `/components/widgets/` if it doesn't exist).
  - Ensure the layout is extensible: Pass children for main content, and allow adding more widgets via props or slots.
  - Add JSDoc comments for complex logic.
  - Test for TypeScript compilation and responsiveness.
  - No breaking changes to existing routes or components.

**Output Structure:**

- Generate all necessary files: layout.tsx, updated dashboard/page.tsx, new discovery/page.tsx, ProfileWidget.tsx.
- Include any required imports, types, and minimal styling.
- Provide a brief summary of changes and how to extend the layout."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Dashboard with Profile Widget (Priority: P1)

As an authenticated user, I want to view the dashboard page with a shared layout that includes a profile widget in the left sidebar, so I can quickly see my profile details while accessing dashboard content.

**Why this priority**: This is the primary user journey for the feature, delivering immediate value by enhancing the dashboard experience with personalized information.

**Independent Test**: Can be fully tested by logging in, navigating to /dashboard, and verifying the profile widget displays user details correctly in the left sidebar.

**Acceptance Scenarios**:

1. **Given** user is authenticated and on the dashboard page, **When** the page loads, **Then** the layout displays with left sidebar containing profile widget showing username, full name, profile image, bio snippet, and location.
2. **Given** user clicks on the profile widget, **When** clicked, **Then** navigates to the user's profile page.

---

### User Story 2 - View Discovery Page with Shared Layout (Priority: P2)

As an authenticated user, I want to view the discovery page with the same shared layout as dashboard, so I have a consistent experience across authenticated pages.

**Why this priority**: Ensures consistency and reusability of the layout for multiple pages.

**Independent Test**: Can be fully tested by navigating to /discovery and verifying the same layout structure with profile widget is applied.

**Acceptance Scenarios**:

1. **Given** user is authenticated and on the discovery page, **When** the page loads, **Then** the layout displays with left sidebar containing profile widget and main content area for discovery features.

---

### User Story 3 - Responsive Layout on Mobile Devices (Priority: P3)

As a user on a mobile device, I want the layout to adapt responsively, so I can access content comfortably on smaller screens.

**Why this priority**: Ensures accessibility and usability across devices, following mobile-first design principles.

**Independent Test**: Can be fully tested by resizing browser or using mobile view to verify sidebars hide or stack appropriately.

**Acceptance Scenarios**:

1. **Given** user is on a mobile device, **When** viewing dashboard or discovery, **Then** sidebars are hidden or collapsed, and main content is fully accessible.

---

### Edge Cases

- What happens when profile data fails to load (e.g., network error)? System shows fallback message "Unable to load profile".
- How does system handle when user has no profile image? Displays default avatar or placeholder.
- What if bio is longer than 100 characters? Truncates with ellipsis.
- How does layout behave on very small screens (e.g., 320px width)? Sidebars fully hidden, main content centered.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST implement a shared layout component using Next.js route group (e.g., `(main)`) that wraps dashboard and discovery pages.
- **FR-002**: Layout MUST include a flexible main content area, left sidebar (300px fixed width), and right sidebar (300px fixed width).
- **FR-003**: Layout MUST be mobile-responsive: sidebars hidden on screens smaller than md breakpoint using Tailwind CSS.
- **FR-004**: System MUST create a ProfileWidget component in `/components/widgets/ProfileWidget.tsx` that displays authenticated user's username, full name, profile image, bio snippet (truncated to 100 chars), and location.
- **FR-005**: ProfileWidget MUST fetch user profile data using `UserService.getUserProfile()` with `session.user.username`.
- **FR-006**: ProfileWidget MUST handle loading states with skeleton UI and errors with fallback message.
- **FR-007**: ProfileWidget MUST be a Client Component using `'use client'` to access NextAuth session.
- **FR-008**: ProfileWidget MUST use shadcn/ui Card component for styling and be clickable to navigate to profile page using `session.user.publicUuid`.
- **FR-009**: System MUST move existing `dashboard/page.tsx` to `app/(main)/dashboard/page.tsx`.
- **FR-010**: System MUST create new `app/(main)/discovery/page.tsx` with placeholder content.
- **FR-011**: Layout MUST be extensible with props/slots for adding more widgets.
- **FR-012**: All components MUST follow project constitution: Server Components where possible, proper error handling, TypeScript strict mode.

### Key Entities _(include if feature involves data)_

- **UserProfile**: Represents authenticated user's profile data including username, firstName, lastName, profileImageUrl, bio, location. Fetched from database via UserService.
- **Layout**: Component structure with main content, left sidebar, right sidebar. No data persistence, purely UI.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view dashboard and discovery pages with shared layout loading in under 2 seconds.
- **SC-002**: Profile widget displays user details accurately for 100% of authenticated users with complete profiles.
- **SC-003**: Layout remains functional and visually consistent on screens from 320px to 1920px width.
- **SC-004**: Profile widget navigation to profile page works for 100% of clicks.
- **SC-005**: No TypeScript compilation errors or linting issues in generated code.
