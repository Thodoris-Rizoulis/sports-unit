# Data Model: DB Services Refactor

**Date**: November 26, 2025  
**Feature**: 005-db-services-refactor

## Entities

### DB Pool

- **Description**: Reusable PostgreSQL connection pool configured with environment variables.
- **Attributes**: host, port, user, password, database.
- **Relationships**: Used by all services.
- **Validation**: Environment variables must be set.

### SportsService

- **Description**: Repository for sports data.
- **Methods**: getSports() → Sport[]
- **Relationships**: Queries sports table.
- **Validation**: Returns array of sports or throws on error.

### PositionsService

- **Description**: Repository for positions data.
- **Methods**: getPositionsBySport(sportId) → Position[]
- **Relationships**: Queries positions table filtered by sport_id.
- **Validation**: sportId must be number; throws on invalid.

### TeamsService

- **Description**: Repository for teams data.
- **Methods**: getTeamsBySport(sportId) → Team[]
- **Relationships**: Queries teams table filtered by sport_id.
- **Validation**: sportId must be number; throws on invalid.

### UserService

- **Description**: Repository for user profiles and attributes.
- **Methods**:
  - getUserAttributes(userId) → UserAttribute | null
  - updateUserProfile(userId, updates) → void
  - getUserProfile(userId) → UserProfile | null
  - getUserIdByUsername(username) → string | null
- **Relationships**: Queries users and user_attributes tables.
- **Validation**: userId/username validated; throws on error.

### AuthService

- **Description**: Repository for authentication data.
- **Methods**: getUserByEmail(email) → User | null
- **Relationships**: Queries users table for login.
- **Validation**: Email required; throws on DB error.

### RolesService

- **Description**: Repository for roles data.
- **Methods**: getRoles() → Role[]
- **Relationships**: Queries profile_roles table.
- **Validation**: Returns array or throws.

## State Transitions

No state transitions; static data access.

## Validation Rules

- All services validate inputs and throw exceptions on invalid data.
- DB errors propagate as exceptions.
