import type { DataModel, Id } from "./_generated/dataModel";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { expo } from "@better-auth/expo";
import { components, internal } from "./_generated/api";
import { internalMutation, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { betterAuth } from "better-auth";
import { v } from "convex/values";

const siteUrl = process.env.SITE_URL!;
const nativeAppUrl = process.env.NATIVE_APP_URL || "mybettertapp://";
const appleUrl = "https://appleid.apple.com";

export const authClient = createClient<DataModel>(components.betterAuth);

export const createAuth = (
	ctx: GenericCtx<DataModel>,
	{ optionsOnly = false } = {}
) => {
	return betterAuth({
		logger: {
			disabled: optionsOnly,
		},
		baseURL: siteUrl,
		trustedOrigins: [siteUrl, nativeAppUrl, appleUrl],
		database: authClient.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		socialProviders: {
			google: {
				clientId: process.env.AUTH_GOOGLE_ID as string,
				clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
				mapProfileToUser: async (profile) => {
					return {
						email: profile.email,
						image: profile.picture,
						name: profile.name,
					};
				},
			},
			apple: {
				clientId: process.env.AUTH_APPLE_ID as string,
				clientSecret: process.env.AUTH_APPLE_SECRET as string,
				appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
			},
		},
		plugins: [expo(), convex()],
		session: {
			expiresIn: 60 * 60 * 24 * 30, // 30 days
			updateAge: 60 * 60 * 24 * 15, // 15 days
		},
		user: {
			additionalFields: {
				username: {
					required: false,
					type: "string",
				},
				locale: {
					required: false,
					type: "string",
				},
				paymentsCustomerId: {
					required: false,
					type: "string",
				},
			},
		},
	});
};

export const auth = createAuth({} as any, { optionsOnly: true });

export const getAuth = <Ctx extends QueryCtx | MutationCtx>(ctx: Ctx) =>
	betterAuth({
		...auth.options,
		database: authClient.adapter(ctx),
	});

// Trigger hooks
export const beforeCreate = internalMutation({
	args: {
		model: v.string(),
		data: v.any(),
	},
	handler: async (ctx, args) => {
		// Add any beforeCreate logic here
		return args.data;
	},
});

export const onCreate = internalMutation({
	args: {
		model: v.string(),
		doc: v.any(),
	},
	handler: async (ctx, args) => {
		console.log("[onCreate Hook] Called with model:", args.model);
		if (args.model === "user") {
			const betterAuthUser = args.doc as {
				_id: Id<"users">;
				name: string;
				email: string;
				image?: string | null;
				emailVerified?: boolean;
				createdAt?: number;
				updatedAt?: number;
				username?: string | null;
				locale?: string | null;
				paymentsCustomerId?: string | null;
			};

			console.log("[onCreate Hook] Creating user in custom users table:", betterAuthUser._id, betterAuthUser.email);

			const now = Date.now();

			// Better Auth creates users in its internal table, but we need them in our custom users table too
			// Check if user already exists in custom users table by email (since IDs might differ)
			let user = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", betterAuthUser.email))
				.first();
			
			if (!user) {
				// Create user in custom users table with all required fields
				// Convex will generate a new _id, which is fine - we'll link by email
				// Generate username if not provided
				const username = betterAuthUser.username || betterAuthUser.email?.split("@")[0] || "user";
				const displayName = betterAuthUser.name || betterAuthUser.email?.split("@")[0] || "User";
				
				const userId = await ctx.db.insert("users", {
					name: betterAuthUser.name,
					email: betterAuthUser.email,
					betterAuthId: betterAuthUser._id as unknown as string,
					emailVerified: betterAuthUser.emailVerified ?? false,
					image: betterAuthUser.image ?? undefined,
					createdAt: betterAuthUser.createdAt ?? now,
					updatedAt: betterAuthUser.updatedAt ?? now,
					username: username,
					displayName: displayName,
					locale: betterAuthUser.locale ?? undefined,
					paymentsCustomerId: betterAuthUser.paymentsCustomerId ?? undefined,
					onboardingComplete: false,
					role: undefined,
					banned: undefined,
					banReason: undefined,
					banExpires: undefined,
					interests: undefined,
					playerId: undefined, // Will be set after player creation
					followerCount: 0,
					followingCount: 0,
					postCount: 0,
					isPrivate: false,
					allowMessages: true,
					lastActive: now,
				});
				console.log("[onCreate Hook] User created in custom users table with ID:", userId);
				user = await ctx.db.get(userId);
			} else {
				// Update existing user with any new fields from Better Auth
				const patchUpdates: {
					name?: string;
					email?: string;
					emailVerified?: boolean;
					image?: string;
					updatedAt: number;
					username?: string;
					locale?: string;
					paymentsCustomerId?: string;
				} = {
					updatedAt: now,
				};
				
				if (betterAuthUser.name) patchUpdates.name = betterAuthUser.name;
				if (betterAuthUser.email) patchUpdates.email = betterAuthUser.email;
				if (betterAuthUser.emailVerified !== undefined) patchUpdates.emailVerified = betterAuthUser.emailVerified;
				if (betterAuthUser.image !== undefined) patchUpdates.image = betterAuthUser.image ?? undefined;
				if (betterAuthUser.username !== undefined) patchUpdates.username = betterAuthUser.username ?? undefined;
				if (betterAuthUser.locale !== undefined) patchUpdates.locale = betterAuthUser.locale ?? undefined;
				if (betterAuthUser.paymentsCustomerId !== undefined) patchUpdates.paymentsCustomerId = betterAuthUser.paymentsCustomerId ?? undefined;
				
				await ctx.db.patch(user._id, patchUpdates);
				console.log("[onCreate Hook] User updated in custom users table");
			}

			// Verify user exists
			if (!user) {
				throw new Error("Failed to create user in custom users table");
			}

			// Check if player profile already exists
			if (user.playerId) {
				const existingPlayer = await ctx.db.get(user.playerId);
				if (existingPlayer) {
					console.log("[onCreate Hook] Player profile already exists:", user.playerId);
					return;
				}
			}

			// Check if player already exists for this user
			const existingPlayer = await ctx.db
				.query("players")
				.withIndex("by_user", (q) => q.eq("userId", user._id))
				.first();

			if (existingPlayer) {
				// Link existing player to user
				await ctx.db.patch(user._id, {
					playerId: existingPlayer._id,
					updatedAt: now,
				});
				console.log("[onCreate Hook] Linked existing player to user");
				return;
			}

			console.log("[onCreate Hook] Creating player profile for user:", user._id, user.email);

			// Create player profile for the new user
			const playerId = await ctx.db.insert("players", {
				name: user.name || user.email?.split("@")[0] || "Player",
				userId: user._id,
				bio: null,
				avatarUrl: user.image ?? null,
				city: null,
				homeRoom: null,
				homeVenue: null,
				isVerified: false,
				updatedAt: now,
				// Optional fields
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
			await ctx.db.patch(user._id, {
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

			console.log("[onCreate Hook] Player profile and stats created successfully");
		} else if (args.model === "account") {
			const betterAuthAccount = args.doc as {
				_id: Id<"accounts">;
				accountId: string;
				providerId: string;
				userId: string;
				accessToken?: string | null;
				refreshToken?: string | null;
				idToken?: string | null;
				expiresAt?: number | null;
				password?: string | null;
				accessTokenExpiresAt?: number | null;
				refreshTokenExpiresAt?: number | null;
				scope?: string | null;
				createdAt: number;
				updatedAt: number;
			};

			console.log("[onCreate Hook] Creating account in custom accounts table:", betterAuthAccount.accountId);

			// Find the user in our custom users table by Better Auth ID
			const user = await ctx.db
				.query("users")
				.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthAccount.userId))
				.first();

			if (!user) {
				console.warn("[onCreate Hook] User not found for account, skipping account sync");
				return;
			}

			// Check if account already exists
			const existingAccount = await ctx.db
				.query("accounts")
				.withIndex("accountId_providerId", (q) =>
					q.eq("accountId", betterAuthAccount.accountId).eq("providerId", betterAuthAccount.providerId)
				)
				.first();

			if (!existingAccount) {
				await ctx.db.insert("accounts", {
					accountId: betterAuthAccount.accountId,
					providerId: betterAuthAccount.providerId,
					userId: user._id,
					accessToken: betterAuthAccount.accessToken ?? null,
					refreshToken: betterAuthAccount.refreshToken ?? null,
					idToken: betterAuthAccount.idToken ?? null,
					expiresAt: betterAuthAccount.expiresAt ?? null,
					password: betterAuthAccount.password ?? null,
					accessTokenExpiresAt: betterAuthAccount.accessTokenExpiresAt ?? null,
					refreshTokenExpiresAt: betterAuthAccount.refreshTokenExpiresAt ?? null,
					scope: betterAuthAccount.scope ?? null,
					createdAt: betterAuthAccount.createdAt,
					updatedAt: betterAuthAccount.updatedAt,
				});
				console.log("[onCreate Hook] Account created in custom accounts table");
			}
		} else if (args.model === "session") {
			const betterAuthSession = args.doc as {
				_id: Id<"sessions">;
				token: string;
				userId: string;
				expiresAt: number;
				createdAt: number;
				updatedAt: number;
				ipAddress?: string | null;
				userAgent?: string | null;
				impersonatedBy?: string | null;
				activeOrganizationId?: string | null;
			};

			console.log("[onCreate Hook] Creating session in custom sessions table");

			// Find the user in our custom users table by Better Auth ID
			const user = await ctx.db
				.query("users")
				.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthSession.userId))
				.first();

			if (!user) {
				console.warn("[onCreate Hook] User not found for session, skipping session sync");
				return;
			}

			// Check if session already exists
			const existingSession = await ctx.db
				.query("sessions")
				.withIndex("by_token", (q) => q.eq("token", betterAuthSession.token))
				.first();

			if (!existingSession) {
				await ctx.db.insert("sessions", {
					token: betterAuthSession.token,
					userId: user._id,
					expiresAt: betterAuthSession.expiresAt,
					createdAt: betterAuthSession.createdAt,
					updatedAt: betterAuthSession.updatedAt,
					ipAddress: betterAuthSession.ipAddress ?? null,
					userAgent: betterAuthSession.userAgent ?? null,
					impersonatedBy: betterAuthSession.impersonatedBy ?? null,
					activeOrganizationId: betterAuthSession.activeOrganizationId ?? null,
				});
				console.log("[onCreate Hook] Session created in custom sessions table");
			}
		}
	},
});

export const beforeUpdate = internalMutation({
	args: {
		model: v.string(),
		data: v.any(),
	},
	handler: async (ctx, args) => {
		// Add any beforeUpdate logic here
		return args.data;
	},
});

export const onUpdate = internalMutation({
	args: {
		model: v.string(),
		doc: v.any(),
	},
	handler: async (ctx, args) => {
		// Add any onUpdate logic here
	},
});

export const beforeDelete = internalMutation({
	args: {
		model: v.string(),
		id: v.string(),
	},
	handler: async (ctx, args) => {
		// Add any beforeDelete logic here
	},
});

export const onDelete = internalMutation({
	args: {
		model: v.string(),
		doc: v.any(),
	},
	handler: async (ctx, args) => {
		// Add any onDelete logic here
	},
});

// Query functions
export const getCurrentUser = query({
	args: {},
	returns: v.any(),
	handler: async function (ctx) {
		return await authClient.getAuthUser(ctx);
	},
});

export const getCurrentUserWithUsersTable = query({
	args: {},
	returns: v.any(),
	handler: async function (ctx) {
		const betterAuthUser = await authClient.getAuthUser(ctx);

		if (!betterAuthUser) {
			return null;
		}

		const betterAuthId = betterAuthUser._id as unknown as string;
		const usersTableUser = await ctx.db
			.query("users")
			.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId))
			.first();

		return {
			betterAuthUser,
			usersTableUser: usersTableUser || null,
		};
	},
});

export const getUserById = query({
	args: {
		id: v.id("users"),
	},
	handler: async function (ctx, args) {
		return ctx.db.get(args.id as unknown as Id<"users">);
	},
});

export const getUserByEmail = query({
	args: {
		email: v.string(),
	},
	handler: async function (ctx, args) {
		return ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", args.email))
			.first();
	},
});

export const getUserSessions = query({
	args: {
		userId: v.id("users"),
	},
	handler: async function (ctx, args) {
		return ctx.db
			.query("sessions")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});

export const getUserAccounts = query({
	args: {
		userId: v.id("users"),
	},
	handler: async function (ctx, args) {
		return ctx.db
			.query("accounts")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});

// Manually sync session using token from signup result
// This can be called immediately after signup if the onCreate hook hasn't fired yet
export const syncSessionFromToken = mutation({
	args: {
		token: v.string(),
		betterAuthUserId: v.string(),
	},
	handler: async function (ctx, args) {
		// Get user from custom table
		const user = await ctx.db
			.query("users")
			.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthUserId))
			.first();

		if (!user) {
			throw new Error("User not found in custom users table. Please sync user first.");
		}

		// Check if session already exists
		const existingSession = await ctx.db
			.query("sessions")
			.withIndex("by_token", (q) => q.eq("token", args.token))
			.first();

		if (existingSession) {
			return {
				success: true,
				message: "Session already exists",
				session: existingSession,
			};
		}

		// Query Better Auth's internal session table to get full session data
		// Better Auth stores sessions in its component table
		// We need to access it through the component system
		try {
			// Try to get session from Better Auth's internal table
			// The session token should be in Better Auth's sessions table
			// Calculate expiresAt (default 30 days from now based on session config)
			const expiresAt = Date.now() + 60 * 60 * 24 * 30 * 1000; // 30 days
			const now = Date.now();

			// Create session in custom table
			const sessionId = await ctx.db.insert("sessions", {
				token: args.token,
				userId: user._id,
				expiresAt: expiresAt,
				createdAt: now,
				updatedAt: now,
				ipAddress: null,
				userAgent: null,
				impersonatedBy: null,
				activeOrganizationId: null,
			});

			const session = await ctx.db.get(sessionId);
			console.log("[syncSessionFromToken] Session synced to custom table:", sessionId);

			return {
				success: true,
				message: "Session synced successfully",
				session,
			};
		} catch (err) {
			console.error("[syncSessionFromToken] Failed to sync session:", err);
			throw err;
		}
	},
});

// Manually sync account for email/password signup
export const syncEmailPasswordAccount = mutation({
	args: {
		betterAuthUserId: v.string(),
		email: v.string(),
	},
	handler: async function (ctx, args) {
		// Get user from custom table
		const user = await ctx.db
			.query("users")
			.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", args.betterAuthUserId))
			.first();

		if (!user) {
			throw new Error("User not found in custom users table. Please sync user first.");
		}

		// Check if account already exists for email/password provider
		const existingAccount = await ctx.db
			.query("accounts")
			.withIndex("accountId_providerId", (q) =>
				q.eq("accountId", args.email).eq("providerId", "credential")
			)
			.first();

		if (existingAccount) {
			return {
				success: true,
				message: "Account already exists",
				account: existingAccount,
			};
		}

		// Create account in custom table for email/password provider
		const now = Date.now();
		const accountId = await ctx.db.insert("accounts", {
			accountId: args.email,
			providerId: "credential", // email/password uses "credential" provider
			userId: user._id,
			accessToken: null,
			refreshToken: null,
			idToken: null,
			expiresAt: null,
			password: null, // Password is hashed and stored separately by Better Auth
			accessTokenExpiresAt: null,
			refreshTokenExpiresAt: null,
			scope: null,
			createdAt: now,
			updatedAt: now,
		});

		const account = await ctx.db.get(accountId);
		console.log("[syncEmailPasswordAccount] Account synced to custom table:", accountId);

		return {
			success: true,
			message: "Account synced successfully",
			account,
		};
	},
});

// Mutation functions
export const updateUserProfile = mutation({
	args: {
		name: v.optional(v.string()),
		username: v.optional(v.string()),
		image: v.optional(v.string()),
		locale: v.optional(v.string()),
	},
	handler: async function (ctx, args) {
		const user = await authClient.getAuthUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		const updates: {
			name?: string;
			username?: string;
			image?: string;
			locale?: string;
			updatedAt: number;
		} = {
			updatedAt: Date.now(),
		};

		if (args.name !== undefined) {
			updates.name = args.name;
		}
		if (args.username !== undefined) {
			updates.username = args.username || undefined;
		}
		if (args.image !== undefined) {
			updates.image = args.image || undefined;
		}
		if (args.locale !== undefined) {
			updates.locale = args.locale || undefined;
		}

		const userId = user._id as unknown as Id<"users">;
		await ctx.db.patch(userId, updates);
		return await ctx.db.get(userId);
	},
});

export const completeOnboarding = mutation({
	args: {},
	handler: async (ctx) => {
		const user = await authClient.getAuthUser(ctx);
		if (!user) {
			throw new Error("Not authenticated");
		}

		await ctx.db.patch(user._id as unknown as Id<"users">, {
			onboardingComplete: true,
			updatedAt: Date.now(),
		});

		return await ctx.db.get(user._id as unknown as Id<"users">);
	},
});

// Create user in custom users table immediately after Better Auth signup
export const syncUserToCustomTable = mutation({
	args: {
		betterAuthUserId: v.optional(v.string()),
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		username: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Try to get user from context first (if authenticated)
		let authUser = await authClient.getAuthUser(ctx).catch(() => null);
		
		// If not authenticated yet, use provided args (from signup result)
		if (!authUser && args.email && args.name) {
			// Find user in Better Auth's internal table by email
			const betterAuthUser = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", args.email!))
				.first();
			
			if (betterAuthUser) {
				authUser = betterAuthUser as any;
			} else if (args.betterAuthUserId) {
				// Try to get by ID if provided
				const userById = await ctx.db.get(args.betterAuthUserId as unknown as Id<"users">);
				if (userById) {
					authUser = userById as any;
				}
			}
		}

		if (!authUser && !args.email) {
			throw new Error("Not authenticated and no user data provided");
		}

		const now = Date.now();
		const userEmail = authUser?.email || args.email!;
		const userName = authUser?.name || args.name!;
		const betterAuthId = authUser?._id ? (authUser._id as unknown as string) : args.betterAuthUserId;
		const username = args.username || (authUser as any)?.username || userEmail?.split("@")[0] || "user";

		// Validate username if provided
		if (username) {
			// Check username format
			if (!/^[a-z0-9-_]+$/.test(username)) {
				throw new Error("Username can only contain lowercase letters, numbers, hyphens, and underscores");
			}
			
			if (username.length < 3 || username.length > 20) {
				throw new Error("Username must be between 3 and 20 characters");
			}

			// Check if username is already taken
			const existingUsername = await ctx.db
				.query("users")
				.withIndex("by_username", (q) => q.eq("username", username))
				.first();

			if (existingUsername) {
				throw new Error("Username is already taken");
			}
		}

		// Check if user already exists in custom users table
		let user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", userEmail))
			.first();

		if (!user) {
			// Create user in custom users table
			const displayName = userName || userEmail?.split("@")[0] || "User";
			
			const userId = await ctx.db.insert("users", {
				name: userName,
				email: userEmail,
				betterAuthId: betterAuthId as unknown as string,
				emailVerified: authUser?.emailVerified ?? false,
				image: authUser?.image ?? undefined,
				createdAt: authUser?.createdAt ?? now,
				updatedAt: authUser?.updatedAt ?? now,
				username: username,
				displayName: displayName,
				locale: (authUser as any)?.locale ?? undefined,
				paymentsCustomerId: (authUser as any)?.paymentsCustomerId ?? undefined,
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
			user = await ctx.db.get(userId);
			console.log("[syncUserToCustomTable] User created in custom users table:", userId);
		} else {
			// Update existing user
			const updates: {
				betterAuthId?: string;
				username?: string;
				updatedAt: number;
			} = {
				updatedAt: now,
			};

			if (betterAuthId) {
				updates.betterAuthId = betterAuthId;
			}

			if (username && !user.username) {
				updates.username = username;
			}

			await ctx.db.patch(user._id, updates);
			console.log("[syncUserToCustomTable] User already exists, updated betterAuthId and/or username");
		}

		return user;
	},
});

// Create player profile for a user (can be called after signup if onCreate hook doesn't fire)
export const createPlayerProfile = mutation({
	args: {},
	handler: async (ctx) => {
		const authUser = await authClient.getAuthUser(ctx);
		if (!authUser) {
			throw new Error("Not authenticated");
		}

		const userId = authUser._id as unknown as Id<"users">;

		// Get full user from database to check for playerId
		// First try to get by the Better Auth ID
		let user = await ctx.db.get(userId);
		
		// If not found, try to find by betterAuthId (in case the user was created in custom table)
		if (!user) {
			user = await ctx.db
				.query("users")
				.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", userId as unknown as string))
				.first();
		}
		
		// If still not found, try by email as fallback
		if (!user && authUser.email) {
			user = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", authUser.email))
				.first();
		}
		
		if (!user) {
			// If still not found, the user might not be created yet
			// Return null instead of throwing to make this idempotent
			console.warn("User not found in database yet, onCreate hook may still be processing");
			return null;
		}

		// Check if user already has a player profile
		if (user.playerId) {
			const existingPlayer = await ctx.db.get(user.playerId);
			if (existingPlayer) {
				return existingPlayer;
			}
		}

		// Check if player already exists for this user
		const existingPlayer = await ctx.db
			.query("players")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.first();

		if (existingPlayer) {
			// Link player to user if not already linked
			if (!user.playerId) {
				await ctx.db.patch(user._id, {
					playerId: existingPlayer._id,
					updatedAt: Date.now(),
				});
			}
			return existingPlayer;
		}

		// Create new player profile
		const playerId = await ctx.db.insert("players", {
			name: user.name || user.email?.split("@")[0] || "Player",
			userId: user._id,
			bio: null,
			avatarUrl: user.image ?? null,
			city: null,
			homeRoom: null,
			homeVenue: null,
			isVerified: false,
			updatedAt: Date.now(),
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
		await ctx.db.patch(user._id, {
			playerId: playerId,
			updatedAt: Date.now(),
		});

		// Create initial player stats
		const existingStats = await ctx.db
			.query("playerStats")
			.withIndex("by_player", (q) => q.eq("playerId", playerId))
			.first();

		if (!existingStats) {
			await ctx.db.insert("playerStats", {
				playerId: playerId,
				totalMatches: 0,
				wins: 0,
				losses: 0,
				tournamentsPlayed: 0,
				tournamentsWon: 0,
				averageScore: 0,
				lastUpdated: Date.now(),
			});
		}

		return await ctx.db.get(playerId);
	},
});