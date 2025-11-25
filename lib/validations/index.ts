import { z } from "zod";
import { VALIDATION_CONSTANTS } from "../constants";

// Username validation schema
export const usernameSchema = z
  .string()
  .min(
    VALIDATION_CONSTANTS.USERNAME.MIN_LENGTH,
    `Username must be at least ${VALIDATION_CONSTANTS.USERNAME.MIN_LENGTH} characters`
  )
  .max(
    VALIDATION_CONSTANTS.USERNAME.MAX_LENGTH,
    `Username must be at most ${VALIDATION_CONSTANTS.USERNAME.MAX_LENGTH} characters`
  )
  .regex(
    VALIDATION_CONSTANTS.USERNAME.PATTERN,
    "Username can only contain letters, numbers, and underscores"
  );

// Role validation schema
export const roleSchema = z.enum(VALIDATION_CONSTANTS.ROLE_OPTIONS, {
  message: "Please select a valid role",
});

// Basic profile validation schema
export const basicProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(
      VALIDATION_CONSTANTS.PROFILE.FIRST_NAME_MAX_LENGTH,
      `First name must be at most ${VALIDATION_CONSTANTS.PROFILE.FIRST_NAME_MAX_LENGTH} characters`
    ),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(
      VALIDATION_CONSTANTS.PROFILE.LAST_NAME_MAX_LENGTH,
      `Last name must be at most ${VALIDATION_CONSTANTS.PROFILE.LAST_NAME_MAX_LENGTH} characters`
    ),
  bio: z
    .string()
    .max(
      VALIDATION_CONSTANTS.PROFILE.BIO_MAX_LENGTH,
      `Bio must be at most ${VALIDATION_CONSTANTS.PROFILE.BIO_MAX_LENGTH} characters`
    )
    .optional(),
  location: z
    .string()
    .max(
      VALIDATION_CONSTANTS.PROFILE.LOCATION_MAX_LENGTH,
      `Location must be at most ${VALIDATION_CONSTANTS.PROFILE.LOCATION_MAX_LENGTH} characters`
    )
    .optional(),
  dateOfBirth: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (val instanceof Date) return val;
      return new Date(val);
    }),
  height: z
    .number()
    .min(
      VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM,
      `Height must be at least ${VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM} cm`
    )
    .max(
      VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM,
      `Height must be at most ${VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM} cm`
    )
    .optional(),
});

// Sports details validation schema
export const sportsDetailsSchema = z.object({
  sportId: z.number().int().positive("Please select a sport"),
  positionIds: z
    .array(z.number().int().positive())
    .min(1, "Please select at least one position")
    .max(
      VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS,
      `You can select at most ${VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS} positions`
    ),
  teamId: z.number().int().positive().optional(),
  openToOpportunities: z.boolean(),
  strongFoot: z.enum(VALIDATION_CONSTANTS.STRONG_FOOT_OPTIONS).optional(),
});

// Media upload validation schema
export const mediaUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        file.size <= VALIDATION_CONSTANTS.MEDIA.MAX_FILE_SIZE_MB * 1024 * 1024,
      `File size must be less than ${VALIDATION_CONSTANTS.MEDIA.MAX_FILE_SIZE_MB}MB`
    )
    .refine(
      (file) =>
        (
          VALIDATION_CONSTANTS.MEDIA.ALLOWED_IMAGE_TYPES as readonly string[]
        ).includes(file.type),
      "File must be a valid image type (JPEG, PNG, WebP)"
    ),
});

// Complete onboarding validation schema
export const onboardingSchema = z.object({
  username: usernameSchema,
  role: roleSchema,
  basicProfile: basicProfileSchema,
  sportsDetails: sportsDetailsSchema,
  profilePictureUrl: z.string().url().optional(),
  coverPictureUrl: z.string().url().optional(),
});

// Profile update validation schema (similar but allows partial updates)
export const profileUpdateSchema = onboardingSchema.partial();

// Type exports
export type UsernameInput = z.infer<typeof usernameSchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type BasicProfileInput = z.infer<typeof basicProfileSchema>;
export type SportsDetailsInput = z.infer<typeof sportsDetailsSchema>;
export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
