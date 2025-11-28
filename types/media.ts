import { z } from "zod";
import { VALIDATION_CONSTANTS } from "@/lib/constants";
import { idField } from "./common";

// ========================================
// Media Schemas and Types
// ========================================

// Upload request schema
export const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().regex(/^image\/(jpeg|png|webp)$/),
  fileSize: z
    .number()
    .max(VALIDATION_CONSTANTS.MEDIA.MAX_FILE_SIZE_MB * 1024 * 1024),
  userId: idField,
});
export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
