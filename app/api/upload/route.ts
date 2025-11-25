import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Cloudflare R2 configuration
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

// Validation schema for upload request
const uploadRequestSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().regex(/^image\/(jpeg|png|webp)$/),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileType, fileSize } = uploadRequestSchema.parse(body);

    // Generate unique key
    const key = `uploads/${Date.now()}-${fileName}`;

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
    const publicUrl = `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.CLOUDFLARE_R2_BUCKET_NAME}/${key}`;

    return NextResponse.json({
      uploadUrl: signedUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Upload URL generation failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
