# Zod Validation Schemas: Enhanced User Profile Sections

**Feature**: 012-enhanced-profile-sections  
**Location**: `types/enhanced-profile.ts`

This document defines the Zod validation schemas for all new entities.

```typescript
import { z } from "zod";
import { idField } from "./common";

// ========================================
// Validation Constants (to add to lib/constants.ts)
// ========================================

export const ATHLETE_METRICS_CONSTANTS = {
  SPRINT_SPEED_30M: { MIN: 3.0, MAX: 8.0 },
  AGILITY_T_TEST: { MIN: 8.0, MAX: 20.0 },
  BEEP_TEST_LEVEL: { MIN: 1, MAX: 21 },
  BEEP_TEST_SHUTTLE: { MIN: 1, MAX: 16 },
  VERTICAL_JUMP: { MIN: 10, MAX: 150 },
} as const;

export const YEAR_CONSTANTS = {
  MIN_YEAR: 1950,
  MAX_YEAR: new Date().getFullYear() + 5,
} as const;

// ========================================
// Language Level Enum
// ========================================

export const languageLevels = [
  "native",
  "fluent",
  "proficient",
  "intermediate",
  "basic",
] as const;

export type LanguageLevel = (typeof languageLevels)[number];

// ========================================
// Athlete Metrics Schema
// ========================================

export const athleteMetricsSchema = z.object({
  sprintSpeed30m: z
    .number()
    .min(ATHLETE_METRICS_CONSTANTS.SPRINT_SPEED_30M.MIN)
    .max(ATHLETE_METRICS_CONSTANTS.SPRINT_SPEED_30M.MAX)
    .nullable()
    .optional(),
  agilityTTest: z
    .number()
    .min(ATHLETE_METRICS_CONSTANTS.AGILITY_T_TEST.MIN)
    .max(ATHLETE_METRICS_CONSTANTS.AGILITY_T_TEST.MAX)
    .nullable()
    .optional(),
  beepTestLevel: z
    .number()
    .int()
    .min(ATHLETE_METRICS_CONSTANTS.BEEP_TEST_LEVEL.MIN)
    .max(ATHLETE_METRICS_CONSTANTS.BEEP_TEST_LEVEL.MAX)
    .nullable()
    .optional(),
  beepTestShuttle: z
    .number()
    .int()
    .min(ATHLETE_METRICS_CONSTANTS.BEEP_TEST_SHUTTLE.MIN)
    .max(ATHLETE_METRICS_CONSTANTS.BEEP_TEST_SHUTTLE.MAX)
    .nullable()
    .optional(),
  verticalJump: z
    .number()
    .int()
    .min(ATHLETE_METRICS_CONSTANTS.VERTICAL_JUMP.MIN)
    .max(ATHLETE_METRICS_CONSTANTS.VERTICAL_JUMP.MAX)
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
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must be at most 250 cm")
    .nullable()
    .optional(),
  positionIds: z
    .array(idField)
    .max(3, "Maximum 3 positions allowed")
    .optional(),
  strongFoot: z.enum(["left", "right", "both"]).nullable().optional(),
});

export type KeyInfoInput = z.infer<typeof keyInfoSchema>;

// ========================================
// Experience Schema
// ========================================

const yearField = z
  .number()
  .int()
  .min(YEAR_CONSTANTS.MIN_YEAR)
  .max(YEAR_CONSTANTS.MAX_YEAR);

export const experienceSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    teamId: idField,
    yearFrom: yearField,
    yearTo: yearField.nullable().optional(),
    location: z.string().max(255).nullable().optional(),
  })
  .refine((data) => !data.yearTo || data.yearTo >= data.yearFrom, {
    message: "End year must be after start year",
    path: ["yearTo"],
  });

export type ExperienceInput = z.infer<typeof experienceSchema>;

// ========================================
// Education Schema
// ========================================

export const educationSchema = z
  .object({
    title: z.string().min(1, "Institution name is required").max(255),
    subtitle: z.string().max(255).nullable().optional(),
    yearFrom: yearField,
    yearTo: yearField.nullable().optional(),
  })
  .refine((data) => !data.yearTo || data.yearTo >= data.yearFrom, {
    message: "End year must be after start year",
    path: ["yearTo"],
  });

export type EducationInput = z.infer<typeof educationSchema>;

// ========================================
// Certification Schema
// ========================================

export const certificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  organization: z.string().max(255).nullable().optional(),
  year: yearField,
  description: z.string().nullable().optional(),
});

export type CertificationInput = z.infer<typeof certificationSchema>;

// ========================================
// Language Schema
// ========================================

export const languageSchema = z.object({
  language: z.string().min(1, "Language is required").max(100),
  level: z.enum(languageLevels),
});

export type LanguageInput = z.infer<typeof languageSchema>;

// ========================================
// Award Schema
// ========================================

export const awardSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  year: yearField,
  description: z.string().nullable().optional(),
});

export type AwardInput = z.infer<typeof awardSchema>;
```

## Usage Examples

### API Route Validation

```typescript
import { experienceSchema } from "@/types/enhanced-profile";
import { createErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = experienceSchema.safeParse(body);

  if (!result.success) {
    return createErrorResponse(
      "Validation failed",
      400,
      result.error.flatten()
    );
  }

  // Use result.data - fully typed
  const experience = await ExperienceService.create(userId, result.data);
}
```

### Form Validation with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { experienceSchema, ExperienceInput } from "@/types/enhanced-profile";

const form = useForm<ExperienceInput>({
  resolver: zodResolver(experienceSchema),
  defaultValues: {
    title: "",
    teamId: 0,
    yearFrom: new Date().getFullYear(),
    yearTo: null,
    location: "",
  },
});
```
