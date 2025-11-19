import { query } from "./_generated/server";
import { getCurrentUserIdOrThrow } from "./lib/utils";

export const getUsageStats = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getCurrentUserIdOrThrow(ctx);

		const tournaments = await ctx.db
			.query("tournaments")
			.withIndex("by_organizer", (q) => q.eq("organizerId", userId))
			.collect();

		const venues = await ctx.db
			.query("venues")
			.withIndex("by_organizer", (q) => q.eq("organizerId", userId))
			.collect();

		const posts = await ctx.db
			.query("posts")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayTimestamp = today.getTime();
		const postsToday = posts.filter((p) => p._creationTime >= todayTimestamp);

		return {
			localCounts: {
				tournaments: tournaments.length,
				venues: venues.length,
				posts: posts.length,
				postsToday: postsToday.length,
			},
		};
	},
});

export const getPlanLimits = query({
	args: {},
	handler: async (ctx) => {
		return {
			tournaments: 3,
			venues: 1,
			postsPerDay: 10,
			hasUnlimitedTournaments: false,
			hasUnlimitedVenues: false,
			hasUnlimitedPosts: false,
			hasFirecrawlAccess: false,
		};
	},
});

