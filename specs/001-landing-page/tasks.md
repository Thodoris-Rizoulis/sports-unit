---
description: "Task list template for feature implementation"
---

# Tasks: Landing Page

**Input**: Design documents from `/specs/001-landing-page/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No unit or e2e tests for pre-MVP per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `app/`, `components/`
- Paths follow the project structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and verify project setup

- [x] T001 Install Heroicons dependency in package.json
- [x] T002 [P] Verify Tailwind CSS configuration and global.css colors in styles/global.css
- [x] T003 [P] Ensure shadcn components are installed and available in components/ui/

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required for this feature

## Phase 3: User Story 1 - View Landing Page

**Story Goal**: Enable users to view the complete landing page with hero, features, and footer sections
**Independent Test Criteria**: Page loads and displays all sections correctly with proper styling and responsiveness
**Tests**: None (pre-MVP)

- [x] T004 Create /app/(landing)/ directory structure
- [x] T005 Create /components directory for reusable components
- [x] T006 [P] Verify /lib and /types directories exist per constitution
- [x] T007 Create Hero.tsx component in /components/Hero.tsx
- [x] T008 Add clean block layout to Hero component
- [x] T009 Add heading and placeholder subheading to Hero
- [x] T010 Add "Login / Register" button using shadcn Button in Hero
- [x] T011 Implement mobile-first responsive design for Hero
- [x] T012 Add hover/active states for Hero button
- [x] T013 Create Features.tsx component in /components/Features.tsx
- [x] T014 Add 3 feature blocks to Features component
- [x] T015 Add Heroicons to each feature block in Features
- [x] T016 Add placeholder titles and descriptions to Features
- [x] T017 Implement responsive layout for Features
- [x] T018 Create Footer.tsx component in /components/Footer.tsx
- [x] T019 Add minimal copyright content to Footer
- [x] T020 Implement responsive design for Footer
- [x] T021 Create /app/(landing)/page.tsx main component
- [x] T022 Import Hero, Features, Footer into page.tsx
- [x] T023 Arrange sections in order: Hero → Features → Footer
- [x] T024 Verify responsive design across breakpoints in page.tsx

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and constitution compliance checks

- [x] T025 Verify TypeScript strict mode compilation passes with zero errors
- [x] T026 Ensure all components are modular and reusable per constitution
- [x] T027 Confirm all styling uses global.css colors per constitution
- [x] T028 Test button hover/active states functionality

## Dependencies

**Story Completion Order**: Setup (Phase 1) → User Story 1 (Phase 3) → Polish (Phase 4)

**Task Dependencies**:

- T001 (install Heroicons) must complete before T015 (add icons)
- T004-T006 (structure setup) must complete before T007-T024 (component creation)
- T007-T012 (Hero) can be parallel with T013-T017 (Features) and T018-T020 (Footer)
- T021-T024 (assembly) depends on all component creation tasks
- T025-T028 (polish) depends on all implementation tasks

## Parallel Execution Examples

**Per User Story**:

- **Setup**: T002 and T003 can run in parallel (verify Tailwind and shadcn)
- **User Story 1**: T007-T012 (Hero), T013-T017 (Features), T018-T020 (Footer) can run in parallel after structure setup
- **Polish**: T025-T028 can run in parallel after implementation

## Implementation Strategy

**MVP Scope**: Complete User Story 1 (landing page display) - delivers immediate value as the primary user entry point
**Incremental Delivery**: No additional stories - this is the complete MVP for landing page
**Risk Mitigation**: Start with Hero section, then Features, then Footer to validate approach before full implementation
