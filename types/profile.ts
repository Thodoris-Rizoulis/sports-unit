import { z } from "zod";
import {
  firstNameBase,
  firstNameRequired,
  lastNameBase,
  lastNameRequired,
  bioField,
  locationField,
  dateOfBirthField,
  heightField,
  urlField,
  usernameBase,
  idField,
} from "./common";

// ========================================
// Profile Input Validation Schemas
// For validating user input in forms and API requests
// Output types (UserProfile, SearchUserResult) are in types/prisma.ts
// ========================================

// Basic profile validation schema (onboarding)
export const basicProfileSchema = z.object({
  firstName: firstNameRequired,
  lastName: lastNameRequired,
  bio: bioField,
  location: locationField,
  dateOfBirth: dateOfBirthField,
  height: heightField,
});
export type BasicProfileInput = z.infer<typeof basicProfileSchema>;

// Profile partial update validation schema (flat structure for partial updates)
// Using .partial() to make all fields optional for PATCH-style updates
export const profilePartialUpdateSchema = z
  .object({
    username: usernameBase,
    firstName: firstNameBase,
    lastName: lastNameBase,
    bio: bioField,
    location: locationField,
    dateOfBirth: dateOfBirthField,
    height: heightField,
    profileImageUrl: urlField,
    coverImageUrl: urlField,
    sportId: idField,
    positionIds: z.array(idField),
    teamId: idField,
    openToOpportunities: z.boolean(),
    strongFoot: z.string(),
  })
  .partial();

// Edit profile schema for EditProfileModal (required fields for form validation)
export const editProfileSchema = z.object({
  firstName: firstNameRequired,
  lastName: lastNameRequired,
  username: usernameBase,
  teamId: idField.nullable(),
  location: locationField,
  openToOpportunities: z.boolean(),
});

export type EditProfileForm = z.infer<typeof editProfileSchema>;
