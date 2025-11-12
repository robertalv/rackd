import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
	users: defineTable({
		email: v.string(),
		emailVerified: v.boolean(),
		betterAuthId: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),

		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		name: v.optional(v.string()),
		nickname: v.optional(v.string()),
		phoneNumber: v.optional(v.string()),

		username: v.string(),
		displayName: v.string(),
		bio: v.optional(v.string()),
		image: v.optional(v.string()),
		coverImage: v.optional(v.string()),

		city: v.optional(v.string()),
		region: v.optional(v.string()),
		country: v.optional(v.string()),

		playerId: v.optional(v.id("players")),

		followerCount: v.number(),
		followingCount: v.number(),
		postCount: v.number(),

		isPrivate: v.boolean(),
		allowMessages: v.boolean(),

		interests: v.optional(v.array(v.string())),

		lastActive: v.number(),

		role: v.optional(v.string()),
		banned: v.optional(v.boolean()),
		banReason: v.optional(v.string()),
		banExpires: v.optional(v.number()),
		onboardingComplete: v.boolean(),
		paymentsCustomerId: v.optional(v.string()),
		locale: v.optional(v.string()),
	})
		.index("by_email", ["email"])
		.index("by_username", ["username"])
		.index("email_name", ["email", "name"])
		.index("by_player", ["playerId"])
		.index("by_betterAuthId", ["betterAuthId"]),

	sessions: defineTable({
		expiresAt: v.number(),
		token: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
		ipAddress: v.optional(v.union(v.null(), v.string())),
		userAgent: v.optional(v.union(v.null(), v.string())),
		userId: v.id("users"),
		impersonatedBy: v.optional(v.union(v.null(), v.string())),
		activeOrganizationId: v.optional(v.union(v.null(), v.string())),
	})
		.index("by_user", ["userId"])
		.index("by_token", ["token"])
		.index("expiresAt", ["expiresAt"])
		.index("expiresAt_userId", ["expiresAt", "userId"]),

	accounts: defineTable({
		accountId: v.string(),
		providerId: v.string(),
		userId: v.id("users"),
		accessToken: v.optional(v.union(v.null(), v.string())),
		refreshToken: v.optional(v.union(v.null(), v.string())),
		idToken: v.optional(v.union(v.null(), v.string())),
		expiresAt: v.optional(v.union(v.null(), v.number())),
		password: v.optional(v.union(v.null(), v.string())),
		accessTokenExpiresAt: v.optional(v.union(v.null(), v.number())),
		refreshTokenExpiresAt: v.optional(v.union(v.null(), v.number())),
		scope: v.optional(v.union(v.null(), v.string())),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_user", ["userId"])
		.index("accountId", ["accountId"])
		.index("accountId_providerId", ["accountId", "providerId"])
		.index("providerId_userId", ["providerId", "userId"]),

	verifications: defineTable({
		identifier: v.string(),
		value: v.string(),
		expiresAt: v.number(),
		createdAt: v.optional(v.union(v.null(), v.number())),
		updatedAt: v.optional(v.union(v.null(), v.number())),
	})
		.index("by_identifier", ["identifier"])
		.index("expiresAt", ["expiresAt"]),

	passkeys: defineTable({
		name: v.optional(v.union(v.null(), v.string())),
		publicKey: v.string(),
		userId: v.id("users"),
		credentialID: v.string(),
		counter: v.number(),
		deviceType: v.string(),
		backedUp: v.boolean(),
		transports: v.optional(v.union(v.null(), v.string())),
		createdAt: v.optional(v.union(v.null(), v.number())),
	})
		.index("by_user", ["userId"])
		.index("by_credential_id", ["credentialID"]),

	notifications: defineTable({
		userId: v.id("users"),
		type: v.union(
			v.literal("follow"),
			v.literal("like"),
			v.literal("comment"),
			v.literal("mention"),
			v.literal("tournament_invite"),
			v.literal("tournament_start"),
			v.literal("match_ready"),
			v.literal("match_result"),
		),
		actorId: v.optional(v.id("users")),
		postId: v.optional(v.id("posts")),
		commentId: v.optional(v.id("comments")),
		tournamentId: v.optional(v.id("tournaments")),
		matchId: v.optional(v.id("matches")),
		read: v.boolean(),
	})
		.index("by_user", ["userId"])
		.index("by_user_and_read", ["userId", "read"]),

	players: defineTable({
		name: v.string(),
		userId: v.optional(v.id("users")),
		fargoId: v.optional(v.union(v.null(), v.string())),
		fargoReadableId: v.optional(v.union(v.null(), v.string())),
		fargoMembershipId: v.optional(v.union(v.null(), v.string())),
		fargoRating: v.optional(v.union(v.null(), v.number())),
		fargoRobustness: v.optional(v.union(v.null(), v.number())),
		league: v.optional(
			v.union(
				v.null(),
				v.literal("APA"),
				v.literal("BCA"),
				v.literal("NAPA"),
				v.literal("OTHER"),
			),
		),
		apaId: v.optional(v.union(v.null(), v.string())),
		apaSkillLevel: v.optional(v.union(v.null(), v.number())),
		bcaId: v.optional(v.union(v.null(), v.string())),
		bio: v.optional(v.union(v.null(), v.string())),
		avatarUrl: v.optional(v.union(v.null(), v.string())),
		homeVenue: v.optional(v.union(v.null(), v.string())),
		homeRoom: v.optional(v.union(v.null(), v.string())),
		city: v.optional(v.union(v.null(), v.string())),
		isVerified: v.boolean(),
		updatedAt: v.optional(v.union(v.null(), v.number())),
  })
    .index("by_user", ["userId"])
    .index("by_fargo_id", ["fargoId"])
    .index("by_name", ["name"]),

  playerStats: defineTable({
    playerId: v.id("players"),
    totalMatches: v.number(),
    wins: v.number(),
    losses: v.number(),
    tournamentsPlayed: v.number(),
    tournamentsWon: v.number(),
    averageScore: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_player", ["playerId"]),

	follows: defineTable({
		followerId: v.id("users"),
		followingId: v.id("users"),
	})
		.index("by_follower", ["followerId"])
		.index("by_following", ["followingId"])
		.index("by_relationship", ["followerId", "followingId"]),

	posts: defineTable({
		userId: v.id("users"),
		content: v.string(),

		images: v.optional(v.array(v.string())),
		video: v.optional(v.string()),

		tournamentId: v.optional(v.id("tournaments")),
		matchId: v.optional(v.id("matches")),
		venueId: v.optional(v.id("venues")),

		type: v.union(
			v.literal("post"),
			v.literal("highlight"),
			v.literal("tournament_update"),
			v.literal("result"),
		),

		likeCount: v.number(),
		commentCount: v.number(),
		shareCount: v.number(),

		isPublic: v.boolean(),
		isPinned: v.optional(v.boolean()),

		updatedAt: v.optional(v.number()),
	})
		.index("by_user", ["userId"])
		.index("by_tournament", ["tournamentId"])
		.index("by_type", ["type"]),

	postLikes: defineTable({
		postId: v.id("posts"),
		userId: v.id("users"),
	})
		.index("by_post", ["postId"])
		.index("by_user", ["userId"])
		.index("by_post_and_user", ["postId", "userId"]),

	comments: defineTable({
		postId: v.id("posts"),
		userId: v.id("users"),
		content: v.string(),
		parentId: v.optional(v.id("comments")),
		likeCount: v.number(),
	})
		.index("by_post", ["postId"])
		.index("by_user", ["userId"])
		.index("by_parent", ["parentId"]),

	commentLikes: defineTable({
		commentId: v.id("comments"),
		userId: v.id("users"),
	})
		.index("by_comment", ["commentId"])
		.index("by_user", ["userId"])
		.index("by_comment_and_user", ["commentId", "userId"]),

	hashtags: defineTable({
		tag: v.string(),
		displayTag: v.string(),
		useCount: v.number(),
		firstUsed: v.number(),
		lastUsed: v.number(),
	})
		.index("by_tag", ["tag"])
		.index("by_use_count", ["useCount"])
		.index("by_last_used", ["lastUsed"]),

	commentHashtags: defineTable({
		commentId: v.id("comments"),
		hashtagId: v.id("hashtags"),
		position: v.number(),
	})
		.index("by_comment", ["commentId"])
		.index("by_hashtag", ["hashtagId"])
		.index("by_comment_and_hashtag", ["commentId", "hashtagId"]),

	postHashtags: defineTable({
		postId: v.id("posts"),
		hashtagId: v.id("hashtags"),
		position: v.number(),
	})
		.index("by_post", ["postId"])
		.index("by_hashtag", ["hashtagId"])
		.index("by_post_and_hashtag", ["postId", "hashtagId"]),

	venues: defineTable({
		name: v.string(),
		organizerId: v.optional(v.id("users")),

		type: v.union(
			v.literal("residence"),
			v.literal("business"),
			v.literal("pool_hall"),
			v.literal("sports_facility"),
			v.literal("bar"),
			v.literal("other"),
		),

		address: v.string(),
		city: v.string(),
		region: v.string(),
		country: v.string(),
		coordinates: v.optional(
			v.union(
				v.null(),
				v.object({
					lat: v.number(),
					lng: v.number(),
				}),
			),
		),

		description: v.optional(v.union(v.null(), v.string())),
		images: v.optional(v.union(v.null(), v.array(v.string()))),
		socialLinks: v.optional(
			v.union(
				v.null(),
				v.array(
					v.object({
						platform: v.string(),
						url: v.string(),
						icon: v.string(),
					}),
				),
			),
		),

		tableCount: v.optional(v.union(v.null(), v.number())),
		hasBar: v.optional(v.union(v.null(), v.boolean())),
		hasFood: v.optional(v.union(v.null(), v.boolean())),

		phone: v.optional(v.union(v.null(), v.string())),
		website: v.optional(v.union(v.null(), v.string())),
		email: v.optional(v.union(v.null(), v.string())),

		followerCount: v.number(),
		operatingHours: v.optional(v.union(v.null(), v.string())),
		access: v.union(
			v.literal("public"),
			v.literal("private"),
			v.literal("membership_needed"),
		),
	})
		.index("by_name", ["name"])
		.index("by_city", ["city"])
		.index("by_type", ["type"])
		.index("by_organizer", ["organizerId"]),

	tables: defineTable({
		venueId: v.optional(v.id("venues")),
		tournamentId: v.optional(v.id("tournaments")),
		label: v.optional(v.union(v.null(), v.string())),
		startNumber: v.number(),
		endNumber: v.number(),
		manufacturer: v.union(
			v.literal("Aileex"),
			v.literal("Blackball"),
			v.literal("Brunswick"),
			v.literal("Diamond"),
			v.literal("Gabriels"),
			v.literal("Heiron & Smith"),
			v.literal("Imperial"),
			v.literal("Joy"),
			v.literal("Min"),
			v.literal("Olhausen"),
			v.literal("Olio"),
			v.literal("Pot Black"),
			v.literal("Predator"),
			v.literal("Rasson"),
			v.literal("Shender"),
			v.literal("Star"),
			v.literal("Supreme"),
			v.literal("Valley"),
			v.literal("Wiraka"),
			v.literal("Xing Pai"),
			v.literal("Other"),
		),
		size: v.union(
			v.literal("6.5 Foot"),
			v.literal("7 Foot"),
			v.literal("8 Foot"),
			v.literal("9 Foot"),
			v.literal("10 Foot"),
			v.literal("12 Foot"),
		),
		isLiveStreaming: v.optional(v.union(v.null(), v.boolean())),
		liveStreamUrl: v.optional(v.union(v.null(), v.string())),
		status: v.optional(
			v.union(
				v.null(),
				v.literal("OPEN"),
				v.literal("CLOSED"),
				v.literal("IN_USE"),
			),
		),
		organizerId: v.id("users"),
		isEnabled: v.boolean(),
	})
		.index("by_venue", ["venueId"])
		.index("by_tournament", ["tournamentId"])
		.index("by_organizer", ["organizerId"]),

	tournamentTemplates: defineTable({
		name: v.string(),
		organizerId: v.id("users"),
		type: v.union(
			v.literal("single"),
			v.literal("double"),
			v.literal("scotch_double"),
			v.literal("teams"),
			v.literal("round_robin"),
		),
		playerType: v.union(
			v.literal("singles"),
			v.literal("doubles"),
			v.literal("scotch_doubles"),
			v.literal("teams"),
		),
		gameType: v.union(
			v.literal("eight_ball"),
			v.literal("nine_ball"),
			v.literal("ten_ball"),
			v.literal("one_pocket"),
			v.literal("bank_pool"),
		),
		bracketOrdering: v.union(
			v.literal("random_draw"),
			v.literal("seeded_draw"),
		),
		winnersRaceTo: v.optional(v.union(v.null(), v.number())),
		losersRaceTo: v.optional(v.union(v.null(), v.number())),
		maxPlayers: v.optional(v.union(v.null(), v.number())),
		entryFee: v.optional(v.union(v.null(), v.number())),
		venueId: v.optional(v.id("venues")),
		description: v.optional(v.union(v.null(), v.string())),
	})
		.index("by_organizer", ["organizerId"])
		.index("by_name", ["name"]),

	tournaments: defineTable({
		name: v.string(),
		organizerId: v.id("users"),

		date: v.number(),
		type: v.union(
			v.literal("single"),
			v.literal("double"),
			v.literal("scotch_double"),
			v.literal("teams"),
			v.literal("round_robin"),
		),
		playerType: v.union(
			v.literal("singles"),
			v.literal("doubles"),
			v.literal("scotch_doubles"),
			v.literal("teams"),
		),
		gameType: v.union(
			v.literal("eight_ball"),
			v.literal("nine_ball"),
			v.literal("ten_ball"),
			v.literal("one_pocket"),
			v.literal("bank_pool"),
		),
		bracketOrdering: v.union(
			v.literal("random_draw"),
			v.literal("seeded_draw"),
		),
		winnersRaceTo: v.optional(v.union(v.null(), v.number())),
		losersRaceTo: v.optional(v.union(v.null(), v.number())),

		venueId: v.optional(v.id("venues")),
		venue: v.optional(v.union(v.null(), v.string())),

		description: v.optional(v.union(v.null(), v.string())),
		flyerUrl: v.optional(v.union(v.null(), v.string())),

		maxPlayers: v.optional(v.union(v.null(), v.number())),
		entryFee: v.optional(v.union(v.null(), v.number())),
		requiresApproval: v.boolean(),
		allowSelfRegistration: v.boolean(),

		status: v.union(
			v.literal("draft"),
			v.literal("upcoming"),
			v.literal("active"),
			v.literal("completed"),
		),

		registeredCount: v.number(),
		viewCount: v.number(),

		isPublic: v.boolean(),
		isFeatured: v.boolean(),

		houseFeePerPlayer: v.optional(v.union(v.null(), v.number())),
		payoutStructure: v.optional(
			v.union(
				v.null(),
				v.object({
					totalCollected: v.number(),
					houseFee: v.number(),
					potAmount: v.number(),
					paidPlayers: v.number(),
					payouts: v.array(
						v.object({
							place: v.number(),
							amount: v.number(),
							percentage: v.number(),
						})
					),
					rationale: v.optional(v.string()),
				}),
			),
		),

		updatedAt: v.optional(v.union(v.null(), v.number())),
	})
		.index("by_organizer", ["organizerId"])
		.index("by_status", ["status"])
		.index("by_date", ["date"])
		.index("by_venue", ["venueId"])
		.index("by_featured", ["isFeatured"]),

	tournamentPlayers: defineTable({
		tournamentId: v.id("tournaments"),
		playerId: v.id("players"),
		seed: v.optional(v.union(v.null(), v.number())),
		checkedIn: v.boolean(),
	})
		.index("by_tournament", ["tournamentId"])
		.index("by_player", ["playerId"])
		.index("by_tournament_and_player", ["tournamentId", "playerId"]),

	tournamentRegistrations: defineTable({
		tournamentId: v.id("tournaments"),
		playerId: v.id("players"),
		userId: v.id("users"),

		status: v.union(
			v.literal("pending"),
			v.literal("approved"),
			v.literal("rejected"),
			v.literal("withdrawn"),
		),

		seed: v.optional(v.union(v.null(), v.number())),
		checkedIn: v.boolean(),
		checkInTime: v.optional(v.union(v.null(), v.number())),

		paymentStatus: v.optional(
			v.union(
				v.null(),
				v.literal("pending"),
				v.literal("paid"),
				v.literal("refunded"),
			),
		),

		updatedAt: v.optional(v.union(v.null(), v.number())),
	})
		.index("by_tournament", ["tournamentId"])
		.index("by_player", ["playerId"])
		.index("by_user", ["userId"])
		.index("by_tournament_and_status", ["tournamentId", "status"]),

	tournamentManagers: defineTable({
		tournamentId: v.id("tournaments"),
		userId: v.id("users"),
		role: v.union(
			v.literal("manager"),
			v.literal("admin"),
		),
		accepted: v.boolean(),
		invitedBy: v.id("users"),
		invitedAt: v.number(),
		acceptedAt: v.optional(v.union(v.null(), v.number())),
	})
		.index("by_tournament", ["tournamentId"])
		.index("by_user", ["userId"])
		.index("by_tournament_and_user", ["tournamentId", "userId"]),

	matches: defineTable({
		tournamentId: v.id("tournaments"),
		player1Id: v.optional(v.id("players")),
		player2Id: v.optional(v.id("players")),
		winnerId: v.optional(v.id("players")),
		round: v.number(),
		bracketPosition: v.number(),
		player1Score: v.number(),
		player2Score: v.number(),
		tableNumber: v.optional(v.union(v.null(), v.number())),
		status: v.union(
			v.literal("pending"),
			v.literal("in_progress"),
			v.literal("completed"),
		),

		highlightPostId: v.optional(v.id("posts")),

		completedAt: v.optional(v.union(v.null(), v.number())),
		nextLooserMatchId: v.optional(v.id("matches")),
		nextMatchId: v.optional(v.id("matches")),
		bracketType: v.optional(
			v.union(
				v.null(),
				v.literal("winner"),
				v.literal("loser"),
				v.literal("grand_final"),
			),
		),
	})
		.index("by_tournament", ["tournamentId"])
		.index("by_player1", ["player1Id"])
		.index("by_player2", ["player2Id"])
		.index("by_status", ["status"])
		.index("by_bracket_type", ["tournamentId", "bracketType"])
		.index("by_round", ["tournamentId", "round"])
		.index("by_bracket_position", ["tournamentId", "bracketPosition"]),

};

const schema = defineSchema(tables);

export default schema;
