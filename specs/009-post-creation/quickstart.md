# Quickstart: Post Creation System

**Date**: November 30, 2025  
**Feature**: 009-post-creation

## Setup

1. **Run Migration**: `npm run create-db` or execute `migrations/010_add_posts_tables.ts`
2. **Environment Variables**: Ensure Cloudflare R2 credentials in `.env.local`
3. **Build**: `npm run build` to validate TypeScript

## Usage

### Creating a Post

```typescript
import { PostService } from '@/services/posts';

const post = await PostService.createPost(userId, { content: 'Hello!', media: [...] });
```

### Getting Feed

```typescript
const posts = await PostService.getFeed(userId, { limit: 20, offset: 0 });
```

### Liking a Post

```typescript
const result = await PostService.toggleLike(postId, userId);
```

## API Examples

### Create Post

```bash
POST /api/posts
{
  "content": "My first post",
  "media": [{"type": "image", "file": "..."}]
}
```

### Get Feed

```bash
GET /api/posts?limit=20&offset=0
```

## Troubleshooting

- **Upload fails**: Check Cloudflare R2 credentials and bucket permissions.
- **Feed empty**: Verify connections exist and posts are created.
- **TypeScript errors**: Run `npm run build` and fix type issues.
- **Performance**: Add more indexes if queries slow.
