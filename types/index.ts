// ========================================
// Type Exports - Single Source of Truth
// ========================================

// Output types (Prisma-derived) - for API responses, component props
export * from "./prisma";

// Input validation schemas (Zod) - for forms, API requests
export * from "./auth"; // registerSchema, loginFormSchema
export * from "./connections"; // connectionRequestSchema, connectionResponseSchema
export * from "./discovery"; // discoveryFiltersSchema, AthleteDiscoveryResult
export * from "./onboarding"; // onboardingSchema
export * from "./posts"; // createPostInputSchema, createCommentInputSchema
export * from "./profile"; // editProfileSchema, basicProfileSchema, profilePartialUpdateSchema
export * from "./sports"; // sportsDetailsSchema
export * from "./watchlists"; // createWatchlistSchema, WatchlistSummary

// Shared utilities
export * from "./common"; // Zod field validators
export * from "./components"; // Component prop types
export * from "./media"; // Media types
