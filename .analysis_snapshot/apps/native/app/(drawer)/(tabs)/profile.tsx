import { Text, View, ScrollView, ActivityIndicator, Pressable, RefreshControl, Animated } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { PostCard } from "@/components/post-card";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileTabs } from "@/components/profile-tabs";
import { QRCodeShareModal } from "@/components/qr-code-share-modal";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

type ViewMode = "social" | "activity";

export default function ProfileScreen() {
	const router = useRouter();
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

	const customUser = useQuery(api.users.currentUser);
	const userProfile = useQuery(
		api.users.getProfile,
		customUser ? { userId: customUser._id } : "skip"
	);
	const userStats = useQuery(
		api.users.getStats,
		customUser ? { userId: customUser._id } : "skip"
	);

	// Get user posts for social feed
	const userPosts = useQuery(
		api.posts.getByUser,
		customUser?._id && viewMode === "social" ? { userId: customUser._id, limit: 50 } : "skip"
	);

	// Get tournaments for activity view
	const organizerTournaments = useQuery(
		api.tournaments.getByOrganizer,
		customUser?._id && viewMode === "activity" ? { userId: customUser._id } : "skip"
	);
	const playerRegistrations = useQuery(
		api.tournamentRegistrations.getByUser,
		customUser?._id && viewMode === "activity" ? { userId: customUser._id } : "skip"
	);

	// Get matches for activity view
	const matchesData = useQuery(
		api.matches.getByUserId,
		customUser?._id && viewMode === "activity" ? { userId: customUser._id, limit: 100 } : "skip"
	);

	const onRefresh = async () => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 1000);
	};

	// Don't block rendering - show header immediately like tournaments screen
	if (!customUser) {
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
						<Text className="text-lg font-semibold" style={{ color: themeColorForeground }}>
							Profile
						</Text>
					</View>
					<View className="flex-row items-center">
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
				<View className="flex-1 items-center justify-center px-4">
					<Ionicons name="person-outline" size={64} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
					<Text className="text-xl font-semibold mt-4 mb-2" style={{ color: themeColorForeground }}>
						Not logged in
					</Text>
				</View>
			</SafeAreaView>
		);
	}

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

	// Get player tournaments
	const tournamentMap = new Map();
	playerRegistrations?.forEach((r: any) => {
		if (r.tournament && r.tournament._id) {
			tournamentMap.set(r.tournament._id, r.tournament);
		}
	});
	const playedTournaments = Array.from(tournamentMap.values());

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
								Start sharing your pool journey!
							</Text>
						</View>
					)}
				</View>
			);
		} else {
			// Activity & Stats view
			return (
				<View className="px-4 pb-4">
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
							<Text className="text-2xl font-bold" style={{ color: themeColorForeground }}>
								{userStats?.followerCount || 0}
							</Text>
							<Text className="text-sm mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Followers
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
							<Text className="text-2xl font-bold" style={{ color: themeColorForeground }}>
								{userStats?.followingCount || 0}
							</Text>
							<Text className="text-sm mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Following
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
							<Text className="text-2xl font-bold" style={{ color: themeColorForeground }}>
								{userStats?.postCount || 0}
							</Text>
							<Text className="text-sm mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Posts
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
							<Text className="text-2xl font-bold" style={{ color: "#10B981" }}>
								{winRate}%
							</Text>
							<Text className="text-sm mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Win Rate
							</Text>
						</View>
					</View>

					{/* Player Stats if available */}
					{userProfile?.player && (
						<View
							className="p-4 rounded-lg mb-4"
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
										<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
											{tournament.name}
										</Text>
										<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											Organizer
										</Text>
									</Pressable>
								))}
								{playedTournaments.map((tournament: any) => (
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
										<Text className="text-base font-semibold mb-1" style={{ color: themeColorForeground }}>
											{tournament.name}
										</Text>
										<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											Player
										</Text>
									</Pressable>
								))}
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
					<Text className="text-4xl font-bold tracking-tighter" style={{ color: themeColorForeground }}>
						{customUser.displayName || customUser.username}
					</Text>
				</View>
				<View className="flex-row items-center gap-2">
					<Pressable
						className="p-2"
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Ionicons name="add-circle-outline" size={24} color={themeColorForeground} />
					</Pressable>
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
			{userProfile === undefined || userStats === undefined ? (
				<View className="flex-1 justify-center items-center py-16">
					<ActivityIndicator size="large" color={accentColor} />
					<Text className="text-base mt-4" style={{ color: themeColorForeground }}>
						Loading profile...
					</Text>
				</View>
			) : (
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
						userId={customUser._id}
						displayName={customUser.displayName || customUser.username}
						username={customUser.username}
						bio={customUser.bio}
						imageUrl={userProfile?.imageUrl}
						postCount={customUser.postCount || 0}
						followerCount={customUser.followerCount || 0}
						followingCount={customUser.followingCount || 0}
						interests={customUser.interests}
						isOwnProfile={true}
						onShareProfile={() => setShowQRModal(true)}
					/>

					{/* Tabs - Inside ScrollView */}
					<View style={{ opacity: tabsSticky ? 0 : 1 }}>
						<ProfileTabs viewMode={viewMode} onViewModeChange={setViewMode} />
					</View>

					{/* Content */}
					{renderContent()}
				</Animated.ScrollView>
			)}

			{/* QR Code Share Modal */}
			{customUser && (
				<QRCodeShareModal
					visible={showQRModal}
					onClose={() => setShowQRModal(false)}
					username={customUser.username}
					displayName={customUser.displayName || customUser.username}
				/>
			)}
		</SafeAreaView>
	);
}

