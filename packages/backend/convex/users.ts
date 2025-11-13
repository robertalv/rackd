import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import schema from './schema';
import { crud } from 'convex-helpers/server/crud';
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { getCurrentUser, getCurrentUserOrThrow, getCurrentUserId } from "./lib/utils";

const userFields = schema.tables.users.validator.fields;

export const { destroy, update } = crud(schema, 'users');

/**
 * Helper function to get user image URL from storage ID
 */
async function getUserImageUrl(ctx: { storage: any }, image: string | undefined): Promise<string | undefined> {
  if (!image) return undefined;
  
  try {
    // Handle both formats: "kg://..." prefix or direct storage ID
    let storageId = image;
    if (image.startsWith("kg://")) {
      storageId = image.replace("kg://", "") as any;
    }
    // If it starts with "kg" it's likely a storage ID, try to get URL
    if (image.startsWith("kg")) {
      const url = await ctx.storage.getUrl(storageId as Id<"_storage">);
      return url ?? undefined;
    }
    // If it's already a URL, return as-is
    return image;
  } catch (error) {
    console.error("Failed to get image URL:", error);
    return image; // Fallback to stored value
  }
}

// Custom create function - simplified schema
export const create = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate unique username from email if not provided
    const baseUsername = args.username || args.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = baseUsername;
    let usernameCounter = 1;
    
    // Ensure username is unique
    while (await ctx.db.query("users").withIndex("by_username", q => q.eq("username", username)).first()) {
      username = `${baseUsername}${usernameCounter}`;
      usernameCounter++;
    }
    
    const now = Date.now();
    
    // Create user record
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
      onboardingComplete: false,
      username: username,
      displayName: args.name,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      isPrivate: false,
      allowMessages: true,
      lastActive: now,
    });
    
    // Auto-create player record
    const playerId = await ctx.db.insert("players", {
      name: args.name,
      userId: userId,
      bio: null,
      avatarUrl: null,
      city: null,
      homeRoom: null,
      homeVenue: null,
      isVerified: false,
      updatedAt: now,
      fargoId: null,
      fargoReadableId: null,
      fargoMembershipId: null,
      fargoRating: null,
      fargoRobustness: null,
      league: null,
      apaId: null,
      apaSkillLevel: null,
      bcaId: null,
    });
    
    // Link player to user
    await ctx.db.patch(userId, {
      playerId: playerId,
      updatedAt: now,
    });
    
    // Create initial player stats
    await ctx.db.insert("playerStats", {
      playerId: playerId,
      totalMatches: 0,
      wins: 0,
      losses: 0,
      tournamentsPlayed: 0,
      tournamentsWon: 0,
      averageScore: 0,
      lastUpdated: now,
    });
    
    return userId;
  },
});

// Internal mutation to update user with storage ID and file metadata
export const updateImageWithStorageId = internalMutation({
  args: {
    userId: v.id("users"),
    storageId: v.id("_storage"),
    blobType: v.string(),
    blobSize: v.number(),
  },
  handler: async (ctx, args) => {    
    // Update user image
    await ctx.db.patch(args.userId, {
      image: args.storageId as any,
      updatedAt: Date.now(),
    });
    
    return args.storageId;
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

// Get current user with their profile image from Convex storage
export const currentUserWithImage = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      return null;
    }

    // Get image URL if available
    let imageUrl: string | undefined = undefined;
    if (user.image) {
      imageUrl = await getUserImageUrl(ctx, user.image);
    }

    return {
      ...user,
      imageUrl,
      hasConvexImage: !!user.image,
    };
  },
});

export const currentSession = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user ? { user } : null;
  },
});

export const upsertUser = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    return user;
  },
});

export const setDefaultRole = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return user;
  },
});

// Get user by ID (internal)
export const getById = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get user by username (for /{username} route)
export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .first();
  },
});

// Get user profile with player data
export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
  
    // Get player profile if linked
    let player = null;
    if (user.playerId) {
      player = await ctx.db.get(user.playerId);
    }
  
    // Get image URL if available
    let imageUrl: string | undefined = undefined;
    if (user.image) {
      imageUrl = await getUserImageUrl(ctx, user.image);
    }
  
    return {
      ...user,
      imageUrl,
      player,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    const updates: {
      name?: string;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };
    
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    
    if (args.image !== undefined) {
      (updates as any).image = args.image;
    }
    
    await ctx.db.patch(user._id, updates);
    
    // Update player profile if linked
    if (user.playerId) {
      const playerUpdates: {
        bio?: string | null;
        city?: string | null;
        avatarUrl?: string | null;
        updatedAt: number;
      } = {
        updatedAt: Date.now(),
      };
      
      if (args.bio !== undefined) {
        playerUpdates.bio = args.bio || null;
      }
      if (args.city !== undefined) {
        playerUpdates.city = args.city || null;
      }
      if (args.image !== undefined) {
        playerUpdates.avatarUrl = args.image || null;
      }
      
      await ctx.db.patch(user.playerId, playerUpdates);
    }
    
    return { success: true };
  },
});

// Check username availability
export const checkUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .first();
    
    return !existing;
  },
});

// Check name availability (for display names)
export const checkName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // Check if any user has this name
    // Note: We can't efficiently query by name alone, so we'll check all users
    // In production, you might want to add a name index
    const users = await ctx.db.query("users").collect();
    const existing = users.find(u => u?.name?.toLowerCase() === args.name.toLowerCase());
    
    return !existing;
  },
});

// Update username (one-time operation)
export const updateUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Check if username is available
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", q => q.eq("username", args.username))
      .first();
    
    if (existing && existing._id !== user._id) {
      throw new Error("Username already taken");
    }
    
    // Validate username format
    if (!/^[a-z0-9-_]+$/.test(args.username)) {
      throw new Error("Username can only contain lowercase letters, numbers, hyphens, and underscores");
    }
    
    if (args.username.length < 3 || args.username.length > 20) {
      throw new Error("Username must be between 3 and 20 characters");
    }
    
    // Update username in Convex
    await ctx.db.patch(user._id, {
      username: args.username,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Search users for @tagging with social graph weighting
export const searchForTagging = query({
  args: { 
    query: v.string(),
    postId: v.optional(v.id("posts")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const currentUserId = currentUser?._id;
    const limit = args.limit || 8;
    const users = await ctx.db.query("users").collect();
    
    const searchTerm = args.query.toLowerCase();
    
    // Get thread participants for context boost
    let threadParticipants: Id<"users">[] = [];
    if (args.postId) {
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_post", q => q.eq("postId", args.postId as Id<"posts">))
        .collect();
      
      const post = await ctx.db.get(args.postId);
      if (post) {
        threadParticipants = [post.userId, ...comments.map(c => c.userId)];
      }
    }
    
    // Filter and score users by username and name
    const matches = users
      .filter(user => {
        // Don't suggest yourself
        if (currentUserId && user._id === currentUserId) return false;
        
        // Match by username or name
        return (
          user.username?.toLowerCase().includes(searchTerm) ||
          user.name?.toLowerCase().includes(searchTerm) ||
          false
        );
      })
      .map(user => {
        let score = 0;
        
        // Prefix matching gets higher score
        if (user.username?.toLowerCase().startsWith(searchTerm)) {
          score += 10;
        }
        if (user.name?.toLowerCase().startsWith(searchTerm)) {
          score += 10;
        }
        
        // Exact username match gets highest score
        if (user.username?.toLowerCase() === searchTerm) {
          score += 20;
        }
        if (user.name?.toLowerCase() === searchTerm) {
          score += 20;
        }
        
        // Boost if user is in current thread
        if (threadParticipants.includes(user._id)) {
          score += 15;
        }
        
        return {
          ...user,
          _score: score,
        };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);
    
    return matches;
  },
});

// Search users (legacy, kept for compatibility)
export const search = query({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const users = await ctx.db.query("users").collect();
    
    const searchTerm = args.query.toLowerCase();
    
    return users
      .filter(user => 
        user.username?.toLowerCase().includes(searchTerm) || false
      )
      .slice(0, limit);
  },
});

// Get user stats
export const getStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) return null;
    
    // Get follower/following counts
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", q => q.eq("followingId", args.userId))
      .collect();
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", q => q.eq("followerId", args.userId))
      .collect();
    
    // Get post counts
    const allPosts = await ctx.db
      .query("posts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
    
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentPosts = allPosts.filter(post => {
      const postTime = post.updatedAt || (post as any)._creationTime;
      return postTime >= thirtyDaysAgo;
    });
    
    return {
      followerCount: followers.length,
      followingCount: following.length,
      postCount: allPosts.length,
      recentPostCount: recentPosts.length,
      joinedAt: user._creationTime,
      lastActive: user.updatedAt || user._creationTime,
    };
  },
});

// Get recent users (signed up within last 7 days)
export const getRecentUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const currentUserId = currentUser?._id;
    const limit = args.limit || 5;

    // Calculate 7 days ago timestamp
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Get users who signed up in the last 7 days
    const recentUsers = await ctx.db
      .query("users")
      .filter(q => q.gte(q.field("_creationTime"), sevenDaysAgo))
      .order("desc")
      .take(limit * 2); // Take more to filter out current user

    // Filter out current user and limit results
    const filteredUsers = recentUsers
      .filter(user => !currentUserId || user._id !== currentUserId)
      .slice(0, limit);

    // Add image URLs
    return await Promise.all(
      filteredUsers.map(async (user) => {
        let imageUrl: string | undefined = undefined;
        if (user.image) {
          imageUrl = await getUserImageUrl(ctx, user.image);
        }
        return {
          ...user,
          imageUrl,
        };
      })
    );
  },
});

// Get all players from the players table for discovery
export const getPlayersForDiscovery = query({
  args: { 
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    minFargoRating: v.optional(v.number()),
    maxFargoRating: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
        
    // Get all players from the players table (no userId requirement)
    let players = await ctx.db
      .query("players")
      .take(limit * 3); // Take more to filter later
        
    // Optionally get user data for players that have linked accounts
    const playersWithOptionalUsers = await Promise.all(
      players.map(async (player) => {
        let user = null;
        let imageUrl: string | undefined = undefined;
        let username: string | undefined = undefined;
        let displayName: string = player.name;
        let followerCount = 0;
        let postCount = 0;
        
        // If player has a userId, try to get user data
        if (player.userId) {
          user = await ctx.db.get(player.userId);
          if (user) {
            if (user.image) {
              imageUrl = await getUserImageUrl(ctx, user.image);
            }
            username = user.username || undefined;
            // Always use player.name as the primary display name
            displayName = player.name;
            followerCount = user.followerCount || 0;
            postCount = user.postCount || 0;
          }
        }
        
        return {
          _id: player._id,
          name: player.name,
          displayName: player.name, // Always use player's actual name
          fargoRating: player.fargoRating,
          fargoRobustness: player.fargoRobustness,
          fargoMembershipId: player.fargoMembershipId,
          fargoReadableId: player.fargoReadableId,
          city: player.city,
          isVerified: player.isVerified,
          bio: player.bio,
          avatarUrl: player.avatarUrl,
          userId: user?._id || undefined,
          username: username,
          userImageUrl: imageUrl,
          followerCount: followerCount,
          postCount: postCount,
        };
      })
    );
    
    // Apply search query filter
    let filteredPlayers = playersWithOptionalUsers;
    if (args.query && args.query.length > 0) {
      const searchTerm = args.query.toLowerCase();
      filteredPlayers = filteredPlayers.filter(player => 
        player.name.toLowerCase().includes(searchTerm) ||
        (player.username && player.username.toLowerCase().includes(searchTerm)) ||
        (player.city && player.city.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply city filter
    if (args.city && args.city.length > 0) {
      filteredPlayers = filteredPlayers.filter(player => {
        return player.city && player.city.toLowerCase().includes(args.city!.toLowerCase());
      });
    }
    
    // Apply country and region filters if player has location data
    // Note: These fields are not in the player schema yet, but can be added
    
    // Apply Fargo rating filter
    if (args.minFargoRating || args.maxFargoRating) {
      filteredPlayers = filteredPlayers.filter(player => {
        if (!player.fargoRating) {
          return false;
        }
        
        const rating = player.fargoRating;
        const meetsMin = !args.minFargoRating || rating >= args.minFargoRating;
        const meetsMax = !args.maxFargoRating || rating <= args.maxFargoRating;
        
        return meetsMin && meetsMax;
      });
    }
    
    // Sort by Fargo rating (highest first), then by name
    filteredPlayers.sort((a, b) => {
      if (a.fargoRating && b.fargoRating) {
        return b.fargoRating - a.fargoRating;
      }
      if (a.fargoRating && !b.fargoRating) return -1;
      if (!a.fargoRating && b.fargoRating) return 1;
      // If no rating, sort by name
      return a.name.localeCompare(b.name);
    });
    
    return filteredPlayers.slice(0, limit);
  },
});

// Update user interests
export const updateInterests = mutation({
  args: {
    interests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Validate interests
    if (args.interests.length > 15) {
      throw new Error("Maximum 15 interests allowed");
    }
    
    // Validate each interest
    for (const interest of args.interests) {
      if (!interest.trim()) {
        throw new Error("Interest cannot be empty");
      }
      if (interest.length > 30) {
        throw new Error("Interest cannot be longer than 30 characters");
      }
    }
    
    // Remove duplicates and trim
    const cleanedInterests = [...new Set(args.interests.map(i => i.trim()))];
    
    // Update user interests in Convex
    await ctx.db.patch(user._id, {
      interests: cleanedInterests,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get linked player record for current user
export const getLinkedPlayer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    if (!user || !user.playerId) {
      return null;
    }
    
    // Get the linked player record
    const player = await ctx.db.get(user.playerId);
    
    return player;
  },
});

// Link player record to current user
export const linkPlayerRecord = mutation({
  args: {
    playerId: v.optional(v.id("players")),
    fargoId: v.optional(v.string()),
    fargoMembershipId: v.optional(v.string()),
    fargoReadableId: v.optional(v.string()),
    fargoName: v.optional(v.string()),
    fargoRating: v.optional(v.number()),
    fargoRobustness: v.optional(v.number()),
    city: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"players">> => {
    const user = await getCurrentUserOrThrow(ctx);
    
    let playerId = args.playerId;
    
    // If linking FargoRate data, create or update player record
    if (args.fargoId && args.fargoName && args.fargoRating) {
      // Check if user already has a player
      let existingUserPlayer = null;
      if (user.playerId) {
        existingUserPlayer = await ctx.db.get(user.playerId);
      }
      
      if (existingUserPlayer) {
        // Update the user's existing player record with new FargoRate data
        await ctx.db.patch(existingUserPlayer._id, {
          name: args.fargoName,
          city: args.city ?? null,
          fargoId: args.fargoId ?? null,
          fargoRating: args.fargoRating ?? null,
          fargoRobustness: args.fargoRobustness ?? null,
          fargoMembershipId: args.fargoMembershipId ?? null,
          fargoReadableId: args.fargoReadableId ?? null,
          updatedAt: Date.now(),
        });
        playerId = existingUserPlayer._id;
      } else {
        // Check if player with this fargoMembershipId already exists (different user)
        const existingFargoPlayers = await ctx.db
          .query("players")
          .withIndex("by_fargo_id", q => q.eq("fargoId", args.fargoId!))
          .collect();
        
        const matchingPlayer = existingFargoPlayers.find((p) => 
          p.fargoId === args.fargoId || p.fargoMembershipId === args.fargoMembershipId
        );
        
        if (matchingPlayer && matchingPlayer.userId && matchingPlayer.userId !== user._id) {
          throw new Error("This Fargo ID is already linked to another user");
        }
        
        if (matchingPlayer) {
          // Update existing player record and link to user
          await ctx.db.patch(matchingPlayer._id, {
            userId: user._id,
            name: args.fargoName,
            city: args.city ?? null,
            updatedAt: Date.now(),
          });
          playerId = matchingPlayer._id;
        } else {
          // Create new player record
          playerId = await ctx.db.insert("players", {
            name: args.fargoName || "",
            userId: user._id,
            city: args.city ?? null,
            fargoId: args.fargoId ?? null,
            fargoRating: args.fargoRating ?? null,
            fargoRobustness: args.fargoRobustness ?? null,
            fargoMembershipId: args.fargoMembershipId ?? null,
            fargoReadableId: args.fargoReadableId ?? null,
            bio: null,
            avatarUrl: null,
            homeRoom: null,
            homeVenue: null,
            isVerified: false,
            updatedAt: Date.now(),
            league: null,
            apaId: null,
            apaSkillLevel: null,
            bcaId: null,
          });
        }
      }
    } else if (args.playerId) {
      // Check if specified player record exists
      const player = await ctx.db.get(args.playerId);
      if (!player) {
        throw new Error("Player record not found");
      }
      
      // Check if player is already linked to another user
      if (player.userId && player.userId !== user._id) {
        throw new Error("This player is already linked to another user");
      }
      
      playerId = args.playerId;
    } else {
      throw new Error("Must provide either playerId or FargoRate data");
    }

    // Link player to user
    await ctx.db.patch(user._id, {
      playerId: playerId,
      updatedAt: Date.now(),
    });
    
    // Also update player's userId if not set
    await ctx.db.patch(playerId, {
      userId: user._id,
      updatedAt: Date.now(),
    });

    return playerId;
  },
});

// Unlink player record from current user
export const unlinkPlayerRecord = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Remove playerId from user
    await ctx.db.patch(user._id, {
      playerId: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});