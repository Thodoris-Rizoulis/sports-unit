import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import { z } from "zod";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { uploadRequestSchema } from "@/types/media";

// Cloudflare R2 configuration
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize, userId } =
      uploadRequestSchema.parse(body);

    // Generate unique key
    const key = `profiles/${userId}/${Date.now()}-${fileName}`;

    // Create put object command
    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
      // Add any additional metadata or ACLs as needed
    });

    // Generate presigned URL (expires in 1 hour)
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Return the presigned URL and the public URL
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    return createSuccessResponse({
      uploadUrl: signedUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Upload URL generation failed:", error);

    if (error instanceof z.ZodError) {
      return createErrorResponse("Invalid request data", 400, error.issues);
    }

    return createErrorResponse("Failed to generate upload URL", 500);
  }
}
