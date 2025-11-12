"use client";

import { createFileRoute } from "@tanstack/react-router";
import { PlayerRegistration } from "@/components/tournaments/player-registration";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

export const Route = createFileRoute("/_authenticated/tournaments/$id/players")({
	component: TournamentPlayersPage,
});

function TournamentPlayersPage() {
	const { id } = Route.useParams();
	const tournamentId = id as Id<"tournaments">;

	return (
		<div className="container mx-auto py-8">
			<PlayerRegistration tournamentId={tournamentId} />
		</div>
	);
}


