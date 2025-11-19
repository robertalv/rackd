import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserIdOrThrow } from "./lib/utils";
import { CounterHelpers } from "./counters";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { attach, check, track } from "./autumn";
import type { DatabaseReader } from "./_generated/server";

async function isOrganizerOrManager(
  ctx: { db: DatabaseReader },
  tournamentId: Id<"tournaments">,
  userId: Id<"users">
): Promise<{ isAuthorized: boolean; isOrganizer: boolean; isManager: boolean }> {
  const tournament = await ctx.db.get(tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const isOrganizer = tournament.organizerId === userId;
  
  if (isOrganizer) {
    return { isAuthorized: true, isOrganizer: true, isManager: false };
  }

  const managers = await ctx.db
    .query("tournamentManagers")
    .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
    .collect();
  
  const isManager = managers.some(
    (m) => m.userId === userId && m.accepted && (m.role === "admin" || m.role === "manager")
  );

  return { 
    isAuthorized: isManager, 
    isOrganizer: false, 
    isManager 
  };
}

export const getAllTournaments = query({
  args: { 
    query: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tournaments = await ctx.db
      .query("tournaments")
      .collect();

    // Get venue and organizer info for each tournament
    let tournamentsWithVenues = await Promise.all(
      tournaments.map(async (tournament) => {
        let venue = null;
        if (tournament.venueId) {
          venue = await ctx.db.get(tournament.venueId);
        }

        let organizer = null;
        if (tournament.organizerId) {
          organizer = await ctx.db.get(tournament.organizerId);
        }

        return {
          ...tournament,
          venue: venue ? {
            name: venue.name,
            city: venue.city,
            region: venue.region,
            country: venue.country,
          } : null,
          organizerName: organizer?.name || "Unknown",
        };
      })
    );

    // Apply search query filter if provided
    if (args.query && args.query.length > 0) {
      const searchTerm = args.query.toLowerCase();
      tournamentsWithVenues = tournamentsWithVenues.filter((tournament: any) => {
        const nameMatch = tournament.name.toLowerCase().includes(searchTerm);
        const venueMatch = tournament.venue?.name?.toLowerCase().includes(searchTerm);
        const venueCityMatch = tournament.venue?.city?.toLowerCase().includes(searchTerm);
        return nameMatch || venueMatch || venueCityMatch;
      });
    }

    return tournamentsWithVenues;
  },
});

// List tournaments with filters
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("completed")
    )),
    organizerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let tournaments;
    
    if (args.status) {
      tournaments = await ctx.db
        .query("tournaments")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.organizerId) {
      tournaments = await ctx.db
        .query("tournaments")
        .withIndex("by_organizer", (q) => q.eq("organizerId", args.organizerId!))
        .collect();
    } else {
      tournaments = await ctx.db
        .query("tournaments")
        .collect();
    }

    // Get venue and organizer info for each tournament
    return await Promise.all(
      tournaments.map(async (tournament) => {
        let venue = null;
        if (tournament.venueId) {
          venue = await ctx.db.get(tournament.venueId);
        }

        let organizer = null;
        if (tournament.organizerId) {
          organizer = await ctx.db.get(tournament.organizerId);
        }

        return {
          ...tournament,
          venue: venue ? {
            name: venue.name,
            city: venue.city,
            region: venue.region,
            country: venue.country,
          } : null,
          organizerName: organizer?.name || "Unknown",
        };
      })
    );
  },
});

// Create tournament
export const create = mutation({
  args: {
    name: v.string(),
    date: v.number(),
    type: v.union(
      v.literal("single"),
      v.literal("double"),
      v.literal("scotch_double"),
      v.literal("teams"),
      v.literal("round_robin")
    ),
    playerType: v.union(
      v.literal("singles"),
      v.literal("doubles"),
      v.literal("scotch_doubles"),
      v.literal("teams")
    ),
    gameType: v.union(
      v.literal("eight_ball"),
      v.literal("nine_ball"),
      v.literal("ten_ball"),
      v.literal("one_pocket"),
      v.literal("bank_pool")
    ),
    bracketOrdering: v.union(
      v.literal("random_draw"),
      v.literal("seeded_draw")
    ),
    winnersRaceTo: v.optional(v.number()),
    losersRaceTo: v.optional(v.number()),
    venueId: v.optional(v.id("venues")),
    venue: v.optional(v.string()),
    description: v.optional(v.string()),
    flyerUrl: v.optional(v.string()),
    maxPlayers: v.optional(v.number()),
    entryFee: v.optional(v.number()),
    createPost: v.optional(v.boolean()),
    turnstileToken: v.optional(v.string()),
    tables: v.optional(
      v.array(
        v.object({
          label: v.optional(v.string()),
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
          isLiveStreaming: v.optional(v.boolean()),
          liveStreamUrl: v.optional(v.string()),
          status: v.optional(
            v.union(
              v.literal("OPEN"),
              v.literal("CLOSED"),
              v.literal("IN_USE"),
            ),
          ),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const unlimitedCheck = await check(ctx, {
      featureId: "unlimited_tournaments",
    });

    if (!unlimitedCheck.data?.allowed) {
      // User is on free plan, check tournament count
      const existingTournaments = await ctx.db
        .query("tournaments")
        .withIndex("by_organizer", (q) => q.eq("organizerId", userId))
        .collect();

      if (existingTournaments.length >= 3) {
        throw new Error(
          "Free plan allows up to 3 tournaments. Please upgrade to create unlimited tournaments."
        );
      }
    }

    // Verify Turnstile token if provided
    if (args.turnstileToken) {
      const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
      if (secretKey) {
        try {
          const formData = new FormData();
          formData.append("secret", secretKey);
          formData.append("response", args.turnstileToken);

          const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error("Turnstile verification request failed");
          }

          const result = (await response.json()) as {
            success: boolean;
            error_codes?: string[];
          };

          if (!result.success || result.error_codes?.length) {
            throw new Error(`Turnstile verification failed: ${result.error_codes?.join(", ") || "Unknown error"}`);
          }
        } catch (error) {
          console.error("Turnstile verification failed:", error);
          throw new Error("Verification failed. Please try again.");
        }
      }
    }

    const tournamentId = await ctx.db.insert("tournaments", {
      name: args.name,
      organizerId: userId,
      date: args.date,
      type: args.type,
      playerType: args.playerType,
      gameType: args.gameType,
      bracketOrdering: args.bracketOrdering,
      winnersRaceTo: args.winnersRaceTo ?? null,
      losersRaceTo: args.losersRaceTo ?? null,
      venueId: args.venueId ?? undefined,
      venue: args.venue ?? null,
      description: args.description ?? null,
      flyerUrl: args.flyerUrl ?? null,
      maxPlayers: args.maxPlayers ?? null,
      entryFee: args.entryFee ?? null,
      requiresApproval: false,
      allowSelfRegistration: true,
      status: args.date > Date.now() ? "upcoming" : "draft",
      registeredCount: 0,
      viewCount: 0,
      isPublic: true,
      isFeatured: false,
      updatedAt: Date.now(),
    });

    await track(ctx, {
      featureId: "tournament_creation",
      quantity: 1,
    });

    await attach(ctx, {
      entityId: tournamentId,
      entityType: "tournament",
    });

    if (args.date > Date.now()) {
      await ctx.scheduler.runAt(args.date, internal.tournaments.activateTournament, {
        tournamentId,
      });
    } else {
      await ctx.db.patch(tournamentId, {
        status: "active",
      });
    }

    if (args.tables && args.tables.length > 0) {
      for (const tableConfig of args.tables) {
        for (let tableNumber = tableConfig.startNumber; tableNumber <= tableConfig.endNumber; tableNumber++) {
          await ctx.db.insert("tables", {
            tournamentId: tournamentId,
            venueId: args.venueId ?? undefined,
            label: tableConfig.label ?? null,
            startNumber: tableNumber,
            endNumber: tableNumber,
            manufacturer: tableConfig.manufacturer,
            size: tableConfig.size,
            isLiveStreaming: tableConfig.isLiveStreaming ?? null,
            liveStreamUrl: tableConfig.liveStreamUrl ?? null,
            status: tableConfig.status ?? "OPEN",
            organizerId: userId,
            isEnabled: true,
          });
        }
      }
    }

    if (args.createPost) {
      let venueInfo = "";
      if (args.venueId) {
        const venue = await ctx.db.get(args.venueId);
        if (venue) {
          venueInfo = `\n📍 Venue: ${venue.name}`;
          if (venue.city) {
            venueInfo += `, ${venue.city}`;
          }
        }
      } else if (args.venue) {
        venueInfo = `\n📍 Venue: ${args.venue}`;
      }

      const gameTypeLabels: Record<string, string> = {
        eight_ball: "8-Ball",
        nine_ball: "9-Ball",
        ten_ball: "10-Ball",
        one_pocket: "One Pocket",
        bank_pool: "Bank Pool",
      };

      const typeLabels: Record<string, string> = {
        single: "Singles",
        double: "Doubles",
        scotch_double: "Scotch Doubles",
        teams: "Teams",
        round_robin: "Round Robin",
      };

      const dateStr = new Date(args.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let postContent = `🎱 New Tournament: ${args.name}\n\n`;
      postContent += `📅 Date: ${dateStr}\n`;
      postContent += `🎯 Game Type: ${gameTypeLabels[args.gameType] || args.gameType}\n`;
      postContent += `👥 Format: ${typeLabels[args.type] || args.type}\n`;
      
      if (args.entryFee) {
        postContent += `💰 Entry Fee: $${args.entryFee}\n`;
      }
      
      if (args.maxPlayers) {
        postContent += `👤 Max Players: ${args.maxPlayers}\n`;
      }
      
      if (venueInfo) {
        postContent += venueInfo;
      }
      
      if (args.description) {
        postContent += `\n\n${args.description}`;
      }
      
      postContent += `\n\n🔗 View tournament: /tournaments/${tournamentId}`;

      const images: string[] = [];
      if (args.flyerUrl) {
        if (!args.flyerUrl.startsWith("http")) {
          images.push(args.flyerUrl);
        } else {
          images.push(args.flyerUrl);
        }
      }

      const postId = await ctx.db.insert("posts", {
        userId,
        content: postContent,
        images: images.length > 0 ? images : undefined,
        tournamentId,
        venueId: args.venueId ?? undefined,
        type: "tournament_update",
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        isPublic: true,
      });

      await CounterHelpers.incrementUserPosts(ctx, userId);

      const hashtagRegex = /#([A-Za-z0-9_]+)/g;
      const hashtags = [];
      let hashtagMatch;
      let position = 0;
      
      while ((hashtagMatch = hashtagRegex.exec(postContent)) !== null) {
        const originalTag = hashtagMatch[1];
        const normalizedTag = originalTag.toLowerCase();
        hashtags.push({
          original: originalTag,
          normalized: normalizedTag,
          position: position++
        });
      }
      
      if (hashtags.length > 0) {
        const now = Date.now();
        
        for (const hashtag of hashtags) {
          let existingHashtag = await ctx.db
            .query("hashtags")
            .withIndex("by_tag", q => q.eq("tag", hashtag.normalized))
            .first();
          
          let hashtagId;
          
          if (existingHashtag) {
            hashtagId = existingHashtag._id;
            await ctx.db.patch(hashtagId, {
              useCount: existingHashtag.useCount + 1,
              lastUsed: now,
              displayTag: hashtag.original.length > existingHashtag.displayTag.length ? 
                hashtag.original : existingHashtag.displayTag
            });
          } else {
            hashtagId = await ctx.db.insert("hashtags", {
              tag: hashtag.normalized,
              displayTag: hashtag.original,
              useCount: 1,
              firstUsed: now,
              lastUsed: now,
            });
          }
          
          await ctx.db.insert("postHashtags", {
            postId,
            hashtagId,
            position: hashtag.position,
          });
        }
      }
    }

    return tournamentId;
  },
});

export const getById = query({
  args: { id: v.id("tournaments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Delete tournament and all related data
export const deleteTournament = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Check if user is organizer or manager
    const { isAuthorized } = await isOrganizerOrManager(ctx, args.tournamentId, userId);
    if (!isAuthorized) {
      throw new Error("Only tournament organizers and managers can delete tournaments");
    }

    // Delete all related data in the correct order

    // 1. Delete tournament registrations
    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    for (const registration of registrations) {
      await ctx.db.delete(registration._id);
    }

    // 2. Delete matches
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    for (const match of matches) {
      await ctx.db.delete(match._id);
    }

    // 3. Delete tournament managers
    const managers = await ctx.db
      .query("tournamentManagers")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    for (const manager of managers) {
      await ctx.db.delete(manager._id);
    }

    // 4. Delete tables associated with the tournament
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    for (const table of tables) {
      await ctx.db.delete(table._id);
    }

    // 5. Delete notifications related to the tournament
    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("tournamentId"), args.tournamentId))
      .collect();
    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // 6. Delete posts related to the tournament (optional - posts might want to keep references)
    // Uncomment if you want to delete posts when tournament is deleted
    // const posts = await ctx.db
    //   .query("posts")
    //   .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
    //   .collect();
    // for (const post of posts) {
    //   await ctx.db.delete(post._id);
    // }

    // 7. Finally, delete the tournament itself
    await ctx.db.delete(args.tournamentId);

    return { success: true };
  },
});

// Update tournament
export const update = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    name: v.optional(v.string()),
    date: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("single"),
      v.literal("double"),
      v.literal("scotch_double"),
      v.literal("teams"),
      v.literal("round_robin")
    )),
    playerType: v.optional(v.union(
      v.literal("singles"),
      v.literal("doubles"),
      v.literal("scotch_doubles"),
      v.literal("teams")
    )),
    gameType: v.optional(v.union(
      v.literal("eight_ball"),
      v.literal("nine_ball"),
      v.literal("ten_ball"),
      v.literal("one_pocket"),
      v.literal("bank_pool")
    )),
    bracketOrdering: v.optional(v.union(
      v.literal("random_draw"),
      v.literal("seeded_draw")
    )),
    winnersRaceTo: v.optional(v.union(v.null(), v.number())),
    losersRaceTo: v.optional(v.union(v.null(), v.number())),
    venueId: v.optional(v.union(v.null(), v.id("venues"))),
    venue: v.optional(v.union(v.null(), v.string())),
    description: v.optional(v.union(v.null(), v.string())),
    flyerUrl: v.optional(v.union(v.null(), v.string())),
    maxPlayers: v.optional(v.union(v.null(), v.number())),
    entryFee: v.optional(v.union(v.null(), v.number())),
    requiresApproval: v.optional(v.boolean()),
    allowSelfRegistration: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("completed")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if user is organizer or manager
    const { isAuthorized } = await isOrganizerOrManager(ctx, args.tournamentId, userId);
    if (!isAuthorized) {
      throw new Error("Only tournament organizers and managers can update tournaments");
    }

    const { tournamentId, ...updates } = args;
    
    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.date !== undefined) {
      updateData.date = updates.date;
      // Update status if date changes
      if (updates.date > Date.now() && tournament.status === "draft") {
        updateData.status = "upcoming";
      }
    }
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.playerType !== undefined) updateData.playerType = updates.playerType;
    if (updates.gameType !== undefined) updateData.gameType = updates.gameType;
    if (updates.bracketOrdering !== undefined) updateData.bracketOrdering = updates.bracketOrdering;
    if (updates.winnersRaceTo !== undefined) updateData.winnersRaceTo = updates.winnersRaceTo;
    if (updates.losersRaceTo !== undefined) updateData.losersRaceTo = updates.losersRaceTo;
    if (updates.venueId !== undefined) updateData.venueId = updates.venueId ?? undefined;
    if (updates.venue !== undefined) updateData.venue = updates.venue;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.flyerUrl !== undefined) updateData.flyerUrl = updates.flyerUrl;
    if (updates.maxPlayers !== undefined) updateData.maxPlayers = updates.maxPlayers;
    if (updates.entryFee !== undefined) updateData.entryFee = updates.entryFee;
    if (updates.requiresApproval !== undefined) updateData.requiresApproval = updates.requiresApproval;
    if (updates.allowSelfRegistration !== undefined) updateData.allowSelfRegistration = updates.allowSelfRegistration;
    if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
    if (updates.isFeatured !== undefined) updateData.isFeatured = updates.isFeatured;
    if (updates.status !== undefined) updateData.status = updates.status;

    await ctx.db.patch(args.tournamentId, updateData);

    // If tournament is being marked as completed, calculate and store results for all registrations
    if (updates.status === "completed" && tournament.status !== "completed") {
      await ctx.scheduler.runAfter(0, internal.tournamentRegistrations.calculateTournamentResultsInternal, {
        tournamentId: args.tournamentId,
      });
    }
  },
});

export const getRegistrations = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    return await Promise.all(
      registrations.map(async (registration) => {
        const player = registration.playerId ? await ctx.db.get(registration.playerId) : null;
        const user = registration.userId ? await ctx.db.get(registration.userId) : null;

        return {
          ...registration,
          player,
          user,
        };
      })
    );
  },
});

export const getPlayerCount = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const checkedIn = registrations.filter((r) => r.checkedIn).length;

    return {
      total: registrations.length,
      checkedIn,
    };
  },
});

export const addPlayer = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const allRegistrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    const existing = allRegistrations.find(r => r.playerId === args.playerId);

    if (existing) {
      throw new Error("Player is already registered for this tournament");
    }

    const player = await ctx.db.get(args.playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    await ctx.db.insert("tournamentRegistrations", {
      tournamentId: args.tournamentId,
      playerId: args.playerId,
      userId: player.userId || undefined, // Only set userId if player has a linked account
      status: "approved",
      checkedIn: false,
      seed: null,
      checkInTime: null,
      paymentStatus: null,
      updatedAt: Date.now(),
    });

    const tournament = await ctx.db.get(args.tournamentId);
    if (tournament) {
      await ctx.db.patch(args.tournamentId, {
        registeredCount: tournament.registeredCount + 1,
      });
    }
  },
});

export const getTables = query({
	args: { tournamentId: v.id("tournaments") },
	handler: async (ctx, args) => {
		const tables = await ctx.db
			.query("tables")
			.withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
			.collect();

		return tables.map((table) => ({
			...table,
			tableNumber: table.startNumber,
			status: table.status || "OPEN",
		}));
	},
});

// Add tables to an existing tournament
export const addTables = mutation({
	args: {
		tournamentId: v.id("tournaments"),
		tables: v.array(
			v.object({
				label: v.optional(v.string()),
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
				isLiveStreaming: v.optional(v.boolean()),
				liveStreamUrl: v.optional(v.string()),
				status: v.optional(
					v.union(
						v.literal("OPEN"),
						v.literal("CLOSED"),
						v.literal("IN_USE"),
					),
				),
			}),
		),
	},
	handler: async (ctx, args) => {
		const userId = await getCurrentUserIdOrThrow(ctx);

		// Verify tournament exists and user has permission
		const tournament = await ctx.db.get(args.tournamentId);
		if (!tournament) {
			throw new Error("Tournament not found");
		}

		// Check if user is organizer or manager
		const { isAuthorized } = await isOrganizerOrManager(ctx, args.tournamentId, userId);
		if (!isAuthorized) {
			throw new Error("Only tournament organizers and managers can add tables");
		}

		// Get existing tables to check for conflicts
		const existingTables = await ctx.db
			.query("tables")
			.withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
			.collect();

		const existingTableNumbers = new Set(
			existingTables.flatMap((t) => {
				const numbers: number[] = [];
				for (let i = t.startNumber; i <= t.endNumber; i++) {
					numbers.push(i);
				}
				return numbers;
			})
		);

		// Create individual table entries for each number in the range
		const createdTables: Id<"tables">[] = [];
		for (const tableConfig of args.tables) {
			for (let tableNumber = tableConfig.startNumber; tableNumber <= tableConfig.endNumber; tableNumber++) {
				// Check if table number already exists
				if (existingTableNumbers.has(tableNumber)) {
					console.warn(`Table ${tableNumber} already exists, skipping`);
					continue;
				}

				const tableId = await ctx.db.insert("tables", {
					tournamentId: args.tournamentId,
					venueId: tournament.venueId ?? undefined,
					label: tableConfig.label ?? null,
					startNumber: tableNumber,
					endNumber: tableNumber, // Each individual table has same start and end number
					manufacturer: tableConfig.manufacturer,
					size: tableConfig.size,
					isLiveStreaming: tableConfig.isLiveStreaming ?? null,
					liveStreamUrl: tableConfig.liveStreamUrl ?? null,
					status: tableConfig.status ?? "OPEN",
					organizerId: userId,
					isEnabled: true,
				});

				createdTables.push(tableId);
				existingTableNumbers.add(tableNumber);
			}
		}

		return createdTables;
	},
});

// Delete a table from a tournament
export const deleteTable = mutation({
	args: {
		tableId: v.id("tables"),
	},
	handler: async (ctx, args) => {
		const userId = await getCurrentUserIdOrThrow(ctx);

		const table = await ctx.db.get(args.tableId);
		if (!table) {
			throw new Error("Table not found");
		}

		if (!table.tournamentId) {
			throw new Error("Table is not associated with a tournament");
		}

		const tournamentId = table.tournamentId;
		const tournament = await ctx.db.get(tournamentId);
		if (!tournament) {
			throw new Error("Tournament not found");
		}

		// Check if user is organizer or manager
		const { isAuthorized } = await isOrganizerOrManager(ctx, tournamentId, userId);
		if (!isAuthorized) {
			throw new Error("Only tournament organizers and managers can delete tables");
		}

		// Check if table is currently in use
		if (table.status === "IN_USE") {
			throw new Error("Cannot delete a table that is currently in use");
		}

		await ctx.db.delete(args.tableId);
	},
});

// Update a table
export const updateTable = mutation({
	args: {
		tableId: v.id("tables"),
		label: v.optional(v.string()),
		manufacturer: v.optional(
			v.union(
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
		),
		size: v.optional(
			v.union(
				v.literal("6.5 Foot"),
				v.literal("7 Foot"),
				v.literal("8 Foot"),
				v.literal("9 Foot"),
				v.literal("10 Foot"),
				v.literal("12 Foot"),
			),
		),
		isLiveStreaming: v.optional(v.boolean()),
		liveStreamUrl: v.optional(v.string()),
		status: v.optional(
			v.union(
				v.literal("OPEN"),
				v.literal("CLOSED"),
				v.literal("IN_USE"),
			),
		),
	},
	handler: async (ctx, args) => {
		const userId = await getCurrentUserIdOrThrow(ctx);

		const table = await ctx.db.get(args.tableId);
		if (!table) {
			throw new Error("Table not found");
		}

		// Get tournament to check permissions
		if (!table.tournamentId) {
			throw new Error("Table is not associated with a tournament");
		}

		const tournamentId = table.tournamentId;
		const tournament = await ctx.db.get(tournamentId);
		if (!tournament) {
			throw new Error("Tournament not found");
		}

		// Check if user is organizer or manager
		const { isAuthorized } = await isOrganizerOrManager(ctx, tournamentId, userId);
		if (!isAuthorized) {
			throw new Error("Only tournament organizers and managers can update tables");
		}

		// Build update object with only provided fields
		const updates: any = {};
		if (args.label !== undefined) {
			updates.label = args.label || null;
		}
		if (args.manufacturer !== undefined) {
			updates.manufacturer = args.manufacturer;
		}
		if (args.size !== undefined) {
			updates.size = args.size;
		}
		if (args.isLiveStreaming !== undefined) {
			updates.isLiveStreaming = args.isLiveStreaming || null;
		}
		if (args.liveStreamUrl !== undefined) {
			updates.liveStreamUrl = args.liveStreamUrl || null;
		}
		if (args.status !== undefined) {
			updates.status = args.status;
		}

		await ctx.db.patch(args.tableId, updates);
	},
});

export const removePlayer = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Check if user is organizer or manager
    const { isAuthorized } = await isOrganizerOrManager(ctx, args.tournamentId, userId);
    if (!isAuthorized) {
      throw new Error("Only tournament organizers and managers can remove players");
    }

    const allRegistrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    const registration = allRegistrations.find(r => r.playerId === args.playerId);

    if (registration) {
      await ctx.db.delete(registration._id);

      const tournament = await ctx.db.get(args.tournamentId);
      if (tournament) {
        await ctx.db.patch(args.tournamentId, {
          registeredCount: Math.max(0, tournament.registeredCount - 1),
        });
      }
    }
  },
});

export const checkInPlayer = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("players"),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Check if user is organizer or manager
    const { isAuthorized } = await isOrganizerOrManager(ctx, args.tournamentId, userId);
    if (!isAuthorized) {
      throw new Error("Only tournament organizers and managers can check in players");
    }

    const allRegistrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    const registration = allRegistrations.find(r => r.playerId === args.playerId);

    if (registration) {
      await ctx.db.patch(registration._id, {
        checkedIn: true,
        checkInTime: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      throw new Error("Player is not registered for this tournament");
    }
  },
});

export const updatePaymentStatus = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("players"),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("refunded"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if user is organizer or manager
    const isOrganizer = tournament.organizerId === userId;
    if (!isOrganizer) {
      const managers = await ctx.db
        .query("tournamentManagers")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
        .collect();
      
      const isManager = managers.some(
        (m) => m.userId === userId && m.accepted && (m.role === "admin" || m.role === "manager")
      );

      if (!isManager) {
        throw new Error("Only tournament organizers and managers can update payment status");
      }
    }

    const allRegistrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();
    const registration = allRegistrations.find(r => r.playerId === args.playerId);

    if (registration) {
      await ctx.db.patch(registration._id, {
        paymentStatus: args.paymentStatus,
        updatedAt: Date.now(),
      });
    } else {
      throw new Error("Player is not registered for this tournament");
    }
  },
});

export const getPayoutCalculation = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const entryFee = tournament.entryFee || 0;
    const totalPlayers = registrations.length;
    const paidPlayers = registrations.filter(r => r.paymentStatus === "paid").length;
    const totalCollected = paidPlayers * entryFee;

    return {
      entryFee,
      totalPlayers,
      paidPlayers,
      unpaidPlayers: totalPlayers - paidPlayers,
      totalCollected,
    };
  },
});

export const generateOptimalPayouts = action({
  args: {
    tournamentId: v.id("tournaments"),
    houseFeePerPlayer: v.optional(v.number()),
    payoutPlaces: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    totalCollected: number;
    houseFee: number;
    potAmount: number;
    paidPlayers: number;
    payouts: Array<{ place: number; amount: number; percentage: number }>;
    rationale: string;
  }> => {
    const tournament = await ctx.runQuery(api.tournaments.getById, { id: args.tournamentId });
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    const registrations = await ctx.runQuery(api.tournaments.getRegistrations, { 
      tournamentId: args.tournamentId 
    });

    const entryFee: number = tournament.entryFee || 0;
    const paidPlayers: number = registrations.filter((r: any) => r.paymentStatus === "paid").length;
    const totalCollected: number = paidPlayers * entryFee;

    // Calculate house fee (per player/team)
    const houseFeePerPlayer: number = args.houseFeePerPlayer || 0;
    const houseFee: number = houseFeePerPlayer * paidPlayers;

    const potAmount: number = totalCollected - houseFee;
    const payoutPlaces: number = args.payoutPlaces || Math.min(3, Math.floor(paidPlayers / 4));

    // Use OpenAI to generate optimal payout structure
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // Fallback to standard payout structure if no API key
      return generateStandardPayouts(potAmount, payoutPlaces, paidPlayers);
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert at creating fair and competitive tournament payout structures for pool/billiards tournaments.

Given:
- Total pot amount: $${potAmount.toFixed(2)}
- Number of paid players: ${paidPlayers}
- Number of payout places: ${payoutPlaces}

Generate an optimal payout structure that:
1. Rewards top performers appropriately
2. Provides meaningful payouts to multiple places
3. Uses standard pool tournament payout percentages when possible
4. Ensures all payouts are whole dollar amounts (round appropriately)
5. The sum of all payouts equals exactly $${potAmount.toFixed(2)}

Return ONLY a JSON object with this structure:
{
  "payouts": [
    {"place": 1, "amount": <number>, "percentage": <number>},
    {"place": 2, "amount": <number>, "percentage": <number>},
    ...
  ],
  "rationale": "<brief explanation of the payout structure>"
}`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content returned from OpenAI");
      }

      // Parse the JSON response
      let payoutData;
      try {
        const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        payoutData = JSON.parse(cleanedContent);
      } catch (parseError) {
        // Fallback to standard payouts if parsing fails
        return generateStandardPayouts(potAmount, payoutPlaces, paidPlayers);
      }

      // Validate and adjust payouts to sum to potAmount
      const totalPayouts = payoutData.payouts.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      if (Math.abs(totalPayouts - potAmount) > 0.01) {
        // Adjust the first place payout to make up the difference
        if (payoutData.payouts.length > 0) {
          payoutData.payouts[0].amount = Math.round(payoutData.payouts[0].amount + (potAmount - totalPayouts));
          payoutData.payouts[0].percentage = (payoutData.payouts[0].amount / potAmount) * 100;
        }
      }

      return {
        totalCollected,
        houseFee,
        potAmount,
        paidPlayers,
        payouts: payoutData.payouts.map((p: any) => ({
          place: p.place,
          amount: Math.round(p.amount),
          percentage: p.percentage || (p.amount / potAmount) * 100,
        })),
        rationale: payoutData.rationale || "Standard tournament payout structure",
      };
    } catch (error) {
      console.error("Error generating optimal payouts:", error);
      // Fallback to standard payouts
      return generateStandardPayouts(potAmount, payoutPlaces, paidPlayers);
    }
  },
});

// Helper function for standard payout structure
function generateStandardPayouts(potAmount: number, payoutPlaces: number, totalPlayers: number) {
  const standardPercentages: Record<number, number[]> = {
    1: [100],
    2: [60, 40],
    3: [50, 30, 20],
    4: [40, 25, 20, 15],
    5: [35, 22, 18, 15, 10],
    6: [30, 20, 15, 12, 10, 8],
    7: [28, 18, 14, 12, 10, 9, 9],
    8: [25, 18, 13, 11, 10, 9, 8, 6],
  };

  const percentages = standardPercentages[payoutPlaces] || standardPercentages[Math.min(8, payoutPlaces)] || [100];
  const payouts = percentages.map((percentage, index) => {
    const amount = Math.round((potAmount * percentage) / 100);
    return {
      place: index + 1,
      amount,
      percentage,
    };
  });

  // Adjust to ensure total equals potAmount
  const total = payouts.reduce((sum, p) => sum + p.amount, 0);
  if (total !== potAmount && payouts.length > 0) {
    payouts[0].amount += potAmount - total;
    payouts[0].percentage = (payouts[0].amount / potAmount) * 100;
  }

  return {
    totalCollected: potAmount,
    houseFee: 0,
    potAmount,
    paidPlayers: totalPlayers,
    payouts,
    rationale: `Standard ${payoutPlaces}-place payout structure`,
  };
}

export const savePayoutStructure = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    houseFeePerPlayer: v.optional(v.number()),
    payoutStructure: v.object({
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
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if user is organizer or manager
    const isOrganizer = tournament.organizerId === userId;
    if (!isOrganizer) {
      const managers = await ctx.db
        .query("tournamentManagers")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
        .collect();
      
      const isManager = managers.some(
        (m) => m.userId === userId && m.accepted && (m.role === "admin" || m.role === "manager")
      );

      if (!isManager) {
        throw new Error("Only tournament organizers and managers can save payout structures");
      }
    }

    // Validate that payouts sum to potAmount
    const totalPayouts = args.payoutStructure.payouts.reduce((sum, p) => sum + p.amount, 0);
    const difference = Math.abs(totalPayouts - args.payoutStructure.potAmount);
    if (difference > 0.01) {
      throw new Error(`Total payouts ($${totalPayouts.toFixed(2)}) must equal pot amount ($${args.payoutStructure.potAmount.toFixed(2)}). Difference: $${difference.toFixed(2)}`);
    }

    const updateData: any = {
      payoutStructure: args.payoutStructure,
      updatedAt: Date.now(),
    };

    if (args.houseFeePerPlayer !== undefined) {
      updateData.houseFeePerPlayer = args.houseFeePerPlayer;
    }

    await ctx.db.patch(args.tournamentId, updateData);
  },
});

export const getPayoutStructure = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    return {
      houseFeePerPlayer: tournament.houseFeePerPlayer || null,
      payoutStructure: tournament.payoutStructure || null,
    };
  },
});

// Extract tournament information from flyer image using OCR/Vision API
export const extractTournamentInfo = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get the file URL from storage
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      throw new Error("File not found");
    }

    // Fetch the image as base64
    const imageResponse = await fetch(fileUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    // Convert ArrayBuffer to base64 (works in both browser and Node.js)
    const bytes = new Uint8Array(imageBuffer);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), "");
    const base64Image = btoa(binary);

    // Use OpenAI Vision API to extract text (requires OPENAI_API_KEY env var)
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured. Please set it in your Convex dashboard.");
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert at extracting tournament information from pool/billiards tournament flyer images. 
Extract the following information from the image and return it as JSON:
- name: Tournament name
- date: Date in format YYYY-MM-DD (extract from text like "Friday, 14 November 2025")
- time: Time in format HH:MM (extract from text like "Signups 6pm" or "6:00 PM")
- venue: Venue name or address
- entryFee: Entry fee as a number (extract from text like "$50" or "$50 TEAM")
- description: Any additional tournament details or description
- gameType: Infer from text (eight_ball, nine_ball, ten_ball, one_pocket, bank_pool)
- playerType: Infer from text (singles, doubles, scotch_doubles, teams)
- maxPlayers: Maximum players if mentioned

Return ONLY valid JSON, no markdown formatting. If a field cannot be determined, use null.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content returned from OpenAI");
      }

      // Parse the JSON response
      let extractedData;
      try {
        // Remove markdown code blocks if present
        const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        extractedData = JSON.parse(cleanedContent);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response: ${content}`);
      }

      // Transform the extracted data to match our form structure
      // Note: Convex doesn't support Date objects, so we return timestamp as number
      const result: {
        name?: string;
        dateTimestamp?: number; // Timestamp in milliseconds
        time?: string;
        venue?: string;
        entryFee?: number;
        description?: string;
        gameType?: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool";
        playerType?: "singles" | "doubles" | "scotch_doubles" | "teams";
        maxPlayers?: number;
      } = {};

      if (extractedData.name) result.name = extractedData.name;
      if (extractedData.date) {
        // Parse date string to timestamp (milliseconds)
        const dateParts = extractedData.date.split("-");
        if (dateParts.length === 3) {
          const dateObj = new Date(
            parseInt(dateParts[0]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[2])
          );
          result.dateTimestamp = dateObj.getTime();
        }
      }
      if (extractedData.time) {
        // Normalize time format
        let timeStr = extractedData.time;
        // Convert "6pm" to "18:00" or "6:00 PM" to "18:00"
        if (timeStr.toLowerCase().includes("pm")) {
          const match = timeStr.match(/(\d+):?(\d+)?/);
          if (match) {
            let hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            if (hours !== 12) hours += 12;
            result.time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
          }
        } else if (timeStr.toLowerCase().includes("am")) {
          const match = timeStr.match(/(\d+):?(\d+)?/);
          if (match) {
            let hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            if (hours === 12) hours = 0;
            result.time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
          }
        } else {
          result.time = timeStr;
        }
      }
      if (extractedData.venue) result.venue = extractedData.venue;
      if (extractedData.entryFee !== null && extractedData.entryFee !== undefined) {
        result.entryFee = typeof extractedData.entryFee === "number" 
          ? extractedData.entryFee 
          : parseFloat(String(extractedData.entryFee).replace(/[^0-9.]/g, ""));
      }
      if (extractedData.description) result.description = extractedData.description;
      if (extractedData.gameType) {
        const gameTypeMap: Record<string, "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool"> = {
          "eight_ball": "eight_ball",
          "8-ball": "eight_ball",
          "8 ball": "eight_ball",
          "nine_ball": "nine_ball",
          "9-ball": "nine_ball",
          "9 ball": "nine_ball",
          "ten_ball": "ten_ball",
          "10-ball": "ten_ball",
          "10 ball": "ten_ball",
          "one_pocket": "one_pocket",
          "one pocket": "one_pocket",
          "bank_pool": "bank_pool",
          "bank pool": "bank_pool",
        };
        result.gameType = gameTypeMap[extractedData.gameType.toLowerCase()] || "eight_ball";
      }
      if (extractedData.playerType) {
        const playerTypeMap: Record<string, "singles" | "doubles" | "scotch_doubles" | "teams"> = {
          "singles": "singles",
          "single": "singles",
          "doubles": "doubles",
          "double": "doubles",
          "scotch_doubles": "scotch_doubles",
          "scotch doubles": "scotch_doubles",
          "scotch": "scotch_doubles",
          "teams": "teams",
          "team": "teams",
        };
        result.playerType = playerTypeMap[extractedData.playerType.toLowerCase()] || "singles";
      }
      if (extractedData.maxPlayers) {
        result.maxPlayers = typeof extractedData.maxPlayers === "number"
          ? extractedData.maxPlayers
          : parseInt(String(extractedData.maxPlayers));
      }

      return result;
    } catch (error) {
      console.error("Error extracting tournament info:", error);
      throw error;
    }
  },
});

// Internal mutation to activate a tournament
export const activateTournament = internalMutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      console.error(`Tournament ${args.tournamentId} not found when trying to activate`);
      return;
    }

    // Only activate if still in "upcoming" status
    if (tournament.status === "upcoming") {
      await ctx.db.patch(args.tournamentId, {
        status: "active",
        updatedAt: Date.now(),
      });
    }
  },
});

// Internal mutation to check and complete tournament if all matches are done
export const checkAndCompleteTournament = internalMutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      return;
    }

    // Only check if tournament is active (not already completed or draft)
    if (tournament.status !== "active") {
      return;
    }

    // Get all matches for this tournament
    const allMatches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // If no matches exist, don't complete
    if (allMatches.length === 0) {
      return;
    }

    // First, mark any remaining TBD vs TBD matches as completed
    const tbdMatches = allMatches.filter(
      (match) => 
        match.status !== "completed" && 
        !match.player1Id && 
        !match.player2Id
    );
    
    for (const match of tbdMatches) {
      await ctx.db.patch(match._id, {
        status: "completed",
        completedAt: Date.now(),
        // No winnerId since both players are TBD
        player1Score: 0,
        player2Score: 0,
      });
    }

    // Refresh matches after updating TBD matches
    const updatedMatches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    // Check if all matches are completed
    // TBD vs TBD matches are considered complete if status is "completed" (even without winnerId)
    // Regular matches need both status "completed" AND a winnerId
    const allCompleted = updatedMatches.every(
      (match) => {
        if (match.status !== "completed") {
          return false;
        }
        // TBD vs TBD matches (no players) are complete if status is completed
        if (!match.player1Id && !match.player2Id) {
          return true;
        }
        // Regular matches need a winnerId
        return !!match.winnerId;
      }
    );

    if (allCompleted) {
      // Mark tournament as completed
      await ctx.db.patch(args.tournamentId, {
        status: "completed",
        updatedAt: Date.now(),
      });

      // Calculate and store tournament results
      await ctx.scheduler.runAfter(0, internal.tournamentRegistrations.calculateTournamentResultsInternal, {
        tournamentId: args.tournamentId,
      });
    }
  },
});

// Get managers for a tournament
export const getManagers = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, args) => {
    const managers = await ctx.db
      .query("tournamentManagers")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    return await Promise.all(
      managers.map(async (manager) => {
        const user = await ctx.db.get(manager.userId);
        const invitedBy = await ctx.db.get(manager.invitedBy);
        return {
          ...manager,
          user,
          invitedByUser: invitedBy,
        };
      })
    );
  },
});

// Add a manager to a tournament
export const addManager = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("manager"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserIdOrThrow(ctx);

    // Verify tournament exists
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if user is organizer or already a manager/admin
    const existingManagers = await ctx.db
      .query("tournamentManagers")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", args.tournamentId))
      .collect();

    const isOrganizer = tournament.organizerId === currentUserId;
    const isManager = existingManagers.some(
      (m) => m.userId === currentUserId && m.accepted
    );

    if (!isOrganizer && !isManager) {
      throw new Error("Only tournament organizers and managers can add managers");
    }

    // Check if user is already a manager
    const existingManager = existingManagers.find((m) => m.userId === args.userId);
    if (existingManager) {
      throw new Error("User is already a manager for this tournament");
    }

    // Don't allow adding the organizer as a manager
    if (tournament.organizerId === args.userId) {
      throw new Error("Tournament organizer is already a manager");
    }

    // Verify the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Add manager (invitation - not accepted yet)
    await ctx.db.insert("tournamentManagers", {
      tournamentId: args.tournamentId,
      userId: args.userId,
      role: args.role || "manager",
      accepted: false,
      invitedBy: currentUserId,
      invitedAt: Date.now(),
      acceptedAt: null,
    });

    // TODO: Send notification to the invited user
  },
});

// Remove a manager from a tournament
export const removeManager = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserIdOrThrow(ctx);

    // Verify tournament exists
    const tournament = await ctx.db.get(args.tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if user is organizer
    const isOrganizer = tournament.organizerId === currentUserId;
    if (!isOrganizer) {
      throw new Error("Only tournament organizers can remove managers");
    }

    // Don't allow removing the organizer
    if (tournament.organizerId === args.userId) {
      throw new Error("Cannot remove tournament organizer");
    }

    // Find and remove the manager
    const manager = await ctx.db
      .query("tournamentManagers")
      .withIndex("by_tournament_and_user", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("userId", args.userId)
      )
      .first();

    if (manager) {
      await ctx.db.delete(manager._id);
    }
  },
});

// Get tournaments by organizer
export const getByOrganizer = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tournaments = await ctx.db
      .query("tournaments")
      .withIndex("by_organizer", (q) => q.eq("organizerId", args.userId))
      .collect();

    return await Promise.all(
      tournaments.map(async (tournament) => {
        let venue = null;
        if (tournament.venueId) {
          venue = await ctx.db.get(tournament.venueId);
        }

        return {
          ...tournament,
          venue: venue ? {
            _id: venue._id,
            name: venue.name,
            city: venue.city,
            region: venue.region,
            country: venue.country,
          } : null,
        };
      })
    );
  },
});

export const acceptManagerInvite = mutation({
  args: {
    tournamentId: v.id("tournaments"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getCurrentUserIdOrThrow(ctx);

    // Find the manager invitation
    const manager = await ctx.db
      .query("tournamentManagers")
      .withIndex("by_tournament_and_user", (q) =>
        q.eq("tournamentId", args.tournamentId).eq("userId", currentUserId)
      )
      .first();

    if (!manager) {
      throw new Error("Manager invitation not found");
    }

    if (manager.accepted) {
      throw new Error("Invitation already accepted");
    }

    // Accept the invitation
    await ctx.db.patch(manager._id, {
      accepted: true,
      acceptedAt: Date.now(),
    });
  },
});
