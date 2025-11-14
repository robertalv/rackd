import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CounterHelpers } from "./counters";
import { getCurrentUser, getCurrentUserOrThrow } from "./lib/utils";

// Query: Search venues
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];
    
    // Get all venues since Convex doesn't have full-text search
    const venues = await ctx.db.query("venues").collect();

    // Filter by partial matching, prioritizing name over address
    const query = args.query.toLowerCase();
    
    // First try to find venues with name matches
    const nameMatches = venues.filter(venue => 
      venue.name.toLowerCase().includes(query)
    );
    
    // If we have name matches, return those
    if (nameMatches.length > 0) {
      return nameMatches.slice(0, 10);
    }
    
    // If no name matches and query is longer than 2 characters, try address
    const filtered = query.length > 2 ? venues.filter(venue => 
      venue.address && venue.address.toLowerCase().includes(query)
    ) : [];

    return filtered.slice(0, 10); // Limit results
  },
});

// Query: Get venue by ID
export const getById = query({
  args: { id: v.id("venues") },
  handler: async (ctx, args) => {
    const venue = await ctx.db.get(args.id);
    if (!venue) return null;
    
    let imageUrl = null;
    if (venue.images && venue.images.length > 0) {
      imageUrl = await ctx.storage.getUrl(venue.images[0]);
    }
    
    return {
      ...venue,
      imageUrl,
    };
  },
});

// Query: List all venues
export const list = query({
  args: { 
    type: v.optional(v.string()),
    organizerId: v.optional(v.id("users"))
  },
  handler: async (ctx, args) => {
    let venues;
    
    if (args.type) {
      venues = await ctx.db.query("venues").collect();
      venues = venues.filter(v => v.type === args.type);
    } else if (args.organizerId) {
      venues = await ctx.db.query("venues").collect();
      venues = venues.filter(v => v.organizerId === args.organizerId);
    } else {
      venues = await ctx.db.query("venues").collect();
    }
    
    // Add image URLs to venues
    const venuesWithImages = await Promise.all(venues.map(async (venue) => {
      let imageUrl = null;
      if (venue.images && venue.images.length > 0) {
        imageUrl = await ctx.storage.getUrl(venue.images[0]);
      }
      return {
        ...venue,
        imageUrl,
      };
    }));
    
    return venuesWithImages;
  },
});

// Query: Get venues for current user
export const getMyVenues = query({
  args: {},
  handler: async (ctx) => {
    const dbUser = await getCurrentUser(ctx);
    if (!dbUser) return [];

    const venues = await ctx.db
      .query("venues")
      .withIndex("by_organizer", q => q.eq("organizerId", dbUser._id))
      .collect();

    // Add image URLs to venues
    const venuesWithImages = await Promise.all(venues.map(async (venue) => {
      let imageUrl = null;
      if (venue.images && venue.images.length > 0) {
        imageUrl = await ctx.storage.getUrl(venue.images[0]);
      }
      return {
        ...venue,
        imageUrl,
      };
    }));
    
    return venuesWithImages;
  },
});

// Query: Get nearby venues based on current user's location
export const getNearby = query({
  args: { 
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const dbUser = await getCurrentUser(ctx);
    if (!dbUser) return [];

    const limit = args.limit || 10;
    
    // Get user's player profile to find their location
    let userCity: string | null = null;
    
    if (dbUser.playerId) {
      const player = await ctx.db.get(dbUser.playerId);
      if (player?.city) {
        userCity = player.city;
      }
    }
    
    // If no city from player profile, return empty array
    // (Could be extended to use user's locale or other location data)
    if (!userCity) {
      return [];
    }
    
    // Get all venues
    const allVenues = await ctx.db.query("venues").collect();
    
    // Filter venues by location proximity - same city
    const nearbyVenues = allVenues.filter((venue) => 
      venue.city && venue.city.toLowerCase() === userCity!.toLowerCase()
    );
    
    // Limit results
    const limitedVenues = nearbyVenues.slice(0, limit);
    
    // Add image URLs to venues
    const venuesWithImages = await Promise.all(limitedVenues.map(async (venue) => {
      let imageUrl = null;
      if (venue.images && venue.images.length > 0) {
        imageUrl = await ctx.storage.getUrl(venue.images[0]);
      }
      return {
        ...venue,
        imageUrl,
      };
    }));
    
    return venuesWithImages;
  },
});

// Mutation: Create venue
export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("residence"),
      v.literal("business"),
      v.literal("pool_hall"),
      v.literal("sports_facility"),
      v.literal("bar"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    operatingHours: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    socialLinks: v.optional(v.array(v.object({
      platform: v.string(),
      url: v.string(),
      icon: v.string()
    }))),
    access: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("membership_needed")
    ),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const dbUser = await getCurrentUserOrThrow(ctx);

    const venueId = await ctx.db.insert("venues", {
      ...args,
      organizerId: dbUser._id,
      followerCount: 0,
      city: "",
      region: "",
      country: "",
      name: args.name,
      address: args.address || "",
    });

    // Increment total venue count using sharded counter
    await CounterHelpers.incrementVenueCount(ctx);

    return venueId;
  },
});

// Mutation: Update venue
export const update = mutation({
  args: {
    id: v.id("venues"),
    name: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("residence"),
      v.literal("business"),
      v.literal("pool_hall"),
      v.literal("sports_facility"),
      v.literal("bar"),
      v.literal("other")
    )),
    description: v.optional(v.string()),
    operatingHours: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    socialLinks: v.optional(v.array(v.object({
      platform: v.string(),
      url: v.string(),
      icon: v.string()
    }))),
    access: v.optional(v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("membership_needed")
    )),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const dbUser = await getCurrentUserOrThrow(ctx);

    const venue = await ctx.db.get(args.id);
    if (!venue) throw new Error("Venue not found");
    
    // Only organizer can update
    if (venue.organizerId !== dbUser._id) {
      throw new Error("Not authorized to update this venue");
    }

    const { id, imageStorageId, ...updates } = args;
    
    // Convert imageStorageId to images array format
    const patchData: any = { ...updates };
    if (imageStorageId !== undefined) {
      patchData.images = imageStorageId ? [imageStorageId] : [];
    }
    
    await ctx.db.patch(id, patchData);
  },
});

// Mutation: Delete venue
export const remove = mutation({
  args: { id: v.id("venues") },
  handler: async (ctx, args) => {
    const dbUser = await getCurrentUserOrThrow(ctx);

    const venue = await ctx.db.get(args.id);
    if (!venue) throw new Error("Venue not found");
    
    // Only organizer can delete
    if (venue.organizerId !== dbUser._id) {
      throw new Error("Not authorized to delete this venue");
    }

    // Delete associated image if it exists
    if (venue.images?.[0]) {
      try {
        await ctx.storage.delete(venue.images[0] as any);
      } catch (error) {
        // Log error but don't fail the venue deletion
        console.error("Failed to delete venue image:", error);
      }
    }

    await ctx.db.delete(args.id);
  },
});

// Query: Get tournaments by venue
export const getTournamentsByVenue = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, args) => {
    const tournaments = await ctx.db
      .query("tournaments")
      .collect();

    // Filter tournaments by venueId
    const venueTournaments = tournaments.filter(
      (tournament) => tournament.venueId === args.venueId
    );

    // Get organizer info for each tournament
    return await Promise.all(
      venueTournaments.map(async (tournament) => {
        let organizer = null;
        if (tournament.organizerId) {
          organizer = await ctx.db.get(tournament.organizerId);
        }

        return {
          ...tournament,
          organizerName: organizer?.name || "Unknown",
        };
      })
    );
  },
});

export const getTablesByVenue = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, args) => {
    const tables = await ctx.db
      .query("tables")
      .filter((q) => q.eq(q.field("venueId"), args.venueId))
      .collect();

    return tables.map((table) => ({
      ...table,
      tableNumber: table.startNumber,
      status: table.status || "OPEN",
    }));
  },
});