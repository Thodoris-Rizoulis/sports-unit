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
// Profile Schemas and Types
// ========================================

export const userProfileSchema = z.object({
  userId: z.string(),
  firstName: firstNameBase,
  lastName: lastNameBase,
  username: usernameBase,
  teamId: z.number().nullable().optional(),
  teamName: z.string().optional(),
  location: locationField,
  bio: bioField,
  coverImageUrl: urlField,
  profileImageUrl: urlField,
  openToOpportunities: z.boolean(),
  sportId: idField.optional(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

export const userAttributeSchema = z.object({
  id: idField,
  user_id: idField,
  first_name: firstNameBase,
  last_name: lastNameBase,
  bio: bioField,
  location: locationField,
  date_of_birth: dateOfBirthField,
  height: heightField,
  profile_picture_url: urlField,
  cover_picture_url: urlField,
  sport_id: idField.optional(),
  positions: z.array(idField).optional(), // JSON array of position ids
  team_id: idField.optional(),
  open_to_opportunities: z.boolean(),
  strong_foot: z.string().optional(),
  role_id: idField.optional(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type UserAttribute = z.infer<typeof userAttributeSchema>;

// Basic profile validation schema
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
export const profilePartialUpdateSchema = z
  .object({
    username: usernameBase.optional(),
    firstName: firstNameBase.optional(),
    lastName: lastNameBase.optional(),
    bio: bioField.optional(),
    location: locationField.optional(),
    dateOfBirth: dateOfBirthField.optional(),
    height: heightField.optional(),
    profileImageUrl: urlField.optional(),
    coverImageUrl: urlField.optional(),
    sportId: idField.optional(),
    positionIds: z.array(idField).optional(),
    teamId: idField.optional(),
    openToOpportunities: z.boolean().optional(),
    strongFoot: z.string().optional(),
  })
  .partial();
