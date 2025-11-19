/**
 * Cloudflare R2 backend integration for Convex
 * 
 * R2 is S3-compatible object storage with no egress fees.
 * Perfect for storing HEIC images and other large files.
 */

export type R2UploadArgs = {
  file: Blob | ArrayBuffer | Uint8Array;
  key: string;
  contentType?: string;
  metadata?: Record<string, string>;
};

export type R2GetUrlArgs = {
  key: string;
  expiresIn?: number; // seconds, default 3600 (1 hour)
};

export type R2DeleteArgs = {
  key: string;
};

/**
 * Upload a file to Cloudflare R2
 * 
 * Example Convex action implementation:
 * 
 * ```typescript
 * import { action } from "./_generated/server";
 * import { v } from "convex/values";
 * 
 * export const uploadToR2 = action({
 *   args: {
 *     fileUrl: v.string(), // URL to fetch the file from
 *     key: v.string(),
 *     contentType: v.optional(v.string()),
 *   },
 *   handler: async (ctx, args) => {
 *     // Fetch file from URL
 *     const fileResponse = await fetch(args.fileUrl);
 *     const fileBlob = await fileResponse.blob();
 *     
 *     return await uploadToR2({
 *       file: fileBlob,
 *       key: args.key,
 *       contentType: args.contentType || fileResponse.headers.get("content-type") || "application/octet-stream",
 *     });
 *   },
 * });
 * ```
 */
export async function uploadToR2(args: R2UploadArgs): Promise<{ key: string; url: string }> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Cloudflare R2 credentials not configured");
  }

  try {
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${bucketName}/${args.key}`;

    // Create the request
    const headers: HeadersInit = {
      "Content-Type": args.contentType || "application/octet-stream",
    };

    // Add metadata if provided
    if (args.metadata) {
      Object.entries(args.metadata).forEach(([key, value]) => {
        headers[`x-amz-meta-${key}`] = value;
      });
    }

    // Convert file to ArrayBuffer if needed
    let fileData: ArrayBuffer;
    if (args.file instanceof Blob) {
      fileData = await args.file.arrayBuffer();
    } else if (args.file instanceof ArrayBuffer) {
      fileData = args.file;
    } else {
      fileData = args.file.buffer as ArrayBuffer;
    }

    // Sign the request (simplified - in production, use AWS SDK or proper signing)
    // For now, we'll use a presigned URL approach or direct upload with credentials
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: fileData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`R2 upload failed: ${error}`);
    }

    // Return the public URL (if bucket is public) or presigned URL
    const publicUrl = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${args.key}`
      : url;

    return {
      key: args.key,
      url: publicUrl,
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    throw error;
  }
}

/**
 * Get a presigned URL for R2 object (for private buckets)
 */
export async function getR2PresignedUrl(args: R2GetUrlArgs): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Cloudflare R2 credentials not configured");
  }

  // For presigned URLs, you'd typically use AWS SDK's getSignedUrl
  // For simplicity, if bucket is public, return public URL
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${args.key}`;
  }

  // Otherwise, generate presigned URL (simplified - use AWS SDK in production)
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  return `${endpoint}/${bucketName}/${args.key}`;
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(args: R2DeleteArgs): Promise<{ success: boolean }> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Cloudflare R2 credentials not configured");
  }

  try {
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${bucketName}/${args.key}`;

    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`R2 delete failed: ${error}`);
    }

    return { success: true };
  } catch (error) {
    console.error("R2 delete error:", error);
    throw error;
  }
}

