# Feature Specification: Advanced Onboarding

**Feature Branch**: `003-advanced-onboarding`  
**Created**: November 25, 2025  
**Status**: Draft  
**Input**: User description: "Implement a multi-step onboarding flow for new users to collect profile information, replacing the current simple button. This enables rich user profiles for a sports networking platform (LinkedIn-like for athletes, coaches, and scouts). Users must complete required fields; optional fields can be skipped but edited later. role/username selection if role is null.

Key Requirements:

- Multi-step wizard: 4 steps (1. Role/Username Selection - conditional if role null; 2. Basic Profile; 3. Sports Details; 4. Review/Submit).
- Role-based fields: Athletes and coaches only for now.
- Data collection:
  - Step 1 (conditional): Edit username (required, validation: 3-20 chars, alphanumeric + underscores, unique), select role (athlete/coach from DB).
  - Step 2: First name (req), last name (req), bio (opt, 200 chars), location (opt, free text), date of birth (opt), height (opt, cm), profile picture (opt), cover picture (opt).
  - Step 3: Sport (req, single select from DB - Football only), positions (req, multi-select from DB, max 3), current team (opt from DB), open to opportunities (req, default false), strong foot (opt for football).
- Media upload: P0 critical path feature, Cloudflare R2, client-side with presigned URLs.
- Validation: Zod schemas, limits from constants.ts, real-time feedback.
- Database: New tables - sports (seed: Football), positions (seed: football positions), teams (seed: major football teams), user_attributes (single table with all columns, FKs, JSON for multi-selects).
- Technical: Next.js, shadcn, NextAuth session updates, API endpoint updates.
- UX: Progress indicator, responsive, mobile-first.

User Stories:

1. As a new user, I must provide required profile details during onboarding to access the platform fully.
2. As an athlete/coach, I want onboarding questions tailored to my role and selected sport.
3. As a user, I want to see my onboarding progress and know which fields are required vs optional.
4. As a user, I want to edit my profile details after onboarding, with the same limits and validation.

Success Criteria: 90% complete in 5 mins, enables search/discovery, no loops, mobile >80%, uploads reliable.

no tests for MVP.

Output: Full spec with plan, tasks, checklists, following project constitution (TypeScript, modular, etc.)."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Complete Required Profile Details (Priority: P1)

As a new user, I must provide required profile details during onboarding to access the platform fully.

**Why this priority**: This is the core functionality enabling users to create rich profiles, which is essential for the sports networking platform.

**Independent Test**: Can be tested by attempting to access the dashboard without completing required fields, verifying access is blocked, and completing onboarding grants full access.

**Acceptance Scenarios**:

1. **Given** a new user with no role set, **When** they start onboarding, **Then** they are prompted to select role and username in step 1.
2. **Given** a user in onboarding, **When** they skip optional fields but complete required ones, **Then** they can proceed to the next step.
3. **Given** a user completes all required fields, **When** they submit, **Then** their profile is saved and they gain full platform access.

---

### User Story 2 - Role-Based Onboarding Questions (Priority: P2)

As an athlete/coach, I want onboarding questions tailored to my role and selected sport.

**Why this priority**: Ensures relevant data collection for athletes and coaches, improving profile quality.

**Independent Test**: Can be tested by selecting different roles and verifying that sports details step shows appropriate fields.

**Acceptance Scenarios**:

1. **Given** a user selects "athlete" role, **When** they reach sports details, **Then** they see fields for sport, positions, team, etc.
2. **Given** a user selects "coach" role, **When** they reach sports details, **Then** they see the same sports fields as athletes.

---

### User Story 3 - Onboarding Progress and Profile Management (Priority: P3)

As a user, I want to see my onboarding progress and know which fields are required vs optional. As a user, I want to edit my profile details after onboarding, with the same limits and validation.

**Why this priority**: Improves user experience with progress feedback and enables post-onboarding profile updates.

**Independent Test**: Navigate wizard steps for progress indicator; edit profile after completion.

**Acceptance Scenarios**:

1. **Given** a user in onboarding, **When** they view any step, **Then** they see a progress indicator showing current step and total steps.
2. **Given** a user views a form field, **When** it's required, **Then** it's clearly marked as required.
3. **Given** a user has completed onboarding, **When** they access profile edit, **Then** they see the same form fields with same validation.
4. **Given** a user edits their profile, **When** they save, **Then** changes are persisted with validation enforced.

### Edge Cases

- What happens when a user enters an invalid username (not 3-20 chars, not alphanumeric + underscores)?
- How does the system handle network failure during media upload?
- What if a user tries to select more than 3 positions?
- How does the system behave if the database is unavailable during submission?
- What happens if a user refreshes the page during onboarding?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a multi-step wizard with 4 steps: Role/Username Selection (conditional), Basic Profile, Sports Details, Review/Submit.
- **FR-002**: System MUST conditionally show Step 1 only if user's role is null, requiring username edit and role selection.
- **FR-003**: System MUST validate username: 3-20 characters, alphanumeric + underscores, unique.
- **FR-004**: System MUST allow selection of role from athlete/coach options.
- **FR-005**: System MUST collect first name and last name as required fields in Step 2.
- **FR-006**: System MUST allow optional fields in Step 2: bio (max 200 chars), location, date of birth, height, profile picture, cover picture.
- **FR-007**: System MUST collect sport as required single select (Football only initially).
- **FR-008**: System MUST collect positions as required multi-select, max 3.
- **FR-009**: System MUST allow optional current team selection.
- **FR-010**: System MUST collect "open to opportunities" as required boolean, default false.
- **FR-011**: System MUST allow optional strong foot selection for football.
- **FR-012**: System MUST support media upload with high priority.
- **FR-013**: System MUST validate inputs with real-time feedback.
- **FR-014**: System MUST persist new data entities for sports, positions, teams, and user attributes.
- **FR-015**: System MUST initialize sports with Football, positions with football positions, teams with major football teams.
- **FR-016**: System MUST store user attributes with relationships to sports, teams, and multiple positions.
- **FR-017**: System MUST update user session after onboarding completion.
- **FR-018**: System MUST provide endpoints for profile management.
- **FR-019**: System MUST display progress indicator throughout the wizard.
- **FR-020**: System MUST be responsive and mobile-first.

### Non-Functional Quality Attributes

- Security & Privacy: OAuth integration with data encryption for user authentication and data protection.
- Performance: 2 seconds average response time per step in the onboarding flow.
- Accessibility: WCAG 2.1 AA compliance for the onboarding interface.

### Key Entities _(include if feature involves data)_

- **User**: Represents platform users, with attributes like username, role, first name, last name, etc.
- **Role**: Defines user types (athlete, coach), related to users.
- **Sport**: Defines available sports (e.g., Football), related to user attributes.
- **Position**: Defines positions within sports (e.g., football positions), related to user attributes via JSON.
- **Team**: Defines teams (e.g., major football teams), optionally related to user attributes.
- **User Attributes**: Single table storing all profile attributes for users, with FKs to sport, team, and JSON for positions.

### Data Volume / Scale Assumptions

- Expected user base: 10,000-100,000 users
- Data growth: Profile attributes and media uploads scale proportionally with user registrations
- Performance expectations: Efficient queries for profile searches and discovery features

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 90% of users complete the onboarding flow in under 5 minutes.
- **SC-002**: Onboarding enables search and discovery features, with 80% of completed profiles being discoverable.
- **SC-003**: No infinite loops or navigation issues in the onboarding flow.
- **SC-004**: Mobile responsiveness achieves 80% user completion rate on mobile devices.
- **SC-005**: Media uploads are reliable with 95% success rate.

## Clarifications

### Session 2025-11-25

- Q: What are the expected data volume and scale assumptions for the platform? → A: Medium-scale (10,000-100,000 users)
- Q: What security and privacy measures are required for user data and authentication? → A: OAuth integration with data encryption
- Q: What are the specific performance targets for the onboarding flow? → A: 2 seconds average response time per step
- Q: What accessibility standards must the onboarding flow meet? → A: WCAG 2.1 AA compliance
- Q: What scalability expectations are there for the onboarding feature? → A: Horizontal scaling for 10,000 concurrent users

## Assumptions

- Role-based fields are only for athletes and coaches; scouts may be added later.
- Football is the only sport seeded initially.
- Users can skip optional fields but must complete required ones to proceed.
- Validation limits are defined in constants.ts.
- Cloudflare R2 is configured for media uploads.
- NextAuth session updates are handled appropriately.
- Database schema supports the new tables and relationships.
