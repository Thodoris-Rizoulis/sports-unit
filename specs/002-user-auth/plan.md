# Implementation Plan: User Authentication Flow

**Feature Branch**: `002-user-auth`  
**Created**: November 23, 2025  
**Spec**: specs/002-user-auth/spec.md  
**Status**: Ready for Implementation

## Executive Summary

Implement a complete authentication system for the Sports Unit platform, enabling user registration and login with role-based access control. The system will support email/password authentication, with modal-based UI and database-backed user management.

**Key Deliverables**:

- Database tables for users and roles
- NextAuth.js integration with custom providers
- Responsive login/register modal
- Access control middleware
- Form validation with Zod

**Timeline Estimate**: 2-3 days for full implementation  
**Risk Level**: Medium (authentication security critical)  
**Dependencies**: Database connection, landing page button

## Phase 1: Infrastructure Setup (Prerequisites)

**Purpose**: Establish all required dependencies and infrastructure before implementation  
**Duration**: 1-2 hours  
**Success Criteria**: All dependencies installed, database connected, basic NextAuth configured

### Task 1.1: Install Dependencies

- Install NextAuth.js v5
- Install bcryptjs for password hashing
- Install @types/bcryptjs
- Install zod (if not already installed)
- Verify package.json updates and no conflicts

### Task 1.2: Environment Setup

- Add NEXTAUTH_SECRET to .env.local
- Add DB_HOST,DB_PORT,DB_USER,DB_PASS,DB_NAME (verify connection)
- Test database connectivity with simple query

### Task 1.3: Basic NextAuth Configuration

- Create /app/api/auth/[...nextauth].ts
- Configure basic providers (Credentials)
- Set up session callbacks
- Validate basic auth flow without database

## Phase 2: Database Layer (Foundation)

**Purpose**: Create and populate database tables for users and roles  
**Duration**: 2-3 hours  
**Success Criteria**: Tables created, seeded with roles, scripts runnable

### Task 2.1: Create Profile Roles Table

- Write migration script in /migrations/init/create-profile-roles.ts
- Define table schema: id (primary), role_name (unique), timestamps
- Insert initial data: athlete, coach, scout
- Follow existing migration pattern from create-db.ts

### Task 2.2: Create Users Table

- Write migration script in /migrations/init/create-users.ts
- Define table schema: id, email (unique), password, username (unique), role_id (foreign key), is_onboarding_complete (default false), timestamps
- Add foreign key constraint to profile_roles
- Follow existing migration pattern

### Task 2.3: Database Integration Validation

- Run migration scripts manually
- Verify table creation and data insertion
- Test foreign key relationships
- Confirm role data is accessible

## Phase 3: Authentication Backend (Core Logic)

**Purpose**: Implement NextAuth integration with custom user management  
**Duration**: 4-6 hours  
**Success Criteria**: Users can register/login via API, sessions managed correctly

### Task 3.1: NextAuth Configuration

- Configure CredentialsProvider for email/password
- Implement authorize function with direct PostgreSQL queries
- Set up session callbacks

### Task 3.2: User Registration Logic

- Create API endpoint for user registration
- Implement password hashing with bcrypt
- Validate email uniqueness
- Link user to selected role
- Return session upon successful registration

### Task 3.3: User Login Logic

- Enhance authorize function for login
- Verify password against hashed version
- Handle login failures gracefully
- Include user role in session

### Task 3.4: Session Management

- Configure session callbacks to include user data
- Add role information to session
- Implement session refresh logic
- Validate session persistence across page reloads

### Task 3.5: Role Fetching Integration

- Create utility function to fetch roles from database
- Cache role data for performance
- Handle role loading errors
- Ensure roles are available for frontend dropdown

## Phase 4: Frontend Modal (User Interface)

**Purpose**: Build responsive modal with forms for authentication  
**Duration**: 4-6 hours  
**Success Criteria**: Modal displays correctly, forms functional, responsive design

### Task 4.1: Modal Component Structure

- Create LoginRegisterModal.tsx in /components
- Implement tabbed interface (Login/Register)
- Use shadcn Dialog component as base
- Add proper modal sizing and positioning

### Task 4.2: Registration Form

- Add form fields: email, password, username, role select
- Implement role dropdown with dynamic data fetching
- Use shadcn Input, Select, Button components
- Apply consistent styling from global.css

### Task 4.3: Login Form

- Add email and password fields
- Include "Forgot Password" placeholder (out of scope)
- Maintain consistent styling

### Task 4.4: Form Validation Integration

- Integrate Zod schemas for client-side validation
- Display inline error messages below fields
- Implement real-time validation feedback
- Handle form submission states (loading, success, error)

### Task 4.5: Responsive Design

- Ensure modal works on mobile devices
- Validate tablet and desktop layouts
- Verify touch interactions
- Check accessibility (keyboard navigation, screen readers)

### Task 4.6: Error Handling UI

- Display authentication errors inline
- Show loading states during submission
- Handle network errors gracefully
- Provide clear error messages for common issues

## Phase 5: Access Control (Security)

**Purpose**: Implement route protection and onboarding redirects  
**Duration**: 2-3 hours  
**Success Criteria**: Unauthorized access blocked, proper redirects working

### Task 5.1: Middleware Setup

- Create middleware.ts in root
- Define protected routes (all except landing)
- Check authentication status
- Redirect unauthenticated users to landing

### Task 5.2: Onboarding Redirect Logic

- Check is_onboarding_complete in session
- Redirect incomplete users to /onboarding
- Allow complete users to access main app
- Handle edge cases (session expiry, invalid data)

### Task 5.3: Landing Page Integration

- Connect "Get Started" button to open modal
- Pass modal state management
- Handle modal open/close logic
- Validate button-to-modal flow

## Phase 6: Integration & Validation (Validation)

**Purpose**: Connect all components and validate end-to-end functionality  
**Duration**: 3-4 hours  
**Success Criteria**: Full user journey works, all acceptance criteria met

### Task 6.1: End-to-End Registration Flow

- Validate complete registration from landing page
- Verify database record creation
- Confirm session establishment
- Check onboarding redirect

### Task 6.2: End-to-End Login Flow

- Validate login with existing user
- Verify session restoration
- Confirm dashboard redirect for complete users

### Task 6.3: Error Scenarios Validation

- Validate invalid credentials
- Validate duplicate email registration
- Validate weak password rejection
- Verify error messages display correctly

### Task 6.4: Cross-Device Validation

- Validate on multiple screen sizes
- Verify responsive behavior
- Check touch interactions
- Validate accessibility features

### Task 6.5: Security Validation

- Confirm password hashing works
- Validate session security
- Verify no sensitive data exposure
- Check for common vulnerabilities

## Phase 7: Polish & Documentation (Finalization)

**Purpose**: Code cleanup, documentation, and final checks  
**Duration**: 1-2 hours  
**Success Criteria**: Code clean, documented, meets constitution standards

### Task 7.1: Code Review & Cleanup

- Remove console.logs and debug code
- Ensure TypeScript strict mode compliance
- Verify consistent code style
- Add proper error handling

### Task 7.2: Documentation Updates

- Update component READMEs if needed
- Document API endpoints
- Add inline code comments for complex logic
- Update constitution compliance notes

### Task 7.3: Final Validation

- Run build to ensure no errors
- Validate all user stories acceptance criteria
- Verify success criteria metrics
- Perform security audit checklist

## Risk Mitigation

**High Risk**: Authentication security vulnerabilities

- Mitigation: Use established libraries (NextAuth, bcrypt), follow OWASP guidelines, thorough validation

**Medium Risk**: Database schema issues

- Mitigation: Validate migrations thoroughly, backup data, gradual rollout

**Low Risk**: UI responsiveness issues

- Mitigation: Validate on multiple devices, use established component library

## Dependencies & Prerequisites

**External Dependencies**:

- Database server running
- Environment variables configured

**Internal Dependencies**:

- Landing page "Get Started" button (from 001-landing-page)
- Database connection utilities
- shadcn component library

**Assumptions**:

- PostgreSQL database is configured with direct queries (no ORM)
- Onboarding page exists (redirect target)
- Dashboard page exists (success redirect)

## Success Metrics

- All 3 user stories acceptance criteria pass
- 95% registration success rate achieved
- No security vulnerabilities found
- Full responsive functionality confirmed
- TypeScript compilation passes with zero errors

## Rollback Plan

If critical issues arise:

1. Revert NextAuth configuration
2. Remove modal integration from landing page
3. Keep database tables (data preservation)
4. Restore original landing page button behavior

## Notes

- Follow modular architecture per constitution
- Prioritize security in all authentication logic
- Validate thoroughly before production deployment
- Document any deviations from standard NextAuth patterns
