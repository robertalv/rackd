import { Text, View, Image, Pressable, ActivityIndicator } from "react-native";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useState } from "react";

interface ProfileHeaderProps {
	userId?: Id<"users">;
	displayName: string;
	username: string;
	bio?: string;
	imageUrl?: string;
	postCount: number;
	followerCount: number;
	followingCount: number;
	interests?: string[];
	isOwnProfile?: boolean;
	onEditProfile?: () => void;
	onShareProfile?: () => void;
}

export function ProfileHeader({
	userId,
	displayName,
	username,
	bio,
	imageUrl,
	postCount,
	followerCount,
	followingCount,
	interests,
	isOwnProfile = false,
	onEditProfile,
	onShareProfile,
}: ProfileHeaderProps) {
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const [isLoading, setIsLoading] = useState(false);

	// Check if current user is following this user
	const isFollowing = useQuery(
		api.follows.isFollowing,
		userId && !isOwnProfile ? { userId } : "skip"
	);

	// Follow/unfollow mutations
	const follow = useMutation(api.follows.follow);
	const unfollow = useMutation(api.follows.unfollow);

	const handleFollowToggle = async () => {
		if (!userId || isOwnProfile || isLoading) return;

		setIsLoading(true);
		try {
			if (isFollowing) {
				await unfollow({ userId });
			} else {
				await follow({ userId });
			}
		} catch (error) {
			console.error("Error toggling follow:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View className="px-4 pt-4 pb-2">
			{/* Profile Picture and Stats Row */}
			<View className="flex-row items-start mb-3">
				{/* Profile Picture */}
				<View className="mr-4">
					{imageUrl ? (
						<Image
							source={{ uri: imageUrl }}
							style={{
								width: 90,
								height: 90,
								borderRadius: 45,
							}}
						/>
					) : (
						<View
							className="w-[90px] h-[90px] rounded-full items-center justify-center"
							style={{
								backgroundColor: withOpacity(accentColor, opacity.OPACITY_20),
							}}
						>
							<Text className="text-4xl font-semibold" style={{ color: accentColor }}>
								{(displayName || username || "U").charAt(0).toUpperCase()}
							</Text>
						</View>
					)}
				</View>

				{/* Stats */}
				<View className="flex-1 flex-row justify-around items-center pt-2">
					<View className="items-center">
						<Text className="text-base font-semibold" style={{ color: themeColorForeground }}>
							{postCount}
						</Text>
						<Text className="text-xs mt-0.5" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
							posts
						</Text>
					</View>
					<View className="items-center">
						<Text className="text-base font-semibold" style={{ color: themeColorForeground }}>
							{followerCount}
						</Text>
						<Text className="text-xs mt-0.5" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
							followers
						</Text>
					</View>
					<View className="items-center">
						<Text className="text-base font-semibold" style={{ color: themeColorForeground }}>
							{followingCount}
						</Text>
						<Text className="text-xs mt-0.5" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
							following
						</Text>
					</View>
				</View>
			</View>

			{/* Username and Bio */}
			<View className="mb-3">
				<Text className="text-sm font-semibold mb-1" style={{ color: themeColorForeground }}>
					{displayName}
				</Text>
				{bio && (
					<Text className="text-sm" style={{ color: themeColorForeground }}>
						{bio}
					</Text>
				)}
			</View>

			{/* Action Buttons */}
			<View className="flex-row gap-2 mb-3">
				{isOwnProfile ? (
					<>
						<Pressable
							onPress={onEditProfile}
							className="flex-1 py-2 rounded-lg items-center"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}
						>
							<Text className="text-sm font-semibold" style={{ color: themeColorForeground }}>
								Edit profile
							</Text>
						</Pressable>
						<Pressable
							onPress={() => onShareProfile?.()}
							className="flex-1 py-2 rounded-lg items-center"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}
						>
							<Text className="text-sm font-semibold" style={{ color: themeColorForeground }}>
								Share profile
							</Text>
						</Pressable>
					</>
				) : (
					<>
						<Pressable
							onPress={handleFollowToggle}
							disabled={isLoading}
							className="flex-1 py-2 rounded-lg items-center justify-center"
							style={({ pressed }) => ({
								backgroundColor: isFollowing
									? withOpacity(themeColorForeground, opacity.OPACITY_10)
									: accentColor,
								borderWidth: 1,
								borderColor: isFollowing
									? withOpacity(themeColorForeground, opacity.OPACITY_20)
									: accentColor,
								opacity: pressed || isLoading ? 0.7 : 1,
							})}
						>
							{isLoading ? (
								<ActivityIndicator size="small" color={isFollowing ? themeColorForeground : "#FFFFFF"} />
							) : (
								<Text
									className="text-sm font-semibold"
									style={{
										color: isFollowing ? themeColorForeground : "#FFFFFF",
									}}
								>
									{isFollowing ? "Following" : "Follow"}
								</Text>
							)}
						</Pressable>
						<Pressable
							className="flex-1 py-2 rounded-lg items-center"
							style={({ pressed }) => ({
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								opacity: pressed ? 0.7 : 1,
							})}
						>
							<Text className="text-sm font-semibold" style={{ color: themeColorForeground }}>
								Message
							</Text>
						</Pressable>
					</>
				)}
			</View>

			{/* Interests */}
			{interests && interests.length > 0 && (
				<View className="flex-row flex-wrap gap-2 mb-3">
					{interests.map((interest: string, index: number) => (
						<View
							key={index}
							className="px-3 py-1 rounded-full"
							style={{
								backgroundColor: withOpacity(accentColor, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(accentColor, opacity.OPACITY_20),
							}}
						>
							<Text className="text-xs" style={{ color: accentColor }}>
								{interest}
							</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
}

