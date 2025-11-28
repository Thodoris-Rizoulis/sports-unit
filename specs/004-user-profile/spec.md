# Feature Specification: User Profile

**Feature Branch**: `004-user-profile`  
**Created**: November 25, 2025  
**Status**: Draft  
**Input**: User description: "Implement user profile pages for the sports networking platform. Each user should have a dedicated profile page accessible via a URL like /profile/{username}. The page consists of two main sections: Hero and About. Hero section: Split horizontally into two parts. Above part (cover section): Display a cover image (default placeholder if none uploaded); if the session user owns the profile, include an upload/edit button to update the cover image via Cloudflare R2. Bottom part (user info section): Display four lines - 1) User's first and last name, 2) @{username}, 3) Current team - location, 4) If "open to opportunities" is true, show a success-colored box (using global.css success color) with text "Open to opportunities"; otherwise, nothing. Profile picture: Located at the left of the hero section, rounded, uploadable by profile owners. Use responsive design for mobile stacking. About section: Display the user's bio text in a clean, readable format. Editing: If the session user matches the profile owner, add edit buttons/modes for updating cover image, profile picture, bio, and "open to opportunities" toggle. Save changes via API endpoints. Include validation and error handling. Backend: Create (if not exit already) API endpoints for fetching profile data and updating fields. Ensure authentication and ownership checks. Use existing database schema (users, user_attributes). Frontend: Build with Next.js, TypeScript, shadcn components, Tailwind CSS. Mobile-first responsive. Follow constitution: Modular, reusable components, error handling, strict TypeScript. Deliverables: Functional profile view and edit pages, API integration, image upload handling, and responsive UI. Placeholder data for testing."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Own Profile (Priority: P1)

As a logged-in user, I want to view my own profile page to see my personal information and bio.

**Why this priority**: This is the core functionality for users to access their profile, enabling self-presentation on the platform.

**Independent Test**: Can be fully tested by logging in, navigating to /profile/{my-username}, and verifying the hero section shows profile picture, cover image, and user info, and the about section shows bio.

**Acceptance Scenarios**:

1. **Given** I am logged in and have completed onboarding, **When** I navigate to /profile/{my-username}, **Then** I see the hero section with rounded profile picture on the left, cover image and user info on the right, and the about section with my bio.
2. **Given** I have no cover image or profile picture uploaded, **When** I view my profile, **Then** default placeholder images are displayed.
3. **Given** my "open to opportunities" is enabled, **When** I view my profile, **Then** a success-colored box appears with "Open to opportunities" text.

---

### User Story 2 - Edit Profile Information (Priority: P2)

As a profile owner, I want to edit my profile fields including cover image, profile picture, bio, and opportunities status.

**Why this priority**: Allows users to maintain and update their profile, keeping information current and engaging.

**Independent Test**: Can be fully tested by accessing edit mode on own profile, making changes, saving, and verifying updates persist and display correctly.

**Acceptance Scenarios**:

1. **Given** I am viewing my own profile, **When** I click an edit button, **Then** I enter edit mode for cover image, profile picture, bio, and opportunities toggle.
2. **Given** I am in edit mode, **When** I upload a new cover image and profile picture, **Then** the images update and are stored via Cloudflare R2.
3. **Given** I am in edit mode, **When** I update my bio and toggle opportunities status, **Then** changes are saved and reflected on the profile page.

---

### User Story 3 - View Other Users' Profiles (Priority: P3)

As a logged-in user, I want to view other users' profile pages to learn about them.

**Why this priority**: Enables networking by allowing users to discover and connect with others on the platform.

**Independent Test**: Can be fully tested by navigating to another user's /profile/{username}, verifying display of their public information without edit options.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I navigate to /profile/{another-username}, **Then** I see their hero and about sections with their data.
2. **Given** I am viewing another user's profile, **When** I look for edit options, **Then** no edit buttons or modes are available.

### Edge Cases

- What happens when navigating to a non-existent username? System should show a 404 error page.
- How does system handle when cover image or profile picture upload fails? Display error message and keep existing images.
- What if bio text is very long? Ensure it displays in a readable format without breaking layout.
- How to handle users without complete profile data? Display available data and placeholders for missing fields.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a profile page at /profile/{username} for each user.
- **FR-002**: System MUST display hero section with rounded profile picture on the left, cover image and user info lines on the right (name, username, team-location, opportunities status).
- **FR-003**: System MUST display about section with user's bio text.
- **FR-004**: System MUST allow profile owners to edit cover image, profile picture, bio, and opportunities status.
- **FR-005**: System MUST use Cloudflare R2 for image storage and upload.
- **FR-006**: System MUST ensure only authenticated users can view profiles and only owners can edit.
- **FR-007**: System MUST validate profile updates and handle errors gracefully.
- **FR-008**: System MUST be responsive, stacking hero sections vertically on mobile.
- **FR-009**: System MUST use success color from global.css for opportunities box.

### Key Entities _(include if feature involves data)_

- **User Profile**: Represents a user's public profile information, including first name, last name, username, team, location, bio, cover image URL, profile image URL, and open to opportunities flag. Related to users table and user_attributes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can view any profile page in under 3 seconds.
- **SC-002**: Profile owners can successfully update their information in under 2 minutes.
- **SC-003**: 95% of profile views load without errors.
- **SC-004**: 90% of users complete profile edits on first attempt.
