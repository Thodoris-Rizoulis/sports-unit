# Feature Specification: DB Services Refactor

**Feature Branch**: `005-db-services-refactor`  
**Created**: November 26, 2025  
**Status**: Draft  
**Input**: User description: "Create a detailed specification for refactoring the project's database layer and introducing service/repository layers. The refactoring should follow this structure: Current Structure db.ts contains a PostgreSQL pool, a query utility function, and various domain-specific helper functions (e.g., getSports, getPositionsBySport, getUserAttributes). API routes in api directly import and use these helpers or the query function. Other files like auth.ts and roles.ts also import query for DB operations. Desired Structure DB Connection Pool: Create lib/db-connection.ts to export a reusable PostgreSQL pool instance. This file should only handle connection setup using environment variables (DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME). Service/Repository Layers: Create a new services/ directory with the following service files, each implementing repository-style classes/modules for data access: services/sports-service.ts: Class with getSports() method. services/positions-service.ts: Class with getPositionsBySport(sportId) method. services/teams-service.ts: Class with getTeamsBySport(sportId) method. services/user-service.ts: Class with methods like getUserAttributes(userId), updateUserProfile(userId, updates), getUserProfile(userId), getUserIdByUsername(username). services/auth-service.ts: Class with authentication-related DB methods (e.g., user lookup by email). services/roles-service.ts: Class with getRoles() method. Each service should import the pool from lib/db-connection.ts and use it directly for queries, with proper connection management (connect/release). Update Existing Files: Refactor db.ts to remove the pool instantiation and helper functions; keep only if needed as a bridge. Update auth.ts to use AuthService instead of direct query calls. Update roles.ts to use RolesService or move its logic. Update all API routes in api to import from services instead of lib/db, and refactor any embedded DB logic into service methods. Types and Utilities: Ensure types from database.ts and profile.ts are used appropriately in services. Implementation Requirements Use TypeScript classes for services with static methods. Handle errors gracefully in services (throw or return errors for API routes to handle). Maintain existing functionality; no breaking changes to API responses. Update imports across the codebase accordingly. Ensure the pool is reused efficiently. Generate the complete code for all new and modified files, including file paths, and provide a step-by-step implementation plan."

## Clarifications

### Session 2025-11-26

- Q: What should happen when the DB pool cannot connect (e.g., invalid environment variables)? → A: Throw an exception immediately.
- Q: How should the system handle concurrent queries from multiple services? → A: No special handling required.
- Q: What should happen if a service method is called with invalid parameters (e.g., non-numeric userId)? → A: Throw an exception.

## User Scenarios & Testing

### User Story 1 - Refactor DB Connection to Reusable Pool (Priority: P1)

As a developer, I want the database connection to be a reusable pool exported from a dedicated file, so that connection management is centralized and reusable across the application.

**Why this priority**: This is the foundation for the entire refactoring, enabling efficient connection reuse and better separation of concerns.

**Independent Test**: Can be tested by verifying that the pool is exported and can be imported in other files without errors, and that environment variables are used for configuration.

**Acceptance Scenarios**:

1. **Given** the application starts, **When** `lib/db-connection.ts` is imported, **Then** a PostgreSQL pool is created using environment variables.
2. **Given** multiple services import the pool, **When** they perform queries, **Then** connections are properly managed (connected/released).

---

### User Story 2 - Introduce Sports Service Repository (Priority: P2)

As a developer, I want a SportsService class that encapsulates sports-related database operations, so that API routes can use a clean interface instead of direct DB calls.

**Why this priority**: Sports is a core domain, and refactoring it first allows testing the service pattern.

**Independent Test**: Can be tested by calling SportsService.getSports() and verifying it returns the same data as the original getSports function.

**Acceptance Scenarios**:

1. **Given** the sports API route, **When** it calls SportsService.getSports(), **Then** it returns the list of sports without errors.

---

### User Story 3 - Introduce Positions Service Repository (Priority: P2)

As a developer, I want a PositionsService class for position-related DB operations, so that the positions API uses a service layer.

**Why this priority**: Similar to sports, positions are queried by sportId, requiring the service pattern.

**Independent Test**: Can be tested by calling PositionsService.getPositionsBySport(sportId) and verifying correct positions are returned.

**Acceptance Scenarios**:

1. **Given** a valid sportId, **When** PositionsService.getPositionsBySport(sportId) is called, **Then** it returns positions for that sport.

---

### User Story 4 - Introduce Teams Service Repository (Priority: P2)

As a developer, I want a TeamsService class for team-related DB operations, so that the teams API uses a service layer.

**Why this priority**: Teams are queried by sportId, fitting the pattern.

**Independent Test**: Can be tested by calling TeamsService.getTeamsBySport(sportId) and verifying teams are returned.

**Acceptance Scenarios**:

1. **Given** a valid sportId, **When** TeamsService.getTeamsBySport(sportId) is called, **Then** it returns teams for that sport.

---

### User Story 5 - Introduce User Service Repository (Priority: P1)

As a developer, I want a UserService class that handles all user profile and attribute operations, so that complex profile logic is encapsulated.

**Why this priority**: User operations are the most complex, involving multiple tables and updates.

**Independent Test**: Can be tested by calling UserService methods and verifying profile data is retrieved/updated correctly.

**Acceptance Scenarios**:

1. **Given** a userId, **When** UserService.getUserAttributes(userId) is called, **Then** it returns user attributes or null.
2. **Given** user updates, **When** UserService.updateUserProfile(userId, updates) is called, **Then** the profile is updated in the DB.

---

### User Story 6 - Introduce Auth Service Repository (Priority: P2)

As a developer, I want an AuthService class for authentication DB operations, so that auth logic is in a service.

**Why this priority**: Auth is critical for security, and centralizing DB calls improves maintainability.

**Independent Test**: Can be tested by calling AuthService methods for user lookup.

**Acceptance Scenarios**:

1. **Given** an email, **When** AuthService.getUserByEmail(email) is called, **Then** it returns user data or null.

---

### User Story 7 - Introduce Roles Service Repository (Priority: P2)

As a developer, I want a RolesService class for role operations, so that roles are handled in a service.

**Why this priority**: Roles are simple, but following the pattern.

**Independent Test**: Can be tested by calling RolesService.getRoles() and verifying roles are returned.

**Acceptance Scenarios**:

1. **Given** the system, **When** RolesService.getRoles() is called, **Then** it returns the list of roles.

---

### User Story 8 - Update API Routes to Use Services (Priority: P1)

As a developer, I want all API routes to import from services instead of lib/db, so that DB logic is abstracted.

**Why this priority**: This completes the refactoring by updating consumers.

**Independent Test**: Can be tested by running API endpoints and verifying responses match original behavior.

**Acceptance Scenarios**:

1. **Given** an API route like /api/sports, **When** it is called, **Then** it uses the service and returns data without errors.

---

### Edge Cases

- If the DB pool cannot connect (e.g., invalid environment variables), throw an exception immediately.
- Concurrent queries from multiple services require no special handling; the PostgreSQL pool manages connections natively.
- If a service method is called with invalid parameters (e.g., non-numeric userId), throw an exception.
- DB errors from services are propagated by throwing exceptions, allowing API routes to catch and handle them.

## Requirements

### Functional Requirements

- **FR-001**: System MUST export a reusable PostgreSQL pool from `lib/db-connection.ts` using environment variables.
- **FR-002**: System MUST create `services/sports-service.ts` with a `SportsService` class containing `getSports()` static method.
- **FR-003**: System MUST create `services/positions-service.ts` with a `PositionsService` class containing `getPositionsBySport(sportId)` static method.
- **FR-004**: System MUST create `services/teams-service.ts` with a `TeamsService` class containing `getTeamsBySport(sportId)` static method.
- **FR-005**: System MUST create `services/user-service.ts` with a `UserService` class containing `getUserAttributes(userId)`, `updateUserProfile(userId, updates)`, `getUserProfile(userId)`, `getUserIdByUsername(username)` static methods.
- **FR-006**: System MUST create `services/auth-service.ts` with an `AuthService` class containing user lookup methods.
- **FR-007**: System MUST create `services/roles-service.ts` with a `RolesService` class containing `getRoles()` static method.
- **FR-008**: System MUST refactor `lib/db.ts` to remove pool instantiation and helper functions, keeping only necessary exports.
- **FR-009**: System MUST update `lib/auth.ts` to use `AuthService` instead of direct `query` calls.
- **FR-010**: System MUST update `lib/roles.ts` to use `RolesService`.
- **FR-011**: System MUST update all API routes in `app/api/` to import from services and refactor embedded DB logic into service methods.
- **FR-012**: System MUST use types from `types/database.ts` and `types/profile.ts` in services.
- **FR-013**: Services MUST use TypeScript classes with static methods.
- **FR-014**: Services MUST handle errors by throwing exceptions for API routes to catch.
- **FR-015**: System MUST maintain existing API response formats and functionality.
- **FR-016**: System MUST ensure the pool is reused efficiently across services.

### Key Entities

- **DB Pool**: Represents the PostgreSQL connection pool, configured with env vars, exported from `lib/db-connection.ts`.
- **SportsService**: Repository for sports data, with methods to query sports.
- **PositionsService**: Repository for positions data, with methods to query positions by sport.
- **TeamsService**: Repository for teams data, with methods to query teams by sport.
- **UserService**: Repository for user profiles and attributes, with methods for CRUD operations.
- **AuthService**: Repository for authentication data, with methods for user lookup.
- **RolesService**: Repository for roles data, with methods to query roles.

## Success Criteria

- Users (developers) can import the DB pool from `lib/db-connection.ts` without issues.
- All service classes are created with static methods that return the same data as original functions.
- API routes compile and run without errors, returning identical responses.
- No breaking changes to API endpoints or response formats.
- Code builds successfully with `npm run build`.
- All existing tests pass (if any).
- DB connections are managed properly (no connection leaks).

## Assumptions

- Environment variables for DB are set correctly.
- PostgreSQL DB schema remains unchanged.
- No new DB tables or changes to existing ones.
- API routes only use the specified methods; no additional DB calls added.

## Dependencies

- PostgreSQL database with existing schema.
- Node.js and pg library.
- Existing types in `types/database.ts` and `types/profile.ts`.

## Implementation Notes

- Each service method should use `const client = await pool.connect(); try { ... } finally { client.release(); }`.
- For complex operations like profile updates, move the dynamic query building into the service.
- Update imports in API routes: e.g., `import { SportsService } from '@/services/sports-service';`.
- Test each service method individually before updating routes.
- If `lib/db.ts` is still needed as a bridge, keep the `query` function but mark it deprecated.
- Concurrent queries are handled by the pool; no additional logic needed.
