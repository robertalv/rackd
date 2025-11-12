import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { CounterHelpers } from "./counters";
import { getCurrentUserIdOrThrow } from "./lib/utils";
import { Id } from "./_generated/dataModel";

// Query: Search players
export const search = query({
  args: { 
    searchTerm: v.optional(v.string()),
    league: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let players = await ctx.db.query("players").collect();
    
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      players = players.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.fargoId?.includes(term)
      );
    }
    
    if (args.league) {
      players = players.filter(p => p.league === args.league);
    }
    
    return players;
  },
});

// Query: Get player by ID
export const getById = query({
  args: { id: v.id("players") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query: Get player by Fargo ID
export const getByFargoId = query({
  args: { fargoId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_fargo_id", (q) => q.eq("fargoId", args.fargoId))
      .first();
  },
});

// Query: Check which FargoRate IDs already exist in the database
export const checkFargoIdsExist = query({
  args: { fargoIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const existingPlayers = await Promise.all(
      args.fargoIds.map(async (fargoId) => {
        const player = await ctx.db
          .query("players")
          .withIndex("by_fargo_id", (q) => q.eq("fargoId", fargoId))
          .first();
        return {
          fargoId,
          exists: !!player,
          playerId: player?._id,
        };
      })
    );
    
    // Return a map for easy lookup
    const result: Record<string, { exists: boolean; playerId?: Id<"players"> }> = {};
    existingPlayers.forEach((item) => {
      result[item.fargoId] = {
        exists: item.exists,
        playerId: item.playerId,
      };
    });
    
    return result;
  },
});

// Internal query: Get player by userId
export const getByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Mutation: Create player
export const create = mutation({
  args: {
    name: v.string(),
    fargoId: v.optional(v.string()),
    fargoRating: v.optional(v.number()),
    league: v.optional(v.union(
      v.literal("APA"),
      v.literal("BCA"),
      v.literal("NAPA"),
      v.literal("OTHER")
    )),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const playerId = await ctx.db.insert("players", {
      ...args,
      userId: userId,
      bio: undefined,
      homeVenue: undefined,
      avatarUrl: undefined,
      isVerified: false,
    });

    // Increment total player count using sharded counter
    await CounterHelpers.incrementPlayerCount(ctx);

    return playerId;
  },
});

// Mutation: Create player from FargoRate data
export const createFromFargoRate = mutation({
  args: {
    fargoId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    city: v.optional(v.string()),
    fargoRating: v.number(),
    league: v.optional(v.union(
      v.literal("APA"),
      v.literal("BCA"),
      v.literal("NAPA"),
      v.literal("OTHER")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Check if player already exists with this FargoID
    const existing = await ctx.db
      .query("players")
      .withIndex("by_fargo_id", q => q.eq("fargoId", args.fargoId))
      .first();

    if (existing) {
      throw new Error("Player with this Fargo ID already exists");
    }

    const playerId = await ctx.db.insert("players", {
      name: `${args.firstName} ${args.lastName}`,
      fargoId: args.fargoId,
      fargoRating: args.fargoRating,
      city: args.city,
      league: args.league,
      userId: userId,
      bio: undefined,
      homeVenue: undefined,
      isVerified: false,
      avatarUrl: undefined,
    });

    // Increment total player count using sharded counter
    await CounterHelpers.incrementPlayerCount(ctx);

    return playerId;
  },
});

// Mutation: Get or create player from FargoRate data
export const getOrCreateFromFargoRate = mutation({
  args: {
    fargoId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    city: v.optional(v.string()),
    fargoRating: v.number(),
    league: v.optional(v.union(
      v.literal("APA"),
      v.literal("BCA"),
      v.literal("NAPA"),
      v.literal("OTHER")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Check if player already exists with this FargoID
    const existing = await ctx.db
      .query("players")
      .withIndex("by_fargo_id", q => q.eq("fargoId", args.fargoId))
      .first();

    if (existing) {
      // Return existing player ID
      return existing._id;
    }

    // Create new player
    const playerId = await ctx.db.insert("players", {
      name: `${args.firstName} ${args.lastName}`,
      fargoId: args.fargoId,
      fargoRating: args.fargoRating,
      city: args.city,
      league: args.league,
      userId: userId,
      bio: undefined,
      homeVenue: undefined,
      isVerified: false,
      avatarUrl: undefined,
    });

    // Increment total player count using sharded counter
    await CounterHelpers.incrementPlayerCount(ctx);

    return playerId;
  },
});

// Mutation: Update player
export const update = mutation({
  args: {
    id: v.id("players"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});