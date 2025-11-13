/**
 * Cloudflare integration for Convex backend
 * 
 * Provides Turnstile verification, Cloudflare Images, and R2 storage services
 */

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * Verify a Turnstile token (internal action)
 * This can be called from other backend functions if needed
 */
export const verifyTurnstile = internalAction({
  args: {
    token: v.string(),
    remoteip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      // If Turnstile is not configured, allow the request (for development)
      console.warn("Turnstile secret key not configured, skipping verification");
      return { success: true, verified: false };
    }

    try {
      const formData = new FormData();
      formData.append("secret", secretKey);
      formData.append("response", args.token);
      if (args.remoteip) {
        formData.append("remoteip", args.remoteip);
      }

      const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Turnstile verification failed: ${response.statusText}`);
      }

      const result = (await response.json()) as {
        success: boolean;
        challenge_ts?: string;
        hostname?: string;
        error_codes?: string[];
        action?: string;
        cdata?: string;
      };

      if (!result.success || result.error_codes?.length) {
        throw new Error(`Turnstile verification failed: ${result.error_codes?.join(", ") || "Unknown error"}`);
      }

      return { 
        success: true, 
        verified: true,
        hostname: result.hostname 
      };
    } catch (error) {
      console.error("Turnstile verification error:", error);
      throw new Error("Turnstile verification failed");
    }
  },
});

/**
 * Upload an image to Cloudflare Images
 * Automatically converts HEIC/HEIF to web-compatible formats
 */
export const uploadToCloudflareImages = internalAction({
  args: {
    imageUrl: v.string(),
    metadata: v.optional(v.object({
      filename: v.optional(v.string()),
      requireSignedURLs: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      const missing = [];
      if (!accountId) missing.push("CLOUDFLARE_ACCOUNT_ID");
      if (!apiToken) missing.push("CLOUDFLARE_API_TOKEN");
      throw new Error(`Cloudflare credentials not configured. Missing: ${missing.join(", ")}`);
    }

    try {
      // Fetch the image from the source URL
      const imageResponse = await fetch(args.imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }

      const imageBlob = await imageResponse.blob();
      const formData = new FormData();
      formData.append("file", imageBlob, args.metadata?.filename || "image.jpg");
      
      if (args.metadata?.requireSignedURLs !== undefined) {
        formData.append("requireSignedURLs", args.metadata.requireSignedURLs.toString());
      }

      // Upload to Cloudflare Images (automatically converts HEIC/HEIF)
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Cloudflare Images upload failed: ${errorText}`;
        
        // Provide helpful error messages
        if (response.status === 401 || errorText.includes("Authentication error")) {
          errorMessage = `Cloudflare Images authentication failed. Please check:
1. CLOUDFLARE_API_TOKEN is set correctly in Convex environment variables
2. API token has "Cloudflare Images:Edit" permission
3. API token is for the correct account
4. Token hasn't expired or been revoked

Original error: ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = (await response.json()) as {
        success: boolean;
        errors?: Array<{ code: number; message: string }>;
        result: {
          id: string;
          variants: string[];
          filename: string;
        };
      };
      
      if (!result.success) {
        const errorDetails = result.errors?.map(e => `Code ${e.code}: ${e.message}`).join(", ") || "Unknown error";
        let errorMessage = `Cloudflare Images upload failed: ${errorDetails}`;
        
        // Check for authentication errors
        if (result.errors?.some(e => e.code === 10000)) {
          errorMessage = `Cloudflare Images authentication error (Code 10000). Please verify:
1. CLOUDFLARE_API_TOKEN is correct
2. Token has "Cloudflare Images:Edit" permission  
3. CLOUDFLARE_ACCOUNT_ID matches your account

Error details: ${errorDetails}`;
        }
        
        throw new Error(errorMessage);
      }

      return {
        imageId: result.result.id,
        variants: result.result.variants,
        filename: result.result.filename,
      };
    } catch (error) {
      console.error("Cloudflare Images upload error:", error);
      throw error;
    }
  },
});

/**
 * Get Cloudflare Images URL with optional transformations
 * Note: This is kept as a regular action for external use
 */
export const getCloudflareImageUrl = internalAction({
  args: {
    imageId: v.string(),
    options: v.optional(v.object({
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      fit: v.optional(v.union(
        v.literal("scale-down"),
        v.literal("contain"),
        v.literal("cover"),
        v.literal("crop"),
        v.literal("pad")
      )),
      quality: v.optional(v.number()),
      format: v.optional(v.union(v.literal("webp"), v.literal("avif"))),
    })),
  },
  handler: async (ctx, args) => {
    const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;
    
    if (!accountHash) {
      throw new Error("Cloudflare Images account hash not configured");
    }

    // Build transformation string if options provided
    let variant = "public";
    if (args.options) {
      const transforms: string[] = [];
      if (args.options.width) transforms.push(`w${args.options.width}`);
      if (args.options.height) transforms.push(`h${args.options.height}`);
      if (args.options.fit) transforms.push(`fit-${args.options.fit}`);
      if (args.options.quality) transforms.push(`quality-${args.options.quality}`);
      if (args.options.format) transforms.push(`format-${args.options.format}`);
      
      if (transforms.length > 0) {
        variant = transforms.join(",");
      }
    }

    return {
      url: `https://imagedelivery.net/${accountHash}/${args.imageId}/${variant}`,
      imageId: args.imageId,
    };
  },
});

/**
 * Upload file to Cloudflare R2 (S3-compatible storage)
 * Better for HEIC images and large files
 */
export const uploadToR2 = internalAction({
  args: {
    fileUrl: v.string(), // URL to fetch the file from (e.g., Convex storage URL)
    key: v.string(), // R2 object key (path)
    contentType: v.optional(v.string()),
    metadata: v.optional(v.object({
      originalFilename: v.optional(v.string()),
      isHeic: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<{ key: string; url: string }> => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error("Cloudflare R2 credentials not configured");
    }

    try {
      // Fetch file from source URL
      const fileResponse = await fetch(args.fileUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
      }

      const fileBlob = await fileResponse.blob();
      const contentType = args.contentType || fileResponse.headers.get("content-type") || "application/octet-stream";

      const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
      const url = `${endpoint}/${bucketName}/${args.key}`;

      const headers: HeadersInit = {
        "Content-Type": contentType,
      };

      // Add metadata if provided
      if (args.metadata) {
        if (args.metadata.originalFilename) {
          headers["x-amz-meta-original-filename"] = args.metadata.originalFilename;
        }
        if (args.metadata.isHeic !== undefined) {
          headers["x-amz-meta-is-heic"] = args.metadata.isHeic.toString();
        }
      }

      // Upload to R2
      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: fileBlob,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`R2 upload failed: ${error}`);
      }

      // Return public URL or presigned URL
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
  },
});

/**
 * Get R2 file URL (public or presigned)
 */
export const getR2Url = action({
  args: {
    key: v.string(),
    expiresIn: v.optional(v.number()), // seconds
  },
  handler: async (ctx, args): Promise<string> => {
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (publicUrl) {
      return `${publicUrl}/${args.key}`;
    }

    // For private buckets, generate presigned URL
    // Simplified - use AWS SDK in production for proper signing
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    return `${endpoint}/${bucketName}/${args.key}`;
  },
});
