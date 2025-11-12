"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Search, Star } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface TablesPlayersViewProps {
	tournamentId: Id<"tournaments">;
	onManagePlayers?: () => void;
}

export function TablesPlayersView({ tournamentId, onManagePlayers }: TablesPlayersViewProps) {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");

	const registrations = useQuery(api.tournaments.getRegistrations, { tournamentId });

	// Calculate player statistics
	const totalPlayers = registrations?.length || 0;
	const checkedInPlayers = registrations?.filter((r) => r.checkedIn).length || 0;
	const eliminatedPlayers = 0; // TODO: Calculate based on matches

	// Filter players by search query
	const filteredPlayers = registrations?.filter((reg) => {
		if (!searchQuery) return true;
		const name = reg.player?.name || reg.user?.name || "";
		return name.toLowerCase().includes(searchQuery.toLowerCase());
	}) || [];

	return (
		<div className="flex flex-col h-full">
			{/* Players Content */}
			<div className="flex-1 overflow-auto flex flex-col">
				{/* Search Bar */}
				<div className="px-4 py-3 border-b">
					<div className="flex items-center gap-2">
						<Input
							placeholder="Search by player name"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="flex-1"
						/>
						<Button size="icon" variant="outline">
							<Search className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Player Statistics */}
				<div className="px-4 py-3 border-b">
					<div className="flex items-center gap-4 text-sm">
						<span>Total players: {totalPlayers}</span>
						<span>Players left: {checkedInPlayers}</span>
						<span>Eliminated: {eliminatedPlayers}</span>
					</div>
				</div>

				{/* Players List */}
				<div className="flex-1 overflow-auto px-4 py-4">
					{filteredPlayers.length > 0 ? (
						<div className="space-y-0">
							{filteredPlayers.map((registration) => {
								const playerName = registration.player?.name || registration.user?.name || "Unknown";
								const playerCountry = registration.player?.city || registration.user?.country;
								
								// Get flag emoji if country is available
								const getFlagEmoji = (country: string | undefined) => {
									if (!country) return null;
									// Simple mapping for common countries - can be expanded
									const countryMap: Record<string, string> = {
										'US': '🇺🇸',
										'USA': '🇺🇸',
										'United States': '🇺🇸',
									};
									return countryMap[country] || null;
								};

								const flagEmoji = getFlagEmoji(playerCountry);

								return (
									<div
										key={registration._id}
										className="flex items-center justify-between py-3 border-b last:border-b-0"
									>
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<span className="text-gray-400">-</span>
											<span className="flex-1 truncate">{playerName}</span>
											{flagEmoji && (
												<span className="text-lg shrink-0">{flagEmoji}</span>
											)}
										</div>
										<Button variant="outline" size="sm" className="ml-2 shrink-0">
											<Star className="h-4 w-4" />
										</Button>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center text-gray-400 py-8">
							No players found
						</div>
					)}
				</div>

				{/* Manage Players Button */}
				<div className="px-4 py-4 border-t">
					<Button
						variant="outline"
						className="w-full"
						onClick={() => {
							if (onManagePlayers) {
								onManagePlayers();
							} else {
								navigate({ to: "/tournaments/$id/players", params: { id: tournamentId } });
							}
						}}
					>
						Manage Players
					</Button>
				</div>
			</div>
		</div>
	);
}
