import { Text, View, ScrollView, ActivityIndicator, Pressable, RefreshControl, Image, Dimensions, Modal, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { formatDate, getGameTypeLabel, getStatusBadgeProps, type TournamentStatus } from "@/lib/tournament-utils";
import { TournamentSettingsView } from "@/components/settings";
import TournamentPayoutsScreen from "@/components/payouts";
import { searchFargoRatePlayers, formatFargoRating, formatRobustness, type PlayerSearchResult } from "@/lib/fargorate-api";
import { TablesManagement } from "@/components/tables-management";
import { AddManagerModal } from "@/components/add-manager-modal";
import { TournamentBracket } from "@/components/tournament-bracket";

type ViewMode = "overview" | "players" | "matches" | "bracket" | "results" | "tables" | "payouts" | "settings";

export default function TournamentDetailScreen() {
	const router = useRouter();
	const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
	const [viewMode, setViewMode] = useState<ViewMode>("overview");
	const [refreshing, setRefreshing] = useState(false);
	const [selectedFlyerUrl, setSelectedFlyerUrl] = useState<string | null>(null);
	const [playerTab, setPlayerTab] = useState<"registered" | "search" | "fargo">("registered");
	const [searchTerm, setSearchTerm] = useState("");
	const [fargoSearchTerm, setFargoSearchTerm] = useState("");
	const [fargoResults, setFargoResults] = useState<PlayerSearchResult[]>([]);
	const [isSearchingFargo, setIsSearchingFargo] = useState(false);
	const [showAddManagerModal, setShowAddManagerModal] = useState(false);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const mutedColor = useThemeColor("muted") || "#F5F5F5";

	const tournament = useQuery(api.tournaments.getById, { id: tournamentId as Id<"tournaments"> });
	const matches = useQuery(api.matches.getByTournament, { tournamentId: tournamentId as Id<"tournaments"> });
	const playerCount = useQuery(api.tournaments.getPlayerCount, { tournamentId: tournamentId as Id<"tournaments"> });
	const registrations = useQuery(api.tournaments.getRegistrations, { tournamentId: tournamentId as Id<"tournaments"> });
	const allPlayers = useQuery(api.players.search, { searchTerm: searchTerm || undefined });
	const managers = useQuery(api.tournaments.getManagers, { tournamentId: tournamentId as Id<"tournaments"> });
	const payoutData = useQuery(api.tournaments.getPayoutCalculation, { tournamentId: tournamentId as Id<"tournaments"> });
	const savedPayoutStructure = useQuery(api.tournaments.getPayoutStructure, { tournamentId: tournamentId as Id<"tournaments"> });
	const venue = useQuery(
		api.venues.getById,
		tournament?.venueId ? { id: tournament.venueId } : "skip"
	);
	const generateBracket = useMutation(api.matches.generateBracket);
	const checkInPlayer = useMutation(api.tournaments.checkInPlayer);
	const removePlayer = useMutation(api.tournaments.removePlayer);
	const addPlayer = useMutation(api.tournaments.addPlayer);
	const updatePaymentStatus = useMutation(api.tournaments.updatePaymentStatus);
	const getOrCreateFromFargoRate = useMutation(api.players.getOrCreateFromFargoRate);
	const removeManager = useMutation(api.tournaments.removeManager);
	const updateTournament = useMutation(api.tournaments.update);
	
	const fargoIdsExist = useQuery(
		api.players.checkFargoIdsExist,
		fargoResults.length > 0
			? { fargoIds: fargoResults.map((p) => p.id) }
			: "skip"
	);

	const isStorageId = tournament?.flyerUrl && !tournament.flyerUrl.startsWith("http");
	const flyerImageUrl = useQuery(
		api.files.getFileUrl,
		isStorageId && tournament?.flyerUrl
			? { storageId: tournament.flyerUrl as Id<"_storage"> }
			: "skip"
	);
	const displayFlyerUrl = isStorageId ? flyerImageUrl : tournament?.flyerUrl;

	const onRefresh = async () => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 1000);
	};

	const handleStartTournament = async () => {
		try {
			await generateBracket({ tournamentId: tournamentId as Id<"tournaments"> });
		} catch (error) {
			console.error("Error starting tournament:", error);
		}
	};

	const handleCheckIn = async (playerId: Id<"players">) => {
		try {
			await checkInPlayer({ tournamentId: tournamentId as Id<"tournaments">, playerId });
		} catch (error) {
			console.error("Failed to check in player:", error);
			Alert.alert("Error", "Failed to check in player.");
		}
	};

	const handleRemovePlayer = async (playerId: Id<"players">) => {
		try {
			await removePlayer({ tournamentId: tournamentId as Id<"tournaments">, playerId });
		} catch (error) {
			console.error("Failed to remove player:", error);
			Alert.alert("Error", "Failed to remove player.");
		}
	};

	const handleTogglePayment = async (playerId: Id<"players">, currentStatus: "pending" | "paid" | "refunded" | null | undefined) => {
		try {
			const newStatus = currentStatus === "paid" ? "pending" : "paid";
			await updatePaymentStatus({ 
				tournamentId: tournamentId as Id<"tournaments">, 
				playerId, 
				paymentStatus: newStatus 
			});
		} catch (error) {
			console.error("Failed to update payment status:", error);
			Alert.alert("Error", "Failed to update payment status.");
		}
	};

	const handleAddPlayer = async (playerId: Id<"players">) => {
		try {
			await addPlayer({ tournamentId: tournamentId as Id<"tournaments">, playerId });
		} catch (error) {
			console.error("Failed to add player:", error);
			Alert.alert("Error", "Failed to add player. They may already be registered.");
		}
	};

	const handleFargoSearch = async () => {
		if (!fargoSearchTerm.trim()) {
			setFargoResults([]);
			return;
		}

		setIsSearchingFargo(true);
		try {
			const response = await searchFargoRatePlayers(fargoSearchTerm);
			setFargoResults(response.value || []);
		} catch (error) {
			console.error("Error searching FargoRate players:", error);
			setFargoResults([]);
			Alert.alert("Error", "Failed to search FargoRate players. Please try again.");
		} finally {
			setIsSearchingFargo(false);
		}
	};

	const handleAddFargoPlayer = async (fargoPlayer: PlayerSearchResult) => {
		try {
			let playerId: Id<"players">;
			
			// Check if player already exists
			const existingPlayer = fargoIdsExist?.[fargoPlayer.id];
			
			if (existingPlayer?.exists && existingPlayer.playerId) {
				// Player already exists, just use their ID
				playerId = existingPlayer.playerId;
			} else {
				// Player doesn't exist, create them
				const rating = parseInt(fargoPlayer.effectiveRating);
				playerId = await getOrCreateFromFargoRate({
					fargoId: fargoPlayer.id,
					firstName: fargoPlayer.firstName,
					lastName: fargoPlayer.lastName,
					city: fargoPlayer.location,
					fargoRating: rating,
				});
			}
			
			// Then add them to the tournament
			await addPlayer({ tournamentId: tournamentId as Id<"tournaments">, playerId });

			// Remove from search results
			setFargoResults((prev) => prev.filter((p) => p.id !== fargoPlayer.id));
		} catch (error: any) {
			console.error("Error adding FargoRate player:", error);
			if (error?.message?.includes("already registered")) {
				Alert.alert("Error", "This player is already registered for this tournament.");
			} else {
				Alert.alert("Error", `Failed to add player: ${error?.message || "Unknown error"}`);
			}
		}
	};

	// Filter out already registered players from the search results
	const availablePlayers =
		allPlayers?.filter((player) => !registrations?.some((reg) => reg.player?._id === player._id)) || [];

	// Helper function to get initials
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n.charAt(0))
			.join("")
			.slice(0, 2)
			.toUpperCase();
	};

	// Calculate match statistics (before early returns)
	// TBD vs TBD matches are considered complete if status is "completed" (even without winnerId)
	const allMatches = matches || [];
	const completedMatches = allMatches.filter(m => {
		if (m.status !== "completed") return false;
		// TBD vs TBD matches (no players) are complete if status is completed
		if (!m.player1Id && !m.player2Id) return true;
		// Regular matches need a winnerId
		return !!m.winnerId;
	}).length;
	const inProgressMatches = allMatches.filter(m => m.status === "in_progress").length;
	const upcomingMatches = allMatches.filter(m => m.status === "pending").length;
	const totalMatches = allMatches.length;
	const completionPercentage = totalMatches > 0 
		? Math.round((completedMatches / totalMatches) * 100) 
		: 0;

	// Automatically mark tournament as completed when all matches are done
	// This hook MUST be called before any early returns
	useEffect(() => {
		if (
			tournament &&
			tournament.status === "active" &&
			totalMatches > 0 &&
			completionPercentage === 100 &&
			completedMatches === totalMatches
		) {
			// All matches are completed, update tournament status
			updateTournament({
				tournamentId: tournamentId as Id<"tournaments">,
				status: "completed",
			}).catch((error) => {
				console.error("Failed to auto-complete tournament:", error);
			});
		}
	}, [tournament, totalMatches, completedMatches, completionPercentage, tournamentId, updateTournament]);

	// Early returns AFTER all hooks are called
	if (tournament === undefined) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color={accentColor} />
					<Text className="mt-4" style={{ color: themeColorForeground }}>
						Loading tournament...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (!tournament) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				<View className="flex-1 justify-center items-center p-6">
					<Text className="text-lg font-semibold mb-2" style={{ color: themeColorForeground }}>
						Tournament not found
					</Text>
					<Pressable onPress={() => router.back()}>
						<Text style={{ color: accentColor }}>Go back</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	const statusProps = getStatusBadgeProps(tournament.status as TournamentStatus);

	const tabs: { mode: ViewMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
		{ mode: "overview", label: "Overview", icon: "grid-outline" },
		{ mode: "players", label: "Players", icon: "people-outline" },
		{ mode: "matches", label: "Matches", icon: "game-controller-outline" },
		{ mode: "bracket", label: "Bracket", icon: "git-network-outline" },
		{ mode: "tables", label: "Tables", icon: "grid" },
		{ mode: "results", label: "Results", icon: "trophy-outline" },
		{ mode: "payouts", label: "Payouts", icon: "cash-outline" },
		{ mode: "settings", label: "Settings", icon: "settings-outline" },
	];

	const renderContent = () => {
		switch (viewMode) {
			case "overview":
				return (
					<View>
						{/* Tournament Flyer */}
						{displayFlyerUrl && (
							<Pressable
								onPress={() => setSelectedFlyerUrl(displayFlyerUrl)}
								className="mb-4 rounded-lg overflow-hidden"
								style={{
									backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								}}
							>
								<Image
									source={{ uri: displayFlyerUrl }}
									style={{
										width: "100%",
										height: 200,
									}}
									resizeMode="cover"
								/>
							</Pressable>
						)}

						{/* Progress Card */}
						<View
							className="p-4 rounded-lg mb-4"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}
						>
							<Text className="text-sm font-semibold mb-3 uppercase" style={{ color: themeColorForeground }}>
								Tournament Progress
							</Text>
							<View className="flex-row items-baseline mb-2">
								<Text className="text-4xl font-bold" style={{ color: accentColor }}>
									{completionPercentage}%
								</Text>
								<Text className="text-lg ml-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									complete
								</Text>
							</View>
							<Text className="text-sm mb-3" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								{completedMatches} of {totalMatches} matches completed
							</Text>
							{tournament.status === "active" && (
								<View className="flex-row items-center">
									<View
										className="w-2 h-2 rounded-full mr-2"
										style={{ backgroundColor: "#10B981" }}
									/>
									<Text className="text-sm font-medium" style={{ color: "#10B981" }}>
										LIVE
									</Text>
								</View>
							)}
						</View>

						{/* Start Tournament Button */}
						{tournament.status === "upcoming" && completionPercentage < 100 && (
							<Pressable
								onPress={handleStartTournament}
								className="p-4 rounded-lg mb-4 flex-row items-center justify-center bg-yellow-500"
							>
								<Ionicons name="play" size={20} color="#FFFFFF" />
								<Text className="text-base font-semibold ml-2" style={{ color: "#FFFFFF" }}>
									Start Tournament
								</Text>
							</Pressable>
						)}

						{/* Tournament Details */}
						<View
							className="p-4 rounded-lg mb-4"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}
						>
							<Text className="text-sm font-semibold mb-3 uppercase" style={{ color: themeColorForeground }}>
								Tournament Details
							</Text>
							<View className="space-y-3">
								<View className="flex-row items-center">
									<Ionicons name="calendar-outline" size={18} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
									<Text className="text-sm ml-2 flex-1" style={{ color: themeColorForeground }}>
										{formatDate(tournament.date)}
									</Text>
								</View>

								{venue && (
									<View className="flex-row items-center">
										<Ionicons name="location-outline" size={18} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
										<View className="flex-1 ml-2">
											<Text className="text-sm font-medium" style={{ color: themeColorForeground }}>
												{venue.name}
											</Text>
											{venue.address && (
												<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
													{venue.address}
													{venue.city && `, ${venue.city}`}
													{venue.region && `, ${venue.region}`}
													{venue.country && ` ${venue.country}`}
												</Text>
											)}
										</View>
									</View>
								)}

								{tournament.entryFee !== undefined && tournament.entryFee !== null && (
									<View className="flex-row items-center">
										<Ionicons name="cash-outline" size={18} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
										<Text className="text-sm ml-2" style={{ color: themeColorForeground }}>
											${tournament.entryFee} entry fee
										</Text>
									</View>
								)}

								<View className="flex-row items-center">
									<Ionicons name="trophy-outline" size={18} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
									<Text className="text-sm ml-2" style={{ color: themeColorForeground }}>
										{getGameTypeLabel(tournament.gameType)} • {tournament.type.replace("_", " ")}
									</Text>
								</View>

								{tournament.description && (
									<View className="mt-2">
										<Text className="text-sm" style={{ color: themeColorForeground }}>
											{tournament.description}
										</Text>
									</View>
								)}
							</View>
						</View>

						{/* Stats Cards */}
						<View className="flex-row flex-wrap gap-3 mb-4">
							<View
								className="flex-1 min-w-[100px] p-4 rounded-lg"
								style={{
									backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderWidth: 1,
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								}}
							>
								<Text className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
									{totalMatches}
								</Text>
								<Text className="text-xs uppercase" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									Matches
								</Text>
							</View>
							<View
								className="flex-1 min-w-[100px] p-4 rounded-lg"
								style={{
									backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderWidth: 1,
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								}}
							>
								<Text className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
									{playerCount?.total || 0}
								</Text>
								<Text className="text-xs uppercase" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									Players
								</Text>
							</View>
							{payoutData && (
								<View
									className="flex-1 min-w-[100px] p-4 rounded-lg"
									style={{
										backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
										borderWidth: 1,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									<Text className="text-2xl font-bold mb-1" style={{ color: "#10B981" }}>
										${payoutData.totalCollected.toFixed(0)}
									</Text>
									<Text className="text-xs uppercase" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Collected
									</Text>
								</View>
							)}
							{savedPayoutStructure?.payoutStructure && (
								<View
									className="flex-1 min-w-[100px] p-4 rounded-lg"
									style={{
										backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
										borderWidth: 1,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									<Text className="text-2xl font-bold mb-1" style={{ color: "#10B981" }}>
										${savedPayoutStructure.payoutStructure.potAmount.toFixed(0)}
									</Text>
									<Text className="text-xs uppercase" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Pot Amount
									</Text>
								</View>
							)}
						</View>

						{/* Match Status Summary */}
						<View
							className="p-4 rounded-lg mb-4"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}
						>
							<Text className="text-sm font-semibold mb-3 uppercase" style={{ color: themeColorForeground }}>
								Match Status
							</Text>
							<View className="space-y-2">
								<View className="flex-row justify-between">
									<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Completed
									</Text>
									<Text className="text-sm font-medium" style={{ color: themeColorForeground }}>
										{completedMatches}
									</Text>
								</View>
								<View className="flex-row justify-between">
									<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										In Progress
									</Text>
									<Text className="text-sm font-medium" style={{ color: themeColorForeground }}>
										{inProgressMatches}
									</Text>
								</View>
								<View className="flex-row justify-between">
									<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Upcoming
									</Text>
									<Text className="text-sm font-medium" style={{ color: themeColorForeground }}>
										{upcomingMatches}
									</Text>
								</View>
							</View>
						</View>

						{/* Managers Section */}
						<View
							className="p-4 rounded-lg"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}
						>
							<View className="flex-row items-center justify-between mb-3">
								<Text className="text-sm font-semibold uppercase" style={{ color: themeColorForeground }}>
									Managers
								</Text>
								{tournament && tournament.organizerId && (
									<Pressable
										onPress={() => setShowAddManagerModal(true)}
										className="px-3 py-1 rounded-lg border bg-yellow-500"
										style={{
											borderColor: accentColor,
										}}
									>
										<Ionicons name="add" size={16} color={accentColor} />
									</Pressable>
								)}
							</View>
							{managers === undefined ? (
								<ActivityIndicator size="small" color={accentColor} />
							) : managers.length === 0 ? (
								<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									No managers yet
								</Text>
							) : (
								<View className="space-y-2">
									{managers.map((manager) => (
										<View key={manager._id} className="flex-row items-center justify-between">
											<View className="flex-row items-center flex-1">
												<View
													className="w-8 h-8 rounded-full items-center justify-center mr-2"
													style={{
														backgroundColor: withOpacity(accentColor, opacity.OPACITY_20),
													}}
												>
													<Text className="text-xs font-semibold" style={{ color: accentColor }}>
														{manager.user?.displayName?.charAt(0).toUpperCase() ||
															manager.user?.name?.charAt(0).toUpperCase() ||
															"U"}
													</Text>
												</View>
												<View className="flex-1">
													<Text className="text-sm font-medium" style={{ color: themeColorForeground }}>
														{manager.user?.displayName || manager.user?.name || "Unknown"}
													</Text>
													<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														@{manager.user?.username || "unknown"} • {manager.role}
													</Text>
												</View>
											</View>
											{tournament && tournament.organizerId && (
												<Pressable
													onPress={() => handleRemoveManager(manager.userId)}
													className="p-2"
												>
													<Ionicons name="close" size={18} color="#EF4444" />
												</Pressable>
											)}
										</View>
									))}
								</View>
							)}
						</View>
					</View>
				);

			case "players":
				return (
					<View className="flex-1">
						{/* Player Tabs */}
						<View
							className="border-b px-4 py-3.5"
							style={{
								borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							}}
						>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{ gap: 8 }}
							>
								<View className="flex-row gap-2">
									<Pressable
										onPress={() => setPlayerTab("registered")}
										className="px-3 py-2 rounded-lg border shrink-0"
										style={({ pressed }) => ({
											backgroundColor: playerTab === "registered" ? accentColor : "transparent",
											borderColor:
												playerTab === "registered"
													? accentColor
													: withOpacity(themeColorForeground, opacity.OPACITY_20),
											opacity: pressed ? 0.7 : 1,
										})}
									>
										<Text
											className="text-sm font-medium"
											style={{
												color: playerTab === "registered" ? "#FFFFFF" : themeColorForeground,
											}}
										>
											Registered ({registrations?.length || 0})
										</Text>
									</Pressable>
									<Pressable
										onPress={() => setPlayerTab("search")}
										className="px-3 py-2 rounded-lg border shrink-0"
										style={({ pressed }) => ({
											backgroundColor: playerTab === "search" ? accentColor : "transparent",
											borderColor:
												playerTab === "search" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
											opacity: pressed ? 0.7 : 1,
										})}
									>
										<Text
											className="text-sm font-medium"
											style={{
												color: playerTab === "search" ? "#FFFFFF" : themeColorForeground,
											}}
										>
											Local Players
										</Text>
									</Pressable>
									<Pressable
										onPress={() => setPlayerTab("fargo")}
										className="px-3 py-2 rounded-lg border shrink-0"
										style={({ pressed }) => ({
											backgroundColor: playerTab === "fargo" ? accentColor : "transparent",
											borderColor:
												playerTab === "fargo" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
											opacity: pressed ? 0.7 : 1,
										})}
									>
										<Text
											className="text-sm font-medium"
											style={{
												color: playerTab === "fargo" ? "#FFFFFF" : themeColorForeground,
											}}
										>
											FargoRate
										</Text>
									</Pressable>
								</View>
							</ScrollView>
						</View>

						{/* Tab Content */}
						{playerTab === "registered" && (
							<View className="px-4 py-4 h-full">
								{registrations && registrations.length > 0 ? (
									<View className="space-y-3">
										{registrations.map((registration: any) => {
											const playerName = registration.player?.name || registration.user?.name || "Unknown";
											const initials = getInitials(playerName);
											return (
												<View
													key={registration._id}
													className="p-4 rounded-xl flex-row items-center"
													style={{
														backgroundColor: themeColorBackground,
														borderWidth: 1,
														borderColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
														shadowColor: "#000",
														shadowOffset: { width: 0, height: 1 },
														shadowOpacity: 0.05,
														shadowRadius: 2,
														elevation: 1,
													}}
												>
													{/* Avatar */}
													<View
														className="w-12 h-12 rounded-full items-center justify-center mr-3"
														style={{
															backgroundColor: withOpacity(accentColor, opacity.OPACITY_20),
														}}
													>
														<Text className="text-base font-semibold" style={{ color: accentColor }}>
															{initials}
														</Text>
													</View>

													{/* Player Info */}
													<View className="flex-1">
														<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
															{playerName}
														</Text>
														<View className="flex-row items-center flex-wrap gap-2">
															{registration.player?.fargoRating && (
																<View
																	className="px-2 py-0.5 rounded"
																	style={{
																		backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
																	}}
																>
																	<Text className="text-xs font-medium" style={{ color: themeColorForeground }}>
																		{registration.player.fargoRating.toLocaleString()}
																	</Text>
																</View>
															)}
															{registration.player?.league && (
																<View
																	className="px-2 py-0.5 rounded"
																	style={{
																		backgroundColor: withOpacity(accentColor, opacity.OPACITY_10),
																		borderWidth: 1,
																		borderColor: withOpacity(accentColor, opacity.OPACITY_20),
																	}}
																>
																	<Text className="text-xs font-medium" style={{ color: accentColor }}>
																		{registration.player.league}
																	</Text>
																</View>
															)}
															{registration.checkedIn ? (
																<View
																	className="px-2 py-0.5 rounded-full flex-row items-center"
																	style={{ backgroundColor: "#10B981" }}
																>
																	<Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
																	<Text className="text-xs font-medium ml-1" style={{ color: "#FFFFFF" }}>
																		Checked In
																	</Text>
																</View>
															) : (
																<View
																	className="px-2 py-0.5 rounded-full"
																	style={{
																		backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
																	}}
																>
																	<Text className="text-xs font-medium" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																		{registration.status || "Registered"}
																	</Text>
																</View>
															)}
															<Pressable
																onPress={() => registration.player?._id && handleTogglePayment(registration.player._id, registration.paymentStatus)}
																className="px-2 py-0.5 rounded-full flex-row items-center"
																style={{
																	backgroundColor: registration.paymentStatus === "paid" 
																		? "#10B981" 
																		: withOpacity(themeColorForeground, opacity.OPACITY_10),
																}}
															>
																<Ionicons 
																	name={registration.paymentStatus === "paid" ? "cash" : "cash-outline"} 
																	size={12} 
																	color={registration.paymentStatus === "paid" ? "#FFFFFF" : withOpacity(themeColorForeground, opacity.OPACITY_60)} 
																/>
																<Text 
																	className="text-xs font-medium ml-1" 
																	style={{ 
																		color: registration.paymentStatus === "paid" 
																			? "#FFFFFF" 
																			: withOpacity(themeColorForeground, opacity.OPACITY_60) 
																	}}
																>
																	{registration.paymentStatus === "paid" ? "Paid" : "Unpaid"}
																</Text>
															</Pressable>
														</View>
														{registration.player?.fargoId && (
															<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																Fargo ID: {registration.player.fargoId}
															</Text>
														)}
													</View>

													{/* Actions */}
													<View className="flex-row items-center gap-2 ml-2">
														{!registration.checkedIn && (
															<Pressable
																onPress={() => registration.player?._id && handleCheckIn(registration.player._id)}
																className="px-3 py-2 rounded-lg"
																style={{ backgroundColor: accentColor }}
															>
																<Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
															</Pressable>
														)}
														<Pressable
															onPress={() => registration.player?._id && handleRemovePlayer(registration.player._id)}
															className="px-3 py-2 rounded-lg"
															style={{
																backgroundColor: withOpacity("#EF4444", opacity.OPACITY_10),
															}}
														>
															<Ionicons name="trash-outline" size={18} color="#EF4444" />
														</Pressable>
													</View>
												</View>
											);
										})}
									</View>
								) : (
									<View className="py-12 items-center">
										<View
											className="w-16 h-16 rounded-full items-center justify-center mb-4"
											style={{
												backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											}}
										>
											<Ionicons name="people-outline" size={32} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
										</View>
										<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
											No players registered yet
										</Text>
										<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											Use the tabs above to add players to this tournament
										</Text>
									</View>
								)}
							</View>
						)}

						{playerTab === "search" && (
							<View className="px-4 py-4">
								{/* Search Input */}
								<View
									className="mb-4 rounded-xl"
									style={{
										backgroundColor: themeColorBackground,
										borderWidth: 1,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
										shadowColor: "#000",
										shadowOffset: { width: 0, height: 1 },
										shadowOpacity: 0.05,
										shadowRadius: 2,
										elevation: 1,
									}}
								>
									<View className="flex-row items-center px-3">
										<Ionicons name="search" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
										<TextInput
											placeholder="Search players..."
											value={searchTerm}
											onChangeText={setSearchTerm}
											className="flex-1 p-3"
											style={{
												color: themeColorForeground,
											}}
											placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_60)}
										/>
									</View>
								</View>

								{/* Results */}
								{availablePlayers.length > 0 ? (
									<View className="space-y-3">
										{availablePlayers.map((player) => {
											const initials = getInitials(player.name);
											return (
												<View
													key={player._id}
													className="p-4 rounded-xl flex-row items-center"
													style={{
														backgroundColor: themeColorBackground,
														borderWidth: 1,
														borderColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
														shadowColor: "#000",
														shadowOffset: { width: 0, height: 1 },
														shadowOpacity: 0.05,
														shadowRadius: 2,
														elevation: 1,
													}}
												>
													{/* Avatar */}
													<View
														className="w-12 h-12 rounded-full items-center justify-center mr-3"
														style={{
															backgroundColor: withOpacity(accentColor, opacity.OPACITY_20),
														}}
													>
														<Text className="text-base font-semibold" style={{ color: accentColor }}>
															{initials}
														</Text>
													</View>

													{/* Player Info */}
													<View className="flex-1">
														<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
															{player.name}
														</Text>
														<View className="flex-row items-center flex-wrap gap-2">
															{player.fargoRating && (
																<View
																	className="px-2 py-0.5 rounded"
																	style={{
																		backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
																	}}
																>
																	<Text className="text-xs font-medium" style={{ color: themeColorForeground }}>
																		{player.fargoRating.toLocaleString()}
																	</Text>
																</View>
															)}
															{player.league && (
																<View
																	className="px-2 py-0.5 rounded"
																	style={{
																		backgroundColor: withOpacity(accentColor, opacity.OPACITY_10),
																		borderWidth: 1,
																		borderColor: withOpacity(accentColor, opacity.OPACITY_20),
																	}}
																>
																	<Text className="text-xs font-medium" style={{ color: accentColor }}>
																		{player.league}
																	</Text>
																</View>
															)}
														</View>
														{player.fargoId && (
															<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																Fargo ID: {player.fargoId}
															</Text>
														)}
													</View>

													{/* Add Button */}
													<Pressable
														onPress={() => handleAddPlayer(player._id)}
														className="px-4 py-2 rounded-lg flex-row items-center"
														style={{ backgroundColor: accentColor }}
													>
														<Ionicons name="add" size={18} color="#FFFFFF" />
														<Text className="text-sm font-medium ml-1" style={{ color: "#FFFFFF" }}>
															Add
														</Text>
													</Pressable>
												</View>
											);
										})}
									</View>
								) : searchTerm ? (
									<View className="py-12 items-center">
										<View
											className="w-16 h-16 rounded-full items-center justify-center mb-4"
											style={{
												backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											}}
										>
											<Ionicons name="search-outline" size={32} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
										</View>
										<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
											No players found
										</Text>
										<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											No available players found for "{searchTerm}"
										</Text>
									</View>
								) : (
									<View className="py-12 items-center">
										<View
											className="w-16 h-16 rounded-full items-center justify-center mb-4"
											style={{
												backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											}}
										>
											<Ionicons name="search-outline" size={32} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
										</View>
										<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
											Search for players
										</Text>
										<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											Search for local players to add to the tournament
										</Text>
									</View>
								)}
							</View>
						)}

						{playerTab === "fargo" && (
							<View className="px-4 py-4">
								{/* Search Input */}
								<View
									className="mb-4 rounded-xl"
									style={{
										backgroundColor: themeColorBackground,
										borderWidth: 1,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
										shadowColor: "#000",
										shadowOffset: { width: 0, height: 1 },
										shadowOpacity: 0.05,
										shadowRadius: 2,
										elevation: 1,
									}}
								>
									<View className="flex-row items-center px-3">
										<Ionicons name="search" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
										<TextInput
											placeholder="Search FargoRate players by name..."
											value={fargoSearchTerm}
											onChangeText={setFargoSearchTerm}
											onSubmitEditing={handleFargoSearch}
											className="flex-1 p-3"
											style={{
												color: themeColorForeground,
											}}
											placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_60)}
										/>
										<Pressable
											onPress={handleFargoSearch}
											disabled={isSearchingFargo}
											className="px-3 py-2 rounded-lg"
											style={{
												backgroundColor: isSearchingFargo ? withOpacity(accentColor, opacity.OPACITY_60) : accentColor,
											}}
										>
											{isSearchingFargo ? (
												<ActivityIndicator size="small" color="#FFFFFF" />
											) : (
												<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
											)}
										</Pressable>
									</View>
								</View>

								{/* Results */}
								{fargoResults.length > 0 ? (
									<View className="space-y-3">
										{fargoResults.map((player) => {
											const initials = `${player.firstName.charAt(0)}${player.lastName.charAt(0)}`.toUpperCase();
											return (
												<View
													key={player.id}
													className="p-4 rounded-xl flex-row items-center"
													style={{
														backgroundColor: themeColorBackground,
														borderWidth: 1,
														borderColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
														shadowColor: "#000",
														shadowOffset: { width: 0, height: 1 },
														shadowOpacity: 0.05,
														shadowRadius: 2,
														elevation: 1,
													}}
												>
													{/* Avatar */}
													<View
														className="w-12 h-12 rounded-full items-center justify-center mr-3"
														style={{
															backgroundColor: withOpacity(accentColor, opacity.OPACITY_20),
														}}
													>
														<Text className="text-base font-semibold" style={{ color: accentColor }}>
															{initials}
														</Text>
													</View>

													{/* Player Info */}
													<View className="flex-1">
														<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
															{player.firstName} {player.lastName}
														</Text>
														{player.location && (
															<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																{player.location}
															</Text>
														)}
														<View className="flex-row items-center flex-wrap gap-2">
															<View
																className="px-2 py-0.5 rounded"
																style={{
																	backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
																}}
															>
																<Text className="text-xs font-medium" style={{ color: themeColorForeground }}>
																	{formatFargoRating(player.effectiveRating)}
																</Text>
															</View>
															<View
																className="px-2 py-0.5 rounded"
																style={{
																	backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
																}}
															>
																<Text className="text-xs font-medium" style={{ color: themeColorForeground }}>
																	R: {formatRobustness(player.robustness)}
																</Text>
															</View>
															{player.provisionalRating !== "0" && (
																<View
																	className="px-2 py-0.5 rounded"
																	style={{
																		backgroundColor: withOpacity("#F59E0B", opacity.OPACITY_10),
																		borderWidth: 1,
																		borderColor: withOpacity("#F59E0B", opacity.OPACITY_20),
																	}}
																>
																	<Text className="text-xs font-medium" style={{ color: "#F59E0B" }}>
																		Provisional
																	</Text>
																</View>
															)}
														</View>
														<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
															ID: {player.readableId}
														</Text>
													</View>

													{/* Action Button */}
													{(() => {
														const existingPlayer = fargoIdsExist?.[player.id];
														
														// Check if this FargoRate player is already registered
														// First check by player ID if we have it
														let isAlreadyRegistered = false;
														if (existingPlayer?.exists && existingPlayer.playerId) {
															isAlreadyRegistered = registrations?.some(
																reg => reg.player?._id === existingPlayer.playerId
															) || false;
														}
														
														// Also check by FargoRate ID in case the query hasn't loaded yet
														if (!isAlreadyRegistered && registrations) {
															isAlreadyRegistered = registrations.some(
																reg => reg.player?.fargoId === player.id
															);
														}
														
														if (isAlreadyRegistered) {
															return (
																<View
																	className="px-3 py-2 rounded-lg"
																	style={{
																		backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
																	}}
																>
																	<Text className="text-xs font-medium" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																		Registered
																	</Text>
																</View>
															);
														}
														
														if (existingPlayer?.exists && existingPlayer.playerId) {
															return (
																<Pressable
																	onPress={() => {
																		if (existingPlayer.playerId) {
																			handleAddPlayer(existingPlayer.playerId);
																		}
																	}}
																	className="px-4 py-2 rounded-lg flex-row items-center"
																	style={{ backgroundColor: accentColor }}
																>
																	<Ionicons name="person-add" size={18} color="#FFFFFF" />
																	<Text className="text-sm font-medium ml-1" style={{ color: "#FFFFFF" }}>
																		Register
																	</Text>
																</Pressable>
															);
														}
														
														return (
															<Pressable
																onPress={() => handleAddFargoPlayer(player)}
																className="px-4 py-2 rounded-lg flex-row items-center"
																style={{ backgroundColor: accentColor }}
															>
																<Ionicons name="add" size={18} color="#FFFFFF" />
																<Text className="text-sm font-medium ml-1" style={{ color: "#FFFFFF" }}>
																	Add & Register
																</Text>
															</Pressable>
														);
													})()}
												</View>
											);
										})}
									</View>
								) : fargoSearchTerm && !isSearchingFargo ? (
									<View className="py-12 items-center">
										<View
											className="w-16 h-16 rounded-full items-center justify-center mb-4"
											style={{
												backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											}}
										>
											<Ionicons name="search-outline" size={32} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
										</View>
										<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
											No players found
										</Text>
										<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											No FargoRate players found for "{fargoSearchTerm}"
										</Text>
									</View>
								) : (
									<View className="py-12 items-center">
										<View
											className="w-16 h-16 rounded-full items-center justify-center mb-4"
											style={{
												backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											}}
										>
											<Ionicons name="search-outline" size={32} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
										</View>
										<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
											Search FargoRate
										</Text>
										<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											Search the FargoRate database to find and add players to the tournament
										</Text>
									</View>
								)}
							</View>
						)}
					</View>
				);

			case "matches":
				return (
					<View className="px-4 py-4">
						{allMatches.length > 0 ? (
							<View className="space-y-3">
								{allMatches.map((match: any) => (
									<View
										key={match._id}
										className="p-4 rounded-lg"
										style={{
											backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											borderWidth: 1,
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<View className="flex-row items-center justify-between mb-2">
											<Text className="text-xs uppercase" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												Round {match.round}
											</Text>
											<View
												className="px-2 py-1 rounded-full"
												style={{
													backgroundColor:
														match.status === "completed"
															? "#10B981"
															: match.status === "in_progress"
															? accentColor
															: withOpacity(themeColorForeground, opacity.OPACITY_20),
												}}
											>
												<Text
													className="text-xs font-medium"
													style={{
														color: match.status === "completed" || match.status === "in_progress" ? "#FFFFFF" : themeColorForeground,
													}}
												>
													{match.status.replace("_", " ").toUpperCase()}
												</Text>
											</View>
										</View>
										<View className="flex-row items-center justify-between">
											<View className="flex-1">
												<Text className="text-sm font-medium" style={{ color: themeColorForeground }}>
													{match.player1?.name || "TBD"}
												</Text>
												<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
													vs
												</Text>
												<Text className="text-sm font-medium mt-1" style={{ color: themeColorForeground }}>
													{match.player2?.name || "TBD"}
												</Text>
											</View>
											{match.status === "completed" && (
												<View className="items-end">
													<Text className="text-lg font-bold" style={{ color: accentColor }}>
														{match.player1Score} - {match.player2Score}
													</Text>
													{match.winner && (
														<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
															Winner: {match.winner.name}
														</Text>
													)}
												</View>
											)}
										</View>
									</View>
								))}
							</View>
						) : (
							<View className="py-16 items-center">
								<Ionicons name="game-controller-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
								<Text className="text-sm mt-4" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									No matches yet. Start the tournament to generate matches.
								</Text>
							</View>
						)}
					</View>
				);

			case "bracket":
				return (
					<View style={{ flex: 1 }}>
						<TournamentBracket
							matches={matches}
							tournamentType={tournament?.type || "single"}
							tournamentId={tournamentId as Id<"tournaments">}
						/>
					</View>
				);

			case "results":
				const completedMatchesForResults = allMatches.filter((m: any) => {
					if (m.status !== "completed") return false;
					// TBD vs TBD matches (no players) are complete if status is completed
					if (!m.player1Id && !m.player2Id) return true;
					// Regular matches need a winnerId
					return !!m.winnerId;
				}).sort((a: any, b: any) => {
					const timeA = a.completedAt || 0;
					const timeB = b.completedAt || 0;
					return timeB - timeA;
				});

				// Calculate player results
				const playerResultsMap = new Map<Id<"players">, { name: string; wins: number; losses: number; finalRound: number }>();
				completedMatchesForResults.forEach((match: any) => {
					if (match.player1Id) {
						const existing = playerResultsMap.get(match.player1Id) || {
							name: match.player1?.name || "Unknown",
							wins: 0,
							losses: 0,
							finalRound: 0,
						};
						existing.wins += match.winnerId === match.player1Id ? 1 : 0;
						existing.losses += match.winnerId !== match.player1Id && match.winnerId ? 1 : 0;
						existing.finalRound = Math.max(existing.finalRound, match.round);
						playerResultsMap.set(match.player1Id, existing);
					}
					if (match.player2Id) {
						const existing = playerResultsMap.get(match.player2Id) || {
							name: match.player2?.name || "Unknown",
							wins: 0,
							losses: 0,
							finalRound: 0,
						};
						existing.wins += match.winnerId === match.player2Id ? 1 : 0;
						existing.losses += match.winnerId !== match.player2Id && match.winnerId ? 1 : 0;
						existing.finalRound = Math.max(existing.finalRound, match.round);
						playerResultsMap.set(match.player2Id, existing);
					}
				});

				const playerResults = Array.from(playerResultsMap.values()).sort((a, b) => {
					if (a.finalRound !== b.finalRound) return b.finalRound - a.finalRound;
					const aWinRate = (a.wins + a.losses) > 0 ? a.wins / (a.wins + a.losses) : 0;
					const bWinRate = (b.wins + b.losses) > 0 ? b.wins / (b.wins + b.losses) : 0;
					if (aWinRate !== bWinRate) return bWinRate - aWinRate;
					return b.wins - a.wins;
				});

				return (
					<ScrollView className="flex-1" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
						<View className="px-4 py-4">
							{/* Stats Summary */}
							<View className="flex-row flex-wrap gap-4 mb-4">
								<View className="flex-1 min-w-[45%] p-4 rounded-lg" style={{ backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10) }}>
									<Text className="text-2xl font-bold" style={{ color: themeColorForeground }}>
										{completedMatchesForResults.length}
									</Text>
									<Text className="text-sm mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Matches Completed
									</Text>
								</View>
								<View className="flex-1 min-w-[45%] p-4 rounded-lg" style={{ backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10) }}>
									<Text className="text-2xl font-bold" style={{ color: themeColorForeground }}>
										{playerResults.length}
									</Text>
									<Text className="text-sm mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Players
									</Text>
								</View>
								<View className="flex-1 min-w-[45%] p-4 rounded-lg" style={{ backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10) }}>
									<Text className="text-2xl font-bold" style={{ color: themeColorForeground }}>
										{playerResults.length > 0 ? playerResults[0].name : "-"}
									</Text>
									<Text className="text-sm mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Champion
									</Text>
								</View>
							</View>

							{/* Standings */}
							<View className="mb-6">
								<Text className="text-lg font-semibold mb-4" style={{ color: themeColorForeground }}>
									Standings
								</Text>
								{playerResults.length > 0 ? (
									<View className="space-y-2">
										{playerResults.map((result, index) => (
											<View
												key={index}
												className="p-4 rounded-lg flex-row items-center"
												style={{
													backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
													borderWidth: 1,
													borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
												}}
											>
												<View className="w-8 items-center mr-3">
													{index === 0 && <Ionicons name="trophy" size={20} color="#F59E0B" />}
													{index === 1 && <Ionicons name="medal" size={20} color="#9CA3AF" />}
													{index === 2 && <Ionicons name="star" size={20} color="#D97706" />}
													<Text className="text-sm font-semibold mt-1" style={{ color: themeColorForeground }}>
														{index + 1}
													</Text>
												</View>
												<View className="flex-1">
													<Text className="text-base font-semibold" style={{ color: themeColorForeground }}>
														{result.name}
													</Text>
													<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														Round {result.finalRound}
													</Text>
												</View>
												<View className="items-end">
													<Text className="text-sm font-semibold" style={{ color: themeColorForeground }}>
														{result.wins}W - {result.losses}L
													</Text>
													<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														{result.wins + result.losses > 0 ? Math.round((result.wins / (result.wins + result.losses)) * 100) : 0}%
													</Text>
												</View>
											</View>
										))}
									</View>
								) : (
									<View className="py-8 items-center">
										<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											No results yet
										</Text>
									</View>
								)}
							</View>

							{/* Recent Matches */}
							<View>
								<Text className="text-lg font-semibold mb-4" style={{ color: themeColorForeground }}>
									Recent Matches
								</Text>
								{completedMatchesForResults.length > 0 ? (
									<View className="space-y-2">
										{completedMatchesForResults.slice(0, 20).map((match: any) => {
											const bracketLabel = match.bracketType === "loser" ? "L" : 
												match.bracketType === "grand_final" ? "GF" : "W";
											const matchLabel = bracketLabel 
												? `${bracketLabel}${match.round}-${match.bracketPosition + 1}`
												: `R${match.round}-${match.bracketPosition + 1}`;

											return (
												<View
													key={match._id}
													className="p-4 rounded-lg"
													style={{
														backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
														borderWidth: 1,
														borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
													}}
												>
													<View className="flex-row items-center justify-between mb-2">
														<Text className="text-xs uppercase" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
															Round {match.round}
														</Text>
														<Text className="text-xs font-medium" style={{ color: themeColorForeground }}>
															{matchLabel}
														</Text>
													</View>
													<View className="space-y-1">
														<Text className={`text-sm ${match.winnerId === match.player1Id ? "font-bold" : ""}`} style={{ color: match.winnerId === match.player1Id ? "#10B981" : themeColorForeground }}>
															{match.player1?.name || "TBD"} {match.player1Score}
														</Text>
														<Text className={`text-sm ${match.winnerId === match.player2Id ? "font-bold" : ""}`} style={{ color: match.winnerId === match.player2Id ? "#10B981" : themeColorForeground }}>
															{match.player2?.name || "TBD"} {match.player2Score}
														</Text>
													</View>
													{match.completedAt && (
														<Text className="text-xs mt-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
															{formatDate(match.completedAt)}
														</Text>
													)}
												</View>
											);
										})}
									</View>
								) : (
									<View className="py-8 items-center">
										<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											No completed matches yet
										</Text>
									</View>
								)}
							</View>
						</View>
					</ScrollView>
				);

			case "tables":
				return <TablesManagement tournamentId={tournamentId as Id<"tournaments">} />;

			case "payouts":
				return <TournamentPayoutsScreen />;

			case "settings":
				return <TournamentSettingsView tournamentId={tournamentId as Id<"tournaments">} />;

			default:
				return null;
		}
	};

	const handleRemoveManager = async (userId: Id<"users">) => {
		Alert.alert(
			"Remove Manager",
			"Are you sure you want to remove this manager?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: async () => {
						try {
							await removeManager({ tournamentId: tournamentId as Id<"tournaments">, userId });
						} catch (error) {
							console.error("Failed to remove manager:", error);
							Alert.alert("Error", error instanceof Error ? error.message : "Failed to remove manager");
						}
					},
				},
			]
		);
	};

	return (
		<>
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
						<Text className="text-2xl font-bold tracking-tighter font-mono shrink" numberOfLines={1} style={{ color: themeColorForeground }}>
							{tournament.name}
						</Text>
					</View>
					<View
						className="px-2 py-0.5 rounded-full ml-3"
						style={{
							backgroundColor:
								statusProps.variant === "default"
									? accentColor
									: withOpacity(themeColorForeground, opacity.OPACITY_20),
						}}
					>
						<Text
							className="text-xs font-medium"
							style={{
								color: statusProps.variant === "default" ? "#FFFFFF" : themeColorForeground,
							}}
						>
							{statusProps.text}
						</Text>
					</View>
				</View>

				{/* Tabs */}
				<View
					className="border-b px-4 py-3.5"
					style={{
						borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					}}
				>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 8 }}
					>
						<View className="flex-row gap-2">
							{tabs.map((tab) => (
								<Pressable
									key={tab.mode}
									onPress={() => setViewMode(tab.mode)}
									className="px-3 py-2 rounded-lg border shrink-0"
									style={({ pressed }) => ({
										backgroundColor:
											viewMode === tab.mode
												? accentColor
												: "transparent",
										borderColor:
											viewMode === tab.mode
												? accentColor
												: withOpacity(themeColorForeground, opacity.OPACITY_20),
										opacity: pressed ? 0.7 : 1,
									})}
								>
									<View className="flex-row items-center justify-center">
										<Ionicons
											name={tab.icon}
											size={16}
											color={viewMode === tab.mode ? "#FFFFFF" : themeColorForeground}
										/>
										<Text
											className="text-sm font-medium ml-2"
											style={{
												color: viewMode === tab.mode ? "#FFFFFF" : themeColorForeground,
											}}
										>
											{tab.label}
										</Text>
									</View>
								</Pressable>
							))}
						</View>
					</ScrollView>
				</View>

				{/* Content */}
				<ScrollView
					style={{ flex: 1 }}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
					}
					contentContainerStyle={{ paddingBottom: 16 }}
				>
					{renderContent()}
				</ScrollView>
			</SafeAreaView>

			{/* Full-size Flyer Modal */}
			<Modal
				visible={selectedFlyerUrl !== null}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setSelectedFlyerUrl(null)}
			>
				<Pressable
					style={{
						flex: 1,
						backgroundColor: "rgba(0, 0, 0, 0.9)",
						justifyContent: "center",
						alignItems: "center",
					}}
					onPress={() => setSelectedFlyerUrl(null)}
				>
					<Pressable
						style={{
							position: "absolute",
							top: 40,
							right: 20,
							zIndex: 1,
						}}
						onPress={() => setSelectedFlyerUrl(null)}
					>
						<View
							style={{
								width: 40,
								height: 40,
								borderRadius: 20,
								backgroundColor: withOpacity(themeColorBackground, opacity.OPACITY_90),
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Ionicons name="close" size={24} color={themeColorForeground} />
						</View>
					</Pressable>
					<Pressable
						onPress={(e) => e.stopPropagation()}
						style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
					>
						<ScrollView
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: "center",
								alignItems: "center",
								padding: 20,
							}}
							maximumZoomScale={3}
							minimumZoomScale={1}
							showsVerticalScrollIndicator={false}
							showsHorizontalScrollIndicator={false}
						>
							{selectedFlyerUrl && (
								<View style={{ width: Dimensions.get("window").width - 40, alignItems: "center" }}>
									<Image
										source={{ uri: selectedFlyerUrl }}
										style={{
											width: Dimensions.get("window").width - 40,
											height: Dimensions.get("window").height - 100,
											resizeMode: "contain",
										}}
									/>
								</View>
							)}
						</ScrollView>
					</Pressable>
				</Pressable>
			</Modal>

			{/* Add Manager Modal */}
			<AddManagerModal
				visible={showAddManagerModal}
				onClose={() => setShowAddManagerModal(false)}
				tournamentId={tournamentId as Id<"tournaments">}
			/>
		</>
	);
}

