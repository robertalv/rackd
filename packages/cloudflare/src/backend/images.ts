/**
 * Cloudflare Images backend integration for Convex
 * 
 * NOTE: These functions should be imported and used in your Convex backend.
 * They are provided here as reference implementations.
 * 
 * To use them, copy these functions to packages/backend/convex/lib/cloudflare.ts
 * or import this file and re-export from there.
 */

// These types match Convex's validation types
// In actual Convex code, import from "convex/values"
export type CloudflareImageUploadArgs = {
  imageUrl: string;
  metadata?: {
    filename?: string;
    requireSignedURLs?: boolean;
  };
};

export type CloudflareImageDeleteArgs = {
  imageId: string;
};

export type CloudflareImageUrlArgs = {
  imageId: string;
  options?: {
    width?: number;
    height?: number;
    fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
    quality?: number;
    format?: "webp" | "avif" | "json";
  };
};

/**
 * Upload an image to Cloudflare Images
 * Returns the Cloudflare Images URL which provides automatic optimization
 * 
 * Example Convex action implementation:
 * 
 * ```typescript
 * import { action } from "./_generated/server";
 * import { v } from "convex/values";
 * 
 * export const uploadToCloudflareImages = action({
 *   args: {
 *     imageUrl: v.string(),
 *     metadata: v.optional(v.object({
 *       filename: v.optional(v.string()),
 *       requireSignedURLs: v.optional(v.boolean()),
 *     })),
 *   },
 *   handler: async (ctx, args) => {
 *     // Use the implementation below
 *   },
 * });
 * ```
 */
export async function uploadToCloudflareImages(args: CloudflareImageUploadArgs) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare credentials not configured");
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

    // Upload to Cloudflare Images
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
      const error = await response.text();
      throw new Error(`Cloudflare Images upload failed: ${error}`);
    }

    const result = await response.json() as {
      success: boolean;
      errors?: unknown[];
      result: {
        id: string;
        variants: string[];
        filename: string;
      };
    };
    
    if (!result.success) {
      throw new Error(`Cloudflare Images upload failed: ${JSON.stringify(result.errors)}`);
    }

    return {
      imageId: result.result.id,
      variants: result.result.variants, // Array of optimized image URLs
      filename: result.result.filename,
    };
  } catch (error) {
    console.error("Cloudflare Images upload error:", error);
    throw error;
  }
}

/**
 * Delete an image from Cloudflare Images
 * 
 * Example Convex action implementation:
 * 
 * ```typescript
 * export const deleteFromCloudflareImages = action({
 *   args: { imageId: v.string() },
 *   handler: async (ctx, args) => {
 *     // Use the implementation below
 *   },
 * });
 * ```
 */
export async function deleteFromCloudflareImages(args: CloudflareImageDeleteArgs) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare credentials not configured");
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${args.imageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare Images delete failed: ${error}`);
    }

    const result = await response.json() as {
      success: boolean;
    };
    return { success: result.success };
  } catch (error) {
    console.error("Cloudflare Images delete error:", error);
    throw error;
  }
}

/**
 * Get optimized image URL from Cloudflare Images
 * You can specify transformations like width, height, fit, etc.
 * 
 * Example Convex action implementation:
 * 
 * ```typescript
 * export const getCloudflareImageUrl = action({
 *   args: {
 *     imageId: v.string(),
 *     options: v.optional(v.object({ ... })),
 *   },
 *   handler: async (ctx, args) => {
 *     // Use the implementation below
 *   },
 * });
 * ```
 */
export function getCloudflareImageUrl(args: CloudflareImageUrlArgs) {
  // Cloudflare Images provides variants automatically
  // The public variant is typically available at: https://imagedelivery.net/<account-hash>/<image-id>/<variant-name>
  // For custom transformations, you'd use: https://imagedelivery.net/<account-hash>/<image-id>/<transformations>
  
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
}

