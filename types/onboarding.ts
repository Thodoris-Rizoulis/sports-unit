import { z } from "zod";
import { usernameBase, urlField, idField } from "./common";
import { basicProfileSchema } from "./profile";
import { sportsDetailsSchema } from "./sports";

// ========================================
// Onboarding Schemas and Types
// ========================================

// Onboarding schema (used for both client and server validation)
export const onboardingSchema = z.object({
  username: usernameBase,
  roleId: idField,
  basicProfile: basicProfileSchema,
  sportsDetails: sportsDetailsSchema,
  profilePictureUrl: urlField,
  coverPictureUrl: urlField,
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
