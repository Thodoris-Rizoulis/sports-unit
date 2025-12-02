import { z } from "zod";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { idField } from "./common";

// ========================================
// Sports Input Validation Schemas
// For validating user input in forms and API requests
// Output types (Sport, Position, Team, Role) are in types/prisma.ts
// ========================================

// Sports details validation schema
export const sportsDetailsSchema = z.object({
  sportId: idField,
  positionIds: z
    .array(idField)
    .min(1, "Please select at least one position")
    .max(
      VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS,
      `You can select at most ${VALIDATION_CONSTANTS.SPORTS.MAX_POSITIONS} positions`
    ),
  teamId: idField.optional(),
  openToOpportunities: z.boolean(),
  strongFoot: z.enum(VALIDATION_CONSTANTS.STRONG_FOOT_OPTIONS).optional(),
});
export type SportsDetailsInput = z.infer<typeof sportsDetailsSchema>;
