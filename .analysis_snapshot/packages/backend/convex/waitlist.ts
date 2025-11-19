import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const count = query({
	args: {},
	handler: async (ctx) => {
		const entries = await ctx.db.query("waitlist").collect();
		return {
			total: entries.length,
		};
	},
});

export const joinWaitlist = mutation({
	args: {
		email: v.string(),
		source: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Check if email already exists
		const existing = await ctx.db
			.query("waitlist")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.first();

		if (existing) {
			// Email already exists, return success without creating duplicate
			return { success: true, message: "Email already on waitlist" };
		}

		// Add to waitlist
		await ctx.db.insert("waitlist", {
			email: args.email,
			source: args.source ?? "Early Access",
			createdAt: Date.now(),
		});

		return { success: true, message: "Successfully joined waitlist" };
	},
});

