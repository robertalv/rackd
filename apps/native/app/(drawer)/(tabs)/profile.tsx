import { Container } from "@/components/container";
import { Text, View, ScrollView } from "react-native";
import { Card } from "heroui-native";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useThemeColor } from "heroui-native";
import { ActivityIndicator } from "react-native";

export default function ProfileScreen() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");
	const accentColor = useThemeColor("accent");

	const customUser = useQuery(api.users.currentUser);
	const userProfile = useQuery(
		api.users.getProfile,
		customUser ? { userId: customUser._id } : "skip"
	);
	const userStats = useQuery(
		api.users.getStats,
		customUser ? { userId: customUser._id } : "skip"
	);

	if (customUser === undefined || userProfile === undefined || userStats === undefined) {
		return (
			<Container className="p-6">
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color={accentColor} />
					<Text className="mt-4" style={{ color: themeColorForeground }}>
						Loading profile...
					</Text>
				</View>
			</Container>
		);
	}

	return (
		<Container className="flex-1">
			<ScrollView className="flex-1">
				<View className="p-6">
					{/* Profile Header */}
					<Card variant="secondary" className="p-6 mb-4">
						<View className="items-center mb-4">
							<View
								className="w-20 h-20 rounded-full items-center justify-center mb-3"
								style={{ backgroundColor: themeColorBackground + "40" }}
							>
								<Text className="text-3xl font-semibold" style={{ color: themeColorForeground }}>
									{customUser.name?.charAt(0).toUpperCase() ||
										customUser.username?.charAt(0).toUpperCase() ||
										"U"}
								</Text>
							</View>
							<Text className="text-2xl font-bold mb-1" style={{ color: themeColorForeground }}>
								{customUser.name || customUser.username || "User"}
							</Text>
							<Text className="text-sm" style={{ color: themeColorForeground + "80" }}>
								@{customUser.username || "user"}
							</Text>
							{userProfile?.player?.bio && (
								<Text className="text-sm mt-3 text-center" style={{ color: themeColorForeground + "80" }}>
									{userProfile.player.bio}
								</Text>
							)}
						</View>

						{/* Stats */}
						<View className="flex-row justify-around mt-4 pt-4 border-t" style={{ borderTopColor: themeColorForeground + "20" }}>
							<View className="items-center">
								<Text className="text-xl font-bold" style={{ color: themeColorForeground }}>
									{userStats.followerCount || 0}
								</Text>
								<Text className="text-xs" style={{ color: themeColorForeground + "80" }}>
									Followers
								</Text>
							</View>
							<View className="items-center">
								<Text className="text-xl font-bold" style={{ color: themeColorForeground }}>
									{userStats.followingCount || 0}
								</Text>
								<Text className="text-xs" style={{ color: themeColorForeground + "80" }}>
									Following
								</Text>
							</View>
							<View className="items-center">
								<Text className="text-xl font-bold" style={{ color: themeColorForeground }}>
									{userStats.postCount || 0}
								</Text>
								<Text className="text-xs" style={{ color: themeColorForeground + "80" }}>
									Posts
								</Text>
							</View>
						</View>
					</Card>

					{/* Additional Info */}
					{customUser.interests && customUser.interests.length > 0 && (
						<Card variant="secondary" className="p-4">
							<Text className="font-semibold mb-2" style={{ color: themeColorForeground }}>
								Interests
							</Text>
							<View className="flex-row flex-wrap">
								{customUser.interests.map((interest: string, index: number) => (
									<View
										key={index}
										className="px-3 py-1 rounded-full mr-2 mb-2"
										style={{ backgroundColor: themeColorBackground + "40" }}
									>
										<Text className="text-sm" style={{ color: themeColorForeground }}>
											{interest}
										</Text>
									</View>
								))}
							</View>
						</Card>
					)}
				</View>
			</ScrollView>
		</Container>
	);
}

