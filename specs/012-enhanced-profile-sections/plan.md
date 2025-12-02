# Implementation Plan: Enhanced User Profile Sections

**Branch**: `012-enhanced-profile-sections` | **Date**: December 2, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-enhanced-profile-sections/spec.md`

## Summary

Implement comprehensive profile sections for athletes and coaches including Key Information (athlete-only), Athlete Metrics (athlete-only), Recent Activity, Experience, Education, Licenses & Certifications (coach-only), and a modular right sidebar with Languages and Awards widgets. Role detection via `profile_roles` table determines section visibility. Six new database tables required.

## Technical Context

**Language/Version**: TypeScript (Next.js 14+)  
**Primary Dependencies**: Next.js, TypeScript, shadcn/ui, Tailwind CSS, Prisma ORM, Zod, React Hook Form, NextAuth.js  
**Storage**: PostgreSQL (existing) with 6 new tables  
**Testing**: Manual testing (pre-MVP)  
**Target Platform**: Web browsers (desktop, tablet, mobile)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Profile page load under 3 seconds  
**Constraints**: Mobile-first responsive, authentication required, role-based section visibility  
**Scale/Scope**: Extended profile page with ~10 new components, 6 new services, 8 new API routes

## Constitution Check

_GATE: ✅ All checks pass - no violations._

- **Code Quality**: ✅ TypeScript strict mode, prefer `type`, avoid `any`, DRY principle
- **TypeScript & Type Safety**: ✅ Zod for input validation, Prisma types for output, centralize in `/types`
- **Project Structure**: ✅ Next.js App Router, services pattern, proper folder organization
- **API & Data Layer**: ✅ Use `api-utils`, Prisma ORM, services for business logic, Zod validation
- **Component Development**: ✅ Server Components default, Client Components for interactivity, shadcn/ui
- **Styling & Theming**: ✅ Tailwind with theme variables, semantic color tokens
- **Validation & Best Practices**: ✅ Zod schemas, established naming conventions
- **Performance & Optimization**: ✅ Proper code splitting, lazy loading modals
- **Error Handling**: ✅ try/catch everywhere, meaningful error messages
- **Reusability**: ✅ Reuse existing common fields, modular sidebar component
- **Dependencies**: ✅ No new dependencies required
- **Design / Responsiveness**: ✅ Mobile-first, sidebar collapses below content on mobile
- **Extensibility / Maintainability**: ✅ Service → API → component pattern

## Project Structure

### Documentation (this feature)

```text
specs/012-enhanced-profile-sections/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# New files for this feature

migrations/
└── 017_add_enhanced_profile_tables.ts    # New tables

prisma/
└── schema.prisma                          # Updated with 6 new models

types/
├── enhanced-profile.ts                    # New Zod schemas for all new entities
└── prisma.ts                              # Extended with new UI types and mappers

services/
├── athlete-metrics.ts                     # New service
├── experience.ts                          # New service
├── education.ts                           # New service
├── certifications.ts                      # New service
├── languages.ts                           # New service
├── awards.ts                              # New service
└── profile.ts                             # Extended for role detection

lib/
└── constants.ts                           # Extended with metric validation ranges

app/
├── api/profile/[uuid]/
│   ├── metrics/route.ts                   # GET, PUT
│   ├── key-info/route.ts                  # PUT
│   ├── experience/route.ts                # GET, POST
│   ├── experience/[id]/route.ts           # PUT, DELETE
│   ├── education/route.ts                 # GET, POST
│   ├── education/[id]/route.ts            # PUT, DELETE
│   ├── certifications/route.ts            # GET, POST
│   ├── certifications/[id]/route.ts       # PUT, DELETE
│   ├── languages/route.ts                 # GET, POST
│   ├── languages/[id]/route.ts            # PUT, DELETE
│   ├── awards/route.ts                    # GET, POST
│   ├── awards/[id]/route.ts               # PUT, DELETE
│   └── posts/route.ts                     # GET (paginated)
└── (main)/profile/[uuid]/[slug]/
    └── posts/page.tsx                     # User posts page with (main) layout

components/profile/
├── KeyInformationSection.tsx              # Athlete-only section
├── KeyInfoEditModal.tsx                   # Edit modal for key info
├── AthleteMetricsSection.tsx              # Athlete-only metrics
├── MetricsEditModal.tsx                   # Edit modal for metrics
├── RecentActivitySection.tsx              # Last 2 posts + See All
├── ExperienceSection.tsx                  # Experience list
├── ExperienceModal.tsx                    # Add/Edit experience
├── EducationSection.tsx                   # Education list
├── EducationModal.tsx                     # Add/Edit education
├── CertificationsSection.tsx              # Coach-only certifications
├── CertificationModal.tsx                 # Add/Edit certification
├── ProfileSidebar.tsx                     # Modular sidebar wrapper
├── LanguagesWidget.tsx                    # Languages sidebar widget
├── LanguageModal.tsx                      # Add/Edit language
├── AwardsWidget.tsx                       # Awards sidebar widget
├── AwardModal.tsx                         # Add/Edit award
└── ProfilePageWrapper.tsx                 # Updated to include all sections

hooks/
├── useAthleteMetrics.ts                   # Metrics data hook
├── useExperience.ts                       # Experience CRUD hook
├── useEducation.ts                        # Education CRUD hook
├── useCertifications.ts                   # Certifications CRUD hook
├── useLanguages.ts                        # Languages CRUD hook
├── useAwards.ts                           # Awards CRUD hook
└── useUserPosts.ts                        # User posts with pagination
```

**Structure Decision**: Follow existing Next.js App Router patterns with services for business logic, new API routes under `/api/profile/[uuid]/`, and new profile components in `/components/profile/`. The modular sidebar enables reuse on other pages.

## Complexity Tracking

> No violations - all requirements align with constitution.
