import { Text, View, ScrollView, ActivityIndicator, RefreshControl, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { TournamentCard } from "@/components/tournament-card";

type TournamentStatus = "all" | "upcoming" | "active" | "completed";

export default function TournamentsScreen() {
	const router = useRouter();
	const [statusFilter, setStatusFilter] = useState<TournamentStatus>("all");
	const [refreshing, setRefreshing] = useState(false);
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	const tournaments = useQuery(api.tournaments.list, {
		status: statusFilter === "all" ? undefined : statusFilter,
	});

	const filters: TournamentStatus[] = ["all", "upcoming", "active", "completed"];

	const onRefresh = async () => {
		setRefreshing(true);
		// Wait a bit to show refresh indicator
		setTimeout(() => setRefreshing(false), 1000);
	};

	const handleCreateTournament = () => {
		router.push("/(drawer)/(tabs)/tournaments/new" as any);
	};

	const filteredTournaments = tournaments || [];

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
						tournaments
					</Text>
				</View>
				<View className="flex-row items-center">
					<Pressable
						onPress={handleCreateTournament}
						className="p-2"
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Ionicons name="add-circle-outline" size={24} color={themeColorForeground} />
					</Pressable>
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
								{status.charAt(0).toUpperCase() + status.slice(1)}
							</Text>
						</Pressable>
					))}
				</View>
			</View>

			{/* Tournament List */}
			<ScrollView
				style={{ backgroundColor: themeColorBackground }}
				contentContainerStyle={{ padding: 16 }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
				}
				showsVerticalScrollIndicator={false}
			>
				{filteredTournaments.length === 0 ? (
					<View className="flex-1 justify-center items-center py-16">
						<Ionicons name="trophy-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
						<Text className="text-lg font-semibold mb-2 mt-4" style={{ color: themeColorForeground }}>
							No tournaments found
						</Text>
						<Text className="text-sm text-center px-8 mb-4" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_80) }}>
							{statusFilter === "all"
								? "No tournaments have been created yet."
								: `No ${statusFilter} tournaments found.`}
						</Text>
						<Pressable
							onPress={handleCreateTournament}
							className="px-6 py-3 rounded-lg"
							style={{ backgroundColor: accentColor }}
						>
							<Text className="font-semibold" style={{ color: "#FFFFFF" }}>
								Create Your First Tournament
							</Text>
						</Pressable>
					</View>
				) : (
					<View>
						{filteredTournaments.map((tournament: any) => (
							<TournamentCard key={tournament._id} tournament={tournament} />
						))}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
