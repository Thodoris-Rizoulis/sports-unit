import { z } from "zod";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { idField } from "./common";

// ========================================
// Media Schemas and Types
// ========================================

// Upload request schema
export const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z
    .string()
    .regex(/^(image\/(jpeg|png|webp)|video\/(mp4|webm|quicktime))$/),
  fileSize: z.number().max(100 * 1024 * 1024), // 100MB for videos
  userId: idField,
});
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
