// Re-export validation schemas from lib (single source of truth)
export {
  usernameSchema,
  roleSchema,
  basicProfileSchema,
  sportsDetailsSchema,
  mediaUploadSchema,
  onboardingSchema,
  profileUpdateSchema,
} from "@/lib/validations";

// Type definitions (derived from schemas in lib)
export type {
  UsernameInput,
  RoleInput,
  BasicProfileInput,
  SportsDetailsInput,
  MediaUploadInput,
  OnboardingInput,
  ProfileUpdateInput,
} from "@/lib/validations";
