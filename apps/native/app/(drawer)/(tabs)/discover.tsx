import { Text, View, ScrollView, TextInput, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { PostCard } from "@/components/post-card";
import { useRecentSearches } from "@/hooks/use-recent-searches";

export default function DiscoverScreen() {
	const params = useLocalSearchParams<{ tab?: string; query?: string }>();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"players" | "tournaments" | "posts">(
		(params.tab as any) || "players"
	);
	const [searchQuery, setSearchQuery] = useState(params.query || "");
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const searchInputRef = useRef<TextInput>(null);
	const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches(activeTab);
	const lastSavedQueryRef = useRef<string>("");

	// Reset last saved query when tab changes
	useEffect(() => {
		lastSavedQueryRef.current = "";
	}, [activeTab]);

	// Query data based on active tab
	const playersData = useQuery(
		api.users.getPlayersForDiscovery,
		activeTab === "players" ? { 
			query: searchQuery.length > 0 ? searchQuery : undefined,
			limit: 50 
		} : "skip"
	);

	const tournamentsData = useQuery(
		api.tournaments.getAllTournaments,
		activeTab === "tournaments" ? { 
			query: searchQuery.length > 0 ? searchQuery : undefined,
		} : "skip"
	);

	const postsData = useQuery(
		api.posts.getDiscoverFeed,
		activeTab === "posts" ? { 
			limit: 50,
			query: searchQuery.length > 0 ? searchQuery : undefined,
		} : "skip"
	);

	useEffect(() => {
		if (params.tab) {
			setActiveTab(params.tab as any);
		}
		if (params.query) {
			setSearchQuery(params.query);
		}
	}, [params.tab, params.query]);

	// Save search when query changes and is not empty
	useEffect(() => {
		if (searchQuery.trim().length > 0 && searchQuery !== lastSavedQueryRef.current) {
			// Debounce: only save after user stops typing for a moment
			const timeoutId = setTimeout(() => {
				addSearch(searchQuery);
				lastSavedQueryRef.current = searchQuery;
			}, 1000);

			return () => clearTimeout(timeoutId);
		}
	}, [searchQuery, addSearch]);

	const handleRecentSearchPress = (query: string) => {
		setSearchQuery(query);
		setIsSearchFocused(false);
		searchInputRef.current?.blur();
	};

	const renderRecentSearches = () => {
		if (!isSearchFocused || searchQuery.length > 0 || recentSearches.length === 0) {
			return null;
		}

		return (
			<View className="px-4 py-2">
				<View className="flex-row items-center justify-between mb-3">
					<Text className="text-sm font-semibold" style={{ color: themeColorForeground }}>
						Recent Searches
					</Text>
					<Pressable
						onPress={clearSearches}
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Text className="text-xs" style={{ color: accentColor }}>
							Clear All
						</Text>
					</Pressable>
				</View>
				{recentSearches.map((query, index) => (
					<Pressable
						key={`${query}-${index}`}
						onPress={() => handleRecentSearchPress(query)}
						style={({ pressed }) => ({
							opacity: pressed ? 0.7 : 1,
						})}
					>
						<View
							className="flex-row items-center justify-between py-3 px-3 rounded-lg mb-2"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							}}
						>
							<View className="flex-row items-center flex-1">
								<Ionicons
									name="time-outline"
									size={18}
									color={withOpacity(themeColorForeground, opacity.OPACITY_60)}
									style={{ marginRight: 10 }}
								/>
								<Text
									className="flex-1"
									style={{ color: themeColorForeground, fontSize: 14 }}
									numberOfLines={1}
								>
									{query}
								</Text>
							</View>
							<Pressable
								onPress={(e) => {
									e.stopPropagation();
									removeSearch(query);
								}}
								style={({ pressed }) => ({
									opacity: pressed ? 0.6 : 1,
									marginLeft: 8,
								})}
							>
								<Ionicons
									name="close-circle"
									size={20}
									color={withOpacity(themeColorForeground, opacity.OPACITY_40)}
								/>
							</Pressable>
						</View>
					</Pressable>
				))}
			</View>
		);
	};

	const renderContent = () => {
		if (activeTab === "players") {
			if (playersData === undefined) {
				return (
					<View className="flex-1 justify-center items-center py-12">
						<ActivityIndicator size="large" color={accentColor} />
						<Text className="mt-4" style={{ color: themeColorForeground }}>
							Loading players...
						</Text>
					</View>
				);
			}
			if (!playersData || playersData.length === 0) {
				return (
					<View className="flex-1 justify-center items-center py-12">
						<Ionicons name="people-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
						<Text className="text-lg font-semibold mb-2 mt-4" style={{ color: themeColorForeground }}>
							No players found
						</Text>
						<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
							{searchQuery.length > 0 
								? "Try a different search term"
								: "Start following players to get personalized suggestions"
							}
						</Text>
					</View>
				);
			}
			return (
				<View className="p-4">
					{playersData.map((player: any) => (
						<Pressable
							key={player._id}
							onPress={() => {
								if (player.username) {
									router.push(`/(drawer)/(tabs)/${player.username}`);
								}
							}}
							style={({ pressed }) => ({
								opacity: pressed ? 0.7 : 1,
							})}
						>
							<View className="mb-4 p-4 rounded-lg border" style={{ 
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}>
								<Text className="font-semibold text-lg" style={{ color: themeColorForeground }}>
									{player.name}
								</Text>
								{player.username && (
									<Text className="text-sm mb-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										@{player.username}
									</Text>
								)}
								{player.city && (
									<View className="flex-row items-center mt-2">
										<Ionicons name="location-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
										<Text className="text-sm ml-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
											{player.city}
										</Text>
									</View>
								)}
								{player.fargoRating && (
									<View className="flex-row items-center mt-2">
										<Text className="font-bold text-lg" style={{ color: accentColor }}>
											{player.fargoRating}
										</Text>
										{player.fargoRobustness && (
											<Text className="text-xs ml-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												R: {player.fargoRobustness}
											</Text>
										)}
									</View>
								)}
							</View>
						</Pressable>
					))}
				</View>
			);
		}

		if (activeTab === "tournaments") {
			if (tournamentsData === undefined) {
				return (
					<View className="flex-1 justify-center items-center py-12">
						<ActivityIndicator size="large" color={accentColor} />
						<Text className="mt-4" style={{ color: themeColorForeground }}>
							Loading tournaments...
						</Text>
					</View>
				);
			}
			if (!tournamentsData || tournamentsData.length === 0) {
				return (
					<View className="flex-1 justify-center items-center py-12">
						<Ionicons name="trophy-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
						<Text className="text-lg font-semibold mb-2 mt-4" style={{ color: themeColorForeground }}>
							No tournaments available
						</Text>
						<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
							Be the first to create a tournament for the community
						</Text>
					</View>
				);
			}
			return (
				<View className="p-4">
					{tournamentsData.map((tournament: any) => (
						<View key={tournament._id} className="mb-4 p-4 rounded-lg border" style={{ 
							backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
						}}>
							<Text className="font-semibold text-lg" style={{ color: themeColorForeground }}>
								{tournament.name}
							</Text>
							<View className="flex-row items-center mt-2">
								<Ionicons name="calendar-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
								<Text className="text-sm ml-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									{new Date(tournament.date).toLocaleDateString()}
								</Text>
							</View>
							{tournament.venue?.name && (
								<View className="flex-row items-center mt-2">
									<Ionicons name="location-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
									<Text className="text-sm ml-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										{tournament.venue.name}
									</Text>
								</View>
							)}
							<View className="flex-row items-center mt-2">
								<Ionicons name="people-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
								<Text className="text-sm ml-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									{tournament.registeredCount || 0}
									{tournament.maxPlayers && ` / ${tournament.maxPlayers}`}
								</Text>
							</View>
						</View>
					))}
				</View>
			);
		}

		if (activeTab === "posts") {
			if (postsData === undefined) {
				return (
					<View className="flex-1 justify-center items-center py-12">
						<ActivityIndicator size="large" color={accentColor} />
						<Text className="mt-4" style={{ color: themeColorForeground }}>
							Loading posts...
						</Text>
					</View>
				);
			}
			if (!postsData || postsData.length === 0) {
				return (
					<View className="flex-1 justify-center items-center py-12">
						<Ionicons name="newspaper-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
						<Text className="text-lg font-semibold mb-2 mt-4" style={{ color: themeColorForeground }}>
							No posts yet
						</Text>
						<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
							Be the first to share something with the community!
						</Text>
					</View>
				);
			}
			return (
				<View>
					{postsData.map((post: any) => (
						<PostCard key={post._id} post={post} />
					))}
				</View>
			);
		}

		return null;
	};

	return (
		<SafeAreaView 
			className="flex-1" 
			style={{ height: "100%", backgroundColor: themeColorBackground }}
			edges={["top"]}
		>
			{/* Header with Search */}
			<View
				className="px-4 py-3 border-b"
				style={{
					backgroundColor: themeColorBackground,
					borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
				}}
			>
				<View className="flex-row items-center mb-3">
                <Pressable
						onPress={() => router.back()}
						className="mr-3"
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Ionicons name="arrow-back" size={24} color={themeColorForeground} />
					</Pressable>
					<View
						className="flex-row items-center px-3 py-2 rounded-lg flex-1"
						style={{
							backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							borderWidth: isSearchFocused ? 1 : 0,
							borderColor: accentColor,
						}}
					>
						<Ionicons 
							name="search-outline" 
							size={18} 
							color={withOpacity(themeColorForeground, opacity.OPACITY_60)} 
							style={{ marginRight: 8 }}
						/>
						<TextInput
							ref={searchInputRef}
							placeholder="Search..."
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_60)}
							value={searchQuery}
							onChangeText={setSearchQuery}
							onFocus={() => setIsSearchFocused(true)}
							onBlur={() => {
								// Delay blur to allow recent search press to register
								setTimeout(() => setIsSearchFocused(false), 200);
							}}
							style={{
								flex: 1,
								color: themeColorForeground,
								fontSize: 14,
							}}
							returnKeyType="search"
							onSubmitEditing={() => {
								if (searchQuery.trim().length > 0) {
									addSearch(searchQuery);
									setIsSearchFocused(false);
								}
							}}
						/>
					</View>
				</View>
			</View>

            <View className="m-4">
				{/* Tabs */}
				<View className="flex-row gap-2">
					<Pressable
						onPress={() => setActiveTab("players")}
						className="px-4 py-2 rounded-lg"
						style={{
							backgroundColor: activeTab === "players" 
								? accentColor 
								: withOpacity(themeColorForeground, opacity.OPACITY_10),
						}}
					>
						<Text 
							className="font-medium" 
							style={{ 
								color: activeTab === "players" 
									? themeColorBackground 
									: themeColorForeground 
							}}
						>
							Players
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setActiveTab("tournaments")}
						className="px-4 py-2 rounded-lg"
						style={{
							backgroundColor: activeTab === "tournaments" 
								? accentColor 
								: withOpacity(themeColorForeground, opacity.OPACITY_10),
						}}
					>
						<Text 
							className="font-medium" 
							style={{ 
								color: activeTab === "tournaments" 
									? themeColorBackground 
									: themeColorForeground 
							}}
						>
							Tournaments
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setActiveTab("posts")}
						className="px-4 py-2 rounded-lg"
						style={{
							backgroundColor: activeTab === "posts" 
								? accentColor 
								: withOpacity(themeColorForeground, opacity.OPACITY_10),
						}}
					>
						<Text 
							className="font-medium" 
							style={{ 
								color: activeTab === "posts" 
									? themeColorBackground 
									: themeColorForeground 
							}}
						>
							Posts
						</Text>
					</Pressable>
				</View>
            </View>

			{/* Recent Searches */}
			{renderRecentSearches()}

			{/* Content */}
			<ScrollView
				style={{ flex: 1, }}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
			>
				{renderContent()}
			</ScrollView>
		</SafeAreaView>
	);
}

