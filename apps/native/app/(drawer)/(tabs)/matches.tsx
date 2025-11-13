import { Text, View, ScrollView, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { formatDate } from "@/lib/tournament-utils";
import { MatchDetailModal } from "@/components/match-detail-modal";

type MatchStatus = "all" | "pending" | "in_progress" | "completed";

export default function MatchesScreen() {
	const router = useRouter();
	const [statusFilter, setStatusFilter] = useState<MatchStatus>("all");
	const [refreshing, setRefreshing] = useState(false);
	const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const mutedColor = useThemeColor("muted") || "#F5F5F5";

	// Get current user
	const currentUser = useQuery(api.users.currentUser);
	
	// Get matches for current user
	const matches = useQuery(
		api.matches.getByUserId,
		currentUser?._id ? { userId: currentUser._id, limit: 100 } : "skip"
	);

	const filters: MatchStatus[] = ["all", "pending", "in_progress", "completed"];

	const filteredMatches = useMemo(() => {
		if (!matches) return [];
		if (statusFilter === "all") return matches;
		return matches.filter((match: any) => match.status === statusFilter);
	}, [matches, statusFilter]);

	const onRefresh = async () => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 1000);
	};

	// Loading state
	if (currentUser === undefined || matches === undefined) {
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
					<View className="flex-row items-center gap-1">
						<Text className="text-4xl font-bold tracking-tighter font-mono" style={{ color: themeColorForeground }}>
							matches
						</Text>
					</View>
				</View>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={accentColor} />
					<Text className="text-base mt-4" style={{ color: themeColorForeground }}>
						Loading matches...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "#10B981";
			case "in_progress":
				return "#FFA500";
			case "pending":
				return withOpacity(themeColorForeground, opacity.OPACITY_60);
			default:
				return withOpacity(themeColorForeground, opacity.OPACITY_60);
		}
	};

	const getStatusLabel = (status: MatchStatus): string => {
		switch (status) {
			case "completed":
				return "Completed";
			case "in_progress":
				return "In Progress";
			case "pending":
				return "Pending";
			default:
				return status;
		}
	};

	return (
		<SafeAreaView
			className="flex-1"
			style={{ height: "100%", backgroundColor: themeColorBackground }}
			edges={["top"]}
		>
			{/* Header */}
			<View
				className="flex-row items-center justify-between px-4 py-3 border-b"
				style={{
					backgroundColor: themeColorBackground,
					borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
				}}
			>
				<View className="flex-row items-center gap-1">
					<Text className="text-4xl font-bold tracking-tighter font-mono" style={{ color: themeColorForeground }}>
						matches
					</Text>
				</View>
			</View>

			{/* Status Filters */}
			<View
				className="px-4 py-3 border-b"
				style={{
					backgroundColor: themeColorBackground,
					borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
				}}
			>
				<View className="flex-row gap-2">
					{filters.map((status) => (
						<Pressable
							key={status}
							onPress={() => setStatusFilter(status)}
							className="flex-1 px-3 py-2 rounded-lg border"
							style={{
								backgroundColor:
									statusFilter === status
										? accentColor
										: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderColor:
									statusFilter === status
										? accentColor
										: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}
						>
							<Text
								className="text-center font-medium text-sm"
								style={{
									color: statusFilter === status ? "#FFFFFF" : themeColorForeground,
								}}
							>
								{status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
							</Text>
						</Pressable>
					))}
				</View>
			</View>

			{/* Matches List */}
			<ScrollView
				style={{ backgroundColor: themeColorBackground }}
				contentContainerStyle={{ padding: 16 }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
				}
				showsVerticalScrollIndicator={false}
			>
				{filteredMatches.length === 0 ? (
					<View className="flex-1 justify-center items-center py-16">
						<Ionicons name="basketball-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
						<Text className="text-lg font-semibold mb-2 mt-4" style={{ color: themeColorForeground }}>
							No matches found
						</Text>
						<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
							{statusFilter === "all"
								? "You haven't played any matches yet."
								: `No ${statusFilter === "in_progress" ? "in progress" : statusFilter} matches found.`}
						</Text>
					</View>
				) : (
					<View>
						{filteredMatches.map((match: any) => {
							const isPlayer1 = match.player1Id && currentUser?.playerId === match.player1Id;
							const isPlayer2 = match.player2Id && currentUser?.playerId === match.player2Id;
							const isWinner = match.winnerId && currentUser?.playerId === match.winnerId;
							
							return (
								<Pressable
									key={match._id}
									onPress={() => setSelectedMatch(match)}
									className="mb-4 rounded-lg border p-4"
									style={{
										backgroundColor: themeColorBackground,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									{/* Tournament Info */}
									{match.tournament && (
										<Pressable
											onPress={() => router.push(`/tournaments/${match.tournamentId}`)}
											className="mb-3"
										>
											<View className="flex-row items-center gap-2">
												<Ionicons name="trophy" size={16} color={accentColor} />
												<Text className="text-sm font-semibold flex-1" style={{ color: accentColor }}>
													{match.tournament.name}
												</Text>
												<Ionicons name="chevron-forward" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
											</View>
										</Pressable>
									)}

									{/* Match Info */}
									<View className="mb-3">
										<View className="flex-row items-center justify-between mb-2">
											<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												Round {match.round}
											</Text>
											<View className="flex-row items-center gap-2">
												<View
													className="px-2 py-1 rounded"
													style={{ backgroundColor: withOpacity(getStatusColor(match.status), opacity.OPACITY_20) }}
												>
													<Text className="text-xs font-medium text-foreground">
														{getStatusLabel(match.status)}
													</Text>
												</View>
											</View>
										</View>

										{/* Players */}
										<View className="space-y-2">
											<View className="flex-row items-center justify-between">
												<View className="flex-1">
													<Text 
														className={`text-base ${isPlayer1 ? "font-bold" : ""}`}
														style={{ 
															color: isPlayer1 && isWinner ? accentColor : themeColorForeground 
														}}
													>
														{match.player1?.name || "TBD"}
													</Text>
													{isPlayer1 && (
														<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
															You
														</Text>
													)}
												</View>
												{match.status === "completed" && (
													<Text className="text-lg font-bold mx-4" style={{ color: themeColorForeground }}>
														{match.player1Score}
													</Text>
												)}
											</View>

											<View className="flex-row items-center justify-between">
												<View className="flex-1">
													<Text 
														className={`text-base ${isPlayer2 ? "font-bold" : ""}`}
														style={{ 
															color: isPlayer2 && isWinner ? accentColor : themeColorForeground 
														}}
													>
														{match.player2?.name || "TBD"}
													</Text>
													{isPlayer2 && (
														<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
															You
														</Text>
													)}
												</View>
												{match.status === "completed" && (
													<Text className="text-lg font-bold mx-4" style={{ color: themeColorForeground }}>
														{match.player2Score}
													</Text>
												)}
											</View>
										</View>

										{/* Winner Badge */}
										{match.status === "completed" && match.winner && (
											<View className="mt-3 pt-3 border-t" style={{ borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20) }}>
												<View className="flex-row items-center gap-2">
													<Ionicons name="trophy" size={16} color={accentColor} />
													<Text className="text-sm font-medium text-foreground">
														Winner: {match.winner.name}
													</Text>
													{isWinner && (
														<View className="px-2 py-0.5 rounded" style={{ backgroundColor: withOpacity(accentColor, opacity.OPACITY_20) }}>
															<Text className="text-xs font-bold text-primary">
																YOU WON!
															</Text>
														</View>
													)}
												</View>
											</View>
										)}

										{/* Table Number */}
										{match.tableNumber && (
											<View className="mt-2 flex-row items-center gap-2">
												<Ionicons name="grid-outline" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
												<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
													Table {match.tableNumber}
												</Text>
											</View>
										)}

										{/* Completed Date */}
										{match.completedAt && (
											<Text className="text-xs mt-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												{formatDate(match.completedAt)}
											</Text>
										)}
									</View>
								</Pressable>
							);
						})}
					</View>
				)}
			</ScrollView>

			{/* Match Detail Modal */}
			{selectedMatch && (
				<MatchDetailModal
					match={selectedMatch}
					tournamentId={selectedMatch.tournamentId}
					visible={!!selectedMatch}
					onClose={() => setSelectedMatch(null)}
				/>
			)}
		</SafeAreaView>
	);
}

