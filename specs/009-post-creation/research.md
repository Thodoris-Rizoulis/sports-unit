# Research Findings: Post Creation System

**Date**: November 30, 2025  
**Feature**: 009-post-creation

## Decisions & Findings

### Video Upload Support in Cloudflare R2

**Decision**: Support MP4, WebM, MOV formats.  
**Rationale**: These are the most common web-compatible video formats, balancing compatibility and performance. MP4 is widely supported, WebM is efficient, MOV is common from iOS.  
**Alternatives Considered**:

- Only MP4: Simpler but less flexible.
- Include AVI/MPG: Broader but outdated formats.
  **Implementation**: Extend upload API regex to `video/(mp4|webm|quicktime)`, increase max size to 100MB.

### Feed Query Optimization

**Decision**: Use UNION of connections' posts and own posts, ordered by created_at DESC.  
**Rationale**: Ensures own posts appear in feed, maintains chronological order.  
**Alternatives Considered**: Separate queries and merge in app - more complex, potential ordering issues.  
**Implementation**: Single query with subqueries for connections and own posts.

### Comment Threading

**Decision**: Use parent_comment_id for nesting, limit depth to 3 levels.  
**Rationale**: Allows threaded discussions without infinite recursion.  
**Alternatives Considered**: Flat comments only - less engaging.  
**Implementation**: Recursive query for replies, UI shows nested structure.

### Media Storage Structure

**Decision**: `posts/{userId}/{postId}/{timestamp}-{fileName}`  
**Rationale**: Organizes by post, allows multiple media per post.  
**Alternatives Considered**: `posts/{userId}/{timestamp}-{fileName}` - harder to group by post.  
**Implementation**: Generate keys in upload service.

### Interaction Uniqueness

**Decision**: UNIQUE constraints on (post_id, user_id) for likes and saves.  
**Rationale**: Prevents duplicate interactions, allows toggle functionality.  
**Alternatives Considered**: Allow multiples - not user-friendly.  
**Implementation**: DB constraints, service checks.

## Resolved Unknowns

- Video formats: MP4, WebM, MOV
- Link display: As clickable text with URL preview
- Feed inclusion: Own posts + connections
- Rate limiting: None for now
- DB indexes: posts(created_at), post_likes(post_id,user_id)
