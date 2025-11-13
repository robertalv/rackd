import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Generate an upload URL for file storage.
 * Returns a URL that can be used to upload a file directly to Convex storage.
 */
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Process uploaded image - automatically converts HEIC to web format via Cloudflare Images
 * Call this after uploading to Convex storage
 */
export const processImageUpload = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<{ storageId: string; displayUrl: string; isHeic: boolean }> => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      throw new Error("File not found in storage");
    }

    // Check if file is HEIC/HEIF
    try {
      const headResponse = await fetch(fileUrl, { method: "HEAD" });
      const contentType = headResponse.headers.get("content-type") || "";
      
      const isHeic = contentType.includes("heic") || contentType.includes("heif") || fileUrl.includes(".heic") || fileUrl.includes(".heif");
      
      if (isHeic) {
        // Convert HEIC to web format via Cloudflare Images (skips R2 for now)
        // Cloudflare Images handles HEIC conversion automatically
        try {
          const cloudflareResult = await ctx.runAction(
            internal.lib.cloudflare.uploadToCloudflareImages,
            {
              imageUrl: fileUrl, // Use Convex URL directly
              metadata: {
                filename: "image.heic",
              },
            }
          ) as { imageId: string; variants: string[]; filename: string };
          
          // Return Cloudflare Images URL (automatically converted to web format)
          const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;
          if (accountHash) {
            const displayUrl = `https://imagedelivery.net/${accountHash}/${cloudflareResult.imageId}/public`;
            return {
              storageId: args.storageId,
              displayUrl,
              isHeic: true,
            };
          }
        } catch (error) {
          console.error("Failed to convert HEIC via Cloudflare Images:", error);
          // Fallback to original URL - browser may not display it, but at least it won't crash
          return {
            storageId: args.storageId,
            displayUrl: fileUrl,
            isHeic: true,
          };
        }
      }
    } catch (error) {
      console.error("Failed to check file type:", error);
    }

    // Not HEIC or conversion failed - return original URL
    return {
      storageId: args.storageId,
      displayUrl: fileUrl,
      isHeic: false,
    };
  },
});

/**
 * Get the URL for a stored file by its storage ID.
 * Use this to get the public URL for displaying/downloading files.
 * For HEIC images, this will return the original URL - use getFileUrlWithHeicConversion for converted URLs.
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get file URL with automatic HEIC conversion (query version)
 * This checks if the file is HEIC and returns the converted URL if available
 */
export const getFileUrlConverted = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) return null;

    // Check if file is HEIC/HEIF by checking metadata
    try {
      const fileMetadata = await ctx.db.system.get(args.storageId);
      const contentType = (fileMetadata as any)?.contentType || "";
      
      // If it's HEIC, we need to use the action to convert it
      // For now, return original URL - conversion should happen on upload
      if (contentType.includes("heic") || contentType.includes("heif")) {
        // Return original URL - the conversion should have happened during upload
        // If conversion failed, this will still work (just won't display in browser)
        return fileUrl;
      }
    } catch (error) {
      // If metadata check fails, continue with original URL
    }

    return fileUrl;
  },
});

/**
 * Get file URL with automatic HEIC conversion via Cloudflare Images
 * This is a fallback if processImageUpload wasn't called during upload
 */
export const getFileUrlWithHeicConversion = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args): Promise<string | null> => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) return null;

    // Check if file is HEIC/HEIF
    try {
      const headResponse = await fetch(fileUrl, { method: "HEAD" });
      const contentType = headResponse.headers.get("content-type") || "";
      
      // If it's HEIC/HEIF, convert via Cloudflare Images
      if (contentType.includes("heic") || contentType.includes("heif") || fileUrl.includes(".heic") || fileUrl.includes(".heif")) {
        try {
          // Convert HEIC to web format via Cloudflare Images
          const cloudflareResult = await ctx.runAction(
            internal.lib.cloudflare.uploadToCloudflareImages,
            {
              imageUrl: fileUrl, // Use Convex URL directly
              metadata: {
                filename: "image.heic",
              },
            }
          ) as { imageId: string; variants: string[]; filename: string };
          
          // Return Cloudflare Images URL (automatically converted to web format)
          const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH;
          if (accountHash) {
            return `https://imagedelivery.net/${accountHash}/${cloudflareResult.imageId}/public`;
          }
        } catch (error) {
          console.error("Failed to convert HEIC via Cloudflare Images:", error);
          // Fallback to original URL
          return fileUrl;
        }
      }
    } catch (error) {
      console.error("Failed to check file type:", error);
    }

    return fileUrl;
  },
});

/**
 * Get the URL for a stored file (action version).
 * Actions can access storage directly, useful for server-side operations.
 */
export const getFileUrlAction = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args): Promise<string | null> => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Delete a file from storage by its storage ID.
 */
export const deleteFileByStorageId = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    return { success: true };
  },
});

/**
 * Get metadata for a stored file.
 * Returns information like content type, size, etc.
 */
export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});

/**
 * Convert HEIC/HEIF images to Cloudflare Images for web compatibility
 * This is called automatically after upload if the file is HEIC/HEIF
 */
export const convertHeicToCloudflare = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<{ cloudflareImageId: string; variants: string[] } | null> => {
    try {
      // Get the file URL from Convex storage
      const fileUrl = await ctx.storage.getUrl(args.storageId);
      if (!fileUrl) {
        throw new Error("File not found in storage");
      }

      // Upload to Cloudflare Images (which automatically converts HEIC)
      const cloudflareResult = await ctx.runAction(
        internal.lib.cloudflare.uploadToCloudflareImages,
        {
          imageUrl: fileUrl,
          metadata: {
            filename: "image.heic",
          },
        }
      ) as { imageId: string; variants: string[]; filename: string };

      return {
        cloudflareImageId: cloudflareResult.imageId,
        variants: cloudflareResult.variants,
      };
    } catch (error) {
      console.error("Failed to convert HEIC to Cloudflare Images:", error);
      // Don't throw - allow fallback to original storage URL
      return null;
    }
  },
});