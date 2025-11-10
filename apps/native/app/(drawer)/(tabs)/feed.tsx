import { Text, View, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useState, useRef } from "react";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { FeedHeader } from "@/components/feed-header";
import { PostCard } from "@/components/post-card";
import { opacity, withOpacity } from "@/lib/opacity";
import { useRouter } from "expo-router";

export default function FeedScreen() {
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const accentColor = useThemeColor("accent") || "#007AFF";
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
    const themeColorAccent = useThemeColor("accent") || "#007AFF";
	const scrollViewRef = useRef<ScrollView>(null);
	const insets = useSafeAreaInsets();
	const router = useRouter();

	const posts = useQuery(api.posts.getFeed, { limit: 50 });

	const handleCreatePost = () => {
		// TODO: Navigate to post composer
		console.log("Create post");
	};

	const handleSearch = () => {
		// Navigate to discover page
		router.push({
			pathname: "/(drawer)/(tabs)/discover" as any,
		});
	};

	const onRefresh = async () => {
		setRefreshing(true);
		setError(null);
		// Wait a bit to show refresh indicator
		setTimeout(() => setRefreshing(false), 1000);
	};

	// Handle loading state
	if (posts === undefined) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				<View className="flex-1 justify-center items-center p-6">
					<ActivityIndicator size="large" color={accentColor} />
					<Text className="mt-4" style={{ color: themeColorForeground }}>
						Loading posts...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Handle null or invalid data
	if (posts === null || !Array.isArray(posts)) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				<FeedHeader onSearch={handleSearch} onCreatePost={handleCreatePost} />
				<View className="flex-1 justify-center items-center p-6">
					<Ionicons name="alert-circle-outline" size={48} color={accentColor} />
					<Text className="text-lg font-semibold mb-2 mt-4" style={{ color: themeColorForeground }}>
						Unable to load posts
					</Text>
					<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
						Please try again later.
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Ensure posts is an array before filtering (defensive check)
	const postsArray = Array.isArray(posts) ? posts : [];
	const pinnedPosts = postsArray.filter((post: any) => post && post.isPinned);
	const regularPosts = postsArray.filter((post: any) => post && !post.isPinned);

	// Debug logging
	console.log("Feed Screen - Posts count:", postsArray.length);
	console.log("Feed Screen - Pinned posts:", pinnedPosts.length);
	console.log("Feed Screen - Regular posts:", regularPosts.length);

	return (
		<SafeAreaView 
			className="flex-1" 
			style={{ backgroundColor: themeColorBackground }}
			edges={["top"]}
		>
			<FeedHeader 
				onSearch={handleSearch} 
				onCreatePost={handleCreatePost}
			/>

			<ScrollView
				ref={scrollViewRef}
				style={{ backgroundColor: themeColorBackground, height: "100%" }}
				contentContainerStyle={{ 
					// paddingHorizontal: 16, 
					// paddingTop: 12,
					paddingBottom: 0
				}}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
				}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
					<View>
						{pinnedPosts.length > 0 && (
							<View className="mb-4">
								<View className="flex-row items-center mb-3">
									<Ionicons name="pin" size={14} color={withOpacity(themeColorForeground, opacity.OPACITY_80)} />
									<Text className="text-xs font-semibold ml-1.5" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
										PINNED POSTS
									</Text>
								</View>
								{pinnedPosts.map((post: any) => (
									<PostCard key={post._id} post={post} scrollViewRef={scrollViewRef} />
								))}
							</View>
						)}

						{regularPosts.length > 0 ? (
							<View>
								{pinnedPosts.length > 0 && (
									<Text className="text-xs font-semibold mb-3" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
										RECENT POSTS
									</Text>
								)}
								{regularPosts.map((post: any) => (
									<PostCard key={post._id} post={post} scrollViewRef={scrollViewRef} />
								))}
							</View>
						) : pinnedPosts.length === 0 ? (
							<View className="justify-center items-center py-16" style={{ minHeight: 400 }}>
								<Ionicons name="newspaper-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
								<Text className="text-lg font-semibold mb-2 mt-4" style={{ color: themeColorForeground }}>
									No posts yet
								</Text>
								<Text className="text-sm text-center px-8" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
									Follow some players to see their posts in your feed.
								</Text>
							</View>
						) : null}
					</View>
				</ScrollView>
		</SafeAreaView>
	);
}

