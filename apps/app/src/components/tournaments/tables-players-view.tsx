"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Card, CardContent } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { Icon, Search01Icon, FavouriteIcon, Add01Icon } from "@rackd/ui/icons";
import { useNavigate } from "@tanstack/react-router";

interface TablesPlayersViewProps {
	tournamentId: Id<"tournaments">;
	onManagePlayers?: () => void;
}

export function TablesPlayersView({ tournamentId, onManagePlayers }: TablesPlayersViewProps) {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");

	const registrations = useQuery(api.tournaments.getRegistrations, { tournamentId });
	const matches = useQuery(api.matches.getByTournament, { tournamentId });
	const addLatePlayerToBracket = useMutation(api.matches.addLatePlayerToBracket);

	// Check which players are already in the bracket
	const bracketExists = matches && matches.length > 0;
	const playersInBracket = new Set(
		matches?.flatMap(m => [m.player1Id, m.player2Id].filter(Boolean)) || []
	);

	const isPlayerInBracket = (playerId: Id<"players"> | undefined) => {
		return playerId ? playersInBracket.has(playerId) : false;
	};

	const handleAddToBracket = async (playerId: Id<"players">) => {
		try {
			await addLatePlayerToBracket({ tournamentId, playerId });
			alert("Player added to bracket successfully!");
		} catch (error: any) {
			console.error("Failed to add player to bracket:", error);
			alert(`Failed to add player to bracket: ${error?.message || "Unknown error"}`);
		}
	};

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
		<div className="flex flex-col h-full min-h-0">
			{/* Players Content */}
			<div className="flex flex-col flex-1 min-h-0">
				{/* Search Bar */}
				<div className="px-4 py-3 border-b bg-background/50 flex-shrink-0">
					<div className="relative">
						<Icon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by player name"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				{/* Player Statistics */}
				<div className="px-4 py-2 border-b bg-muted/30 flex-shrink-0">
					<div className="flex items-center gap-4 text-sm">
						<Badge variant="secondary" className="text-xs">
							Total: {totalPlayers}
						</Badge>
						<Badge variant="secondary" className="text-xs">
							Checked In: {checkedInPlayers}
						</Badge>
						<Badge variant="secondary" className="text-xs">
							Eliminated: {eliminatedPlayers}
						</Badge>
					</div>
				</div>

				{/* Players List - Scrollable */}
				<ScrollArea className="flex-1 min-h-0">
					<div className="p-4 space-y-2">
					{filteredPlayers.length > 0 ? (
						<div className="space-y-2">
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

								const canAddToBracket = 
									registration.checkedIn && 
									bracketExists && 
									!isPlayerInBracket(registration.player?._id);

								const isInBracket = registration.player?._id && isPlayerInBracket(registration.player._id);

								return (
									<Card 
										key={registration._id}
										className="bg-accent/50 hover:bg-accent/70 transition-colors"
									>
										<CardContent>
											<div className="flex items-center justify-between gap-2">
												<div className="flex items-center gap-2 flex-1 min-w-0">
													<div className="flex items-center gap-2 flex-1 min-w-0">
														<span className="font-medium text-sm truncate">{playerName}</span>
														{flagEmoji && (
															<span className="text-base shrink-0">{flagEmoji}</span>
														)}
													</div>
													{registration.checkedIn && (
														<Badge variant="default" className="text-xs shrink-0 px-1.5 py-0.5">
															Checked In
														</Badge>
													)}
													{isInBracket && (
														<Badge variant="secondary" className="text-xs shrink-0 px-1.5 py-0.5">
															In Bracket
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-1 shrink-0">
													{canAddToBracket && (
														<Button 
															variant="secondary" 
															size="sm"
															onClick={() => registration.player?._id && handleAddToBracket(registration.player._id)}
															title="Add player to bracket"
															className="h-7 w-7 p-0"
														>
															<Icon icon={Add01Icon} className="h-3.5 w-3.5" />
														</Button>
													)}
													<Button variant="ghost" size="sm" className="h-7 w-7 p-0">
														<Icon icon={FavouriteIcon} className="h-3.5 w-3.5" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					) : (
						<Card className="bg-accent/50">
							<CardContent className="p-8">
								<div className="text-center text-muted-foreground">
									<p className="text-sm">No players found</p>
									{searchQuery && (
										<p className="text-xs mt-1">Try adjusting your search</p>
									)}
								</div>
							</CardContent>
						</Card>
					)}
					</div>
				</ScrollArea>

				{/* Manage Players Button */}
				<div className="px-4 py-3 border-t bg-background/50 flex-shrink-0">
					<Button
						variant="default"
						className="w-full"
						onClick={() => {
							if (onManagePlayers) {
								onManagePlayers();
							} else {
								navigate({ to: "/tournaments/$id", params: { id: tournamentId } });
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
