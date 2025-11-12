import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

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
 * Get the URL for a stored file by its storage ID.
 * Use this to get the public URL for displaying/downloading files.
 */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
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