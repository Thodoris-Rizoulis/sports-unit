import { z } from "zod";
import { idField } from "./common";

// ========================================
// Connection Input Validation Schemas
// For validating user input in forms and API requests
// Output types (ConnectionListItem, ConnectionStatusResponse) are in types/prisma.ts
// ========================================

// Connection request schema (for sending requests)
export const connectionRequestSchema = z.object({
  recipientId: idField,
});
export type ConnectionRequest = z.infer<typeof connectionRequestSchema>;

// Connection response schema (for accepting/declining)
export const connectionResponseSchema = z.object({
  action: z.enum(["accept", "decline"]),
});
export type ConnectionResponse = z.infer<typeof connectionResponseSchema>;
