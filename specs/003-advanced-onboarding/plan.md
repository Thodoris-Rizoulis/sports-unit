# Implementation Plan: Advanced Onboarding

**Feature Branch**: `003-advanced-onboarding`  
**Created**: November 25, 2025  
**Status**: Draft  
**Spec**: specs/003-advanced-onboarding/spec.md

## Executive Summary

This plan outlines the implementation of a multi-step onboarding flow to collect rich user profile information for a sports networking platform. The feature replaces the simple onboarding button with a 4-step wizard that conditionally collects role/username, basic profile, sports details, and review/submit. Key highlights include media upload integration with Cloudflare R2, real-time validation, and mobile-first responsive design.

**Key Milestones**:

- Phase 0 (Foundation): Database schema and seeding complete (Week 1)
- Phase 1 (Core Backend): API endpoints and validation ready (Week 2)
- Phase 2 (Frontend Integration): Full wizard UI and media upload (Week 3)
- Phase 3 (Polish & Deploy): Testing, accessibility, and production deployment (Week 4)

**Total Estimated Effort**: 50-60 hours across 4 weeks
**Team Size**: 1-2 developers (full-stack)
**Success Metrics**: 90% user completion in <5 minutes, 95% upload reliability, 80% mobile completion rate

## Technical Context

### Architecture Decisions

- **Modular Design**: Separate concerns with reusable components for forms, validation, and media upload
- **Incremental Delivery**: Backend-first approach allowing UI development in parallel
- **State Management**: Client-side state for wizard steps with server-side persistence
- **Security**: OAuth integration with encrypted data storage

### Technology Stack

- **Frontend**: Next.js 14, TypeScript, shadcn/ui components, Tailwind CSS
- **Backend**: Next.js API routes, NextAuth for session management
- **Database**: PostgreSQL (new tables: sports, positions, teams, user_attributes)
- **Validation**: Zod schemas with real-time feedback
- **Media Upload**: Cloudflare R2 with presigned URLs (client-side)
- **Deployment**: Vercel/Netlify with horizontal scaling support

### Dependencies

- Existing: User authentication (NextAuth), database connection, basic UI components
- New: Cloudflare R2 account, football data seeding scripts
- External: None (all internal or standard services)

### Constraints

- **Performance**: 2s average response per step, support 10k concurrent users
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile-First**: Responsive design with 80% mobile completion rate
- **Data Scale**: Medium-scale (10k-100k users) with proportional growth

## Constitution Check

✅ **TypeScript**: All code in TypeScript with strict typing
✅ **Modular Architecture**: Components in separate files, reusable utilities
✅ **shadcn/ui**: Consistent UI components for forms, buttons, progress
✅ **Next.js Best Practices**: App router, server components where appropriate
✅ **Database**: Direct PostgreSQL queries with type safety
✅ **Error Handling**: Comprehensive error boundaries and user feedback
✅ **Testing**: Basic validation tests (no full test suite for MVP)
✅ **Documentation**: Inline comments and README updates

## Phase Breakdown

### Phase 0: Foundation (Week 1, 10-15 hours)

Focus: Database schema, data seeding, and core constants

**Objectives**: Establish data foundation for onboarding
**Deliverables**: Migration scripts, seeded data, validation constants
**Risk Level**: Low (standard database work)

**Key Tasks**:

- Create database migrations for sports, positions, teams, user_attributes tables
- Implement seeding scripts for football positions and major teams
- Define validation constants in constants.ts
- Update database schema definitions with new entities

### Phase 1: Core Backend (Week 2, 15-20 hours)

Focus: API endpoints, validation, and session management

**Objectives**: Backend services ready for frontend integration
**Deliverables**: Complete API routes, Zod schemas, session updates
**Risk Level**: Medium (complex validation logic)

**Key Tasks**:

- Implement Zod validation schemas for all form steps
- Create API endpoints for profile creation/update
- Add NextAuth session updates post-onboarding
- Implement media upload presigned URL generation
- Add database queries for sports/positions/teams

### Phase 2: Frontend Integration (Week 3, 15-20 hours)

Focus: UI components, wizard flow, and media upload

**Objectives**: Functional onboarding wizard with all features
**Deliverables**: Complete React components, responsive design
**Risk Level**: Medium (UI complexity, media upload)

**Key Tasks**:

- Build multi-step wizard component with progress indicator
- Implement conditional step rendering (role-based)
- Create form components for each step with real-time validation
- Integrate Cloudflare R2 media upload with progress feedback
- Add mobile-first responsive styling
- Implement accessibility features (ARIA labels, keyboard navigation)

### Phase 3: Polish & Deploy (Week 4, 5-10 hours)

Focus: Integration testing, accessibility compliance, and production

**Objectives**: Production-ready feature with monitoring
**Deliverables**: Deployed feature, basic monitoring
**Risk Level**: Low (integration and polish)

**Key Tasks**:

- End-to-end integration testing
- Accessibility audit and fixes (WCAG 2.1 AA)
- Performance optimization for 2s/step target
- Update existing onboarding trigger to use new flow
- Deploy to production with monitoring
- Documentation updates

## Risk Assessment & Mitigation

### High Risk

- **Media Upload Failures**: Complex client-side upload with network issues
  - Mitigation: Robust error handling, retry logic, fallback to basic upload
- **Mobile Responsiveness**: Ensuring 80% completion on mobile
  - Mitigation: Early mobile testing, touch-friendly components

### Medium Risk

- **Validation Complexity**: Real-time feedback for multiple fields
  - Mitigation: Modular validation functions, comprehensive testing
- **Database Performance**: Efficient queries for 10k+ users
  - Mitigation: Proper indexing, query optimization

### Low Risk

- **Accessibility Compliance**: WCAG 2.1 AA requirements
  - Mitigation: Use shadcn components with built-in accessibility
- **Session Management**: NextAuth integration
  - Mitigation: Follow existing patterns, thorough testing

## Success Metrics

### Quantitative

- **SC-001**: 90% of users complete onboarding in <5 minutes
- **SC-002**: 80% of profiles discoverable for search/discovery
- **SC-003**: Zero infinite loops or navigation issues
- **SC-004**: 80% completion rate on mobile devices
- **SC-005**: 95% media upload success rate

### Qualitative

- User feedback on onboarding experience
- Accessibility compliance verification
- Performance monitoring (response times <2s/step)

### Monitoring

- Application performance monitoring (APM) for response times
- Error tracking for upload failures
- User analytics for completion rates and drop-off points

## Dependencies & Prerequisites

### Internal Dependencies

- ✅ User authentication system (NextAuth)
- ✅ Database connection and basic schema
- ✅ Existing UI component library (shadcn)
- ✅ Basic user profile structure

### External Prerequisites

- Cloudflare R2 account and API keys
- Football data sources for seeding (positions, teams)

### Blocking Items

- None identified - can proceed incrementally
- Phase 0 can start immediately
- Each phase delivers value independently
