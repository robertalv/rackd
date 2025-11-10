import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFile = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.optional(v.string()),
    size: v.optional(v.number()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("tournament_flyer"),
      v.literal("venue_image"),
      v.literal("player_avatar"),
      v.literal("document"),
      v.literal("other")
    )),
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.union(
      v.literal("tournament"),
      v.literal("venue"),
      v.literal("player"),
      v.literal("user")
    )),
  },
  handler: async (ctx, args) => {
    const metadata = await ctx.db.system.get(args.storageId);
    
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      name: args.name,
      type: args.type || metadata?.contentType,
      size: args.size || metadata?.size,
      description: args.description,
      category: args.category || "other",
      relatedId: args.relatedId,
      relatedType: args.relatedType,
      uploadedAt: Date.now(),
    });
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getFileUrlAction = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args): Promise<string | null> => {
    // Actions can access storage directly, no need for query
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getFile = query({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) return null;
    
    const url = await ctx.storage.getUrl(file.storageId);
    const metadata = await ctx.db.system.get(file.storageId);
    
    return {
      ...file,
      url,
      metadata,
    };
  },
});

export const getFilesByCategory = query({
  args: { 
    category: v.union(
      v.literal("tournament_flyer"),
      v.literal("venue_image"),
      v.literal("player_avatar"),
      v.literal("document"),
      v.literal("other")
    ),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let files;
    
    if (args.relatedId) {
      files = await ctx.db
        .query("files")
        .withIndex("by_category_and_related", (q) => 
          q.eq("category", args.category).eq("relatedId", args.relatedId)
        )
        .collect();
    } else {
      files = await ctx.db
        .query("files")
        .withIndex("by_category", (q) => q.eq("category", args.category))
        .collect();
    }
    
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const url = await ctx.storage.getUrl(file.storageId);
        return { ...file, url };
      })
    );
    
    return filesWithUrls;
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }
    
    await ctx.storage.delete(file.storageId);
    await ctx.db.delete(args.fileId);
    
    return { success: true };
  },
});

export const deleteFileByStorageId = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Find the file record in our database
    const file = await ctx.db
      .query("files")
      .withIndex("by_storage_id", (q) => q.eq("storageId", args.storageId))
      .first();
    
    // Delete from storage
    await ctx.storage.delete(args.storageId);
    
    // Delete from our files table if it exists
    if (file) {
      await ctx.db.delete(file._id);
    }
    
    return { success: true };
  },
});

export const getFileMetadata = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.db.system.get(args.storageId);
  },
});