# Quick Start: Shared Layout with Widgets

**Feature**: 007-shared-layout-widgets  
**Date**: November 30, 2025

## Overview

This feature adds a shared layout with widget sidebars to dashboard and discovery pages, starting with a profile widget.

## Prerequisites

- Next.js 14+ project with App Router
- NextAuth.js configured
- shadcn/ui installed
- PostgreSQL database with user profiles

## Installation

1. **Create route group structure**:

   ```bash
   mkdir -p app/\(main\)/dashboard
   mkdir -p app/\(main\)/discovery
   mkdir -p components/widgets
   ```

2. **Move existing dashboard**:

   ```bash
   mv app/dashboard/page.tsx app/\(main\)/dashboard/page.tsx
   ```

3. **Install dependencies** (if needed):
   ```bash
   npm install @radix-ui/react-avatar  # for shadcn Avatar
   ```

## Configuration

1. **Update navigation links** to point to new routes:

   - `/dashboard` → still works (route group doesn't change URL)
   - `/discovery` → new page

2. **Environment variables** (existing NextAuth setup required):
   ```env
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

## Usage

1. **Start development server**:

   ```bash
   npm run dev
   ```

2. **Navigate to pages**:

   - Visit `/dashboard` to see shared layout with profile widget
   - Visit `/discovery` to see same layout

3. **Test responsiveness**:
   - Resize browser to < 768px to see sidebars hide
   - Click profile widget to navigate to profile page

## Customization

### Adding More Widgets

1. Create new widget component in `components/widgets/`:

   ```tsx
   "use client";
   export default function MyWidget() {
     return <Card>...</Card>;
   }
   ```

2. Import and add to layout:

   ```tsx
   import MyWidget from '@/components/widgets/MyWidget'

   // In layout.tsx
   <Layout leftWidgets={[<ProfileWidget />, <MyWidget />]}>
   ```

### Styling

- Use Tailwind classes from `globals.css`
- Follow shadcn/ui patterns
- Ensure mobile responsiveness

## Troubleshooting

- **Widget not loading**: Check NextAuth session and database connection
- **Layout not applying**: Verify route group structure
- **TypeScript errors**: Ensure types are imported from `/types`
- **Styling issues**: Check Tailwind configuration

## Next Steps

- Add more widgets to sidebars
- Implement widget configuration
- Add widget drag-and-drop reordering
