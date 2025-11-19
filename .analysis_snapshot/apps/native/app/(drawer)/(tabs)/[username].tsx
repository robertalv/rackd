import { Text, View, ScrollView, ActivityIndicator, Pressable, RefreshControl, Animated } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { PostCard } from "@/components/post-card";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileTabs } from "@/components/profile-tabs";
import { QRCodeShareModal } from "@/components/qr-code-share-modal";
import { formatDistanceToNow } from "date-fns";

type ViewMode = "social" | "activity";

export default function UserProfileScreen() {
	const router = useRouter();
	const { username } = useLocalSearchParams<{ username: string }>();
	const [viewMode, setViewMode] = useState<ViewMode>("social");
	const [refreshing, setRefreshing] = useState(false);
	const [showQRModal, setShowQRModal] = useState(false);
	const scrollY = useRef(new Animated.Value(0)).current;
	const [tabsSticky, setTabsSticky] = useState(false);
	const profileHeaderHeight = 280; // Approximate height of profile header section
	const insets = useSafeAreaInsets();

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	// Get current user to check if this is own profile
	const currentUser = useQuery(api.users.currentUser);
	const user = useQuery(api.users.getByUsername, { username: username || "" });
	const userProfile = useQuery(
		api.users.getProfile,
		user?._id ? { userId: user._id } : "skip"
	);

	// Get user posts for social feed
	const userPosts = useQuery(
		api.posts.getByUser,
		user?._id && viewMode === "social" ? { userId: user._id, limit: 50 } : "skip"
	);

	// Get user stats for activity view
	const userStats = useQuery(
		api.users.getStats,
		user?._id && viewMode === "activity" ? { userId: user._id } : "skip"
	);

	// Get tournaments for activity view
	const organizerTournaments = useQuery(
		api.tournaments.getByOrganizer,
		user?._id && viewMode === "activity" ? { userId: user._id } : "skip"
	);
	const playerRegistrations = useQuery(
		api.tournamentRegistrations.getByUser,
		user?._id && viewMode === "activity" ? { userId: user._id } : "skip"
	);

	// Get matches for activity view
	const matchesData = useQuery(
		api.matches.getByUserId,
		user?._id && viewMode === "activity" ? { userId: user._id, limit: 100 } : "skip"
	);

	const onRefresh = async () => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 1000);
	};

	const handleScroll = Animated.event(
		[{ nativeEvent: { contentOffset: { y: scrollY } } }],
		{
			useNativeDriver: false,
			listener: (event: any) => {
				const offsetY = event.nativeEvent.contentOffset.y;
				setTabsSticky(offsetY > profileHeaderHeight);
			},
		}
	);

	// Early returns AFTER all hooks are called
	if (user === undefined || userProfile === undefined) {
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

	if (!user) {
		return (
			<SafeAreaView className="flex-1" style={{ height: "100%", backgroundColor: themeColorBackground }} edges={["top"]}>
				<View className="flex-1 items-center justify-center px-4">
					<Ionicons name="person-outline" size={64} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
					<Text className="text-xl font-semibold mt-4 mb-2" style={{ color: themeColorForeground }}>
						User not found
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

	const isOwnProfile = currentUser?._id === user._id;

	// Calculate matches stats
	const matches = matchesData || [];
	const userPlayerIds = new Set<Id<"players">>();
	if (userProfile?.playerId) {
		userPlayerIds.add(userProfile.playerId);
	}

	const completedMatches = matches.filter((m: any) => {
		if (m.status !== "completed") return false;
		const isPlayer1 = m.player1Id ? userPlayerIds.has(m.player1Id) : false;
		const isPlayer2 = m.player2Id ? userPlayerIds.has(m.player2Id) : false;
		const isUserInMatch = isPlayer1 || isPlayer2;
		if (!isUserInMatch || !m.winnerId) return false;
		return true;
	});

	const totalMatches = completedMatches.length;
	const wins = completedMatches.filter((m: any) => m.winnerId && userPlayerIds.has(m.winnerId)).length;
	const losses = completedMatches.filter((m: any) => m.winnerId && !userPlayerIds.has(m.winnerId)).length;
	const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0";

	// Get player tournaments with registration data
	const tournamentMap = new Map();
	const tournamentRegistrationsMap = new Map();
	playerRegistrations?.forEach((r: any) => {
		if (r.tournament && r.tournament._id) {
			tournamentMap.set(r.tournament._id, r.tournament);
			tournamentRegistrationsMap.set(r.tournament._id, r);
		}
	});
	const playedTournaments = Array.from(tournamentMap.values());
	const uniquePlayerTournaments = tournamentMap.size;

	const renderContent = () => {
		if (viewMode === "social") {
			return (
				<View className="px-4 pb-4">
					{userPosts === undefined ? (
						<View className="py-8 items-center">
							<ActivityIndicator size="small" color={accentColor} />
						</View>
					) : userPosts && userPosts.length > 0 ? (
						<View>
							{userPosts.map((post: any) => (
								<PostCard key={post._id} post={post} />
							))}
						</View>
					) : (
						<View className="py-16 items-center">
							<Ionicons name="document-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
							<Text className="text-base font-semibold mt-4 mb-1" style={{ color: themeColorForeground }}>
								No posts yet
							</Text>
							<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								{isOwnProfile ? "Start sharing your pool journey!" : "This user hasn't posted anything yet"}
							</Text>
						</View>
					)}
				</View>
			);
		} else {
			// Activity & Stats view
			return (
				<View className="px-4 pb-4">
						{userStats === undefined ? (
							<View className="py-8 items-center">
								<ActivityIndicator size="small" color={accentColor} />
							</View>
						) : (
							<View className="space-y-4">
								{/* Stats Cards */}
								<View className="flex-row flex-wrap gap-4 mb-4">
									<View
										className="flex-1 min-w-[45%] p-4 rounded-lg"
										style={{
											backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											borderWidth: 1,
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<View className="flex-row items-center mb-2">
											<Ionicons name="trophy" size={16} color="#10B981" />
											<Text className="text-sm font-semibold ml-2" style={{ color: themeColorForeground }}>
												Win Rate
											</Text>
										</View>
										<Text className="text-2xl font-bold" style={{ color: "#10B981" }}>
											{winRate}%
										</Text>
										<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											{wins} wins, {losses} losses
										</Text>
									</View>
									<View
										className="flex-1 min-w-[45%] p-4 rounded-lg"
										style={{
											backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											borderWidth: 1,
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<View className="flex-row items-center mb-2">
											<Ionicons name="game-controller" size={16} color={accentColor} />
											<Text className="text-sm font-semibold ml-2" style={{ color: themeColorForeground }}>
												Total Matches
											</Text>
										</View>
										<Text className="text-2xl font-bold" style={{ color: accentColor }}>
											{totalMatches}
										</Text>
										<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											All time
										</Text>
									</View>
									<View
										className="flex-1 min-w-[45%] p-4 rounded-lg"
										style={{
											backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											borderWidth: 1,
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<View className="flex-row items-center mb-2">
											<Ionicons name="trophy-outline" size={16} color="#F59E0B" />
											<Text className="text-sm font-semibold ml-2" style={{ color: themeColorForeground }}>
												Tournaments
											</Text>
										</View>
										<Text className="text-2xl font-bold" style={{ color: "#F59E0B" }}>
											{uniquePlayerTournaments}
										</Text>
										<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											Participated
										</Text>
									</View>
								</View>

								{/* Performance Breakdown */}
								<View
									className="p-4 rounded-lg mb-4"
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
												{completedMatches.length > 0 ? (
													completedMatches.slice(-10).map((match: any, index: number) => {
														const isWin = match.winnerId && userPlayerIds.has(match.winnerId);
														return (
															<View
																key={match._id || index}
																className="w-3 h-3 rounded-full"
																style={{
																	backgroundColor: isWin ? "#10B981" : "#EF4444",
																}}
															/>
														);
													})
												) : (
													<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														No matches yet
													</Text>
												)}
											</View>
										</View>
									</View>
								</View>

								{/* Player Stats if available */}
								{userProfile?.player && (
									<View
										className="p-4 rounded-lg"
										style={{
											backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											borderWidth: 1,
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<Text className="text-lg font-semibold mb-4" style={{ color: themeColorForeground }}>
											Player Stats
										</Text>
										<View className="flex-row flex-wrap gap-4">
											{userProfile.player.fargoRating && (
												<View className="flex-1 min-w-[45%]">
													<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														Fargo Rating
													</Text>
													<Text className="text-xl font-bold mt-1" style={{ color: accentColor }}>
														{userProfile.player.fargoRating.toLocaleString()}
													</Text>
												</View>
											)}
											{userProfile.player.fargoRobustness && (
												<View className="flex-1 min-w-[45%]">
													<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														Robustness
													</Text>
													<Text className="text-xl font-bold mt-1" style={{ color: "#10B981" }}>
														{userProfile.player.fargoRobustness}
													</Text>
												</View>
											)}
										</View>
										{userProfile.player.fargoReadableId && (
											<Text className="text-xs mt-3" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												Fargo ID: {userProfile.player.fargoReadableId}
											</Text>
										)}
									</View>
								)}

								{/* Link to Player Profile if available */}
								{userProfile?.player?._id && (
									<Pressable
										onPress={() => router.push(`/(drawer)/(tabs)/players/${userProfile?.player?._id}`)}
										className="p-4 rounded-lg flex-row items-center justify-between mb-4"
										style={{
											backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
											borderWidth: 1,
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<View className="flex-row items-center">
											<Ionicons name="person-outline" size={24} color={accentColor} />
											<Text className="text-base font-semibold ml-3" style={{ color: themeColorForeground }}>
												View Player Profile
											</Text>
										</View>
										<Ionicons name="chevron-forward" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
									</Pressable>
								)}

								{/* Tournaments */}
								<View className="mb-4">
									<Text className="text-lg font-semibold mb-3" style={{ color: themeColorForeground }}>
										Tournaments
									</Text>
									{(organizerTournaments || []).length > 0 || playedTournaments.length > 0 ? (
										<View className="space-y-3">
											{(organizerTournaments || []).map((tournament: any) => (
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
													<View className="flex-row items-center justify-between">
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
													<Text className="text-xs mt-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														Organizer
													</Text>
												</Pressable>
											))}
											{playedTournaments.map((tournament: any) => {
												const registration = tournamentRegistrationsMap.get(tournament._id);
												return (
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
														<View className="flex-row items-center justify-between mb-2">
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
														<View className="flex-row items-center justify-between">
															<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																Player
															</Text>
															{registration?.position && (
																<View className="flex-row items-center">
																	<Ionicons 
																		name="trophy" 
																		size={14} 
																		color={
																			registration.position === 1 ? "#F59E0B" :
																			registration.position === 2 ? "#94A3B8" :
																			registration.position === 3 ? "#F97316" :
																			withOpacity(themeColorForeground, opacity.OPACITY_60)
																		} 
																	/>
																	<Text className="text-xs font-semibold ml-1" style={{ color: themeColorForeground }}>
																		{registration.position === 1 ? "1st" :
																		 registration.position === 2 ? "2nd" :
																		 registration.position === 3 ? "3rd" :
																		 `${registration.position}th`}
																	</Text>
																	{registration?.winnings && registration.winnings > 0 && (
																		<Text className="text-xs font-semibold ml-2" style={{ color: "#10B981" }}>
																			${registration.winnings.toLocaleString()}
																		</Text>
																	)}
																</View>
															)}
														</View>
													</Pressable>
												);
											})}
										</View>
									) : (
										<View className="py-8 items-center">
											<Ionicons name="trophy-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
											<Text className="text-sm text-center px-8 mt-4" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												No tournaments yet
											</Text>
										</View>
									)}
								</View>

								{/* Match History */}
								<View className="mb-4">
									<Text className="text-lg font-semibold mb-3" style={{ color: themeColorForeground }}>
										Recent Matches
									</Text>
									{completedMatches.length > 0 ? (
										<View className="space-y-3">
											{completedMatches.slice(0, 10).map((match: any) => {
												const isPlayer1 = match.player1Id ? userPlayerIds.has(match.player1Id) : false;
												const userWon = match.winnerId && userPlayerIds.has(match.winnerId);
												const opponentName = isPlayer1 ? match.player2Name : match.player1Name;
												const userScore = isPlayer1 ? match.player1Score : match.player2Score;
												const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
												
												return (
													<Pressable
														key={match._id}
														onPress={() => match.tournament?._id && router.push(`/(drawer)/(tabs)/tournaments/${match.tournament._id}`)}
														className="p-4 rounded-lg"
														style={{
															backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
															borderWidth: 1,
															borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
														}}
													>
														<View className="flex-row items-center justify-between mb-2">
															<View className="flex-row items-center flex-1">
																{userWon && (
																	<Ionicons name="trophy" size={16} color="#F59E0B" />
																)}
																<Text className="text-base font-semibold ml-2" style={{ color: themeColorForeground }}>
																	{opponentName}
																</Text>
															</View>
															<View className="flex-row items-center gap-2">
																<View
																	className="px-2 py-1 rounded"
																	style={{
																		backgroundColor: userWon ? "#10B981" : withOpacity(themeColorForeground, opacity.OPACITY_10),
																	}}
																>
																	<Text className="text-sm font-semibold" style={{ color: userWon ? "#FFFFFF" : themeColorForeground }}>
																		{userScore || 0}
																	</Text>
																</View>
																<Text style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>-</Text>
																<View
																	className="px-2 py-1 rounded"
																	style={{
																		backgroundColor: !userWon ? "#EF4444" : withOpacity(themeColorForeground, opacity.OPACITY_10),
																	}}
																>
																	<Text className="text-sm font-semibold" style={{ color: !userWon ? "#FFFFFF" : themeColorForeground }}>
																		{opponentScore || 0}
																	</Text>
																</View>
															</View>
														</View>
														<View className="flex-row items-center justify-between">
															<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																{match.tournamentName || "Match"}
															</Text>
															<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
																{formatDistanceToNow(new Date(match.playedAt), { addSuffix: true })}
															</Text>
														</View>
													</Pressable>
												);
											})}
										</View>
									) : (
										<View className="py-8 items-center">
											<Ionicons name="game-controller-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
											<Text className="text-sm text-center px-8 mt-4" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												No matches played yet
											</Text>
										</View>
									)}
								</View>
							</View>
						)}
					</View>
			);
		}
	};

	return (
		<SafeAreaView className="flex-1" style={{ height: "100%", backgroundColor: themeColorBackground }} edges={["top"]}>
			{/* Header - Fixed */}
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
					<Text className="text-lg font-semibold" style={{ color: themeColorForeground }}>
						{user.displayName || user.username}
					</Text>
				</View>
				<View className="flex-row items-center gap-2">
					<Pressable
						className="p-2"
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Ionicons name="ellipsis-horizontal" size={24} color={themeColorForeground} />
					</Pressable>
				</View>
			</View>

			{/* Sticky Tabs - Show when scrolled */}
			{tabsSticky && (
				<View
					style={{
						position: "absolute",
						top: insets.top + 50, // Header height + safe area
						left: 0,
						right: 0,
						zIndex: 10,
						backgroundColor: themeColorBackground,
						borderBottomWidth: 1,
						borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.1,
						shadowRadius: 3,
						elevation: 3,
					}}
				>
					<ProfileTabs viewMode={viewMode} onViewModeChange={setViewMode} />
				</View>
			)}

			{/* Main ScrollView */}
			<Animated.ScrollView
				onScroll={handleScroll}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingBottom: 20 }}
			>
				{/* Profile Header - Instagram Style */}
				<ProfileHeader
					userId={user._id}
					displayName={user.displayName || user.username}
					username={user.username}
					bio={user.bio}
					imageUrl={userProfile?.imageUrl}
					postCount={user.postCount || 0}
					followerCount={user.followerCount || 0}
					followingCount={user.followingCount || 0}
					interests={user.interests}
					isOwnProfile={isOwnProfile}
					onShareProfile={() => setShowQRModal(true)}
				/>

				{/* Tabs - Inside ScrollView */}
				<View style={{ opacity: tabsSticky ? 0 : 1 }}>
					<ProfileTabs viewMode={viewMode} onViewModeChange={setViewMode} />
				</View>

				{/* Content */}
				{renderContent()}
			</Animated.ScrollView>

			{/* QR Code Share Modal */}
			{isOwnProfile && (
				<QRCodeShareModal
					visible={showQRModal}
					onClose={() => setShowQRModal(false)}
					username={user.username}
					displayName={user.displayName || user.username}
				/>
			)}
		</SafeAreaView>
	);
}

