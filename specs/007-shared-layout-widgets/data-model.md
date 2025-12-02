# Data Model

**Feature**: Shared Layout with Widgets  
**Date**: November 30, 2025  
**Phase**: 1 (Design)

## Entities

### UserProfile

Represents authenticated user's profile data for display in widgets.

**Fields**:

- `userId`: string (references users.id)
- `publicUuid`: string (for profile URL)
- `firstName`: string
- `lastName`: string
- `username`: string (unique identifier)
- `location`: string (optional)
- `bio`: string (optional, truncated to 100 chars)
- `profileImageUrl`: string (optional, uses next/image)
- `teamId`: number (optional)
- `teamName`: string (optional)

**Relationships**:

- Belongs to User (via userId)
- Has one Team (optional, via teamId)

**Validation Rules**:

- username: required, unique
- firstName/lastName: required for display
- bio: max 100 chars for widget display
- profileImageUrl: valid URL format

**State Transitions**: Read-only for widget display.

### Layout

UI component structure for shared layout.

**Fields**:

- `children`: React.ReactNode (main content)
- `leftWidgets`: React.Component[] (array of widget components)
- `rightWidgets`: React.Component[] (array of widget components)

**Relationships**:

- Contains multiple Widgets
- Wraps Page components

**Validation Rules**:

- children: required
- widgets: optional arrays

**Notes**: Purely UI structure, no data persistence.

## Data Flow

1. User loads dashboard/discovery page
2. Layout renders with ProfileWidget in left sidebar
3. ProfileWidget fetches UserProfile via UserService.getUserProfile()
4. Data displayed in widget with loading/error states
5. Click navigates to profile page using publicUuid

## Schema Extensions

No database schema changes required - uses existing user_attributes and users tables.

## API Contracts

See `/contracts/` directory for OpenAPI specifications.
