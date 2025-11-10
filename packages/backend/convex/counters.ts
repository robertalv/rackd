import { ShardedCounter } from "@convex-dev/sharded-counter";
import { TableAggregate } from "@convex-dev/aggregate";
import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";

// Initialize components
export const counters = new ShardedCounter(components.shardedCounter);
export const migrations = new Migrations<DataModel>(components.migrations);

// Define counter names for different entities
export const COUNTER_NAMES = {
  // User-related counters
  USER_COUNT: "users_total",
  USER_POSTS: "user_posts_", // prefix + userId
  USER_FOLLOWERS: "user_followers_", // prefix + userId  
  USER_FOLLOWING: "user_following_", // prefix + userId
  
  // Post-related counters
  POST_COUNT: "posts_total",
  POST_LIKES: "post_likes_", // prefix + postId
  POST_COMMENTS: "post_comments_", // prefix + postId
  POST_SHARES: "post_shares_", // prefix + postId
  
  // Comment-related counters
  COMMENT_COUNT: "comments_total",
  COMMENT_LIKES: "comment_likes_", // prefix + commentId
  
  // Hashtag-related counters
  HASHTAG_COUNT: "hashtags_total",
  HASHTAG_USAGE: "hashtag_usage_", // prefix + hashtagId
  
  // Tournament-related counters
  TOURNAMENT_COUNT: "tournaments_total",
  TOURNAMENT_REGISTRATIONS: "tournament_registrations_", // prefix + tournamentId
  TOURNAMENT_PLAYERS: "tournament_players_", // prefix + tournamentId
  TOURNAMENT_TEMPLATE_COUNT: "tournament_templates_total",
  
  // Venue-related counters
  VENUE_COUNT: "venues_total",
  VENUE_FOLLOWERS: "venue_followers_", // prefix + venueId
  
  // Match-related counters
  MATCH_COUNT: "matches_total",
  
  // Player-related counters
  PLAYER_COUNT: "players_total",
  
  // Table-related counters
  TABLE_COUNT: "tables_total",
  
  // Notification-related counters  
  NOTIFICATION_COUNT: "notifications_total",
  USER_UNREAD_NOTIFICATIONS: "user_notifications_", // prefix + userId
} as const;

// Table aggregates for complex queries
export const postsByUser = new TableAggregate(components.aggregate, {
  namespace: (doc: any) => doc.userId,
  sortKey: (doc: any) => doc._creationTime,
});

export const commentsByPost = new TableAggregate(components.aggregate, {
  namespace: (doc: any) => doc.postId,
  sortKey: (doc: any) => doc._creationTime,
});

export const hashtagsByUsage = new TableAggregate(components.aggregate, {
  sortKey: (doc: any) => [doc.useCount, doc.lastUsed],
});

export const tournamentsByDate = new TableAggregate(components.aggregate, {
  sortKey: (doc: any) => doc.date,
});

export const usersByFollowers = new TableAggregate(components.aggregate, {
  sortKey: (doc: any) => doc.followerCount,
});

// Helper functions for counter operations
export const CounterHelpers = {
  // User counters
  async incrementUserPosts(ctx: any, userId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.USER_POSTS}${userId}`);
    await counters.inc(ctx, COUNTER_NAMES.POST_COUNT);
  },
  
  async decrementUserPosts(ctx: any, userId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.USER_POSTS}${userId}`);
    await counters.dec(ctx, COUNTER_NAMES.POST_COUNT);
  },
  
  async incrementUserFollowers(ctx: any, userId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.USER_FOLLOWERS}${userId}`);
  },
  
  async decrementUserFollowers(ctx: any, userId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.USER_FOLLOWERS}${userId}`);
  },
  
  async incrementUserFollowing(ctx: any, userId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.USER_FOLLOWING}${userId}`);
  },
  
  async decrementUserFollowing(ctx: any, userId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.USER_FOLLOWING}${userId}`);
  },
  
  // Post counters
  async incrementPostLikes(ctx: any, postId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.POST_LIKES}${postId}`);
  },
  
  async decrementPostLikes(ctx: any, postId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.POST_LIKES}${postId}`);
  },
  
  async incrementPostComments(ctx: any, postId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.POST_COMMENTS}${postId}`);
    await counters.inc(ctx, COUNTER_NAMES.COMMENT_COUNT);
  },
  
  async decrementPostComments(ctx: any, postId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.POST_COMMENTS}${postId}`);
    await counters.dec(ctx, COUNTER_NAMES.COMMENT_COUNT);
  },
  
  async incrementPostShares(ctx: any, postId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.POST_SHARES}${postId}`);
  },
  
  async decrementPostShares(ctx: any, postId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.POST_SHARES}${postId}`);
  },
  
  // Comment counters
  async incrementCommentLikes(ctx: any, commentId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.COMMENT_LIKES}${commentId}`);
  },
  
  async decrementCommentLikes(ctx: any, commentId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.COMMENT_LIKES}${commentId}`);
  },
  
  // Hashtag counters
  async incrementHashtagUsage(ctx: any, hashtagId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.HASHTAG_USAGE}${hashtagId}`);
  },
  
  // Tournament counters
  async incrementTournamentCount(ctx: any) {
    await counters.inc(ctx, COUNTER_NAMES.TOURNAMENT_COUNT);
  },
  
  async decrementTournamentCount(ctx: any) {
    await counters.dec(ctx, COUNTER_NAMES.TOURNAMENT_COUNT);
  },
  
  async incrementTournamentRegistrations(ctx: any, tournamentId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.TOURNAMENT_REGISTRATIONS}${tournamentId}`);
  },
  
  async decrementTournamentRegistrations(ctx: any, tournamentId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.TOURNAMENT_REGISTRATIONS}${tournamentId}`);
  },
  
  // Venue counters
  async incrementVenueCount(ctx: any) {
    await counters.inc(ctx, COUNTER_NAMES.VENUE_COUNT);
  },
  
  async decrementVenueCount(ctx: any) {
    await counters.dec(ctx, COUNTER_NAMES.VENUE_COUNT);
  },
  
  async incrementVenueFollowers(ctx: any, venueId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.VENUE_FOLLOWERS}${venueId}`);
  },
  
  async decrementVenueFollowers(ctx: any, venueId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.VENUE_FOLLOWERS}${venueId}`);
  },
  
  // Notification counters
  async incrementUserNotifications(ctx: any, userId: string) {
    await counters.inc(ctx, `${COUNTER_NAMES.USER_UNREAD_NOTIFICATIONS}${userId}`);
    await counters.inc(ctx, COUNTER_NAMES.NOTIFICATION_COUNT);
  },
  
  async decrementUserNotifications(ctx: any, userId: string) {
    await counters.dec(ctx, `${COUNTER_NAMES.USER_UNREAD_NOTIFICATIONS}${userId}`);
  },
  
  // Get counter values
  async getUserPostCount(ctx: any, userId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.USER_POSTS}${userId}`);
  },
  
  async getUserFollowerCount(ctx: any, userId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.USER_FOLLOWERS}${userId}`);
  },
  
  async getUserFollowingCount(ctx: any, userId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.USER_FOLLOWING}${userId}`);
  },
  
  async getPostLikeCount(ctx: any, postId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.POST_LIKES}${postId}`);
  },
  
  async getPostCommentCount(ctx: any, postId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.POST_COMMENTS}${postId}`);
  },
  
  async getCommentLikeCount(ctx: any, commentId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.COMMENT_LIKES}${commentId}`);
  },
  
  async getHashtagUsageCount(ctx: any, hashtagId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.HASHTAG_USAGE}${hashtagId}`);
  },
  
  async getTotalUserCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.USER_COUNT);
  },
  
  async getTotalPostCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.POST_COUNT);
  },
  
  async getTotalCommentCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.COMMENT_COUNT);
  },
  
  async getTotalHashtagCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.HASHTAG_COUNT);
  },
  
  async getTotalTournamentCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.TOURNAMENT_COUNT);
  },
  
  async incrementTournamentTemplateCount(ctx: any) {
    await counters.inc(ctx, COUNTER_NAMES.TOURNAMENT_TEMPLATE_COUNT);
  },
  
  async getTotalTournamentTemplateCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.TOURNAMENT_TEMPLATE_COUNT);
  },
  
  async getTournamentRegistrationCount(ctx: any, tournamentId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.TOURNAMENT_REGISTRATIONS}${tournamentId}`);
  },
  
  async getTotalVenueCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.VENUE_COUNT);
  },
  
  async getVenueFollowerCount(ctx: any, venueId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.VENUE_FOLLOWERS}${venueId}`);
  },
  
  async getUserUnreadNotificationCount(ctx: any, userId: string): Promise<number> {
    return await counters.count(ctx, `${COUNTER_NAMES.USER_UNREAD_NOTIFICATIONS}${userId}`);
  },
  
  // Match counters
  async incrementMatchCount(ctx: any) {
    await counters.inc(ctx, COUNTER_NAMES.MATCH_COUNT);
  },
  
  async getTotalMatchCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.MATCH_COUNT);
  },
  
  // Player counters
  async incrementPlayerCount(ctx: any) {
    await counters.inc(ctx, COUNTER_NAMES.PLAYER_COUNT);
  },
  
  async getTotalPlayerCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.PLAYER_COUNT);
  },
  
  // Table counters
  async incrementTableCount(ctx: any) {
    await counters.inc(ctx, COUNTER_NAMES.TABLE_COUNT);
  },
  
  async getTotalTableCount(ctx: any): Promise<number> {
    return await counters.count(ctx, COUNTER_NAMES.TABLE_COUNT);
  }
};