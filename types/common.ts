import { z } from "zod";
import { VALIDATION_CONSTANTS } from "@/lib/constants";

// ========================================
// Reusable Field Schemas
// ========================================

export const emailField = z.email("Invalid email address");
export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, number and special character"
  );
export const loginPasswordField = z.string().min(1, "Password is required");
export const hashedPasswordField = z.string();
export const idField = z.number().int().positive();
export const optionalIdField = idField.optional();
export type OptionalId = z.infer<typeof optionalIdField>;
export const roleIdField = z.number().int().positive("Please select a role");

export const urlField = z.url().optional();
export const onboardingCompleteField = z.boolean();

// Username validation schema (base schema)
export const usernameBase = z
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
export const optionalUsernameField = usernameBase.optional();
export type OptionalUsername = z.infer<typeof optionalUsernameField>;

// First name validation schema (base schema)
export const firstNameBase = z
  .string()
  .max(VALIDATION_CONSTANTS.PROFILE.FIRST_NAME_MAX_LENGTH)
  .regex(/^[a-zA-Z\s]+$/, "Only alphabetic characters allowed");
export const firstNameRequired = firstNameBase.min(1, "First name is required");

// Last name validation schema (base schema)
export const lastNameBase = z
  .string()
  .max(VALIDATION_CONSTANTS.PROFILE.LAST_NAME_MAX_LENGTH)
  .regex(/^[a-zA-Z\s]+$/, "Only alphabetic characters allowed");
export const lastNameRequired = lastNameBase.min(1, "Last name is required");

export const bioField = z
  .string()
  .max(VALIDATION_CONSTANTS.PROFILE.BIO_MAX_LENGTH)
  .optional();
export const locationField = z
  .string()
  .max(VALIDATION_CONSTANTS.PROFILE.LOCATION_MAX_LENGTH)
  .optional();

export const dateOfBirthField = z
  .union([z.date(), z.string()])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    return new Date(val);
  });

export const heightField = z
  .number()
  .min(
    VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM,
    `Height must be at least ${VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM} cm`
  )
  .max(
    VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM,
    `Height must be at most ${VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM} cm`
  )
  .optional();

// ========================================
// Other Types
// ========================================

export type StrongFoot = "left" | "right" | "both";
