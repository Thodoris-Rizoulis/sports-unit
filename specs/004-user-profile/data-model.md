# Data Model: User Profile

## Entities

### User Profile

Represents a user's public profile information displayed on their profile page.

**Attributes**:

- `userId` (string, UUID): Unique identifier linking to the users table.
- `firstName` (string, required): User's first name (max 50 chars).
- `lastName` (string, required): User's last name (max 50 chars).
- `username` (string, required, unique): Unique username for URL routing (max 30 chars, alphanumeric + underscores).
- `team` (string, optional): Current team name (max 100 chars).
- `location` (string, optional): User's location (max 100 chars).
- `bio` (string, optional): User biography text (max 500 chars).
- `coverImageUrl` (string, optional): URL to cover image stored in Cloudflare R2.
- `profileImageUrl` (string, optional): URL to profile picture stored in Cloudflare R2.
- `openToOpportunities` (boolean, default false): Flag indicating if user is open to opportunities.

**Relationships**:

- Belongs to `users` table via `userId` (one-to-one).
- Extends `user_attributes` table for additional fields like team, location, bio.

**Validation Rules**:

- `firstName` and `lastName`: Non-empty, alphabetic characters only.
- `username`: Unique, starts with letter, no spaces.
- `bio`: Plain text, no HTML; max 500 chars.
- `coverImageUrl` and `profileImageUrl`: Valid HTTPS URLs pointing to R2 bucket.
- `openToOpportunities`: Boolean only.

**State Transitions**:

- Creation: Set during onboarding or initial profile setup.
- Updates: Editable by profile owner only; changes trigger revalidation of profile page.
- Deletion: Not applicable (profiles persist).

**Notes**:

- Data sourced from existing `users` and `user_attributes` tables.
- No additional tables needed; extend current schema.
