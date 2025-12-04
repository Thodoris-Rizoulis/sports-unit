# Implementation Plan: Notifications

**Branch**: `014-notifications` | **Date**: 2025-12-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-notifications/spec.md`

## Summary

Implement a real-time notifications system for the Sports Unit platform. Users will receive in-app notifications for connection requests, post likes, and post comments. The feature includes a bell icon with unread badge in the header, a dropdown showing recent notifications with grouping, a dedicated `/notifications` page with infinite scroll, and real-time updates via Server-Sent Events (SSE).

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode  
**Primary Dependencies**: Next.js 14+ (App Router), React Query, Prisma ORM, NextAuth.js, Zod, shadcn/ui  
**Storage**: PostgreSQL via Prisma ORM  
**Testing**: Manual testing via browser, TypeScript compilation validation  
**Target Platform**: Web (responsive, mobile-first)  
**Project Type**: Next.js App Router web application  
**Performance Goals**: Badge count in <1s, dropdown open in <2s, real-time updates in <3s  
**Constraints**: SSE over WebSocket for simplicity, session-based auth for SSE endpoint  
**Scale/Scope**: Handle 100+ unread notifications without degradation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: ✅ TypeScript strict mode, use `type` over `interface`, no `any`, follow DRY
- **TypeScript & Type Safety**: ✅ Zod schemas for input validation in `types/notifications.ts`, output types in `types/prisma.ts`, reuse common fields from `types/common.ts`
- **Project Structure**: ✅ Next.js App Router, `/services/notifications.ts`, `/app/api/notifications/`, `/components/notifications/`, `/types/notifications.ts`
- **API & Data Layer**: ✅ Use `api-utils` for responses, Prisma ORM via `lib/prisma.ts`, business logic in service layer, Zod validation at API boundaries
- **Component Development**: ✅ Server Components for page wrappers, Client Components for interactive bell/dropdown, shadcn/ui components
- **Styling & Theming**: ✅ Tailwind with theme variables from `globals.css`, semantic color tokens
- **Validation & Best Practices**: ✅ All API inputs validated with Zod, naming convention `NotificationInput` for form types
- **Performance & Optimization**: ✅ React Query caching, efficient grouping algorithm, indexed queries
- **Error Handling**: ✅ try/catch in services and API routes, meaningful user errors
- **Reusability**: ✅ `NotificationService` with static methods, reusable `NotificationItem` component
- **Dependencies**: ✅ No new dependencies required - uses existing stack
- **Design / Responsiveness**: ✅ Mobile-first dropdown and notifications page, works on 320px+ screens
- **Extensibility / Maintainability**: ✅ NotificationType enum designed for future types (mentions, profile views)

## Project Structure

### Documentation (this feature)

```text
specs/014-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# New files for Notifications feature
app/
├── api/
│   └── notifications/
│       ├── route.ts                 # GET paginated notifications
│       ├── unread-count/
│       │   └── route.ts             # GET unread count
│       ├── mark-read/
│       │   └── route.ts             # POST mark all as read
│       └── stream/
│           └── route.ts             # GET SSE endpoint
└── notifications/
    └── page.tsx                     # Notifications history page

components/
└── notifications/
    ├── index.ts                     # Barrel exports
    ├── NotificationBell.tsx         # Bell icon with badge (client)
    ├── NotificationDropdown.tsx     # Dropdown container (client)
    ├── NotificationItem.tsx         # Single notification display
    ├── NotificationList.tsx         # List with grouping logic
    ├── NotificationEmptyState.tsx   # Empty state component
    └── NotificationsPage.tsx        # Full page with infinite scroll (client)

types/
├── notifications.ts                 # Zod schemas & input types
└── prisma.ts                        # + Notification output types & mappers

services/
└── notifications.ts                 # NotificationService class

hooks/
└── useNotifications.ts              # React Query hooks for notifications

migrations/
└── 019_add_notifications_table.ts   # Database migration

prisma/
└── schema.prisma                    # + Notification model
```

**Structure Decision**: Following established project patterns - service layer for business logic, API routes for HTTP handling, React Query hooks for client state, shadcn/ui for components.

## Complexity Tracking

> No constitution violations requiring justification.
