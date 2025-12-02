# Data Model: Post Creation System

**Date**: November 30, 2025  
**Feature**: 009-post-creation

## Entities & Relationships

### Post

- **Attributes**:
  - id: SERIAL PRIMARY KEY
  - user_id: INTEGER REFERENCES users(id) ON DELETE CASCADE
  - content: TEXT NOT NULL
  - created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  - updated_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **Relationships**: 1:N with PostMedia, PostLike, PostComment, PostShare, PostSave
- **Validation**: content 1-500 chars, no HTML
- **Lifecycle**: Created on post submission, updated rarely

### PostMedia

- **Attributes**:
  - id: SERIAL PRIMARY KEY
  - post_id: INTEGER REFERENCES posts(id) ON DELETE CASCADE
  - media_type: VARCHAR(10) CHECK (IN ('image','video','link'))
  - url: TEXT (for links or public URL)
  - key: TEXT (for uploaded files)
  - order_index: INTEGER DEFAULT 0
- **Relationships**: N:1 with Post
- **Validation**: Valid URL for links, key format for uploads
- **Lifecycle**: Created with post, deleted with post

### PostLike

- **Attributes**:
  - id: SERIAL PRIMARY KEY
  - post_id: INTEGER REFERENCES posts(id) ON DELETE CASCADE
  - user_id: INTEGER REFERENCES users(id) ON DELETE CASCADE
  - created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **Relationships**: N:1 with Post, N:1 with User
- **Validation**: UNIQUE(post_id, user_id)
- **Lifecycle**: Toggle create/delete

### PostComment

- **Attributes**:
  - id: SERIAL PRIMARY KEY
  - post_id: INTEGER REFERENCES posts(id) ON DELETE CASCADE
  - user_id: INTEGER REFERENCES users(id) ON DELETE CASCADE
  - parent_comment_id: INTEGER REFERENCES post_comments(id) ON DELETE CASCADE (nullable)
  - content: TEXT NOT NULL
  - created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **Relationships**: N:1 with Post, N:1 with User, self-referencing for replies
- **Validation**: content 1-200 chars, depth <=3
- **Lifecycle**: Created on comment, deleted with post

### PostShare

- **Attributes**:
  - id: SERIAL PRIMARY KEY
  - post_id: INTEGER REFERENCES posts(id) ON DELETE CASCADE
  - user_id: INTEGER REFERENCES users(id) ON DELETE CASCADE
  - created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **Relationships**: N:1 with Post, N:1 with User
- **Validation**: None (allow multiple shares)
- **Lifecycle**: Created on share

### PostSave

- **Attributes**:
  - id: SERIAL PRIMARY KEY
  - post_id: INTEGER REFERENCES posts(id) ON DELETE CASCADE
  - user_id: INTEGER REFERENCES users(id) ON DELETE CASCADE
  - created_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
- **Relationships**: N:1 with Post, N:1 with User
- **Validation**: UNIQUE(post_id, user_id)
- **Lifecycle**: Toggle create/delete

## State Transitions

- **Post**: Draft → Published (no draft state, immediate publish)
- **Interactions**: None/Exists (toggle-based)

## Indexes

- posts(created_at DESC)
- post_likes(post_id, user_id)
- post_comments(post_id, created_at)
- post_shares(post_id)
- post_saves(user_id, created_at)
