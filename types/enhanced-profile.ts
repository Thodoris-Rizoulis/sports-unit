import { z } from "zod";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { idField } from "./common";

// ========================================
// Athlete Metrics Schema
// ========================================

export const athleteMetricsSchema = z.object({
  sprintSpeed30m: z
    .number()
    .min(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M.MIN,
      `Sprint speed must be at least ${VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M.MIN}s`
    )
    .max(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M.MAX,
      `Sprint speed must be at most ${VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M.MAX}s`
    )
    .nullable()
    .optional(),
  agilityTTest: z
    .number()
    .min(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST.MIN,
      `Agility T-Test must be at least ${VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST.MIN}s`
    )
    .max(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST.MAX,
      `Agility T-Test must be at most ${VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST.MAX}s`
    )
    .nullable()
    .optional(),
  beepTestLevel: z
    .number()
    .int()
    .min(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL.MIN,
      `Beep test level must be at least ${VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL.MIN}`
    )
    .max(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL.MAX,
      `Beep test level must be at most ${VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL.MAX}`
    )
    .nullable()
    .optional(),
  beepTestShuttle: z
    .number()
    .int()
    .min(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_SHUTTLE.MIN,
      `Beep test shuttle must be at least ${VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_SHUTTLE.MIN}`
    )
    .max(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_SHUTTLE.MAX,
      `Beep test shuttle must be at most ${VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_SHUTTLE.MAX}`
    )
    .nullable()
    .optional(),
  verticalJump: z
    .number()
    .int()
    .min(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP.MIN,
      `Vertical jump must be at least ${VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP.MIN}cm`
    )
    .max(
      VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP.MAX,
      `Vertical jump must be at most ${VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP.MAX}cm`
    )
    .nullable()
    .optional(),
});

export type AthleteMetricsInput = z.infer<typeof athleteMetricsSchema>;

// ========================================
// Key Information Schema
// ========================================

export const keyInfoSchema = z.object({
  dateOfBirth: z
    .union([z.date(), z.string()])
    .nullable()
    .optional()
    .transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val;
      return new Date(val);
    }),
  height: z
    .number()
    .int()
    .min(
      VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM,
      `Height must be at least ${VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM} cm`
    )
    .max(
      VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM,
      `Height must be at most ${VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM} cm`
    )
    .nullable()
    .optional(),
  positionIds: z
    .array(idField)
    .max(
      VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS,
      `Maximum ${VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS} positions allowed`
    )
    .optional(),
  strongFoot: z.enum(["left", "right", "both"]).nullable().optional(),
});

export type KeyInfoInput = z.infer<typeof keyInfoSchema>;

// Form input type (before transform) - used for react-hook-form
export type KeyInfoFormInput = {
  dateOfBirth?: Date | string | null;
  height?: number | null;
  positionIds?: number[];
  strongFoot?: "left" | "right" | "both" | null;
};

// ========================================
// Year Field Helper
// ========================================

const yearField = z
  .number()
  .int()
  .min(VALIDATION_CONSTANTS.YEAR.MIN, `Year must be at least ${VALIDATION_CONSTANTS.YEAR.MIN}`)
  .max(VALIDATION_CONSTANTS.YEAR.MAX, `Year must be at most ${VALIDATION_CONSTANTS.YEAR.MAX}`);

// ========================================
// Experience Schema
// ========================================

export const experienceSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    teamId: idField,
    yearFrom: yearField,
    yearTo: yearField.nullable().optional(),
    location: z.string().max(255, "Location is too long").nullable().optional(),
  })
  .refine((data) => !data.yearTo || data.yearTo >= data.yearFrom, {
    message: "End year must be after or equal to start year",
    path: ["yearTo"],
  });

export type ExperienceInput = z.infer<typeof experienceSchema>;

// ========================================
// Education Schema
// ========================================

export const educationSchema = z
  .object({
    title: z.string().min(1, "Institution name is required").max(255, "Title is too long"),
    subtitle: z.string().max(255, "Subtitle is too long").nullable().optional(),
    yearFrom: yearField,
    yearTo: yearField.nullable().optional(),
  })
  .refine((data) => !data.yearTo || data.yearTo >= data.yearFrom, {
    message: "End year must be after or equal to start year",
    path: ["yearTo"],
  });

export type EducationInput = z.infer<typeof educationSchema>;

// ========================================
// Certification Schema
// ========================================

export const certificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  organization: z.string().max(255, "Organization name is too long").nullable().optional(),
  year: yearField,
  description: z.string().nullable().optional(),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

// ========================================
// Language Schema
// ========================================

export const languageLevels = VALIDATION_CONSTANTS.LANGUAGE_LEVELS;
export type LanguageLevel = (typeof languageLevels)[number];

export const languageSchema = z.object({
  language: z.string().min(1, "Language is required").max(100, "Language name is too long"),
  level: z.enum(languageLevels),
});

export type LanguageInput = z.infer<typeof languageSchema>;

// ========================================
// Award Schema
// ========================================

export const awardSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  year: yearField,
  description: z.string().nullable().optional(),
});

export type AwardInput = z.infer<typeof awardSchema>;
