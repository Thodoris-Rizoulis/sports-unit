# Research: Hashtag System

**Feature**: 010-hashtag-system  
**Date**: 2025-12-02

## Research Questions & Findings

### 1. Hashtag Extraction Pattern

**Question**: How to reliably extract hashtags from text content?

**Decision**: Use regex pattern `/(?:^|\s)(#[a-zA-Z0-9_]+)/g`

**Rationale**:

- Matches `#` followed by alphanumeric characters and underscores
- Requires whitespace or start-of-string before `#` (prevents matching mid-word like `super#hero`)
- Standard pattern used by Twitter, Instagram, etc.
- Case-insensitive matching by converting to lowercase after extraction

**Alternatives Considered**:

- Using a library like `twitter-text` - Rejected: adds dependency, overkill for our needs
- Simple `#\w+` pattern - Rejected: matches mid-word hashtags incorrectly

### 2. Database Schema Design

**Question**: How to store hashtags and their relationship to posts?

**Decision**: Two-table design with junction table including timestamp

**Rationale**:

- `Hashtag` table: stores unique hashtags (normalized to lowercase)
- `PostHashtag` junction table: links posts to hashtags with `createdAt` timestamp
- Timestamp on junction table enables efficient "popular in last 7 days" queries
- Unique constraint on `Hashtag.name` prevents duplicates
- Index on `PostHashtag.createdAt` for time-based queries

**Alternatives Considered**:

- Storing hashtags as JSON array in Post - Rejected: can't query efficiently, no normalization
- Single denormalized table - Rejected: data duplication, harder to maintain popularity counts

### 3. Popular Hashtags Query Strategy

**Question**: How to efficiently query top hashtags from last 7 days?

**Decision**: Count `PostHashtag` records grouped by `hashtagId` with date filter

**Rationale**:

```sql
SELECT h.id, h.name, COUNT(ph.id) as post_count
FROM hashtags h
JOIN post_hashtags ph ON h.id = ph.hashtag_id
WHERE ph.created_at >= NOW() - INTERVAL '7 days'
GROUP BY h.id, h.name
ORDER BY post_count DESC
LIMIT 5
```

- Uses index on `post_hashtags.created_at`
- Groups by hashtag to count occurrences
- Efficient with proper indexing

**Alternatives Considered**:

- Caching popular hashtags in Redis - Rejected: adds infrastructure complexity, not needed at current scale
- Materialized view - Rejected: overkill, query is fast enough with indexes

### 4. Text Rendering with Hashtags

**Question**: How to render hashtags as clickable links in post content?

**Decision**: Extend existing `parseTextWithLinks` function in `lib/utils.ts`

**Rationale**:

- Already handles URL parsing with similar pattern
- Can add hashtag detection alongside URL detection
- Returns structured array of parts (text, link, hashtag) for rendering
- `TextWithLinks` component already exists and can be extended

**Alternatives Considered**:

- Separate component for hashtag parsing - Rejected: duplication, would need to compose with URL parsing
- Markdown processor - Rejected: overkill, not using markdown elsewhere

### 5. Post-Hashtag Linking on Post Creation

**Question**: When and how to link hashtags to posts?

**Decision**: Extract and link in PostService.createPost within the same transaction

**Rationale**:

- Atomic operation: post and hashtag links created together
- Uses Prisma `createMany` for efficient batch insert
- Deduplicate hashtags before linking (handle `#sports #sports` in same post)
- `upsert` pattern for hashtags: create if not exists, return if exists

**Alternatives Considered**:

- Background job for hashtag extraction - Rejected: adds complexity, not needed for simple regex
- Trigger in database - Rejected: logic in application layer is easier to maintain

### 6. Hashtag Page Data Fetching

**Question**: How to fetch posts by hashtag with pagination?

**Decision**: Cursor-based pagination using post ID

**Rationale**:

- Consistent with existing PostFeed infinite scroll pattern
- Query posts through `PostHashtag` junction, ordered by `Post.createdAt DESC`
- Cursor is the last post ID, filter `Post.id < cursor`
- Reuse existing post mapping logic from PostService

**Alternatives Considered**:

- Offset-based pagination - Rejected: inconsistent results if new posts added while paginating
- Time-based cursor - Rejected: post ID is simpler and guaranteed unique

## Technical Decisions Summary

| Decision         | Choice                             | Key Reason                                 |
| ---------------- | ---------------------------------- | ------------------------------------------ | ------------------------------------------ |
| Hashtag regex    | `/(?:^                             | \s)(#[a-zA-Z0-9_]+)/g`                     | Standard format, prevents mid-word matches |
| Storage          | Two tables (Hashtag + PostHashtag) | Efficient queries, proper normalization    |
| Popular query    | COUNT with date filter             | Fast with indexes, no extra infrastructure |
| Text rendering   | Extend parseTextWithLinks          | Reuse existing pattern, no duplication     |
| Post integration | Same transaction in createPost     | Atomic, consistent                         |
| Pagination       | Cursor-based (post ID)             | Consistent with existing feed pattern      |

## Dependencies Confirmed

- No new npm packages required
- Prisma migrations for new tables
- Extends existing `lib/utils.ts` and `components/TextWithLinks.tsx`
