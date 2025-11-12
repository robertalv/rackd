"use client";

import { createFileRoute } from "@tanstack/react-router";
import { TablesManagement } from "@/components/tournaments/tables-management";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

export const Route = createFileRoute("/_authenticated/tournaments/$id/tables")({
	component: TournamentTablesPage,
});

function TournamentTablesPage() {
	const { id } = Route.useParams();
	const tournamentId = id as Id<"tournaments">;

	return <TablesManagement tournamentId={tournamentId} />;
}

