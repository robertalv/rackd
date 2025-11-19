import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CounterHelpers } from "./counters";
import { getCurrentUserIdOrThrow, getCurrentUser } from "./lib/utils";

// Follow a user
export const follow = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserIdOrThrow(ctx);

    // Verify target user exists
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("Target user not found");

    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_relationship", q =>
        q.eq("followerId", currentUserId).eq("followingId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("Already following");
    }

    // Create follow record
    await ctx.db.insert("follows", {
      followerId: currentUserId,
      followingId: args.userId,
    });

    // Update counts using sharded counters
    await CounterHelpers.incrementUserFollowing(ctx, currentUserId);
    await CounterHelpers.incrementUserFollowers(ctx, args.userId);

    // Update user document fields for immediate UI updates
    const currentUser = await ctx.db.get(currentUserId);
    
    if (currentUser) {
      await ctx.db.patch(currentUserId, {
        followingCount: (currentUser.followingCount || 0) + 1,
      });
    }
    
    // targetUser was already fetched above
    await ctx.db.patch(args.userId, {
      followerCount: (targetUser.followerCount || 0) + 1,
    });

    // Create notification
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "follow",
      actorId: currentUserId,
      read: false,
    });
  },
});

// Unfollow a user
export const unfollow = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserIdOrThrow(ctx);

    // Check if following
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_relationship", q =>
        q.eq("followerId", currentUserId).eq("followingId", args.userId)
      )
      .first();

    if (!follow) {
      throw new Error("Not following");
    }

    // Delete follow record
    await ctx.db.delete(follow._id);

    // Update counts using sharded counters
    await CounterHelpers.decrementUserFollowing(ctx, currentUserId);
    await CounterHelpers.decrementUserFollowers(ctx, args.userId);

    // Update user document fields for immediate UI updates
    const currentUser = await ctx.db.get(currentUserId);
    const targetUser = await ctx.db.get(args.userId);
    
    if (currentUser && currentUser.followingCount > 0) {
      await ctx.db.patch(currentUserId, {
        followingCount: currentUser.followingCount - 1,
      });
    }
    
    if (targetUser && targetUser.followerCount > 0) {
      await ctx.db.patch(args.userId, {
        followerCount: targetUser.followerCount - 1,
      });
    }
  },
});


export const getFollowingCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await CounterHelpers.getUserFollowingCount(ctx, args.userId);
  },
});

export const getFollowerCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await CounterHelpers.getUserFollowerCount(ctx, args.userId);
  },
});

// Check if following
export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return false;

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_relationship", q =>
        q.eq("followerId", currentUser._id)
         .eq("followingId", args.userId)
      )
      .first();

    return !!follow;
  },
});

// Get followers
export const getFollowers = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", q => q.eq("followingId", args.userId))
      .collect();

    return await Promise.all(
      follows.map(async (f) => await ctx.db.get(f.followerId))
    );
  },
});

// Get following
export const getFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", q => q.eq("followerId", args.userId))
      .collect();

    return await Promise.all(
      follows.map(async (f) => await ctx.db.get(f.followingId))
    );
  },
});

// Get mutual follows (users who follow each other)
export const getMutualFollows = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    // Get users current user follows
    const currentUserFollows = await ctx.db
      .query("follows")
      .withIndex("by_follower", q => q.eq("followerId", currentUser._id))
      .collect();

    // Get users that the target user follows
    const targetUserFollows = await ctx.db
      .query("follows")
      .withIndex("by_follower", q => q.eq("followerId", args.userId))
      .collect();

    // Find mutual follows
    const currentUserFollowingIds = new Set(currentUserFollows.map(f => f.followingId));
    const mutualFollowIds = targetUserFollows
      .filter(f => currentUserFollowingIds.has(f.followingId))
      .map(f => f.followingId);

    return await Promise.all(
      mutualFollowIds.map(async (userId) => await ctx.db.get(userId))
    );
  },
});

// Get follow suggestions
export const getSuggestions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return [];

    const limit = args.limit || 10;

    // Get users current user follows
    const currentUserFollows = await ctx.db
      .query("follows")
      .withIndex("by_follower", q => q.eq("followerId", currentUser._id))
      .collect();

    const followingIds = new Set([
      ...currentUserFollows.map(f => f.followingId),
      currentUser._id // Don't suggest self
    ]);

    // Get all users and filter out those already followed
    const allUsers = await ctx.db.query("users").collect();
    const suggestions = allUsers
      .filter(user => !followingIds.has(user._id))
      .slice(0, limit);

    return suggestions;
  },
});