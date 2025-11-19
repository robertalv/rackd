import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
	"tournament-reminders",
	{
		hourUTC: 9,
		minuteUTC: 0,
	},
	internal.scheduled.sendTournamentReminders,
);

crons.weekly(
	"data-cleanup",
	{
		dayOfWeek: "sunday",
		hourUTC: 2,
		minuteUTC: 0,
	},
	internal.scheduled.cleanupOldData,
);

export default crons;

