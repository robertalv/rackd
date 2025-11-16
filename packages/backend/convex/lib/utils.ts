import type { QueryCtx, MutationCtx } from "../_generated/server";
import { authClient } from "../auth";
import type { Id } from "../_generated/dataModel";

// Type guard to check if context is a mutation context
function isMutationCtx(ctx: QueryCtx | MutationCtx): ctx is MutationCtx {
	return "db" in ctx && typeof (ctx.db as any).insert === "function";
}

export const site = {
  name: "Rackd",
  slogan: "Your AI-powered billiard partner",
  description:
    "Rackd is a Platform for billiard players to find venues, tournaments, and players",
  logo: "/logo.png",
  phone: undefined,
  email: "info@rackd.com",
  emailFrom: "info@rackd.com",
};

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
	try {
		// Safety check: ensure ctx has the expected structure
		if (!ctx || !ctx.db) {
			console.warn("[getCurrentUser] Invalid context provided");
			return null;
		}
		
		const user = await authClient.getAuthUser(ctx);
		if (!user) return null;
		
		// Look up user in custom users table by betterAuthId
		const betterAuthId = user._id as unknown as string;
		const dbUser = await ctx.db
			.query("users")
			.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId))
			.first();
		
		return dbUser || null;
	} catch (error: any) {
		// getAuthUser throws "Unauthenticated" error when no session exists
		if (error?.message === "Unauthenticated" || error?.message?.includes("Unauthenticated")) {
			return null;
		}
		// Re-throw other errors
		throw error;
	}
}

export async function getCurrentUserId(
	ctx: QueryCtx | MutationCtx,
): Promise<Id<"users"> | null> {
	const dbUser = await getCurrentUser(ctx);
	return dbUser ? dbUser._id : null;
}

export async function getCurrentUserOrThrow(ctx: QueryCtx | MutationCtx) {
	try {
		const user = await authClient.getAuthUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}
		
		// Look up user in custom users table by betterAuthId
		const betterAuthId = user._id as unknown as string;
		let dbUser = await ctx.db
			.query("users")
			.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId))
			.first();
		
		// If user doesn't exist, try to find by email or create them automatically (only in mutations)
		if (!dbUser) {
			// Try to check by email as well (in case betterAuthId wasn't set)
			const userByEmail = user.email 
				? await ctx.db
					.query("users")
					.withIndex("by_email", (q) => q.eq("email", user.email!))
					.first()
				: null;
			
			if (userByEmail) {
				// Update existing user with betterAuthId if missing (only in mutations)
				if (!userByEmail.betterAuthId && isMutationCtx(ctx)) {
					await ctx.db.patch(userByEmail._id, { betterAuthId: betterAuthId });
				}
				dbUser = userByEmail;
			} else if (isMutationCtx(ctx)) {
				// Try to auto-create user (only in mutation context)
				try {
					const now = Date.now();
					const username = (user as any)?.username || user.email?.split("@")[0] || "user";
					const displayName = user.name || user.email?.split("@")[0] || "User";
					
					const userId = await ctx.db.insert("users", {
						name: user.name || user.email?.split("@")[0] || "User",
						email: user.email || "",
						betterAuthId: betterAuthId,
						emailVerified: user.emailVerified ?? false,
						image: user.image ?? undefined,
						createdAt: user.createdAt ?? now,
						updatedAt: user.updatedAt ?? now,
						username: username,
						displayName: displayName,
						locale: (user as any)?.locale ?? undefined,
						paymentsCustomerId: (user as any)?.paymentsCustomerId ?? undefined,
						onboardingComplete: false,
						role: undefined,
						banned: undefined,
						banReason: undefined,
						banExpires: undefined,
						interests: undefined,
						playerId: undefined,
						followerCount: 0,
						followingCount: 0,
						postCount: 0,
						isPrivate: false,
						allowMessages: true,
						lastActive: now,
					});
					dbUser = await ctx.db.get(userId);
					console.log("[getCurrentUserOrThrow] Auto-created user in custom users table:", userId);
				} catch (insertError: any) {
					// If insert fails (e.g., duplicate), log and continue to throw original error
					console.warn("[getCurrentUserOrThrow] Could not auto-create user:", insertError);
				}
			}
		}
		
		if (!dbUser) {
			throw new Error("User not found in database. Please ensure your account is properly synced.");
		}
		return dbUser;
	} catch (error: any) {
		// getAuthUser throws "Unauthenticated" error when no session exists
		if (error?.message === "Unauthenticated" || error?.message?.includes("Unauthenticated")) {
			throw new Error("Not authenticated");
		}
		// Re-throw other errors
		throw error;
	}
}

export async function getCurrentUserIdOrThrow(
	ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
	const user = await getCurrentUserOrThrow(ctx);
	return user._id;
}

