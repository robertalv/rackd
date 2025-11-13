import { Text, View, ScrollView, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

type ViewMode = "tournaments" | "statistics" | "matches";
type TournamentRole = "organizer" | "manager" | "player";

export default function PlayerDetailScreen() {
	const router = useRouter();
	const { playerId } = useLocalSearchParams<{ playerId: string }>();
	const [viewMode, setViewMode] = useState<ViewMode>("tournaments");
	const [tournamentRole, setTournamentRole] = useState<TournamentRole>("player");
	const [refreshing, setRefreshing] = useState(false);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const mutedColor = useThemeColor("muted") || "#F5F5F5";

	const player = useQuery(api.players.getById, { id: playerId as Id<"players"> });
	
	// Get tournaments
	const organizedTournaments = useQuery(
		api.players.getOrganizedTournaments,
		player ? { playerId: playerId as Id<"players"> } : "skip"
	);
	const managedTournaments = useQuery(
		api.players.getManagedTournaments,
		player ? { playerId: playerId as Id<"players"> } : "skip"
	);
	const playedTournaments = useQuery(
		api.players.getPlayedTournaments,
		player ? { playerId: playerId as Id<"players"> } : "skip"
	);
	
	// Get matches
	const matches = useQuery(
		api.matches.getByPlayerId,
		player ? { playerId: playerId as Id<"players">, limit: 100 } : "skip"
	);

	const onRefresh = async () => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 1000);
	};

	if (player === undefined || organizedTournaments === undefined || managedTournaments === undefined || playedTournaments === undefined || matches === undefined) {
		return (
			<SafeAreaView className="flex-1" style={{ height: "100%", backgroundColor: themeColorBackground }} edges={["top"]}>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={accentColor} />
					<Text className="text-base mt-4" style={{ color: themeColorForeground }}>
						Loading...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!player) {
		return (
			<SafeAreaView className="flex-1" style={{ height: "100%", backgroundColor: themeColorBackground }} edges={["top"]}>
				<View className="flex-1 items-center justify-center px-4">
					<Ionicons name="person-outline" size={64} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
					<Text className="text-xl font-semibold mt-4 mb-2" style={{ color: themeColorForeground }}>
						Player not found
					</Text>
					<Pressable
						onPress={() => router.back()}
						className="mt-4 px-6 py-3 rounded-lg"
						style={{ backgroundColor: accentColor }}
					>
						<Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
							Go back
						</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	// Calculate statistics
	const totalMatches = matches?.length || 0;
	const wins = matches?.filter(match => match.winnerId === (playerId as Id<"players">)).length || 0;
	const losses = totalMatches - wins;
	const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0";

	// Get the current tournament list based on role
	const currentTournaments = 
		tournamentRole === "organizer" ? (organizedTournaments || []) :
		tournamentRole === "manager" ? (managedTournaments || []) :
		(playedTournaments || []);

	const tabs: { mode: ViewMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
		{ mode: "tournaments", label: "Tournaments", icon: "trophy-outline" },
		{ mode: "statistics", label: "Statistics", icon: "stats-chart-outline" },
		{ mode: "matches", label: "Matches", icon: "game-controller-outline" },
	];

	const renderContent = () => {
		switch (viewMode) {
			case "tournaments":
				return (
					<ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
						<View className="px-4 py-4">
							{/* Role Filter Buttons */}
							<View className="flex-row gap-2 mb-4 flex-wrap">
								<Pressable
									onPress={() => setTournamentRole("organizer")}
									className="px-4 py-2 rounded-lg"
									style={{
										backgroundColor: tournamentRole === "organizer" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_10),
									}}
								>
									<Text className="text-sm font-semibold" style={{ color: tournamentRole === "organizer" ? "#FFFFFF" : themeColorForeground }}>
										ORGANIZER ({(organizedTournaments || []).length})
									</Text>
								</Pressable>
								<Pressable
									onPress={() => setTournamentRole("manager")}
									className="px-4 py-2 rounded-lg"
									style={{
										backgroundColor: tournamentRole === "manager" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_10),
									}}
								>
									<Text className="text-sm font-semibold" style={{ color: tournamentRole === "manager" ? "#FFFFFF" : themeColorForeground }}>
										MANAGER ({(managedTournaments || []).length})
									</Text>
								</Pressable>
								<Pressable
									onPress={() => setTournamentRole("player")}
									className="px-4 py-2 rounded-lg"
									style={{
										backgroundColor: tournamentRole === "player" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_10),
									}}
								>
									<Text className="text-sm font-semibold" style={{ color: tournamentRole === "player" ? "#FFFFFF" : themeColorForeground }}>
										PLAYER ({(playedTournaments || []).length})
									</Text>
								</Pressable>
							</View>

							{currentTournaments.length > 0 ? (
								<View className="space-y-3">
									{currentTournaments.map((tournament: any) => (
										<Pressable
											key={tournament._id}
											onPress={() => router.push(`/(drawer)/(tabs)/tournaments/${tournament._id}`)}
											className="p-4 rounded-lg"
											style={{
												backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
												borderWidth: 1,
												borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
											}}
										>
											<View className="flex-row items-start justify-between mb-2">
												<View className="flex-1">
													<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
														{tournament.name}
													</Text>
													{tournament.venue && (
														<View className="flex-row items-center mt-1">
															<Ionicons name="location-outline" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
															<Text className="text-sm ml-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																{tournament.venue.name}
																{tournament.venue.city && `, ${tournament.venue.city}`}
																{tournament.venue.state && `, ${tournament.venue.state}`}
															</Text>
														</View>
													)}
												</View>
												<View
													className="px-2 py-1 rounded-full"
													style={{
														backgroundColor: tournament.status === "completed" ? "#10B981" : withOpacity(themeColorForeground, opacity.OPACITY_20),
													}}
												>
													<Text className="text-xs font-medium" style={{ color: tournament.status === "completed" ? "#FFFFFF" : themeColorForeground }}>
														{tournament.status.toUpperCase()}
													</Text>
												</View>
											</View>
											<View className="flex-row items-center justify-between mt-2">
												<View className="flex-row items-center">
													<Ionicons name="time-outline" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
													<Text className="text-sm ml-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														{formatDistanceToNow(new Date(tournament.date), { addSuffix: true })}
													</Text>
												</View>
												{tournament.entryFee && (
													<Text className="text-sm font-semibold" style={{ color: "#10B981" }}>
														${tournament.entryFee}
													</Text>
												)}
											</View>
										</Pressable>
									))}
								</View>
							) : (
								<View className="py-16 items-center">
									<Ionicons name="trophy-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
									<Text className="text-base font-semibold mt-4 mb-1" style={{ color: themeColorForeground }}>
										{tournamentRole === "organizer" && "No tournaments organized yet"}
										{tournamentRole === "manager" && "No tournaments managed yet"}
										{tournamentRole === "player" && "No tournaments played yet"}
									</Text>
									<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										{tournamentRole === "organizer" && "This player hasn't organized any tournaments yet"}
										{tournamentRole === "manager" && "This player hasn't managed any tournaments yet"}
										{tournamentRole === "player" && "This player hasn't participated in any tournaments yet"}
									</Text>
								</View>
							)}
						</View>
					</ScrollView>
				);

			case "statistics":
				return (
					<ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
						<View className="px-4 py-4">
							<View className="flex-row flex-wrap gap-4 mb-6">
								{/* Win Rate Card */}
								<View
									className="flex-1 min-w-[45%] p-4 rounded-lg"
									style={{
										backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
										borderWidth: 1,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									<View className="flex-row items-center mb-2">
										<Ionicons name="trophy" size={20} color="#10B981" />
										<Text className="text-sm font-semibold ml-2" style={{ color: themeColorForeground }}>
											Win Rate
										</Text>
									</View>
									<Text className="text-3xl font-bold" style={{ color: "#10B981" }}>
										{winRate}%
									</Text>
									<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										{wins} wins, {losses} losses
									</Text>
								</View>

								{/* Total Matches */}
								<View
									className="flex-1 min-w-[45%] p-4 rounded-lg"
									style={{
										backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
										borderWidth: 1,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									<View className="flex-row items-center mb-2">
										<Ionicons name="game-controller" size={20} color={accentColor} />
										<Text className="text-sm font-semibold ml-2" style={{ color: themeColorForeground }}>
											Total Matches
										</Text>
									</View>
									<Text className="text-3xl font-bold" style={{ color: accentColor }}>
										{totalMatches}
									</Text>
									<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										All time
									</Text>
								</View>

								{/* Tournaments Played */}
								<View
									className="flex-1 min-w-[45%] p-4 rounded-lg"
									style={{
										backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
										borderWidth: 1,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									<View className="flex-row items-center mb-2">
										<Ionicons name="trophy-outline" size={20} color="#F59E0B" />
										<Text className="text-sm font-semibold ml-2" style={{ color: themeColorForeground }}>
											Tournaments
										</Text>
									</View>
									<Text className="text-3xl font-bold" style={{ color: "#F59E0B" }}>
										{(playedTournaments || []).length}
									</Text>
									<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Participated
									</Text>
								</View>
							</View>

							{/* Performance Breakdown */}
							<View
								className="p-4 rounded-lg"
								style={{
									backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderWidth: 1,
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								}}
							>
								<Text className="text-lg font-semibold mb-4" style={{ color: themeColorForeground }}>
									Performance Breakdown
								</Text>
								<View className="space-y-4">
									<View className="flex-row items-center justify-between">
										<Text className="text-sm" style={{ color: themeColorForeground }}>
											Recent Form (Last 10 matches)
										</Text>
										<View className="flex-row gap-1">
											{(matches || []).slice(-10).map((match: any, index: number) => (
												<View
													key={match._id || index}
													className="w-3 h-3 rounded-full"
													style={{
														backgroundColor: match.winnerId === (playerId as Id<"players">) ? "#10B981" : "#EF4444",
													}}
												/>
											))}
										</View>
									</View>
								</View>
							</View>
						</View>
					</ScrollView>
				);

			case "matches":
				return (
					<ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
						<View className="px-4 py-4">
							{(matches || []).length > 0 ? (
								<View className="space-y-3">
									{(matches || []).slice(0, 20).map((match: any) => (
										<Pressable
											key={match._id}
											onPress={() => router.push(`/(drawer)/(tabs)/tournaments/${match.tournament?._id}`)}
											className="p-4 rounded-lg"
											style={{
												backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
												borderWidth: 1,
												borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
											}}
										>
											<View className="flex-row items-center justify-between mb-2">
												<View className="flex-1">
													<View className="flex-row items-center gap-2 mb-1">
														<Text className="text-sm font-semibold" style={{ color: themeColorForeground }}>
															{match.player1Name}
														</Text>
														<View
															className="px-2 py-0.5 rounded"
															style={{
																backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
															}}
														>
															<Text className="text-xs" style={{ color: themeColorForeground }}>
																{match.player1Score || 0}
															</Text>
														</View>
													</View>
													<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														vs
													</Text>
													<View className="flex-row items-center gap-2">
														<Text className="text-sm font-semibold" style={{ color: themeColorForeground }}>
															{match.player2Name}
														</Text>
														<View
															className="px-2 py-0.5 rounded"
															style={{
																backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
															}}
														>
															<Text className="text-xs" style={{ color: themeColorForeground }}>
																{match.player2Score || 0}
															</Text>
														</View>
														{match.winnerId && (
															<Ionicons
																name="trophy"
																size={16}
																color={match.winnerId === (playerId as Id<"players">) ? "#F59E0B" : withOpacity(themeColorForeground, opacity.OPACITY_40)}
															/>
														)}
													</View>
												</View>
											</View>
											<View className="flex-row items-center justify-between mt-2">
												<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
													{match.tournamentName}
												</Text>
												<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
													{formatDistanceToNow(new Date(match.playedAt), { addSuffix: true })}
												</Text>
											</View>
										</Pressable>
									))}
								</View>
							) : (
								<View className="py-16 items-center">
									<Ionicons name="game-controller-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
									<Text className="text-base font-semibold mt-4 mb-1" style={{ color: themeColorForeground }}>
										No matches played yet
									</Text>
									<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										This player hasn't played any matches yet
									</Text>
								</View>
							)}
						</View>
					</ScrollView>
				);

			default:
				return null;
		}
	};

	return (
		<SafeAreaView className="flex-1" style={{ height: "100%", backgroundColor: themeColorBackground }} edges={["top"]}>
			{/* Header */}
			<View
				className="flex-row items-center justify-between px-4 py-3 border-b"
				style={{
					backgroundColor: themeColorBackground,
					borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
				}}
			>
				<View className="flex-row items-center flex-1">
					<Pressable
						onPress={() => router.back()}
						className="mr-3"
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Ionicons name="arrow-back" size={24} color={themeColorForeground} />
					</Pressable>
					<View className="flex-1">
						<Text className="text-lg font-semibold" style={{ color: themeColorForeground }}>
							{player.name}
						</Text>
						{player.fargoRating && (
							<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Fargo: {player.fargoRating}
							</Text>
						)}
					</View>
				</View>
			</View>

			{/* Tabs */}
			<View
				className="flex-row border-b"
				style={{
					borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
				}}
			>
				{tabs.map((tab) => (
					<Pressable
						key={tab.mode}
						onPress={() => setViewMode(tab.mode)}
						className="flex-1 py-3 items-center"
						style={{
							borderBottomWidth: viewMode === tab.mode ? 2 : 0,
							borderBottomColor: accentColor,
						}}
					>
						<Ionicons
							name={tab.icon}
							size={20}
							color={viewMode === tab.mode ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60)}
						/>
						<Text
							className="text-xs mt-1"
							style={{
								color: viewMode === tab.mode ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
								fontWeight: viewMode === tab.mode ? "600" : "400",
							}}
						>
							{tab.label}
						</Text>
					</Pressable>
				))}
			</View>

			{/* Content */}
			<View className="flex-1">
				{renderContent()}
			</View>
		</SafeAreaView>
	);
}

