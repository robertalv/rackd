export type TournamentStatus = "all" | "upcoming" | "active" | "completed" | "draft";

export function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export function getGameTypeLabel(gameType: string): string {
	switch (gameType) {
		case "eight_ball":
			return "8-Ball";
		case "nine_ball":
			return "9-Ball";
		case "ten_ball":
			return "10-Ball";
		case "one_pocket":
			return "One Pocket";
		case "bank_pool":
			return "Bank Pool";
		default:
			return gameType;
	}
}

export function getStatusBadgeProps(status: TournamentStatus): { variant: "default" | "secondary" | "destructive" | "outline"; text: string } {
	switch (status) {
		case "upcoming":
			return { variant: "default", text: "Upcoming" };
		case "active":
			return { variant: "default", text: "In Progress" };
		case "completed":
			return { variant: "secondary", text: "Completed" };
		case "draft":
			return { variant: "outline", text: "Draft" };
		default:
			return { variant: "secondary", text: status };
	}
}





