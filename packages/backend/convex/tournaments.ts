import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all tournaments
export const getAllTournaments = query({
  args: { 
    query: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tournaments = await ctx.db
      .query("tournaments")
      .collect();

    // Get venue info for each tournament
    let tournamentsWithVenues = await Promise.all(
      tournaments.map(async (tournament) => {
        let venue = null;
        if (tournament.venueId) {
          venue = await ctx.db.get(tournament.venueId);
        }

        return {
          ...tournament,
          venue: venue ? {
            name: venue.name,
            city: venue.city,
            region: venue.region,
            country: venue.country,
          } : null,
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

