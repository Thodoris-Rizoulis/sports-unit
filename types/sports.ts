import { z } from "zod";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { idField } from "./common";

// ========================================
// Sports Schemas and Types
// ========================================

export const sportSchema = z.object({
  id: idField,
  name: z.string(),
  created_at: z.date(),
});
export type Sport = z.infer<typeof sportSchema>;

export const positionSchema = z.object({
  id: idField,
  sport_id: idField,
  name: z.string(),
  created_at: z.date(),
});
export type Position = z.infer<typeof positionSchema>;

export const teamSchema = z.object({
  id: idField,
  sport_id: idField,
  name: z.string(),
  created_at: z.date(),
});
export type Team = z.infer<typeof teamSchema>;

export const roleSchema = z.object({
  id: idField,
  role_name: z.string(),
  description: z.string().optional(),
});
export type Role = z.infer<typeof roleSchema>;

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
