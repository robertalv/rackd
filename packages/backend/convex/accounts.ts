import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./lib/utils";
import type { Id } from "./_generated/dataModel";

// Helper function to format provider name for display
function formatProviderName(providerId: string): string {
	const provider = providerId.toLowerCase();
	
	if (provider === "credential" || provider === "email_password") {
		return "Email + Password";
	}
	if (provider === "google") {
		return "Google";
	}
	if (provider === "apple") {
		return "Apple";
	}
	if (provider === "github") {
		return "GitHub";
	}
	if (provider === "microsoft") {
		return "Microsoft";
	}
	if (provider === "facebook") {
		return "Facebook";
	}
	
	// Capitalize and format provider name
	return provider
		.split(/[_-]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

// Get current user's accounts
export const getMyAccounts = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		// Get all accounts for this user from custom accounts table
		const accounts = await ctx.db
			.query("accounts")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		// Format accounts for frontend
		return accounts.map((account) => {
			const providerName = formatProviderName(account.providerId);
			const isPasswordMethod = account.providerId === "credential" || account.providerId === "email_password";
			
			return {
				id: account._id,
				accountId: account.accountId,
				providerId: account.providerId,
				provider: providerName,
				method: providerName, // For compatibility with frontend
				type: isPasswordMethod ? "password" : "oauth",
				createdAt: account.createdAt,
				updatedAt: account.updatedAt,
				// Don't expose sensitive tokens
			};
		});
	},
});

// Disconnect an account (delete it)
export const disconnectAccount = mutation({
	args: {
		accountId: v.id("accounts"),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		// Get the account to verify it belongs to the user
		const account = await ctx.db.get(args.accountId);
		if (!account) {
			throw new Error("Account not found");
		}

		if (account.userId !== user._id) {
			throw new Error("Unauthorized: Account does not belong to current user");
		}

		// Prevent disconnecting the last authentication method
		const allAccounts = await ctx.db
			.query("accounts")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.collect();

		if (allAccounts.length <= 1) {
			throw new Error("Cannot disconnect your last authentication method");
		}

		// Prevent disconnecting password method if it's the only one
		const passwordAccounts = allAccounts.filter(
			(a) => a.providerId === "credential" || a.providerId === "email_password"
		);
		const isPasswordAccount = account.providerId === "credential" || account.providerId === "email_password";
		
		if (isPasswordAccount && passwordAccounts.length === 1 && allAccounts.length > 1) {
			// Allow disconnecting password if there are OAuth methods available
			const hasOAuthMethods = allAccounts.some(
				(a) => a.providerId !== "credential" && a.providerId !== "email_password"
			);
			if (!hasOAuthMethods) {
				throw new Error("Cannot disconnect your password authentication without another method");
			}
		}

		// Delete account from custom table
		// Better Auth's onCreate/onDelete hooks will sync this deletion
		await ctx.db.delete(args.accountId);

		return { success: true };
	},
});

// Get FargoRate account info for current user
export const getFargoRateAccount = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			return null;
		}

		// Check if user has a linked player with FargoRate data
		if (!user.playerId) {
			return null;
		}

		const player = await ctx.db.get(user.playerId);
		if (!player || !player.fargoId) {
			return null;
		}

		return {
			id: player._id,
			fargoId: player.fargoId,
			fargoReadableId: player.fargoReadableId,
			fargoMembershipId: player.fargoMembershipId,
			fargoRating: player.fargoRating,
			fargoRobustness: player.fargoRobustness,
			name: player.name,
			city: player.city,
		};
	},
});

// Search for FargoRate players (must be an action because it uses fetch)
export const searchFargoRatePlayers = action({
	args: {
		query: v.string(),
	},
	handler: async (ctx, args) => {
		if (!args.query || args.query.length < 2) {
			return [];
		}

		try {
			const encodedQuery = encodeURIComponent(args.query);
			const apiUrl = `https://dashboard.fargorate.com/api/indexsearch?q=${encodedQuery}`;

			const response = await fetch(apiUrl, {
				headers: {
					"Accept": "application/json",
					"User-Agent": "Rackd-App/1.0",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			
			// The API returns { value: PlayerSearchResult[] }
			if (data && data.value && Array.isArray(data.value)) {
				return data.value.map((player: any) => ({
					id: player.id,
					readableId: player.readableId,
					firstName: player.firstName,
					lastName: player.lastName,
					name: `${player.firstName} ${player.lastName}`,
					location: player.location,
					effectiveRating: player.effectiveRating,
					provisionalRating: player.provisionalRating,
					robustness: player.robustness,
				}));
			}

			return [];
		} catch (error) {
			console.error("Error searching FargoRate players:", error);
			throw new Error("Failed to search FargoRate players");
		}
	},
});

// Link FargoRate account to current user
export const linkFargoRateAccount = mutation({
	args: {
		fargoId: v.string(),
		fargoReadableId: v.string(),
		fargoMembershipId: v.optional(v.string()),
		name: v.string(),
		fargoRating: v.number(),
		fargoRobustness: v.optional(v.number()),
		city: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		// Check if this Fargo ID is already linked to another user
		const existingPlayers = await ctx.db
			.query("players")
			.withIndex("by_fargo_id", (q) => q.eq("fargoId", args.fargoId))
			.collect();

		const matchingPlayer = existingPlayers.find(
			(p) => p.fargoId === args.fargoId || p.fargoMembershipId === args.fargoMembershipId
		);

		if (matchingPlayer && matchingPlayer.userId && matchingPlayer.userId !== user._id) {
			throw new Error("This FargoRate account is already linked to another user");
		}

		// Use the existing linkPlayerRecord mutation logic
		let playerId: Id<"players">;

		if (user.playerId) {
			// Update existing player record
			const existingPlayer = await ctx.db.get(user.playerId);
			if (existingPlayer) {
				await ctx.db.patch(existingPlayer._id, {
					name: args.name,
					city: args.city ?? null,
					fargoId: args.fargoId,
					fargoRating: args.fargoRating,
					fargoRobustness: args.fargoRobustness ?? null,
					fargoMembershipId: args.fargoMembershipId ?? null,
					fargoReadableId: args.fargoReadableId,
					updatedAt: Date.now(),
				});
				playerId = existingPlayer._id;
			} else {
				// Create new player record
				playerId = await ctx.db.insert("players", {
					name: args.name,
					userId: user._id,
					city: args.city ?? null,
					fargoId: args.fargoId,
					fargoRating: args.fargoRating,
					fargoRobustness: args.fargoRobustness ?? null,
					fargoMembershipId: args.fargoMembershipId ?? null,
					fargoReadableId: args.fargoReadableId,
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
		} else if (matchingPlayer) {
			// Link existing player to user
			await ctx.db.patch(matchingPlayer._id, {
				userId: user._id,
				name: args.name,
				city: args.city ?? null,
				fargoId: args.fargoId,
				fargoRating: args.fargoRating,
				fargoRobustness: args.fargoRobustness ?? null,
				fargoMembershipId: args.fargoMembershipId ?? null,
				fargoReadableId: args.fargoReadableId,
				updatedAt: Date.now(),
			});
			playerId = matchingPlayer._id;
		} else {
			// Create new player record
			playerId = await ctx.db.insert("players", {
				name: args.name,
				userId: user._id,
				city: args.city ?? null,
				fargoId: args.fargoId,
				fargoRating: args.fargoRating,
				fargoRobustness: args.fargoRobustness ?? null,
				fargoMembershipId: args.fargoMembershipId ?? null,
				fargoReadableId: args.fargoReadableId,
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

		// Link player to user
		await ctx.db.patch(user._id, {
			playerId: playerId,
			updatedAt: Date.now(),
		});

		return { success: true, playerId };
	},
});

// Unlink FargoRate account from current user
export const unlinkFargoRateAccount = mutation({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		if (!user.playerId) {
			throw new Error("No FargoRate account linked");
		}

		const player = await ctx.db.get(user.playerId);
		if (!player || !player.fargoId) {
			throw new Error("No FargoRate account linked");
		}

		// Remove FargoRate data from player (but keep the player record)
		await ctx.db.patch(player._id, {
			fargoId: null,
			fargoReadableId: null,
			fargoMembershipId: null,
			fargoRating: null,
			fargoRobustness: null,
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});

// Get APA account info for current user
export const getAPAAccount = query({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			return null;
		}

		// Check if user has a linked player with APA data
		if (!user.playerId) {
			return null;
		}

		const player = await ctx.db.get(user.playerId);
		if (!player || !player.apaId) {
			return null;
		}

		return {
			id: player._id,
			apaId: player.apaId,
			apaSkillLevel: player.apaSkillLevel,
			name: player.name,
			league: player.league,
		};
	},
});

// Search for APA members (must be an action because it uses fetch)
// Note: The APA API may require authentication or have different search endpoints
// This is a basic implementation that can be adjusted based on actual API requirements
export const searchAPAMembers = action({
	args: {
		query: v.string(),
		leagueId: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		if (!args.query || args.query.length < 2) {
			return [];
		}

		try {
			// Try to search members - the actual endpoint may vary
			// Using the members endpoint as a starting point
			const baseUrl = "https://api.poolplayers.com";
			let apiUrl = `${baseUrl}/members`;
			
			// If we have a leagueId, we might want to filter by league
			// The actual API structure may differ, so this is a placeholder
			const response = await fetch(apiUrl, {
				headers: {
					"Accept": "application/json",
					"User-Agent": "Rackd-App/1.0",
				},
			});

			if (!response.ok) {
				// If the endpoint doesn't exist or requires auth, return empty array
				// In production, you'd want to handle this more gracefully
				console.warn(`APA API returned status ${response.status}`);
				return [];
			}

			const data = await response.json();
			
			// Filter results based on query (client-side filtering)
			// In production, you'd want server-side search if available
			if (Array.isArray(data)) {
				const queryLower = args.query.toLowerCase();
				return data
					.filter((member: any) => {
						const firstName = (member.firstName || "").toLowerCase();
						const lastName = (member.lastName || "").toLowerCase();
						const memberId = String(member.memberId || "");
						return (
							firstName.includes(queryLower) ||
							lastName.includes(queryLower) ||
							memberId.includes(queryLower)
						);
					})
					.slice(0, 20) // Limit results
					.map((member: any) => ({
						memberId: member.memberId,
						firstName: member.firstName || "",
						lastName: member.lastName || "",
						name: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
						email: member.email,
						phone: member.phone,
					}));
			}

			return [];
		} catch (error) {
			console.error("Error searching APA members:", error);
			// Return empty array instead of throwing to allow graceful degradation
			return [];
		}
	},
});

// Link APA account to current user
export const linkAPAAccount = mutation({
	args: {
		apaId: v.string(),
		name: v.string(),
		apaSkillLevel: v.optional(v.number()),
		leagueId: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		// Check if this APA ID is already linked to another user
		// Note: We'd need an index on apaId for this to work efficiently
		const existingPlayers = await ctx.db
			.query("players")
			.collect();

		const matchingPlayer = existingPlayers.find(
			(p) => p.apaId === args.apaId
		);

		if (matchingPlayer && matchingPlayer.userId && matchingPlayer.userId !== user._id) {
			throw new Error("This APA account is already linked to another user");
		}

		// Use the existing linkPlayerRecord mutation logic
		let playerId: Id<"players">;

		if (user.playerId) {
			// Update existing player record
			const existingPlayer = await ctx.db.get(user.playerId);
			if (existingPlayer) {
				await ctx.db.patch(existingPlayer._id, {
					name: args.name,
					apaId: args.apaId,
					apaSkillLevel: args.apaSkillLevel ?? null,
					league: args.leagueId ? "APA" : existingPlayer.league || "APA",
					updatedAt: Date.now(),
				});
				playerId = existingPlayer._id;
			} else {
				// Create new player record
				playerId = await ctx.db.insert("players", {
					name: args.name,
					userId: user._id,
					city: null,
					fargoId: null,
					fargoRating: null,
					fargoRobustness: null,
					fargoMembershipId: null,
					fargoReadableId: null,
					bio: null,
					avatarUrl: null,
					homeRoom: null,
					homeVenue: null,
					isVerified: false,
					updatedAt: Date.now(),
					league: args.leagueId ? "APA" : "APA",
					apaId: args.apaId,
					apaSkillLevel: args.apaSkillLevel ?? null,
					bcaId: null,
				});
			}
		} else if (matchingPlayer) {
			// Link existing player to user
			await ctx.db.patch(matchingPlayer._id, {
				userId: user._id,
				name: args.name,
				apaId: args.apaId,
				apaSkillLevel: args.apaSkillLevel ?? null,
				league: args.leagueId ? "APA" : matchingPlayer.league || "APA",
				updatedAt: Date.now(),
			});
			playerId = matchingPlayer._id;
		} else {
			// Create new player record
			playerId = await ctx.db.insert("players", {
				name: args.name,
				userId: user._id,
				city: null,
				fargoId: null,
				fargoRating: null,
				fargoRobustness: null,
				fargoMembershipId: null,
				fargoReadableId: null,
				bio: null,
				avatarUrl: null,
				homeRoom: null,
				homeVenue: null,
				isVerified: false,
				updatedAt: Date.now(),
				league: args.leagueId ? "APA" : "APA",
				apaId: args.apaId,
				apaSkillLevel: args.apaSkillLevel ?? null,
				bcaId: null,
			});
		}

		// Link player to user
		await ctx.db.patch(user._id, {
			playerId: playerId,
			updatedAt: Date.now(),
		});

		return { success: true, playerId };
	},
});

// Unlink APA account from current user
export const unlinkAPAAccount = mutation({
	args: {},
	handler: async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		if (!user.playerId) {
			throw new Error("No APA account linked");
		}

		const player = await ctx.db.get(user.playerId);
		if (!player || !player.apaId) {
			throw new Error("No APA account linked");
		}

		// Remove APA data from player (but keep the player record)
		await ctx.db.patch(player._id, {
			apaId: null,
			apaSkillLevel: null,
			// Only remove league if it was APA
			league: player.league === "APA" ? null : player.league,
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});

