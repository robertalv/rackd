import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Get tournament registrations by user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      registrations.map(async (registration) => {
        const tournament = registration.tournamentId 
          ? await ctx.db.get(registration.tournamentId) 
          : null;
        const player = registration.playerId 
          ? await ctx.db.get(registration.playerId) 
          : null;

        let venue = null;
        if (tournament?.venueId) {
          venue = await ctx.db.get(tournament.venueId);
        }

        // Use stored position and winnings if available, otherwise calculate (for backwards compatibility)
        let position: number | null = registration.position ?? null;
        let winnings: number | null = registration.winnings ?? null;
        
        // If not stored and tournament is completed, calculate it (fallback for old tournaments)
        if (!position && tournament?.status === "completed" && player?._id) {
          const matches = await ctx.db
            .query("matches")
            .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
            .collect();

          // Get all registrations to count total players
          const allRegistrations = await ctx.db
            .query("tournamentRegistrations")
            .withIndex("by_tournament", (q) => q.eq("tournamentId", tournament._id))
            .collect();
          
          const totalPlayers = allRegistrations.length;

          if (tournament.type === "single") {
            // Single elimination: Calculate position by working backwards from final
            const maxRound = Math.max(...matches.map(m => m.round), 0);
            
            // Find the final match (highest round, winner bracket)
            const finalMatch = matches.find(m => 
              m.round === maxRound && 
              (!m.bracketType || m.bracketType === "winner") &&
              m.status === "completed"
            );
            
            if (finalMatch?.winnerId === player._id) {
              position = 1;
            } else if (finalMatch) {
              // Player lost in final = 2nd place
              const isInFinal = finalMatch.player1Id === player._id || finalMatch.player2Id === player._id;
              if (isInFinal) {
                position = 2;
              } else {
                // Find when player was eliminated
                const playerLosses = matches.filter(m => 
                  (m.player1Id === player._id || m.player2Id === player._id) && 
                  m.status === "completed" &&
                  m.winnerId &&
                  m.winnerId !== player._id
                );
                
                if (playerLosses.length > 0) {
                  // Find the latest loss (highest round where they lost)
                  const lastLoss = playerLosses.reduce((latest, match) => {
                    if (!latest || match.round > latest.round) {
                      return match;
                    }
                    if (match.round === latest.round && match.completedAt && latest.completedAt) {
                      return match.completedAt > latest.completedAt ? match : latest;
                    }
                    return latest;
                  }, null as any);

                  if (lastLoss) {
                    // Calculate position based on elimination round
                    // In single elimination, position = number of players eliminated before + 1
                    // Players eliminated in round R are in positions: (totalPlayers / 2^R) + 1 to totalPlayers / 2^(R-1)
                    const eliminationRound = lastLoss.round;
                    
                    if (eliminationRound === maxRound - 1) {
                      // Lost in semi-final = 3rd or 4th (tied for 3rd)
                      position = 3;
                    } else {
                      // Calculate how many players were eliminated in same or later rounds
                      // Position = totalPlayers - (players eliminated in rounds >= eliminationRound) + 1
                      const playersEliminatedInSameOrLaterRounds = matches.filter(m => 
                        m.status === "completed" &&
                        m.winnerId &&
                        m.round >= eliminationRound &&
                        (m.player1Id === player._id || m.player2Id === player._id || 
                         m.winnerId !== player._id)
                      ).length;
                      
                      // More accurate: count players eliminated in this round or later
                      // For round R, approximately totalPlayers / 2^R players are still in
                      const playersStillInAtRound = Math.ceil(totalPlayers / Math.pow(2, eliminationRound));
                      position = Math.max(3, playersStillInAtRound + 1);
                    }
                  }
                }
              }
            }
          } else if (tournament.type === "double") {
            // Double elimination: More complex - need to track both brackets
            const grandFinal = matches.find(m => 
              m.bracketType === "grand_final" && 
              m.status === "completed"
            );
            
            if (grandFinal?.winnerId === player._id) {
              position = 1;
            } else {
              // Check if player lost in grand final
              const isInGrandFinal = grandFinal && 
                (grandFinal.player1Id === player._id || grandFinal.player2Id === player._id);
              
              if (isInGrandFinal) {
                position = 2;
              } else {
                // Find elimination match in loser's bracket or winner's bracket final
                const playerLosses = matches.filter(m => 
                  (m.player1Id === player._id || m.player2Id === player._id) && 
                  m.status === "completed" &&
                  m.winnerId &&
                  m.winnerId !== player._id
                );
                
                if (playerLosses.length > 0) {
                  // Find the latest loss
                  const lastLoss = playerLosses.reduce((latest, match) => {
                    if (!latest || (match.completedAt && latest.completedAt && match.completedAt > latest.completedAt)) {
                      return match;
                    }
                    return latest;
                  }, null as any);

                  if (lastLoss) {
                    // For double elimination, position calculation is more complex
                    // Simplified: if lost in winner's bracket final, likely 3rd
                    // If lost in loser's bracket final, likely 3rd or 4th
                    if (lastLoss.bracketType === "winner" && lastLoss.round === Math.max(...matches.filter(m => m.bracketType === "winner").map(m => m.round))) {
                      position = 3; // Lost in winner's bracket final
                    } else {
                      // Estimate based on round and bracket
                      position = 4; // Conservative estimate for double elimination
                    }
                  }
                }
              }
            }
          } else {
            // Round robin or other formats - use simplified calculation
            const playerWins = matches.filter(m => 
              (m.player1Id === player._id || m.player2Id === player._id) && 
              m.status === "completed" &&
              m.winnerId === player._id
            ).length;
            
            // For round robin, calculate position by win count
            // Get win counts for all players
            const playerWinCounts = await Promise.all(
              allRegistrations.map(async (r) => {
                const p = r.playerId ? await ctx.db.get(r.playerId) : null;
                if (!p) return 0;
                return matches.filter(m => 
                  (m.player1Id === p._id || m.player2Id === p._id) && 
                  m.status === "completed" &&
                  m.winnerId === p._id
                ).length;
              })
            );
            
            const maxWins = Math.max(...playerWinCounts, 0);
            
            // Count how many players have more wins (better position)
            const playersWithMoreWins = playerWinCounts.filter(wins => wins > playerWins).length;
            position = playersWithMoreWins + 1;
            
            // If tied for first, position is 1
            if (playerWins === maxWins && playersWithMoreWins === 0) {
              position = 1;
            }
          }

          // Get winnings from payout structure
          if (position && tournament.payoutStructure?.payouts) {
            const payout = tournament.payoutStructure.payouts.find((p: any) => p.place === position);
            if (payout) {
              winnings = payout.amount;
            }
          }
        }

        return {
          ...registration,
          tournament: tournament ? {
            ...tournament,
            venue: venue ? {
              _id: venue._id,
              name: venue.name,
              city: venue.city,
              region: venue.region,
              country: venue.country,
            } : null,
          } : null,
          player,
          position: position ?? registration.position ?? null,
          winnings: winnings ?? registration.winnings ?? null,
          matchesWon: registration.matchesWon ?? null,
          matchesLost: registration.matchesLost ?? null,
          eliminatedAt: registration.eliminatedAt ?? null,
        };
      })
    );
  },
});

// Calculate and store tournament results for all registrations
// This should be called when a tournament is completed
export const calculateTournamentResults = mutation({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, { tournamentId }) => {
    const tournament = await ctx.db.get(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "completed") {
      throw new Error("Tournament must be completed to calculate results");
    }

    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    const matches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    // Calculate results for each registration
    for (const registration of registrations) {
      const player = registration.playerId ? await ctx.db.get(registration.playerId) : null;
      if (!player) continue;

      let position: number | null = null;
      let winnings: number | null = null;
      let matchesWon = 0;
      let matchesLost = 0;
      let eliminatedAt: number | null = null;

      // Count matches won and lost
      const playerMatches = matches.filter(m => 
        (m.player1Id === player._id || m.player2Id === player._id) && 
        m.status === "completed"
      );

      playerMatches.forEach(match => {
        if (match.winnerId === player._id) {
          matchesWon++;
        } else if (match.winnerId) {
          matchesLost++;
          // Track elimination time (latest loss)
          if (!eliminatedAt || (match.completedAt && match.completedAt > eliminatedAt)) {
            eliminatedAt = match.completedAt ?? null;
          }
        }
      });

      // Calculate position based on tournament type
      if (tournament.type === "single") {
        const maxRound = Math.max(...matches.map(m => m.round), 0);
        const finalMatch = matches.find(m => 
          m.round === maxRound && 
          (!m.bracketType || m.bracketType === "winner") &&
          m.status === "completed"
        );
        
        if (finalMatch?.winnerId === player._id) {
          position = 1;
          eliminatedAt = null; // Winner wasn't eliminated
        } else if (finalMatch) {
          const isInFinal = finalMatch.player1Id === player._id || finalMatch.player2Id === player._id;
          if (isInFinal) {
            position = 2;
          } else {
            const playerLosses = matches.filter(m => 
              (m.player1Id === player._id || m.player2Id === player._id) && 
              m.status === "completed" &&
              m.winnerId &&
              m.winnerId !== player._id
            );
            
            if (playerLosses.length > 0) {
              const lastLoss = playerLosses.reduce((latest, match) => {
                if (!latest || match.round > latest.round) {
                  return match;
                }
                if (match.round === latest.round && match.completedAt && latest.completedAt) {
                  return match.completedAt > latest.completedAt ? match : latest;
                }
                return latest;
              }, null as any);

              if (lastLoss) {
                const eliminationRound = lastLoss.round;
                if (eliminationRound === maxRound - 1) {
                  position = 3;
                } else {
                  const totalPlayers = registrations.length;
                  const playersStillInAtRound = Math.ceil(totalPlayers / Math.pow(2, eliminationRound));
                  position = Math.max(3, playersStillInAtRound + 1);
                }
              }
            }
          }
        }
      } else if (tournament.type === "double") {
        const grandFinal = matches.find(m => 
          m.bracketType === "grand_final" && 
          m.status === "completed"
        );
        
        if (grandFinal?.winnerId === player._id) {
          position = 1;
          eliminatedAt = null;
        } else {
          const isInGrandFinal = grandFinal && 
            (grandFinal.player1Id === player._id || grandFinal.player2Id === player._id);
          
          if (isInGrandFinal) {
            position = 2;
          } else {
            const playerLosses = matches.filter(m => 
              (m.player1Id === player._id || m.player2Id === player._id) && 
              m.status === "completed" &&
              m.winnerId &&
              m.winnerId !== player._id
            );
            
            if (playerLosses.length > 0) {
              const lastLoss = playerLosses.reduce((latest, match) => {
                if (!latest || (match.completedAt && latest.completedAt && match.completedAt > latest.completedAt)) {
                  return match;
                }
                return latest;
              }, null as any);

              if (lastLoss) {
                const winnerBracketMatches = matches.filter(m => m.bracketType === "winner");
                const maxWinnerRound = winnerBracketMatches.length > 0 
                  ? Math.max(...winnerBracketMatches.map(m => m.round))
                  : 0;
                
                if (lastLoss.bracketType === "winner" && lastLoss.round === maxWinnerRound) {
                  position = 3;
                } else {
                  position = 4;
                }
              }
            }
          }
        }
      } else {
        // Round robin: calculate by win count
        const playerWinCounts = await Promise.all(
          registrations.map(async (r) => {
            const p = r.playerId ? await ctx.db.get(r.playerId) : null;
            if (!p) return 0;
            return matches.filter(m => 
              (m.player1Id === p._id || m.player2Id === p._id) && 
              m.status === "completed" &&
              m.winnerId === p._id
            ).length;
          })
        );
        
        const maxWins = Math.max(...playerWinCounts, 0);
        const playersWithMoreWins = playerWinCounts.filter(wins => wins > matchesWon).length;
        position = playersWithMoreWins + 1;
        
        if (matchesWon === maxWins && playersWithMoreWins === 0) {
          position = 1;
          eliminatedAt = null;
        }
      }

      // Get winnings from payout structure
      if (position && tournament.payoutStructure?.payouts) {
        const payout = tournament.payoutStructure.payouts.find((p: any) => p.place === position);
        if (payout) {
          winnings = payout.amount;
        }
      }

      // Update registration with calculated results
      await ctx.db.patch(registration._id, {
        position,
        winnings,
        matchesWon,
        matchesLost,
        eliminatedAt,
        updatedAt: Date.now(),
      });
    }

    return { success: true, registrationsUpdated: registrations.length };
  },
});

// Internal mutation version (can be called from other backend functions)
export const calculateTournamentResultsInternal = internalMutation({
  args: { tournamentId: v.id("tournaments") },
  handler: async (ctx, { tournamentId }) => {
    // Same logic as public mutation
    const tournament = await ctx.db.get(tournamentId);
    if (!tournament || tournament.status !== "completed") {
      return;
    }

    const registrations = await ctx.db
      .query("tournamentRegistrations")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    const matches = await ctx.db
      .query("matches")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", tournamentId))
      .collect();

    for (const registration of registrations) {
      const player = registration.playerId ? await ctx.db.get(registration.playerId) : null;
      if (!player) continue;

      let position: number | null = null;
      let winnings: number | null = null;
      let matchesWon = 0;
      let matchesLost = 0;
      let eliminatedAt: number | null = null;

      const playerMatches = matches.filter(m => 
        (m.player1Id === player._id || m.player2Id === player._id) && 
        m.status === "completed"
      );

      playerMatches.forEach(match => {
        if (match.winnerId === player._id) {
          matchesWon++;
        } else if (match.winnerId) {
          matchesLost++;
          if (!eliminatedAt || (match.completedAt && match.completedAt > eliminatedAt)) {
            eliminatedAt = match.completedAt ?? null;
          }
        }
      });

      // Calculate position (same logic as above - can be extracted to a helper function)
      if (tournament.type === "single") {
        const maxRound = Math.max(...matches.map(m => m.round), 0);
        const finalMatch = matches.find(m => 
          m.round === maxRound && 
          (!m.bracketType || m.bracketType === "winner") &&
          m.status === "completed"
        );
        
        if (finalMatch?.winnerId === player._id) {
          position = 1;
          eliminatedAt = null;
        } else if (finalMatch) {
          const isInFinal = finalMatch.player1Id === player._id || finalMatch.player2Id === player._id;
          if (isInFinal) {
            position = 2;
          } else {
            const playerLosses = matches.filter(m => 
              (m.player1Id === player._id || m.player2Id === player._id) && 
              m.status === "completed" &&
              m.winnerId &&
              m.winnerId !== player._id
            );
            
            if (playerLosses.length > 0) {
              const lastLoss = playerLosses.reduce((latest, match) => {
                if (!latest || match.round > latest.round) {
                  return match;
                }
                if (match.round === latest.round && match.completedAt && latest.completedAt) {
                  return match.completedAt > latest.completedAt ? match : latest;
                }
                return latest;
              }, null as any);

              if (lastLoss) {
                const eliminationRound = lastLoss.round;
                if (eliminationRound === maxRound - 1) {
                  position = 3;
                } else {
                  const totalPlayers = registrations.length;
                  const playersStillInAtRound = Math.ceil(totalPlayers / Math.pow(2, eliminationRound));
                  position = Math.max(3, playersStillInAtRound + 1);
                }
              }
            }
          }
        }
      } else if (tournament.type === "double") {
        const grandFinal = matches.find(m => 
          m.bracketType === "grand_final" && 
          m.status === "completed"
        );
        
        if (grandFinal?.winnerId === player._id) {
          position = 1;
          eliminatedAt = null;
        } else {
          const isInGrandFinal = grandFinal && 
            (grandFinal.player1Id === player._id || grandFinal.player2Id === player._id);
          
          if (isInGrandFinal) {
            position = 2;
          } else {
            const playerLosses = matches.filter(m => 
              (m.player1Id === player._id || m.player2Id === player._id) && 
              m.status === "completed" &&
              m.winnerId &&
              m.winnerId !== player._id
            );
            
            if (playerLosses.length > 0) {
              const lastLoss = playerLosses.reduce((latest, match) => {
                if (!latest || (match.completedAt && latest.completedAt && match.completedAt > latest.completedAt)) {
                  return match;
                }
                return latest;
              }, null as any);

              if (lastLoss) {
                const winnerBracketMatches = matches.filter(m => m.bracketType === "winner");
                const maxWinnerRound = winnerBracketMatches.length > 0 
                  ? Math.max(...winnerBracketMatches.map(m => m.round))
                  : 0;
                
                if (lastLoss.bracketType === "winner" && lastLoss.round === maxWinnerRound) {
                  position = 3;
                } else {
                  position = 4;
                }
              }
            }
          }
        }
      }

      if (position && tournament.payoutStructure?.payouts) {
        const payout = tournament.payoutStructure.payouts.find((p: any) => p.place === position);
        if (payout) {
          winnings = payout.amount;
        }
      }

      await ctx.db.patch(registration._id, {
        position,
        winnings,
        matchesWon,
        matchesLost,
        eliminatedAt,
        updatedAt: Date.now(),
      });
    }
  },
});
