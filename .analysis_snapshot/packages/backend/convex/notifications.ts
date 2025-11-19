import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { CounterHelpers } from "./counters";
import { getCurrentUser } from "./lib/utils";

// Get user notifications
export const getByUser = query({
  args: { 
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    let notificationsQuery = ctx.db
      .query("notifications")
      .withIndex("by_user", q => q.eq("userId", user._id));

    if (args.unreadOnly) {
      notificationsQuery = notificationsQuery.filter(q => q.eq(q.field("read"), false));
    }

    const notifications = await notificationsQuery
      .order("desc")
      .take(args.limit || 50);

    // Populate with actor and context data
    return await Promise.all(
      notifications.map(async (notification) => {
        const actor = notification.actorId ? await ctx.db.get(notification.actorId) : null;
        const post = notification.postId ? await ctx.db.get(notification.postId) : null;
        const tournament = notification.tournamentId ? await ctx.db.get(notification.tournamentId) : null;
        const match = notification.matchId ? await ctx.db.get(notification.matchId) : null;
        
        return {
          ...notification,
          actor,
          post,
          tournament,
          match,
        };
      })
    );
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not found");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    // Check if user owns the notification
    if (notification.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Only decrement counter if notification was unread
    if (!notification.read) {
      await CounterHelpers.decrementUserNotifications(ctx, notification.userId);
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
    });
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not found");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", q => 
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    // Decrement counter by the number of unread notifications
    if (unreadNotifications.length > 0) {
      // Reset the counter to 0 since we're marking all as read
      const currentUnreadCount = await CounterHelpers.getUserUnreadNotificationCount(ctx, user._id);
      if (currentUnreadCount > 0) {
        // Reset counter to 0
        for (let i = 0; i < currentUnreadCount; i++) {
          await CounterHelpers.decrementUserNotifications(ctx, user._id);
        }
      }
    }

    await Promise.all(
      unreadNotifications.map(notification =>
        ctx.db.patch(notification._id, { read: true })
      )
    );

    return unreadNotifications.length;
  },
});

// Get unread count (using sharded counter for better performance)
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return 0;

    return await CounterHelpers.getUserUnreadNotificationCount(ctx, user._id);
  },
});

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("User not found");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    // Check if user owns the notification
    if (notification.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.notificationId);
  },
});

// Create notification (internal helper)
export const create = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    actorId: v.optional(v.id("users")),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    tournamentId: v.optional(v.id("tournaments")),
    matchId: v.optional(v.id("matches")),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type as any,
      actorId: args.actorId,
      postId: args.postId,
      commentId: args.commentId,
      tournamentId: args.tournamentId,
      matchId: args.matchId,
      read: false,
    });

    // Increment unread notifications counter
    await CounterHelpers.incrementUserNotifications(ctx, args.userId);

    return notificationId;
  },
});

// Get notification preferences (for future use)
export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Get user from WorkOS to check allowMessages in metadata
    // Since this is a query, we can't call WorkOS API directly
    // Return default preferences for now
    // Frontend should use useCurrentUser hook to get actual allowMessages value
    return {
      followNotifications: true,
      likeNotifications: true,
      commentNotifications: true,
      mentionNotifications: true,
      tournamentNotifications: true,
      matchNotifications: true,
      emailNotifications: false, // Default, actual value comes from WorkOS metadata via useCurrentUser
    };
  },
});

// Update notification preferences (for future use)
export const updatePreferences = mutation({
  args: {
    followNotifications: v.optional(v.boolean()),
    likeNotifications: v.optional(v.boolean()),
    commentNotifications: v.optional(v.boolean()),
    mentionNotifications: v.optional(v.boolean()),
    tournamentNotifications: v.optional(v.boolean()),
    matchNotifications: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // For now, just update the allowMessages field in WorkOS metadata
    // This needs to be converted to an action to call WorkOS API
    // For now, return success - actual update should be done via account.updatePrivacySettings
    if (args.emailNotifications !== undefined) {
      // This should be handled by account.updatePrivacySettings action
      // which updates WorkOS metadata
    }

    return { success: true };
  },
});