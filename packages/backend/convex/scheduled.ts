import { internalAction } from "./_generated/server";
import { api } from "./_generated/api";

export const sendTournamentReminders = internalAction({
	args: {},
	handler: async (ctx): Promise<{ success: boolean; tournamentsProcessed?: number; message?: string; error?: string }> => {
		try {
			const tournaments: any[] = await ctx.runQuery(api.tournaments.list, {
				status: "upcoming",
			});

			const now = Date.now();
			const tomorrow = now + 24 * 60 * 60 * 1000;
			const upcomingSoon = tournaments.filter((t: any) => {
				const tournamentDate = t.date || 0;
				return tournamentDate >= now && tournamentDate <= tomorrow;
			});

			// TODO: Implement reminder sending logic - for now, just logging the count
			console.log(`Found ${upcomingSoon.length} tournaments starting in the next 24 hours`);

			return {
				success: true,
				tournamentsProcessed: upcomingSoon.length,
				message: "Tournament reminders processed",
			};
		} catch (error) {
			console.error("Error sending tournament reminders:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});

export const cleanupOldData = internalAction({
	args: {},
	handler: async (ctx): Promise<{ success: boolean; cleanedCount?: number; message?: string; error?: string }> => {
		try {
			const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

			const drafts: any[] = await ctx.runQuery(api.tournaments.list, {
				status: "draft",
			});

			const oldDrafts = drafts.filter((draft: any) => {
				return draft._creationTime < thirtyDaysAgo;
			});

			// TODO: Implement cleanup logic - for now, just logging the count
			console.log(`Found ${oldDrafts.length} old draft tournaments to clean up`);

			return {
				success: true,
				cleanedCount: oldDrafts.length,
				message: "Data cleanup completed",
			};
		} catch (error) {
			console.error("Error cleaning up old data:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
});
