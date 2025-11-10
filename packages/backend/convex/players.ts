import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { CounterHelpers } from "./counters";

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const playerId = await ctx.db.insert("players", {
      ...args,
      userId: identity.subject as any,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

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
      userId: identity.subject as any,
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