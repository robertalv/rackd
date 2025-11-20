import type { DataModel, Id } from "./_generated/dataModel";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { expo } from "@better-auth/expo";
import { api, components, internal } from "./_generated/api";
import { internalMutation, mutation, MutationCtx, query, QueryCtx, action } from "./_generated/server";
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
				redirectURI: `${siteUrl}/api/auth/callback/google`,
				mapProfileToUser: async (profile) => {
					// Extract username from email or name
					const baseUsername = profile.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || 
						profile.given_name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 
						"user";
					
					return {
						email: profile.email,
						image: profile.picture, // Will be uploaded to Convex storage in onCreate hook
						name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
						username: baseUsername,
						locale: profile.locale,
					};
				},
			},
			apple: {
				clientId: process.env.AUTH_APPLE_ID as string,
				clientSecret: process.env.AUTH_APPLE_SECRET as string,
				appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
			},
		},
		plugins: [
			expo(),
			convex(),
		],
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

// Action to download and upload Google profile image to Convex storage
// This is scheduled from onCreate hook - actions can use fetch()
export const uploadGoogleProfileImageAction = action({
	args: {
		imageUrl: v.string(),
		userId: v.id("users"),
	},
	handler: async (ctx, args): Promise<{ storageId: Id<"_storage"> | null; imageUrl: string }> => {
		try {
			// Download the image from Google (actions can use fetch)
			const imageResponse = await fetch(args.imageUrl);
			if (!imageResponse.ok) {
				throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
			}

			const imageBlob = await imageResponse.blob();
			const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

			// Generate upload URL via mutation (use public API since there's no internal version)
			const uploadUrl = await ctx.runMutation(api.files.generateUploadUrl);

			// Upload to Convex storage
			const uploadResponse = await fetch(uploadUrl, {
				method: "POST",
				headers: {
					"Content-Type": contentType,
				},
				body: imageBlob,
			});

			if (!uploadResponse.ok) {
				const errorText = await uploadResponse.text();
				throw new Error(`Upload failed: ${uploadResponse.status} ${errorText || uploadResponse.statusText}`);
			}

			// Get storage ID from response
			const responseText = await uploadResponse.text();
			let storageId: Id<"_storage">;
			
			try {
				const responseData = JSON.parse(responseText);
				storageId = (responseData.storageId || responseData) as Id<"_storage">;
			} catch (parseError) {
				storageId = responseText.trim() as Id<"_storage">;
			}

			if (!storageId) {
				throw new Error("No storageId in upload response");
			}

			// Get the file URL via action (actions can access storage directly)
			const fileUrl = await ctx.runAction(api.files.getFileUrlAction, { storageId });
			if (!fileUrl) {
				throw new Error("Failed to get file URL after upload");
			}

			// Update user with the uploaded image URL via internal mutation
			await ctx.runMutation(internal.auth.updateUserImage, {
				userId: args.userId,
				imageUrl: fileUrl,
				storageId: storageId,
			});

			console.log("[uploadGoogleProfileImageAction] Successfully uploaded Google profile image for user:", args.userId);
			return { storageId, imageUrl: fileUrl };
		} catch (error) {
			console.error("[uploadGoogleProfileImageAction] Failed to upload image:", error);
			// Keep the original Google URL as fallback via mutation
			try {
				await ctx.runMutation(internal.auth.updateUserImage, {
					userId: args.userId,
					imageUrl: args.imageUrl,
				});
			} catch (updateError) {
				console.error("[uploadGoogleProfileImageAction] Failed to update user with fallback image:", updateError);
			}
			return { storageId: null, imageUrl: args.imageUrl };
		}
	},
});

// Public action wrapper (if needed for external calls)
export const uploadGoogleProfileImage = action({
	args: {
		imageUrl: v.string(),
		userId: v.id("users"),
	},
	handler: async (ctx, args): Promise<{ storageId: Id<"_storage"> | null; imageUrl: string }> => {
		// Call the action directly (actions are public)
		return await ctx.runAction(api.auth.uploadGoogleProfileImageAction, {
			imageUrl: args.imageUrl,
			userId: args.userId,
		});
	},
});

// Internal mutation to update user image
export const updateUserImage = internalMutation({
	args: {
		userId: v.id("users"),
		imageUrl: v.string(),
		storageId: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.userId, {
			image: args.imageUrl,
			updatedAt: Date.now(),
		});
	},
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
				// Generate username if not provided, ensuring uniqueness
				const baseUsername = betterAuthUser.username || betterAuthUser.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || "user";
				let username = baseUsername;
				let usernameCounter = 1;
				
				// Ensure username is unique
				while (await ctx.db
					.query("users")
					.withIndex("by_username", (q) => q.eq("username", username))
					.first()) {
					username = `${baseUsername}${usernameCounter}`;
					usernameCounter++;
				}
				
				const displayName = betterAuthUser.name || betterAuthUser.email?.split("@")[0] || "User";
				
				const userId = await ctx.db.insert("users", {
					name: betterAuthUser.name,
					email: betterAuthUser.email,
					betterAuthId: betterAuthUser._id as unknown as string,
					emailVerified: betterAuthUser.emailVerified ?? false,
					image: betterAuthUser.image ?? undefined, // Temporary - will be replaced with uploaded image
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

				// If user has a Google image URL (starts with https://lh3.googleusercontent.com or similar),
				// schedule an action to download and upload it to Convex storage
				if (betterAuthUser.image && (
					betterAuthUser.image.startsWith("https://lh3.googleusercontent.com") ||
					(betterAuthUser.image.startsWith("https://") && betterAuthUser.image.includes("googleusercontent"))
				)) {
					console.log("[onCreate Hook] Scheduling Google profile image upload for user:", userId);
					// Schedule the image upload action to run immediately (0ms delay)
					// Actions are public, so use api.auth
					await ctx.scheduler.runAfter(0, api.auth.uploadGoogleProfileImageAction, {
						imageUrl: betterAuthUser.image,
						userId: userId,
					});
				}
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

			await ctx.db.patch(user._id, {
				playerId: playerId,
				updatedAt: now,
			});

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
					lastUpdated: now,
				});
				console.log("[onCreate Hook] Player stats created successfully");
			} else {
				console.log("[onCreate Hook] Player stats already exist");
			}

			console.log("[onCreate Hook] Player profile and stats created successfully");
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
		const betterAuthUser = await authClient.safeGetAuthUser(ctx);

		if (!betterAuthUser) {
			return null;
		}

		const betterAuthId = betterAuthUser._id as unknown as string;
		let usersTableUser = await ctx.db
			.query("users")
			.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId))
			.first();

		// Fallback: If user doesn't exist in custom table, try to find by email
		// This handles cases where onCreate hook didn't fire (e.g., OAuth flows)
		if (!usersTableUser) {
			usersTableUser = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", betterAuthUser.email))
				.first();

			if (!usersTableUser) {
				console.warn("[getCurrentUserWithUsersTable] User exists in Better Auth but not in custom users table. onCreate hook may not have fired yet. Client should call ensureUserExists.");
			}
		}

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
		} else if (args.betterAuthUserId && args.betterAuthUserId !== "undefined") {
			// Try to get by ID if provided (only if it's a valid string, not "undefined")
			try {
				const userById = await ctx.db.get(args.betterAuthUserId as unknown as Id<"users">);
				if (userById) {
					authUser = userById as any;
				}
			} catch (err) {
				// Invalid ID format, ignore and continue
				console.warn("[syncUserToCustomTable] Invalid betterAuthUserId format:", args.betterAuthUserId);
			}
		}
		}

		if (!authUser && !args.email) {
			throw new Error("Not authenticated and no user data provided");
		}

		const now = Date.now();
		const userEmail = authUser?.email || args.email!;
		const userName = authUser?.name || args.name!;
		const betterAuthId = authUser?._id 
			? (authUser._id as unknown as string) 
			: (args.betterAuthUserId && args.betterAuthUserId !== "undefined" ? args.betterAuthUserId : undefined);
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
				playerId: undefined, // Will be set after player creation
				followerCount: 0,
				followingCount: 0,
				postCount: 0,
				isPrivate: false,
				allowMessages: true,
				lastActive: now,
			});
			user = await ctx.db.get(userId);
			if (!user) {
				throw new Error("Failed to retrieve created user");
			}
			console.log("[syncUserToCustomTable] User created in custom users table:", userId);
			
			// Create player profile for the new user
			if (!user.playerId) {
				// Check if player already exists for this user
				const existingPlayer = await ctx.db
					.query("players")
					.withIndex("by_user", (q) => q.eq("userId", user?._id as unknown as Id<"users">))
					.first();
				
				if (!existingPlayer) {
					// Create player profile
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
							lastUpdated: now,
						});
					}
					
					console.log("[syncUserToCustomTable] Player profile created for user:", userId);
					// Refresh user to get updated playerId
					user = await ctx.db.get(userId);
				} else {
					// Link existing player to user
					await ctx.db.patch(user._id, {
						playerId: existingPlayer._id,
						updatedAt: now,
					});
					console.log("[syncUserToCustomTable] Linked existing player to user:", userId);
					user = await ctx.db.get(userId);
				}
			}
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
			
			// Ensure player profile exists for existing user
			if (user && !user.playerId) {
				// Check if player already exists for this user (user is not null here due to check above)
				const userId = user._id;
				const userName = user.name;
				const userEmail = user.email;
				const userImage = user.image;
				const existingPlayer = await ctx.db
					.query("players")
					.withIndex("by_user", (q) => q.eq("userId", userId))
					.first();
				
				if (!existingPlayer) {
					// Create player profile
					const playerId = await ctx.db.insert("players", {
						name: userName || userEmail?.split("@")[0] || "Player",
						userId: userId,
						bio: null,
						avatarUrl: userImage ?? null,
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
							lastUpdated: now,
						});
					}
					
					console.log("[syncUserToCustomTable] Player profile created for existing user:", userId);
					// Refresh user to get updated playerId
					user = await ctx.db.get(userId);
				} else {
					// Link existing player to user
					await ctx.db.patch(userId, {
						playerId: existingPlayer._id,
						updatedAt: now,
					});
					console.log("[syncUserToCustomTable] Linked existing player to user:", userId);
					user = await ctx.db.get(userId);
				}
			}
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

// Ensure user exists in custom table and has player profile (idempotent)
// This is a fallback for OAuth flows where onCreate hook might not fire
export const ensureUserExists = mutation({
	args: {},
	handler: async (ctx) => {
		const authUser = await authClient.getAuthUser(ctx);
		if (!authUser) {
			throw new Error("Not authenticated");
		}

		const betterAuthId = authUser._id as unknown as string;
		const now = Date.now();

		// Check if user exists in custom users table
		let user = await ctx.db
			.query("users")
			.withIndex("by_betterAuthId", (q) => q.eq("betterAuthId", betterAuthId))
			.first();

		// If not found, try by email
		if (!user) {
			user = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", authUser.email))
				.first();
		}

		// Create user if doesn't exist (reusing logic from onCreate hook)
		if (!user) {
			console.log("[ensureUserExists] Creating user in custom users table:", authUser._id, authUser.email);

			// Generate username if not provided, ensuring uniqueness
			const baseUsername = (authUser as any)?.username || authUser.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || "user";
			let username = baseUsername;
			let usernameCounter = 1;
			
			// Ensure username is unique
			while (await ctx.db
				.query("users")
				.withIndex("by_username", (q) => q.eq("username", username))
				.first()) {
				username = `${baseUsername}${usernameCounter}`;
				usernameCounter++;
			}
			
			const displayName = authUser.name || authUser.email?.split("@")[0] || "User";
			
			const userId = await ctx.db.insert("users", {
				name: authUser.name,
				email: authUser.email,
				betterAuthId: betterAuthId,
				emailVerified: authUser.emailVerified ?? false,
				image: authUser.image ?? undefined,
				createdAt: authUser.createdAt ?? now,
				updatedAt: authUser.updatedAt ?? now,
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
			console.log("[ensureUserExists] User created in custom users table with ID:", userId);

			// If user has a Google image URL, schedule upload to Convex storage
			if (authUser.image && (
				authUser.image.startsWith("https://lh3.googleusercontent.com") ||
				(authUser.image.startsWith("https://") && authUser.image.includes("googleusercontent"))
			)) {
				console.log("[ensureUserExists] Scheduling Google profile image upload for user:", userId);
				// Actions are public, so use api.auth
				await ctx.scheduler.runAfter(0, api.auth.uploadGoogleProfileImageAction, {
					imageUrl: authUser.image,
					userId: userId,
				});
			}
		} else {
			// Update existing user with betterAuthId if missing
			if (!user.betterAuthId) {
				await ctx.db.patch(user._id, {
					betterAuthId: betterAuthId,
					updatedAt: now,
				});
			}
		}

		if (!user) {
			throw new Error("Failed to create or retrieve user");
		}

		// Ensure player profile exists (reusing logic from onCreate hook)
		if (user.playerId) {
			const existingPlayer = await ctx.db.get(user.playerId);
			if (existingPlayer) {
				return { user, player: existingPlayer };
			}
		}

		// Check if player already exists for this user
		const existingPlayer = await ctx.db
			.query("players")
			.withIndex("by_user", (q) => q.eq("userId", user._id))
			.first();

		if (existingPlayer) {
			// Link existing player to user
			if (!user.playerId) {
				await ctx.db.patch(user._id, {
					playerId: existingPlayer._id,
					updatedAt: now,
				});
			}
			return { user, player: existingPlayer };
		}

		// Create player profile
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

		await ctx.db.patch(user._id, {
			playerId: playerId,
			updatedAt: now,
		});

		// Create initial player stats if they don't exist
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
				lastUpdated: now,
			});
		}

		const player = await ctx.db.get(playerId);
		return { user, player };
	},
});