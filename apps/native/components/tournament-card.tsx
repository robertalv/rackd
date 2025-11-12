import { Text, View, Pressable, Image, Modal, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { formatDate, getGameTypeLabel, getStatusBadgeProps, type TournamentStatus } from "@/lib/tournament-utils";

interface TournamentCardProps {
	tournament: {
		_id: string;
		name: string;
		date: number;
		gameType: string;
		type: string;
		status: string;
		venue?: {
			name: string;
			city?: string;
			region?: string;
			country?: string;
		} | null;
		entryFee?: number | null;
		organizerName: string;
		flyerUrl?: string | null;
		registeredCount?: number;
		maxPlayers?: number | null;
	};
}

export function TournamentCard({ tournament }: TournamentCardProps) {
	const router = useRouter();
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const [selectedFlyerUrl, setSelectedFlyerUrl] = useState<string | null>(null);

	const statusProps = getStatusBadgeProps(tournament.status as TournamentStatus);

	// Check if flyerUrl is a storage ID (doesn't start with http) or a URL
	const isStorageId = tournament.flyerUrl && !tournament.flyerUrl.startsWith("http");
	const flyerImageUrl = useQuery(
		api.files.getFileUrl,
		isStorageId && tournament.flyerUrl
			? { storageId: tournament.flyerUrl as Id<"_storage"> }
			: "skip"
	);
	const displayFlyerUrl = isStorageId ? flyerImageUrl : tournament.flyerUrl;

	const handlePress = () => {
		router.push(`/(drawer)/(tabs)/tournaments/${tournament._id}` as any);
	};

	const handleFlyerPress = (e: any) => {
		e.stopPropagation();
		if (displayFlyerUrl) {
			setSelectedFlyerUrl(displayFlyerUrl);
		}
	};

	return (
		<>
			<Pressable
				onPress={handlePress}
				className="mb-4 p-4 rounded-lg border"
				style={{
					backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
				}}
			>
				<View className="flex-row items-start justify-between mb-2">
					<View className="flex-1 mr-2 flex-row items-center gap-2">
						{displayFlyerUrl ? (
							<Pressable onPress={handleFlyerPress}>
								<Image
									source={{ uri: displayFlyerUrl }}
									style={{
										width: 40,
										height: 40,
										borderRadius: 8,
										borderWidth: 2,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
									resizeMode="cover"
									onError={(error) => {
										console.error("Failed to load flyer image:", error.nativeEvent.error);
									}}
								/>
							</Pressable>
						) : tournament.flyerUrl && isStorageId ? (
							<View
								style={{
									width: 40,
									height: 40,
									borderRadius: 8,
									borderWidth: 2,
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									justifyContent: "center",
									alignItems: "center",
									backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								}}
							>
								<ActivityIndicator size="small" color={accentColor} />
							</View>
						) : null}
						<View className="flex-1">
							<Text className="font-semibold text-lg mb-1" style={{ color: themeColorForeground }}>
								{tournament.name}
							</Text>
							<Text className="text-sm mb-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								by {tournament.organizerName}
							</Text>
						</View>
					</View>
					<View
						className="px-3 py-1 rounded-full"
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

			<View className="space-y-2">
				<View className="flex-row items-center">
					<Ionicons name="calendar-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
					<Text className="text-sm ml-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
						{formatDate(tournament.date)}
					</Text>
				</View>

				{tournament.venue?.name && (
					<View className="flex-row items-center">
						<Ionicons name="location-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
						<Text className="text-sm ml-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
							{tournament.venue.name}
						</Text>
					</View>
				)}

				{tournament.entryFee !== undefined && tournament.entryFee !== null && (
					<View className="flex-row items-center">
						<Ionicons name="cash-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
						<Text className="text-sm ml-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
							${tournament.entryFee}
						</Text>
					</View>
				)}

				<View className="flex-row items-center">
					<Ionicons name="trophy-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
					<Text className="text-sm ml-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
						{getGameTypeLabel(tournament.gameType)} • {tournament.type.replace("_", " ")}
					</Text>
				</View>

				<View className="flex-row items-center">
					<Ionicons name="people-outline" size={16} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
					<Text className="text-sm ml-2" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
						{tournament.registeredCount || 0}
						{tournament.maxPlayers && ` / ${tournament.maxPlayers}`} registered
					</Text>
				</View>
			</View>
		</Pressable>

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
									onError={(error) => {
										console.error("Failed to load full-size flyer image:", error.nativeEvent.error);
									}}
								/>
							</View>
						)}
					</ScrollView>
				</Pressable>
			</Pressable>
		</Modal>
		</>
	);
}

