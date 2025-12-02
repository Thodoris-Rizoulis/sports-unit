# Quickstart: Global Header

## Overview

The global header provides consistent navigation and search functionality across all authenticated pages of the Sports Unit app. It appears automatically on all pages except the homepage.

## Features

- **Logo**: Clickable link to homepage
- **Navigation**: Quick access to Dashboard, Discovery, Inbox, Notifications, and Profile
- **Search**: Find users by name or username with autocomplete

## Usage

### Navigation

1. The header appears on all pages except `/`
2. Click any navigation icon to navigate to that section
3. Profile link automatically uses your account information

### Search

1. Click in the search bar or start typing
2. Results appear as you type (debounced for performance)
3. Click a result to visit that user's profile
4. Use keyboard navigation (arrow keys, enter) for accessibility

## Technical Integration

### For Developers

- Header is conditionally rendered based on pathname
- Uses NextAuth session for user data
- Search results cached client-side for 5 minutes
- API endpoint: `GET /api/search/people?q=searchTerm`

### Adding New Navigation Links

1. Update the navigation array in `components/Header.tsx`
2. Add corresponding route in `app/` directory
3. Update icons from `@heroicons/react`

### Customizing Search

- Modify search logic in `services/profile.ts`
- Update API validation in `app/api/search/people/route.ts`
- Adjust UI in `components/Header.tsx`

## Troubleshooting

- **Header not appearing**: Check if on homepage (`/`) - header is hidden there
- **Search not working**: Ensure user is authenticated
- **Profile link missing**: Check NextAuth session status
- **Mobile issues**: Verify responsive breakpoints in Tailwind classes

## Performance Notes

- Header loads in <1s
- Search debounced at 300ms
- Results cached for 5 minutes
- Uses PostgreSQL full-text search for efficiency
