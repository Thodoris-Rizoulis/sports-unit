# Quickstart: User Profile

## Overview

This feature adds user profile pages to the sports networking platform, allowing users to view and edit their profiles with cover images, profile pictures, bio, and opportunity status.

## Prerequisites

- Next.js app with authentication (NextAuth)
- PostgreSQL database with users and user_attributes tables
- Cloudflare R2 account for image storage
- Environment variables: R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_BUCKET_NAME

## Setup

1. Install dependencies: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
2. Configure R2 bucket CORS for your domain.
3. Update database schema if needed (extend user_attributes).

## Key Files

- `app/profile/[userId]/page.tsx`: Profile page component
- `app/api/profile/[userId]/route.ts`: API for fetch/update
- `app/api/upload/route.ts`: API for presigned URLs
- `components/ProfileHero.tsx`: Hero section component
- `components/ProfileAbout.tsx`: About section component

## Usage

1. Navigate to `/profile/{username}` to view a profile.
2. If owner, click edit to update fields, including uploading profile picture and cover image.
3. Profile picture appears rounded on the left of hero section.

## Testing

- View profile: Load time <3s, show rounded profile picture on left
- Edit: Update all fields including images, save in <2 minutes
- Upload: Images stored in R2, URLs saved

## Troubleshooting

- Auth errors: Check session setup
- Upload fails: Verify R2 credentials and CORS
- Slow loads: Enable caching in fetches
