import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { CounterHelpers } from "./counters";
import { internal } from "./_generated/api";

// Get all matches for a tournament
export const getByTournament = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, { tournamentId }) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    // Get player info for each match
    const matchesWithPlayers = await Promise.all(
      matches.map(async (match) => {
        const player1 = match.player1Id ? await ctx.db.get(match.player1Id) : null;
        const player2 = match.player2Id ? await ctx.db.get(match.player2Id) : null;
        const winner = match.winnerId ? await ctx.db.get(match.winnerId) : null;

        return {
          ...match,
          player1,
          player2,
          winner,
          bracketType: match.bracketType || 'winner', // Default to 'winner' if not set
        };
      })
    );

    return matchesWithPlayers;
  },
});

// Get matches by round
export const getByRound = query({
  args: { 
    tournamentId: v.id("tournaments"),
    round: v.number()
  },
  handler: async (ctx, { tournamentId, round }) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_round", (q: any) => 
        q.eq("tournamentId", tournamentId).eq("round", round)
      )
      .collect();

    // Get player info for each match
    const matchesWithPlayers = await Promise.all(
      matches.map(async (match) => {
        const player1 = match.player1Id ? await ctx.db.get(match.player1Id) : null;
        const player2 = match.player2Id ? await ctx.db.get(match.player2Id) : null;
        const winner = match.winnerId ? await ctx.db.get(match.winnerId) : null;

        return {
          ...match,
          player1,
          player2,
          winner,
        };
      })
    );

    return matchesWithPlayers;
  },
});

// Get matches by user ID (through their player registrations)
export const getByUserId = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { userId, limit }) => {

    const user = await ctx.db.get(userId);
    
    // Get all player IDs associated with this user
    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const playerIds = new Set<Id<"players">>();
    
    // CRITICAL: Only use the user's direct playerId, not all registration player IDs
    // This ensures we only show matches where the user themselves is playing,
    // not matches between other players they may have registered
    if (user && "playerId" in user && user.playerId) {
      playerIds.add(user.playerId);
    }
    
    // NOTE: We're NOT adding player IDs from registrations because:
    // - A user may register multiple players for a tournament (e.g., registering teammates)
    // - We only want to show matches where the USER THEMSELVES is playing
    // - The user's actual player is stored in user.playerId
    if (playerIds.size === 0) {
      return [];
    }

    // Get all matches where user's player is either player1 or player2
    const allMatches: any[] = [];
    
    for (const playerId of playerIds) {
      // Get matches where player is player1
      const player1Matches = await ctx.db
        .query("matches")
        .withIndex("by_player1", (q) => q.eq("player1Id", playerId))
        .collect();
      
      // Get matches where player is player2
      const player2Matches = await ctx.db
        .query("matches")
        .withIndex("by_player2", (q) => q.eq("player2Id", playerId))
        .collect();
      
      allMatches.push(...player1Matches, ...player2Matches);
    }
    
    // Remove duplicates and STRICTLY filter to ensure user's player is actually in the match
    const deduplicatedMatches = Array.from(
      new Map(allMatches.map(m => [m._id, m])).values()
    );
    
    const filteredMatches = deduplicatedMatches.filter(match => {
      // CRITICAL: Match must have user's player ID as either player1Id OR player2Id
      // This is the primary filter - if this fails, the match is excluded
      if (!match.player1Id && !match.player2Id) {
        return false; // No players in match, skip
      }
      
      const hasUserPlayer1 = match.player1Id ? playerIds.has(match.player1Id) : false;
      const hasUserPlayer2 = match.player2Id ? playerIds.has(match.player2Id) : false;
      
      // Match must have at least one of the user's player IDs
      if (!hasUserPlayer1 && !hasUserPlayer2) {
        return false; // User's player is not in this match, exclude it
      }
      
      // Only return completed matches
      if (match.status !== "completed") {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      const aTime = a.completedAt || 0;
      const bTime = b.completedAt || 0;
      return bTime - aTime;
    });
    
    const uniqueMatches = filteredMatches;

    // Apply limit
    const limitedMatches = limit ? uniqueMatches.slice(0, limit) : uniqueMatches;

    // Get player info, tournament info, and user info for each match
    const matchesWithDetails = await Promise.all(
      limitedMatches.map(async (match) => {
        // CRITICAL: Final verification - match MUST have user's player ID as player1Id OR player2Id
        // This is the absolute final check before processing
        const isUserPlayer1 = match.player1Id ? playerIds.has(match.player1Id) : false;
        const isUserPlayer2 = match.player2Id ? playerIds.has(match.player2Id) : false;
        
        if (!isUserPlayer1 && !isUserPlayer2) {
          // This match does not contain the user's player ID - exclude it
          return null;
        }
        
        const player1 = match.player1Id ? await ctx.db.get(match.player1Id) : null;
        const player2 = match.player2Id ? await ctx.db.get(match.player2Id) : null;
        const winner = match.winnerId ? await ctx.db.get(match.winnerId) : null;
        const tournament = match.tournamentId ? await ctx.db.get(match.tournamentId) : null;

        // Final verification: double-check player IDs match AND verify player belongs to user
        const player1IdMatches = match.player1Id && playerIds.has(match.player1Id);
        const player2IdMatches = match.player2Id && playerIds.has(match.player2Id);
        
        if (!player1IdMatches && !player2IdMatches) {
          return null;
        }
        
        // Additional check: verify the player's userId matches (if userId exists on player)
        // This ensures we're not accidentally including matches from other users' players
        if (player1 && "userId" in player1 && player1.userId && player1.userId !== userId && player1IdMatches) {
          // Player1 belongs to a different user, but we matched by playerId - exclude it
          return null;
        }
        if (player2 && "userId" in player2 && player2.userId && player2.userId !== userId && player2IdMatches) {
          // Player2 belongs to a different user, but we matched by playerId - exclude it
          return null;
        }
        
        // Get user info for players
        let player1User = null;
        let player2User = null;
        if (player1 && "userId" in player1 && player1.userId) {
          player1User = await ctx.db.get(player1.userId);
        }
        if (player2 && "userId" in player2 && player2.userId) {
          player2User = await ctx.db.get(player2.userId);
        }

        return {
          ...match,
          player1,
          player2,
          winner,
          tournament: tournament && "name" in tournament && "gameType" in tournament && "status" in tournament ? {
            _id: tournament._id,
            name: tournament.name as string,
            gameType: tournament.gameType as string,
            status: tournament.status as "draft" | "scheduled" | "in_progress" | "completed",
          } : null,
          player1User,
          player2User,
        };
      })
    );

    // Filter out null matches (where user wasn't actually a participant)
    const finalMatches = matchesWithDetails.filter(match => match !== null);

    return finalMatches;
  },
});

// Query: Get matches by player ID
export const getByPlayerId = query({
  args: { 
    playerId: v.id("players"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { playerId, limit }) => {
    // Get matches where player is player1
    const player1Matches = await ctx.db
      .query("matches")
      .withIndex("by_player1", (q) => q.eq("player1Id", playerId))
      .collect();
    
    // Get matches where player is player2
    const player2Matches = await ctx.db
      .query("matches")
      .withIndex("by_player2", (q) => q.eq("player2Id", playerId))
      .collect();
    
    // Combine and deduplicate
    const allMatches = Array.from(
      new Map([...player1Matches, ...player2Matches].map(m => [m._id, m])).values()
    );

    // Sort by completedAt (most recent first), or by creation time
    const sortedMatches = allMatches.sort((a, b) => {
      const aTime = a.completedAt || a._creationTime;
      const bTime = b.completedAt || b._creationTime;
      return bTime - aTime;
    });

    // Apply limit
    const limitedMatches = limit ? sortedMatches.slice(0, limit) : sortedMatches;

    // Get player info, tournament info for each match
    return await Promise.all(
      limitedMatches.map(async (match) => {
        const player1 = match.player1Id ? await ctx.db.get(match.player1Id) : null;
        const player2 = match.player2Id ? await ctx.db.get(match.player2Id) : null;
        const winner = match.winnerId ? await ctx.db.get(match.winnerId) : null;
        const tournament = match.tournamentId ? await ctx.db.get(match.tournamentId) : null;

        return {
          ...match,
          player1,
          player2,
          winner,
          tournament: tournament ? {
            _id: tournament._id,
            name: tournament.name as string,
            gameType: tournament.gameType as string,
            status: tournament.status as "draft" | "upcoming" | "active" | "completed",
          } : null,
          player1Name: player1?.name || "Unknown",
          player2Name: player2?.name || "Unknown",
          tournamentName: tournament?.name as string || "Unknown Tournament",
          playedAt: match.completedAt || match._creationTime,
        };
      })
    );
  },
});

// Create a match
export const create = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    player1Id: v.id("players"),
    player2Id: v.id("players"),
    round: v.number(),
    bracketPosition: v.number(),
    tableNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const matchId = await ctx.db.insert("matches", {
      ...args,
      player1Score: 0,
      player2Score: 0,
      status: "pending",
      completedAt: undefined,
      winnerId: undefined,
    });

    // Increment total match count using sharded counter
    await CounterHelpers.incrementMatchCount(ctx);

    return matchId;
  },
});

// Update match score and table
export const updateScore = mutation({
  args: {
    id: v.id("matches"),
    player1Score: v.number(),
    player2Score: v.number(),
    winnerId: v.optional(v.id("players")),
    tableNumber: v.optional(v.number()),
  },
  handler: async (ctx, { id, player1Score, player2Score, winnerId, tableNumber }) => {
    const match = await ctx.db.get(id);
    if (!match) {
      throw new Error("Match not found");
    }

    // If match is being completed, unassign the table
    if (winnerId && match.tableNumber) {
      const allTables = await ctx.db
        .query("tables")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", match.tournamentId))
        .collect();
      
      const assignedTable = allTables.find(t => t.startNumber === match.tableNumber);
      
      if (assignedTable) {
        await ctx.db.patch(assignedTable._id, {
          status: "OPEN",
        });
      }
    }

    await ctx.db.patch(id, {
      player1Score,
      player2Score,
      winnerId,
      tableNumber: winnerId ? null : tableNumber, // Unassign table when match is completed
      status: winnerId ? "completed" : "in_progress",
      completedAt: winnerId ? Date.now() : undefined,
    });

    // Update player stats if match is completed
    if (winnerId) {
      const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
      
      // Update winner stats
      const winnerStats = await ctx.db
        .query("playerStats")
        .withIndex("by_player", (q) => q.eq("playerId", winnerId))
        .first();
      
      if (winnerStats) {
        await ctx.db.patch(winnerStats._id, {
          totalMatches: winnerStats.totalMatches + 1,
          wins: winnerStats.wins + 1,
        });
      } else {
        await ctx.db.insert("playerStats", {
          playerId: winnerId,
          totalMatches: 1,
          wins: 1,
          losses: 0,
          averageScore: 0,  
          tournamentsPlayed: 1,
          tournamentsWon: 1,
          lastUpdated: Date.now(),
        });
      }

      // Update loser stats
      if (loserId) {
        const loserStats = await ctx.db
          .query("playerStats")
          .withIndex("by_player", (q) => q.eq("playerId", loserId))
          .first();
        
        if (loserStats) {
          await ctx.db.patch(loserStats._id, {
            totalMatches: loserStats.totalMatches + 1,
            losses: loserStats.losses + 1,
          });
        } else {
          await ctx.db.insert("playerStats", {
            playerId: loserId,
            totalMatches: 1,
            wins: 0,
            losses: 1,
            averageScore: 0,
            tournamentsPlayed: 1,
            tournamentsWon: 0,
            lastUpdated: Date.now(),
          });
        }
      }

      // Advance winner to next round
      await advanceToNextRound(ctx, match.tournamentId, match, winnerId);

      // Check if tournament should be automatically completed
      await ctx.scheduler.runAfter(0, internal.tournaments.checkAndCompleteTournament, {
        tournamentId: match.tournamentId,
      });
    }

    return match;
  },
});

// Generate bracket for tournament
export const generateBracket = mutation({
  args: { 
    tournamentId: v.id("tournaments"),
    preserveCompleted: v.optional(v.boolean()), // Option to preserve completed matches
  },
  handler: async (ctx, { tournamentId, preserveCompleted = false }) => {
    // Get tournament info
    const tournament = await ctx.db.get(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Get tournament registrations (checked-in players)
    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .filter((q) => q.eq(q.field("checkedIn"), true))
      .collect();

    if (registrations.length < 2) {
      throw new Error("Need at least 2 checked-in players to generate bracket");
    }

    // Get existing matches
    const existingMatches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    // If preserving completed matches, save them and their winners
    const completedMatches = preserveCompleted 
      ? existingMatches.filter(m => m.status === "completed" && m.winnerId)
      : [];
    
    const completedWinners = new Set(
      completedMatches.map(m => m.winnerId).filter((id): id is Id<"players"> => id !== undefined)
    );

    // Clear existing matches (or only non-completed ones if preserving)
    if (preserveCompleted && completedMatches.length > 0) {
      // Only delete non-completed matches
      for (const match of existingMatches) {
        if (match.status !== "completed") {
          await ctx.db.delete(match._id);
        }
      }
    } else {
      // Clear all matches
      for (const match of existingMatches) {
        await ctx.db.delete(match._id);
      }
    }

    // Convert registrations to player objects for bracket generation
    const tournamentPlayers = registrations.map(reg => ({
      playerId: reg.playerId,
      seed: reg.seed,
    }));

    // Shuffle players for random bracket seeding (or use seeded if bracketOrdering is seeded_draw)
    let shuffledPlayers = [...tournamentPlayers];
    if (tournament.bracketOrdering === "seeded_draw") {
      // Sort by seed if available, otherwise random
      shuffledPlayers.sort((a, b) => {
        if (a.seed !== null && b.seed !== null) {
          return (a.seed || 0) - (b.seed || 0);
        }
        if (a.seed !== null) return -1;
        if (b.seed !== null) return 1;
        return Math.random() - 0.5;
      });
    } else {
      shuffledPlayers.sort(() => Math.random() - 0.5);
    }

    // Generate bracket based on tournament type
    if (tournament.type === "single") {
      return await generateSingleElimination(ctx, tournamentId, shuffledPlayers, preserveCompleted ? completedMatches : []);
    } else if (tournament.type === "double") {
      return await generateDoubleElimination(ctx, tournamentId, shuffledPlayers, preserveCompleted ? completedMatches : []);
    } else if (tournament.type === "round_robin") {
      return await generateRoundRobin(ctx, tournamentId, shuffledPlayers, preserveCompleted ? completedMatches : []);
    } else {
      throw new Error("Unsupported tournament type");
    }
  },
});

// Regenerate bracket preserving completed matches and allowing late players
export const regenerateBracket = mutation({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, { tournamentId }) => {
    // Get tournament info
    const tournament = await ctx.db.get(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Get tournament registrations (checked-in players)
    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .filter((q) => q.eq(q.field("checkedIn"), true))
      .collect();

    if (registrations.length < 2) {
      throw new Error("Need at least 2 checked-in players to regenerate bracket");
    }

    // Get existing matches
    const existingMatches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    // Preserve completed matches
    const completedMatches = existingMatches.filter(m => m.status === "completed" && m.winnerId);

    // Only delete non-completed matches
    for (const match of existingMatches) {
      if (match.status !== "completed") {
        await ctx.db.delete(match._id);
      }
    }

    // Convert registrations to player objects for bracket generation
    const tournamentPlayers = registrations.map(reg => ({
      playerId: reg.playerId,
      seed: reg.seed,
    }));

    // Shuffle players for random bracket seeding (or use seeded if bracketOrdering is seeded_draw)
    let shuffledPlayers = [...tournamentPlayers];
    if (tournament.bracketOrdering === "seeded_draw") {
      // Sort by seed if available, otherwise random
      shuffledPlayers.sort((a, b) => {
        if (a.seed !== null && b.seed !== null) {
          return (a.seed || 0) - (b.seed || 0);
        }
        if (a.seed !== null) return -1;
        if (b.seed !== null) return 1;
        return Math.random() - 0.5;
      });
    } else {
      shuffledPlayers.sort(() => Math.random() - 0.5);
    }

    // Generate bracket based on tournament type, preserving completed matches
    if (tournament.type === "single") {
      return await generateSingleElimination(ctx, tournamentId, shuffledPlayers, completedMatches);
    } else if (tournament.type === "double") {
      return await generateDoubleElimination(ctx, tournamentId, shuffledPlayers, completedMatches);
    } else if (tournament.type === "round_robin") {
      return await generateRoundRobin(ctx, tournamentId, shuffledPlayers, completedMatches);
    } else {
      throw new Error("Unsupported tournament type");
    }
  },
});

// Generate single elimination bracket
async function generateSingleElimination(
  ctx: any,
  tournamentId: Id<"tournaments">,
  players: any[],
  completedMatches: any[] = []
) {
  const numPlayers = players.length;
  const matches: any[] = [];
  
  // Track players already placed in bracket from completed matches
  const placedPlayers = new Set<Id<"players">>();
  completedMatches.forEach(m => {
    if (m.player1Id) placedPlayers.add(m.player1Id);
    if (m.player2Id) placedPlayers.add(m.player2Id);
    if (m.winnerId) placedPlayers.add(m.winnerId);
  });
  
  // Add completed matches to matches array (they're already in DB, but we need them for linking)
  completedMatches.forEach(m => matches.push(m));
  
  // Filter out players already in completed matches
  const availablePlayers = players.filter(p => !placedPlayers.has(p.playerId));
  
  // Calculate total players (including those in completed matches)
  const totalPlayers = numPlayers;
  
  // Calculate bracket size as next power of 2 (16, 32, 64, etc.)
  // Minimum bracket size is 16
  const bracketSize = Math.max(16, Math.pow(2, Math.ceil(Math.log2(Math.max(totalPlayers, 2)))));
  
  // Calculate the number of matches needed in the first round for the full bracket
  const firstRoundMatches = bracketSize / 2;
  const numRounds = Math.log2(bracketSize);
  
  // If we have completed matches, we need to skip positions already taken
  const completedPositions = new Set(completedMatches.map(m => `${m.round}-${m.bracketPosition}`));
  
  // Generate first round matches for the full bracket size
  // This ensures we always show a complete bracket (16, 32, 64, etc.)
  // CRITICAL: Always create ALL matches for the bracket size, even if some are empty
  console.log(`Generating bracket: ${numPlayers} players, bracketSize: ${bracketSize}, firstRoundMatches: ${firstRoundMatches}`);
  console.log(`Available players: ${availablePlayers.length}, Total players: ${numPlayers}`);
  
  // CRITICAL: We MUST create exactly firstRoundMatches matches (8 for 16-player bracket, 16 for 32-player bracket, etc.)
  let matchesCreated = 0;
  for (let pos = 0; pos < firstRoundMatches; pos++) {
    const positionKey = `1-${pos}`;
    
    // Skip if this position is already taken by a completed match
    if (completedPositions.has(positionKey)) {
      console.log(`Skipping position ${pos} - already has completed match`);
      matchesCreated++; // Count it as existing
      continue;
    }
    
    const playerIndex1 = pos * 2;
    const playerIndex2 = pos * 2 + 1;
    
    // Get players for this match from available players
    // If we have fewer players than bracket size, some slots will be empty (byes)
    // IMPORTANT: Use availablePlayers.length, not players.length, to account for players already in completed matches
    // BUT: We still create the match even if both players are null (empty match slot)
    const player1 = playerIndex1 < availablePlayers.length ? availablePlayers[playerIndex1] : null;
    const player2 = playerIndex2 < availablePlayers.length ? availablePlayers[playerIndex2] : null;
    
    console.log(`Creating match at position ${pos}: player1=${player1?.playerId || 'null'}, player2=${player2?.playerId || 'null'}`);
    
    let status = "pending";
    let winnerId = undefined;
    
    // If only one player, they get a bye (automatically advance)
    if (player1 && !player2) {
      status = "completed";
      winnerId = player1.playerId;
    }
    
    const match = {
      tournamentId,
      player1Id: player1?.playerId,
      player2Id: player2?.playerId,
      round: 1,
      bracketPosition: pos,
      player1Score: status === "completed" ? 1 : 0,
      player2Score: 0,
      status,
      completedAt: status === "completed" ? Date.now() : undefined,
      winnerId,
      nextMatchId: undefined, // Will be set after all matches are created
      bracketType: "winner" as const,
    };
    
    const insertedId = await ctx.db.insert("matches", match);
    matches.push({ ...match, _id: insertedId });
    matchesCreated++;
  }
  
  console.log(`Created ${matchesCreated} round 1 matches (expected ${firstRoundMatches})`);
  
  // Generate subsequent rounds (empty matches)
  let currentRoundMatches = firstRoundMatches;
  for (let round = 2; round <= numRounds; round++) {
    const matchesInRound = Math.floor(currentRoundMatches / 2);
    
    for (let pos = 0; pos < matchesInRound; pos++) {
      const positionKey = `${round}-${pos}`;
      
      // Skip if this position is already taken by a completed match
      if (completedPositions.has(positionKey)) {
        continue;
      }
      
      const match = {
        tournamentId,
        player1Id: undefined,
        player2Id: undefined,
        round,
        bracketPosition: pos,
        player1Score: 0,
        player2Score: 0,
        status: "pending",
        completedAt: undefined,
        winnerId: undefined,
        nextMatchId: undefined,
        bracketType: "winner" as const,
      };
      
      const insertedId = await ctx.db.insert("matches", match);
      matches.push({ ...match, _id: insertedId });
    }
    
    currentRoundMatches = matchesInRound;
  }
  
  // Set up nextMatchId for all matches except final round
  for (let round = 1; round < numRounds; round++) {
    const roundMatches = matches.filter(m => m.round === round);
    for (let i = 0; i < roundMatches.length; i++) {
      const nextRound = round + 1;
      const nextPosition = Math.floor(i / 2);
      const nextMatch = matches.find(m => 
        m.round === nextRound && 
        m.bracketPosition === nextPosition
      );
      
      if (nextMatch) {
        await ctx.db.patch(roundMatches[i]._id, {
          nextMatchId: nextMatch._id
        });
      }
    }
  }
  
  return { 
    message: "Single elimination bracket generated", 
    numRounds, 
    numPlayers,
    bracketSize,
    preservedMatches: completedMatches.length 
  };
}

// Generate double elimination bracket
async function generateDoubleElimination(
  ctx: any,
  tournamentId: Id<"tournaments">,
  players: any[],
  completedMatches: any[] = []
) {
  const numPlayers = players.length;
  
  // Calculate bracket size as next power of 2 (16, 32, 64, etc.)
  // Minimum bracket size is 16
  const bracketSize = Math.max(16, Math.pow(2, Math.ceil(Math.log2(Math.max(numPlayers, 2)))));
  const numWinnerRounds = Math.log2(bracketSize);
  const matches: any[] = [];
  
  // Add completed matches to matches array
  completedMatches.forEach(m => matches.push(m));
  
  // Track positions already taken by completed matches
  const completedPositions = new Set(completedMatches.map(m => `${m.bracketType}-${m.round}-${m.bracketPosition}`));
  
  // Generate Winner's Bracket - First Round
  // Generate matches for the full bracket size to show complete bracket
  const firstRoundMatches = bracketSize / 2;
  for (let pos = 0; pos < firstRoundMatches; pos++) {
    const positionKey = `winner-1-${pos}`;
    
    // Skip if this position is already taken by a completed match
    if (completedPositions.has(positionKey)) {
      continue;
    }
    
    const playerIndex1 = pos * 2;
    const playerIndex2 = pos * 2 + 1;
    
    // Get players for this match
    // If we have fewer players than bracket size, some slots will be empty (byes)
    const player1 = playerIndex1 < players.length ? players[playerIndex1] : null;
    const player2 = playerIndex2 < players.length ? players[playerIndex2] : null;
    
    let status = "pending";
    let winnerId = undefined;
    
    // If only one player, they get a bye (automatically advance)
    if (player1 && !player2) {
      status = "completed";
      winnerId = player1.playerId;
    }
    
    const match = {
      tournamentId,
      player1Id: player1?.playerId,
      player2Id: player2?.playerId,
      round: 1,
      bracketPosition: pos,
      player1Score: status === "completed" ? 1 : 0,
      player2Score: 0,
      status,
      completedAt: status === "completed" ? Date.now() : undefined,
      winnerId,
      nextMatchId: undefined,
      nextLooserMatchId: undefined,
      bracketType: "winner" as const,
    };
    
    const insertedId = await ctx.db.insert("matches", match);
    matches.push({ ...match, _id: insertedId });
  }
  
  // Generate Winner's Bracket - Subsequent Rounds
  let currentRoundMatches = firstRoundMatches;
  for (let round = 2; round <= numWinnerRounds; round++) {
    const matchesInRound = Math.floor(currentRoundMatches / 2);
    
    for (let pos = 0; pos < matchesInRound; pos++) {
      const positionKey = `winner-${round}-${pos}`;
      
      // Skip if this position is already taken by a completed match
      if (completedPositions.has(positionKey)) {
        continue;
      }
      
      const match = {
        tournamentId,
        player1Id: undefined,
        player2Id: undefined,
        round,
        bracketPosition: pos,
        player1Score: 0,
        player2Score: 0,
        status: "pending",
        completedAt: undefined,
        winnerId: undefined,
        nextMatchId: undefined,
        nextLooserMatchId: undefined,
        bracketType: "winner" as const,
      };
      
      const insertedId = await ctx.db.insert("matches", match);
      matches.push({ ...match, _id: insertedId });
    }
    
    currentRoundMatches = matchesInRound;
  }
  
  // Set up nextMatchId for winner's bracket
  const winnerMatches = matches.filter(m => m.bracketType === "winner");
  for (let round = 1; round < numWinnerRounds; round++) {
    const roundMatches = winnerMatches.filter(m => m.round === round);
    for (let i = 0; i < roundMatches.length; i++) {
      const nextRound = round + 1;
      const nextPosition = Math.floor(i / 2);
      const nextMatch = winnerMatches.find(m => 
        m.round === nextRound && 
        m.bracketPosition === nextPosition
      );
      
      if (nextMatch) {
        await ctx.db.patch(roundMatches[i]._id, {
          nextMatchId: nextMatch._id
        });
      }
    }
  }
  
  // Generate Loser's Bracket
  const numLoserRounds = (numWinnerRounds - 1) * 2 + 1;
  
  // Generate all loser bracket rounds
  let currentMatches = Math.floor(firstRoundMatches / 2);
  
  for (let round = 1; round <= numLoserRounds; round++) {
    const isDropInRound = round % 2 === 1; // Odd rounds receive drops from winner's bracket
    
    // Calculate matches for this round
    let matchesInRound;
    if (round === 1) {
      // First round: receives losers from winner's round 1
      matchesInRound = Math.floor(firstRoundMatches / 2);
    } else if (isDropInRound) {
      // Drop-in rounds: existing matches + space for new drops
      matchesInRound = currentMatches;
    } else {
      // Elimination rounds: reduce by half
      matchesInRound = Math.floor(currentMatches / 2);
    }
    
    // Create matches for this round
    for (let pos = 0; pos < matchesInRound; pos++) {
      const positionKey = `loser-${round}-${pos}`;
      
      // Skip if this position is already taken by a completed match
      if (completedPositions.has(positionKey)) {
        continue;
      }
      
      const match = {
        tournamentId,
        player1Id: undefined,
        player2Id: undefined,
        round,
        bracketPosition: pos,
        player1Score: 0,
        player2Score: 0,
        status: "pending",
        completedAt: undefined,
        winnerId: undefined,
        nextMatchId: undefined,
        nextLooserMatchId: undefined,
        bracketType: "loser" as const,
      };
      
      const insertedId = await ctx.db.insert("matches", match);
      matches.push({ ...match, _id: insertedId });
    }
    
    currentMatches = matchesInRound;
    
    // Stop if we reach 1 match (loser bracket final)
    if (matchesInRound === 1) {
      break;
    }
  }
  
  // Set up nextMatchId for loser's bracket
  const loserMatches = matches.filter(m => m.bracketType === "loser");
  for (let round = 1; round < numLoserRounds; round++) {
    const roundMatches = loserMatches.filter(m => m.round === round);
    for (let i = 0; i < roundMatches.length; i++) {
      const nextRound = round + 1;
      const nextPosition = Math.floor(i / 2);
      const nextMatch = loserMatches.find(m => 
        m.round === nextRound && 
        m.bracketPosition === nextPosition
      );
      
      if (nextMatch) {
        await ctx.db.patch(roundMatches[i]._id, {
          nextMatchId: nextMatch._id
        });
      }
    }
  }
  
  // Create Grand Final match
  const grandFinalMatch = {
    tournamentId,
    player1Id: undefined, // Will be winner of winner's bracket
    player2Id: undefined, // Will be winner of loser's bracket
    round: numWinnerRounds + 1,
    bracketPosition: 0,
    player1Score: 0,
    player2Score: 0,
    status: "pending",
    completedAt: undefined,
    winnerId: undefined,
    nextMatchId: undefined,
    nextLooserMatchId: undefined,
    bracketType: "grand_final" as const,
  };
  
  const grandFinalId = await ctx.db.insert("matches", grandFinalMatch);
  matches.push({ ...grandFinalMatch, _id: grandFinalId });
  
  // Map winner's bracket matches to loser's bracket matches
  for (let i = 0; i < winnerMatches.length; i++) {
    const match = winnerMatches[i];
    
    // Calculate which loser's bracket round this winner's bracket match feeds into
    // Formula: Winner's bracket round N feeds into loser's bracket round (2*N - 1)
    const targetLoserRound = (match.round * 2) - 1;
    
    // Find the appropriate loser's bracket match
    let loserMatch;
    
    if (match.round === 1) {
      // First round: each pair of winner's matches feeds one loser's match
      loserMatch = loserMatches.find(m => 
        m.round === 1 && 
        m.bracketPosition === Math.floor(match.bracketPosition / 2)
      );
    } else {
      // Later rounds: find available match in the drop-in round
      const availableMatches = loserMatches.filter(m => m.round === targetLoserRound);
      
      // Try to find a match that doesn't have a designated drop-in yet
      loserMatch = availableMatches.find(m => 
        m.bracketPosition === match.bracketPosition % availableMatches.length
      );
      
      // If not found, use the first available match
      if (!loserMatch && availableMatches.length > 0) {
        loserMatch = availableMatches[0];
      }
    }
    
    if (loserMatch) {
      await ctx.db.patch(match._id, {
        nextLooserMatchId: loserMatch._id,
      });
    } else {
      console.warn(`Could not find loser bracket match for winner's bracket R${match.round} P${match.bracketPosition}`);
    }
  }
  
  return { 
    message: "Double elimination bracket generated", 
    numWinnerRounds, 
    numLoserRounds,
    totalMatches: matches.length,
    numPlayers,
    bracketSize,
    preservedMatches: completedMatches.length
  };
}

// Generate round robin bracket
async function generateRoundRobin(
  ctx: any,
  tournamentId: Id<"tournaments">,
  players: any[],
  completedMatches: any[] = []
) {
  const numPlayers = players.length;
  let matchPosition = 0;
  
  // Track players already in completed matches
  const placedPlayers = new Set<Id<"players">>();
  completedMatches.forEach(m => {
    if (m.player1Id) placedPlayers.add(m.player1Id);
    if (m.player2Id) placedPlayers.add(m.player2Id);
  });
  
  // Track completed match positions to avoid duplicates
  const completedPositions = new Set(completedMatches.map(m => `${m.player1Id}-${m.player2Id}`));
  
  // Create matches for every player vs every other player
  // Skip matches that are already completed
  for (let i = 0; i < numPlayers; i++) {
    for (let j = i + 1; j < numPlayers; j++) {
      const player1Id = players[i].playerId;
      const player2Id = players[j].playerId;
      const positionKey1 = `${player1Id}-${player2Id}`;
      const positionKey2 = `${player2Id}-${player1Id}`;
      
      // Skip if this match is already completed
      if (completedPositions.has(positionKey1) || completedPositions.has(positionKey2)) {
        continue;
      }
      
      await ctx.db.insert("matches", {
        tournamentId,
        player1Id,
        player2Id,
        round: 1, // All matches are in "round 1" for round robin
        bracketPosition: matchPosition,
        player1Score: 0,
        player2Score: 0,
        status: "pending",
        completedAt: undefined,
        winnerId: undefined,
      });
      matchPosition++;
    }
  }
  
  return { 
    message: "Round robin bracket generated", 
    numRounds: 1, 
    numPlayers,
    preservedMatches: completedMatches.length
  };
}

// Helper function to mark TBD vs TBD matches as completed when next round starts
async function completeTbdMatchesInPreviousRound(
  ctx: any,
  tournamentId: Id<"tournaments">,
  currentRound: number,
  bracketType?: "winner" | "loser" | "grand_final" | null
) {
  const previousRound = currentRound - 1;
  if (previousRound < 1) return; // No previous round for round 1
  
  // Get all matches in the previous round
  const previousRoundMatches = await ctx.db
    .query("matches")
    .withIndex("by_round", (q: any) => 
      q.eq("tournamentId", tournamentId).eq("round", previousRound)
    )
    .collect();
  
  // Filter by bracket type if specified
  const matchesToCheck = bracketType 
    ? previousRoundMatches.filter((m: any) => m.bracketType === bracketType)
    : previousRoundMatches;
  
  // Find TBD vs TBD matches (both player1Id and player2Id are null/undefined)
  const tbdMatches = matchesToCheck.filter((match: any) => 
    match.status !== "completed" && 
    !match.player1Id && 
    !match.player2Id
  );
  
  // Mark all TBD vs TBD matches as completed
  for (const match of tbdMatches) {
    console.log(`[completeTbdMatchesInPreviousRound] Marking TBD vs TBD match ${match._id} as completed (round ${previousRound})`);
    await ctx.db.patch(match._id, {
      status: "completed",
      completedAt: Date.now(),
      // No winnerId since both players are TBD
      player1Score: 0,
      player2Score: 0,
    });
  }
  
  if (tbdMatches.length > 0) {
    console.log(`[completeTbdMatchesInPreviousRound] Completed ${tbdMatches.length} TBD vs TBD matches in round ${previousRound}`);
  }
}

// Helper function to advance winner to next round
async function advanceToNextRound(
  ctx: any,
  tournamentId: Id<"tournaments">,
  currentMatch: any,
  winnerId: Id<"players">
) {
  const loserId = winnerId === currentMatch.player1Id ? currentMatch.player2Id : currentMatch.player1Id;
  
  // Before advancing, check if we're moving to a new round and complete any TBD vs TBD matches
  const nextRound = currentMatch.round + 1;
  const nextRoundMatches = await ctx.db
    .query("matches")
    .withIndex("by_round", (q: any) => 
      q.eq("tournamentId", tournamentId).eq("round", nextRound)
    )
    .collect();
  
  // If there are matches in the next round, check if any have players assigned
  // This indicates the round has started, so we should complete TBD matches in current round
  const nextRoundHasPlayers = nextRoundMatches.some((m: any) => m.player1Id || m.player2Id);
  
  if (nextRoundHasPlayers || nextRoundMatches.length > 0) {
    // Complete TBD vs TBD matches in the current round (which is becoming the previous round)
    await completeTbdMatchesInPreviousRound(
      ctx, 
      tournamentId, 
      nextRound, 
      currentMatch.bracketType || undefined
    );
  }
  
  if (currentMatch.bracketType === "winner") {
    // Winner's bracket advancement
    await advanceWinnerBracket(ctx, tournamentId, currentMatch, winnerId);
    
    // Drop loser to loser's bracket (if there's a drop match configured)
    if (currentMatch.nextLooserMatchId) {
      await dropToLoserBracket(ctx, currentMatch.nextLooserMatchId, loserId);
    } else {
      // If no specific loser match is configured, try to find an appropriate one
      await findAndPlaceInLoserBracket(ctx, tournamentId, currentMatch, loserId);
    }
    
  } else if (currentMatch.bracketType === "loser") {
    // Loser's bracket advancement
    await advanceLoserBracket(ctx, tournamentId, currentMatch, winnerId);
    
  } else if (currentMatch.bracketType === "grand_final") {
    // Grand final logic
    await handleGrandFinal(ctx, tournamentId, currentMatch, winnerId, loserId);
  } else {
    // Single elimination or no bracket type - still complete TBD matches
    await advanceWinnerBracket(ctx, tournamentId, currentMatch, winnerId);
  }
}

// Advance winner in winner's bracket
async function advanceWinnerBracket(
  ctx: any,
  tournamentId: Id<"tournaments">,
  currentMatch: any,
  winnerId: Id<"players">
) {
  const nextRound = currentMatch.round + 1;
  const nextPosition = Math.floor(currentMatch.bracketPosition / 2);
  
  // First try to find a next match in winner's bracket
  const nextMatch = await ctx.db
    .query("matches")
    .withIndex("by_round", (q: any) => 
      q.eq("tournamentId", tournamentId).eq("round", nextRound)
    )
    .filter((q: any) => q.eq(q.field("bracketPosition"), nextPosition))
    .filter((q: any) => q.eq(q.field("bracketType"), "winner"))
    .first();
    
  if (nextMatch) {
    // Regular winner's bracket advancement
    const isFirstPlayer = currentMatch.bracketPosition % 2 === 0;
    
    // After assigning player to next match, check if we should complete TBD matches
    if (isFirstPlayer) {
      await ctx.db.patch(nextMatch._id, {
        player1Id: winnerId,
      });
    } else {
      await ctx.db.patch(nextMatch._id, {
        player2Id: winnerId,
      });
    }
    
    // Check if next match now has at least one player (round has started)
    const updatedNextMatch = await ctx.db.get(nextMatch._id);
    if (updatedNextMatch && (updatedNextMatch.player1Id || updatedNextMatch.player2Id)) {
      // At least one player assigned - round has started, complete any TBD vs TBD matches in previous round
      await completeTbdMatchesInPreviousRound(
        ctx,
        tournamentId,
        nextRound,
        "winner"
      );
    }
  } else {
    // No next winner's bracket match - this must be winner's bracket final
    // Send winner to grand final
    const grandFinalMatch = await ctx.db
      .query("matches")
      .withIndex("by_bracket_type", (q: any) => 
        q.eq("tournamentId", tournamentId).eq("bracketType", "grand_final")
      )
      .first();

    if (grandFinalMatch && !grandFinalMatch.player1Id) {
      await ctx.db.patch(grandFinalMatch._id, {
        player1Id: winnerId, // Winner's bracket winner is player1 in grand final
      });
      
      // Check if grand final now has at least one player (round has started)
      const updatedGrandFinal = await ctx.db.get(grandFinalMatch._id);
      if (updatedGrandFinal && (updatedGrandFinal.player1Id || updatedGrandFinal.player2Id)) {
        // At least one player assigned - round has started, complete TBD matches in previous round
        await completeTbdMatchesInPreviousRound(
          ctx,
          tournamentId,
          grandFinalMatch.round,
          "winner"
        );
      }
    }
  }
}

// Advance winner in loser's bracket
async function advanceLoserBracket(
  ctx: any,
  tournamentId: Id<"tournaments">,
  currentMatch: any,
  winnerId: Id<"players">
) {
  const nextRound = currentMatch.round + 1;
  const nextPosition = Math.floor(currentMatch.bracketPosition / 2);
  
  // First try to find a next match in loser's bracket
  const nextMatch = await ctx.db
    .query("matches")
    .withIndex("by_bracket_type", (q: any) => 
      q.eq("tournamentId", tournamentId).eq("bracketType", "loser")
    )
    .filter((q: any) => q.eq(q.field("round"), nextRound))
    .filter((q: any) => q.eq(q.field("bracketPosition"), nextPosition))
    .first();
    
  if (nextMatch) {
    // Regular loser's bracket advancement
    const isFirstPlayer = currentMatch.bracketPosition % 2 === 0;
    
    if (isFirstPlayer) {
      await ctx.db.patch(nextMatch._id, {
        player1Id: winnerId,
      });
    } else {
      await ctx.db.patch(nextMatch._id, {
        player2Id: winnerId,
      });
    }
    
    // Check if next match now has at least one player (round has started)
    const updatedNextMatch = await ctx.db.get(nextMatch._id);
    if (updatedNextMatch && (updatedNextMatch.player1Id || updatedNextMatch.player2Id)) {
      // At least one player assigned - round has started, complete any TBD vs TBD matches in previous round
      await completeTbdMatchesInPreviousRound(
        ctx,
        tournamentId,
        nextRound,
        "loser"
      );
    }
  } else {
    // No next loser's bracket match - this must be loser's bracket final
    // Send winner to grand final as player2
    const grandFinalMatch = await ctx.db
      .query("matches")
      .withIndex("by_bracket_type", (q: any) => 
        q.eq("tournamentId", tournamentId).eq("bracketType", "grand_final")
      )
      .first();

    if (grandFinalMatch && !grandFinalMatch.player2Id) {
      await ctx.db.patch(grandFinalMatch._id, {
        player2Id: winnerId, // Loser's bracket winner is player2 in grand final
      });
      
      // Check if grand final now has at least one player (round has started)
      const updatedGrandFinal = await ctx.db.get(grandFinalMatch._id);
      if (updatedGrandFinal && (updatedGrandFinal.player1Id || updatedGrandFinal.player2Id)) {
        // At least one player assigned - round has started, complete TBD matches in previous round
        await completeTbdMatchesInPreviousRound(
          ctx,
          tournamentId,
          grandFinalMatch.round,
          "loser"
        );
      }
    }
  }
}

// Drop loser to loser's bracket
async function dropToLoserBracket(
  ctx: any,
  loserMatchId: Id<"matches">,
  loserId: Id<"players">
) {
  const loserMatch = await ctx.db.get(loserMatchId);
  if (!loserMatch) {
    console.warn(`Loser match ${loserMatchId} not found`);
    return;
  }

  // Check if the match already has both players assigned
  if (loserMatch.player1Id && loserMatch.player2Id) {
    console.warn(`Loser match ${loserMatchId} already has both players assigned`);
    return;
  }

  // Determine which slot to fill in loser's bracket
  if (!loserMatch.player1Id) {
    await ctx.db.patch(loserMatch._id, {
      player1Id: loserId,
    });
  } else if (!loserMatch.player2Id) {
    await ctx.db.patch(loserMatch._id, {
      player2Id: loserId,
    });
  }
}

// Handle grand final logic (with reset if needed)
async function handleGrandFinal(
  ctx: any,
  tournamentId: Id<"tournaments">,
  currentMatch: any,
  winnerId: Id<"players">,
  loserId: Id<"players">
) {
  // In grand final, player1 is from winner's bracket, player2 is from loser's bracket
  const isWinnerBracketPlayer = winnerId === currentMatch.player1Id;
  
  if (isWinnerBracketPlayer) {
    // Winner's bracket player wins - tournament over, they are champion
    // No additional action needed, tournament is complete
    
  } else {
    // Loser's bracket player wins - reset the bracket (both players have 1 loss now)
    // Create a new grand final match
    const resetMatch = await ctx.db.insert("matches", {
      tournamentId,
      player1Id: winnerId, // Previous loser bracket winner
      player2Id: loserId,  // Previous winner bracket player (now has 1 loss)
      round: currentMatch.round + 1,
      bracketPosition: 0,
      player1Score: 0,
      player2Score: 0,
      status: "pending",
      completedAt: undefined,
      winnerId: undefined,
      nextMatchId: undefined,
      nextLooserMatchId: undefined,
      bracketType: "grand_final",
    });
    
  }
}

// Advance winner to next round
export const advanceWinner = mutation({
  args: { 
    matchId: v.id("matches"),
    winnerId: v.id("players") 
  },
  handler: async (ctx, { matchId, winnerId }) => {
    const match = await ctx.db.get(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Calculate next round position
    const nextRound = match.round + 1;
    const nextPosition = Math.floor(match.bracketPosition / 2);

    // Create or update next round match
    await advanceToNextRound(ctx, match.tournamentId, match, winnerId);

    return { success: true };
  },
});

// Get tournament bracket structure
export const getBracketStructure = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, { tournamentId }) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    // Group matches by round
    const rounds = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, typeof matches>);

    // Sort matches within each round by bracket position
    Object.keys(rounds).forEach(round => {
      rounds[parseInt(round)].sort((a, b) => a.bracketPosition - b.bracketPosition);
    });

    const numRounds = Math.max(...Object.keys(rounds).map(r => parseInt(r)));

    return {
      rounds,
      numRounds,
      totalMatches: matches.length,
    };
  },
});

// Add a late player to an existing bracket
export const addLatePlayerToBracket = mutation({
  args: {
    tournamentId: v.id("tournaments"),
    playerId: v.id("players"),
  },
  handler: async (ctx, { tournamentId, playerId }) => {
    // Get tournament info
    const tournament = await ctx.db.get(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Verify player exists
    const player = await ctx.db.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Check if player is registered and checked in
    const registration = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .filter((q) => q.eq(q.field("playerId"), playerId))
      .first();

    if (!registration) {
      throw new Error("Player is not registered for this tournament");
    }

    if (!registration.checkedIn) {
      throw new Error("Player must be checked in before adding to bracket");
    }

    // Get all matches for this tournament
    const allMatches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    if (allMatches.length === 0) {
      throw new Error("Bracket has not been generated yet. Please generate the bracket first.");
    }

    // Check if player is already in the bracket
    const playerAlreadyInBracket = allMatches.some(
      (m) => m.player1Id === playerId || m.player2Id === playerId
    );

    if (playerAlreadyInBracket) {
      throw new Error("Player is already in the bracket");
    }

    // Get all checked-in players to calculate bracket size
    const allRegistrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .filter((q) => q.eq(q.field("checkedIn"), true))
      .collect();

    // Calculate bracket size based on current checked-in players (including this new one)
    const totalCheckedInPlayers = allRegistrations.length;
    const bracketSize = Math.max(16, Math.pow(2, Math.ceil(Math.log2(Math.max(totalCheckedInPlayers, 2)))));
    const maxFirstRoundMatches = bracketSize / 2;

    // Count how many players are currently in the bracket
    const playersInBracket = new Set(
      allMatches.flatMap(m => [m.player1Id, m.player2Id].filter(Boolean))
    );
    const playersInBracketCount = playersInBracket.size;

    // If adding this player would exceed the bracket size, suggest regenerating
    if (playersInBracketCount >= bracketSize) {
      throw new Error(
        `Bracket is full (${bracketSize} players). Cannot add more players without regenerating the bracket. ` +
        `Please use "Regenerate Bracket" to expand to a larger bracket size.`
      );
    }

    // Find first round matches (round 1)
    const firstRoundMatches = allMatches
      .filter((m) => m.round === 1 && (!m.bracketType || m.bracketType === "winner"))
      .sort((a, b) => a.bracketPosition - b.bracketPosition);

    // Find an empty slot (match with no players or only one player)
    // Only look within the bracket size limit
    let targetMatch = firstRoundMatches
      .filter((m) => m.bracketPosition < maxFirstRoundMatches)
      .find((m) => !m.player1Id || !m.player2Id);

    if (!targetMatch) {
      // Check if we've reached the bracket size limit
      if (firstRoundMatches.length >= maxFirstRoundMatches) {
        throw new Error(
          `Bracket is full. Cannot add more players. Current bracket size: ${bracketSize} players (${maxFirstRoundMatches} matches). ` +
          `Please regenerate the bracket to accommodate more players.`
        );
      }

      // No empty slots in first round within bracket size, need to create a new match
      // Find the highest bracket position in round 1
      const maxPosition = Math.max(
        ...firstRoundMatches.map((m) => m.bracketPosition),
        -1
      );

      // Ensure we don't exceed the bracket size
      if (maxPosition + 1 >= maxFirstRoundMatches) {
        throw new Error(
          `Bracket is full. Cannot add more players. Current bracket size: ${bracketSize} players (${maxFirstRoundMatches} matches). ` +
          `Please regenerate the bracket to accommodate more players.`
        );
      }

      // Create a new match in round 1
      const newMatch: {
        tournamentId: Id<"tournaments">;
        player1Id: Id<"players">;
        player2Id: Id<"players"> | undefined;
        round: number;
        bracketPosition: number;
        player1Score: number;
        player2Score: number;
        status: "pending";
        bracketType: "winner";
        nextMatchId: Id<"matches"> | undefined;
        nextLooserMatchId: Id<"matches"> | undefined;
      } = {
        tournamentId,
        player1Id: playerId,
        player2Id: undefined,
        round: 1,
        bracketPosition: maxPosition + 1,
        player1Score: 0,
        player2Score: 0,
        status: "pending",
        bracketType: "winner",
        nextMatchId: undefined,
        nextLooserMatchId: undefined,
      };

      // Find the next round match this should point to
      const nextRound = 2;
      const nextRoundMatches = allMatches.filter(
        (m) => m.round === nextRound && (!m.bracketType || m.bracketType === "winner")
      );

      if (nextRoundMatches.length > 0) {
        // Calculate which match in round 2 this should point to
        const nextPosition = Math.floor((maxPosition + 1) / 2);
        const nextMatch = nextRoundMatches.find(
          (m) => m.bracketPosition === nextPosition
        );

        if (nextMatch) {
          newMatch.nextMatchId = nextMatch._id;
        } else {
          // Use the last match in round 2 if calculated position doesn't exist
          const sortedNextMatches = [...nextRoundMatches].sort(
            (a, b) => a.bracketPosition - b.bracketPosition
          );
          if (sortedNextMatches.length > 0) {
            newMatch.nextMatchId =
              sortedNextMatches[sortedNextMatches.length - 1]._id;
          }
        }
      }

      const insertedId = await ctx.db.insert("matches", newMatch);
      return {
        success: true,
        message: "Late player added to new match in bracket",
        matchId: insertedId,
      };
    }

    // Add player to existing empty slot
    const updateData: any = {};
    if (!targetMatch.player1Id) {
      updateData.player1Id = playerId;
    } else if (!targetMatch.player2Id) {
      updateData.player2Id = playerId;
    }

    // If this was a bye match (only one player), mark it as pending since it now has two players
    if (targetMatch.status === "completed" && targetMatch.winnerId) {
      updateData.status = "pending";
      updateData.winnerId = undefined;
      updateData.player1Score = 0;
      updateData.player2Score = 0;
      updateData.completedAt = undefined;
    }

    await ctx.db.patch(targetMatch._id, updateData);

    return {
      success: true,
      message: "Late player added to existing match in bracket",
      matchId: targetMatch._id,
    };
  },
});

// Get bracket data formatted for G-Loot library
export const getGLootBracketData = query({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, { tournamentId }) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    if (matches.length === 0) {
      return { matches: [], idMap: {} };
    }

    // Get player info for each match
    const matchesWithPlayers = await Promise.all(
      matches.map(async (match) => {
        const player1 = match.player1Id ? await ctx.db.get(match.player1Id) : null;
        const player2 = match.player2Id ? await ctx.db.get(match.player2Id) : null;
        const winner = match.winnerId ? await ctx.db.get(match.winnerId) : null;

        return {
          ...match,
          player1,
          player2,
          winner,
        };
      })
    );

    // Create a mapping from Convex IDs to sequential integer IDs
    // Sort by bracket type, then round, then position for consistent ordering
    const sortedMatches = [...matchesWithPlayers].sort((a, b) => {
      // Sort by bracket type first (winner, loser, grand_final)
      const bracketOrder = { "winner": 0, "loser": 1, "grand_final": 2 };
      const aOrder = bracketOrder[(a.bracketType || "winner") as keyof typeof bracketOrder] ?? 0;
      const bOrder = bracketOrder[(b.bracketType || "winner") as keyof typeof bracketOrder] ?? 0;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Then by round
      if (a.round !== b.round) return a.round - b.round;
      
      // Finally by bracket position
      return a.bracketPosition - b.bracketPosition;
    });

    // Create ID mapping
    const idMap: Record<string, number> = {};
    sortedMatches.forEach((match, index) => {
      idMap[match._id] = index;
    });

    // Find the grand final match for later reference
    const grandFinalMatch = sortedMatches.find(m => m.bracketType === "grand_final");
    const grandFinalIndex = grandFinalMatch ? idMap[grandFinalMatch._id] : null;
    
    // Find the final matches of winner and loser brackets
    const winnerFinal = sortedMatches
      .filter(m => m.bracketType === "winner")
      .sort((a, b) => b.round - a.round)[0];
    const loserFinal = sortedMatches
      .filter(m => m.bracketType === "loser")
      .sort((a, b) => b.round - a.round)[0];
    
    // Transform to G-Loot format
    const gLootMatches = sortedMatches.map((match, index) => {
      // Calculate nextMatchId as integer
      let nextMatchId: number | null = null;
      
      // Special handling for bracket finals that lead to grand final
      if (grandFinalIndex !== null && match._id === winnerFinal?._id) {
        nextMatchId = grandFinalIndex;
      } else if (grandFinalIndex !== null && match._id === loserFinal?._id) {
        nextMatchId = grandFinalIndex;
      } else if (match.nextMatchId) {
        nextMatchId = idMap[match.nextMatchId] ?? null;
      }

      // For double elimination, track where losers go
      let nextLooserMatchId: number | null = null;
      if (match.nextLooserMatchId) {
        nextLooserMatchId = idMap[match.nextLooserMatchId] ?? null;
      }

      return {
        id: index,
        convexId: match._id,
        name: match.bracketType === "grand_final" 
          ? "Grand Final"
          : match.bracketType === "loser"
          ? `LB R${match.round}`
          : `R${match.round}`,
        nextMatchId,
        nextLooserMatchId,
        tournamentRoundText: match.bracketType === "grand_final"
          ? "Grand Final"
          : match.bracketType === "loser"
          ? `Loser Round ${match.round}`
          : `Round ${match.round}`,
        startTime: new Date().toISOString(),
        state: match.status === "completed" ? "DONE" as const : 
               match.status === "in_progress" ? "RUNNING" as const : 
               "SCHEDULED" as const,
        participants: [
          {
            id: match.player1Id || `tbd-1-${index}`,
            name: match.player1?.name || "TBD",
            isWinner: Boolean(match.winnerId && match.winnerId === match.player1Id),
            resultText: match.winnerId === match.player1Id ? "W" : 
                       match.status === "completed" ? "L" : "",
            status: match.player1Id ? "PLAYED" as const : "NO_SHOW" as const,
          },
          {
            id: match.player2Id || `tbd-2-${index}`,
            name: match.player2?.name || "TBD",
            isWinner: Boolean(match.winnerId && match.winnerId === match.player2Id),
            resultText: match.winnerId === match.player2Id ? "W" : 
                       match.status === "completed" ? "L" : "",
            status: match.player2Id ? "PLAYED" as const : "NO_SHOW" as const,
          },
        ],
        // Include original match data for display
        tableNumber: match.tableNumber,
        player1Score: match.player1Score,
        player2Score: match.player2Score,
        bracketType: match.bracketType || "winner",
        round: match.round,
        bracketPosition: match.bracketPosition,
      };
    });

    return {
      matches: gLootMatches,
      idMap, // Return the ID mapping in case needed
    };
  },
});

// Find and place loser in appropriate loser bracket match
async function findAndPlaceInLoserBracket(
  ctx: any,
  tournamentId: Id<"tournaments">,
  currentMatch: any,
  loserId: Id<"players">
) {
  // Calculate which loser's bracket round this winner's bracket match should feed into
  const targetLoserRound = (currentMatch.round * 2) - 1;
  
  // Look for an available loser's bracket match in the target round
  const availableMatches = await ctx.db
    .query("matches")
    .withIndex("by_bracket_type", (q: any) => 
      q.eq("tournamentId", tournamentId).eq("bracketType", "loser")
    )
    .filter((q: any) => q.eq(q.field("round"), targetLoserRound))
    .collect();
  
  // Find a match that needs a player
  for (const match of availableMatches) {
    if (!match.player1Id) {
      await ctx.db.patch(match._id, {
        player1Id: loserId,
      });
      return;
    } else if (!match.player2Id) {
      await ctx.db.patch(match._id, {
        player2Id: loserId,
      });
      return;
    }
  }
  
  // If no available match found, create a new one if needed
  console.warn(`No available loser bracket match found for player ${loserId} from winner's bracket round ${currentMatch.round}`);
}

// Mutation: Assign table to match
export const assignTable = mutation({
  args: {
    id: v.id("matches"),
    tableNumber: v.optional(v.number()),
  },
  handler: async (ctx, { id, tableNumber }) => {
    const match = await ctx.db.get(id);
    if (!match) {
      throw new Error("Match not found");
    }

    // If there was a previous table assignment, set it back to OPEN
    if (match.tableNumber) {
      const allTables = await ctx.db
        .query("tables")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", match.tournamentId))
        .collect();
      
      const previousTable = allTables.find(t => t.startNumber === match.tableNumber);
      
      if (previousTable) {
        await ctx.db.patch(previousTable._id, {
          status: "OPEN",
        });
      }
    }

    // Update match with new table assignment
    await ctx.db.patch(id, {
      tableNumber,
    });

    // If assigning a new table, set it to IN_USE
    if (tableNumber) {
      const allTables = await ctx.db
        .query("tables")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", match.tournamentId))
        .collect();
      
      const newTable = allTables.find(t => t.startNumber === tableNumber);
      
      if (newTable) {
        await ctx.db.patch(newTable._id, {
          status: "IN_USE",
        });
      }
    }

    return match;
  },
});

// Mutation: Update match status
export const updateStatus = mutation({
  args: {
    id: v.id("matches"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, { id, status }) => {
    const match = await ctx.db.get(id);
    if (!match) {
      throw new Error("Match not found");
    }

    // If match is being completed, unassign the table
    if (status === "completed" && match.tableNumber) {
      const allTables = await ctx.db
        .query("tables")
        .withIndex("by_tournament", (q) => q.eq("tournamentId", match.tournamentId))
        .collect();
      
      const assignedTable = allTables.find(t => t.startNumber === match.tableNumber);
      
      if (assignedTable) {
        await ctx.db.patch(assignedTable._id, {
          status: "OPEN",
        });
      }
    }

    await ctx.db.patch(id, {
      status,
      completedAt: status === "completed" ? Date.now() : match.completedAt,
      tableNumber: status === "completed" ? null : match.tableNumber,
    });

    return match;
  },
});

// Mutation: Update match with full details (status, scores, table, start time)
export const updateMatch = mutation({
  args: {
    id: v.id("matches"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    )),
    player1Score: v.optional(v.number()),
    player2Score: v.optional(v.number()),
    tableNumber: v.optional(v.union(v.null(), v.number())),
    winnerId: v.optional(v.id("players")), // Schema doesn't allow null, only undefined or valid ID
    scheduledAt: v.optional(v.union(v.null(), v.number())),
  },
  handler: async (ctx, { id, status, player1Score, player2Score, tableNumber, winnerId, scheduledAt }) => {
    const match = await ctx.db.get(id);
    if (!match) {
      throw new Error("Match not found");
    }

    const updates: any = {};
    
    if (status !== undefined) {
      updates.status = status;
      if (status === "completed" && !match.completedAt) {
        updates.completedAt = Date.now();
        
        // If match is being completed, unassign the table
        if (match.tableNumber) {
          const allTables = await ctx.db
            .query("tables")
            .withIndex("by_tournament", (q) => q.eq("tournamentId", match.tournamentId))
            .collect();
          
          const assignedTable = allTables.find(t => t.startNumber === match.tableNumber);
          
          if (assignedTable) {
            await ctx.db.patch(assignedTable._id, {
              status: "OPEN",
            });
          }
          
          updates.tableNumber = null;
        }
      }
    }
    
    if (player1Score !== undefined) updates.player1Score = player1Score;
    if (player2Score !== undefined) updates.player2Score = player2Score;
    
    // Handle table assignment/unassignment and update table status
    if (tableNumber !== undefined) {
      const oldTableNumber = match.tableNumber;
      
      // If there was a previous table assignment, set it back to OPEN
      if (oldTableNumber && oldTableNumber !== tableNumber) {
        const allTables = await ctx.db
          .query("tables")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", match.tournamentId))
          .collect();
        
        const previousTable = allTables.find(t => t.startNumber === oldTableNumber);
        
        if (previousTable) {
          await ctx.db.patch(previousTable._id, {
            status: "OPEN",
          });
        }
      }

      updates.tableNumber = tableNumber;

      // If assigning a new table, set it to IN_USE
      if (tableNumber !== null) {
        const allTables = await ctx.db
          .query("tables")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", match.tournamentId))
          .collect();
        
        const newTable = allTables.find(t => t.startNumber === tableNumber);
        
        if (newTable) {
          await ctx.db.patch(newTable._id, {
            status: "IN_USE",
          });
        }
      }
    }
    
    // Only update winnerId if it's a valid ID (not null or undefined)
    if (winnerId !== undefined && winnerId !== null) {
      updates.winnerId = winnerId;
      if (!match.completedAt) {
        updates.completedAt = Date.now();
        updates.status = "completed";
        
        // If match is being completed, unassign the table
        if (match.tableNumber) {
          const allTables = await ctx.db
            .query("tables")
            .withIndex("by_tournament", (q) => q.eq("tournamentId", match.tournamentId))
            .collect();
          
          const assignedTable = allTables.find(t => t.startNumber === match.tableNumber);
          
          if (assignedTable) {
            await ctx.db.patch(assignedTable._id, {
              status: "OPEN",
            });
          }
          
          updates.tableNumber = null;
        }
      }
    }
    
    // Note: scheduledAt would need to be added to schema if not present
    // For now, we'll skip it or use completedAt field differently

    await ctx.db.patch(id, updates);

    // If winner is set, advance to next round
    if (winnerId && match.tournamentId) {
      await advanceToNextRound(ctx, match.tournamentId, match, winnerId);
    }
    
    // If a player was assigned to this match, check if we need to complete TBD matches in previous round
    const updatedMatch = await ctx.db.get(id);
    if (updatedMatch && (updates.player1Id !== undefined || updates.player2Id !== undefined)) {
      // A player was assigned - check if this is the first player in this round
      const roundMatches = await ctx.db
        .query("matches")
        .withIndex("by_round", (q: any) => 
          q.eq("tournamentId", updatedMatch.tournamentId).eq("round", updatedMatch.round)
        )
        .collect();
      
      // Check if any match in this round has a player assigned (round has started)
      const roundHasPlayers = roundMatches.some(m => m.player1Id || m.player2Id);
      if (roundHasPlayers && updatedMatch.round > 1) {
        // Round has started - complete TBD matches in previous round
        await completeTbdMatchesInPreviousRound(
          ctx,
          updatedMatch.tournamentId,
          updatedMatch.round,
          updatedMatch.bracketType || undefined
        );
      }
    }

    return match;
  },
});