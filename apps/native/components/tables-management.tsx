import { Text, View, ScrollView, Pressable, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useState } from "react";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { AddTablesModal } from "./add-tables-modal";
import { EditTableModal } from "./edit-table-modal";

type TabType = "all" | "in_use";

interface TablesManagementProps {
	tournamentId: Id<"tournaments">;
}

export function TablesManagement({ tournamentId }: TablesManagementProps) {
	const [activeTab, setActiveTab] = useState<TabType>("all");
	const [showAddTablesModal, setShowAddTablesModal] = useState(false);
	const [editingTable, setEditingTable] = useState<Id<"tables"> | null>(null);
	const [deletingTable, setDeletingTable] = useState<Id<"tables"> | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const mutedColor = useThemeColor("muted") || "#F5F5F5";

	const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
	const matches = useQuery(api.matches.getByTournament, { tournamentId });
	const tables = useQuery(api.tournaments.getTables, { tournamentId }) || [];
	const addTables = useMutation(api.tournaments.addTables);
	const updateTable = useMutation(api.tournaments.updateTable);
	const deleteTable = useMutation(api.tournaments.deleteTable);

	// Get players assigned to tables via matches
	const getPlayersForTable = (tableNumber: number) => {
		return matches?.filter((m) => m.tableNumber === tableNumber) || [];
	};

	// Filter tables based on active tab
	const filteredTables = tables.filter((table) => {
		if (activeTab === "all") return true;
		if (activeTab === "in_use") {
			const tableNum = table.tableNumber || table.startNumber;
			return table.status === "IN_USE" || getPlayersForTable(tableNum).length > 0;
		}
		return true;
	});

	const handleAddTables = async (newTables: Array<{
		label?: string;
		startNumber: number;
		endNumber: number;
		manufacturer: string;
		size: string;
		isLiveStreaming?: boolean;
		liveStreamUrl?: string;
		status?: "OPEN" | "CLOSED" | "IN_USE";
	}>, importVenueId?: Id<"venues">) => {
		try {
			if (importVenueId) {
				// TODO: Implement venue table import
				console.log("Venue table import not yet implemented");
				return;
			}

			if (newTables.length > 0) {
				await addTables({
					tournamentId,
					tables: newTables.map((table) => ({
						label: table.label,
						startNumber: table.startNumber,
						endNumber: table.endNumber,
						manufacturer: table.manufacturer as any,
						size: table.size as any,
						isLiveStreaming: table.isLiveStreaming,
						liveStreamUrl: table.liveStreamUrl,
						status: table.status as any,
					})),
				});
			}
		} catch (error) {
			console.error("Failed to add tables:", error);
			Alert.alert("Error", "Failed to add tables. Please try again.");
		}
	};

	const handleUpdateTable = async (
		tableId: Id<"tables">,
		updates: {
			label?: string;
			manufacturer?: string;
			size?: string;
			isLiveStreaming?: boolean;
			liveStreamUrl?: string;
			status?: "OPEN" | "CLOSED" | "IN_USE";
		}
	) => {
		try {
			await updateTable({
				tableId,
				label: updates.label,
				manufacturer: updates.manufacturer as any,
				size: updates.size as any,
				isLiveStreaming: updates.isLiveStreaming,
				liveStreamUrl: updates.liveStreamUrl,
				status: updates.status,
			});
			setEditingTable(null);
		} catch (error: any) {
			console.error("Failed to update table:", error);
			Alert.alert("Error", error.message || "Failed to update table. Please try again.");
		}
	};

	const handleDeleteTable = async (tableId: Id<"tables">) => {
		Alert.alert(
			"Delete Table",
			"Are you sure you want to delete this table? This action cannot be undone.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteTable({ tableId });
							setDeletingTable(null);
						} catch (error: any) {
							console.error("Failed to delete table:", error);
							Alert.alert("Error", error.message || "Failed to delete table. Please try again.");
						}
					},
				},
			]
		);
	};

	const onRefresh = async () => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 1000);
	};

	if (!tournament) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color={accentColor} />
				<Text className="mt-4" style={{ color: themeColorForeground }}>
					Loading...
				</Text>
			</View>
		);
	}

	return (
		<View className="flex-1" style={{ backgroundColor: themeColorBackground }}>
			{/* Tabs */}
			<View
				className="flex-row border-b"
				style={{
					borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
					backgroundColor: themeColorBackground,
				}}
			>
				<Pressable
					onPress={() => setActiveTab("all")}
					className="flex-1 py-3 items-center"
					style={{
						borderBottomWidth: activeTab === "all" ? 2 : 0,
						borderBottomColor: accentColor,
					}}
				>
					<Text
						className="text-sm font-medium"
						style={{
							color: activeTab === "all" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
						}}
					>
						ALL TABLES
					</Text>
				</Pressable>
				<Pressable
					onPress={() => setActiveTab("in_use")}
					className="flex-1 py-3 items-center"
					style={{
						borderBottomWidth: activeTab === "in_use" ? 2 : 0,
						borderBottomColor: accentColor,
					}}
				>
					<Text
						className="text-sm font-medium"
						style={{
							color: activeTab === "in_use" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
						}}
					>
						IN USE
					</Text>
				</Pressable>
			</View>

			{/* Content */}
			<ScrollView
				className="flex-1 px-4 py-6"
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			>
				{/* Add New Table Card */}
				<Pressable
					onPress={() => setShowAddTablesModal(true)}
					className="p-8 rounded-lg mb-4 items-center justify-center min-h-[200px] border-2 border-dashed"
					style={{
						backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_5),
						borderColor: withOpacity(themeColorForeground, opacity.OPACITY_30),
					}}
				>
					<Ionicons name="add" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
					<Text className="text-sm font-medium mt-4" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
						Add New Table
					</Text>
				</Pressable>

				{/* Table Cards */}
				{filteredTables.map((table) => {
					const tableNum = table.tableNumber || table.startNumber;
					const tableMatches = getPlayersForTable(tableNum);
					const isInUse = table.status === "IN_USE" || tableMatches.length > 0;
					const isClosed = table.status === "CLOSED";
					const currentMatch = tableMatches[0];

					return (
						<View
							key={table._id}
							className="rounded-lg mb-4 p-4"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderWidth: 1,
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							}}
						>
							{/* Table Header */}
							<View className="flex-row items-center justify-between mb-3">
								<Text className="text-lg font-semibold" style={{ color: themeColorForeground }}>
									{table.label || `Table ${tableNum}`}
								</Text>
								<View className="flex-row items-center gap-2">
									<View
										className="px-2 py-1 rounded"
										style={{
											backgroundColor: isInUse
												? withOpacity("#10B981", opacity.OPACITY_20)
												: isClosed
												? withOpacity("#6B7280", opacity.OPACITY_20)
												: withOpacity("#3B82F6", opacity.OPACITY_20),
										}}
									>
										<Text
											className="text-xs font-medium"
											style={{
												color: isInUse ? "#10B981" : isClosed ? "#6B7280" : "#3B82F6",
											}}
										>
											{isInUse ? "IN_USE" : isClosed ? "CLOSED" : "OPEN"}
										</Text>
									</View>
									<Pressable
										onPress={() => setEditingTable(table._id)}
										className="p-2"
									>
										<Ionicons name="pencil" size={16} color={themeColorForeground} />
									</Pressable>
									<Pressable
										onPress={() => {
											setDeletingTable(table._id);
											handleDeleteTable(table._id);
										}}
										className="p-2"
									>
										<Ionicons name="trash-outline" size={16} color="#EF4444" />
									</Pressable>
								</View>
							</View>

							{/* Pool Table Visualization */}
							<View
								className="rounded-lg mb-3 relative overflow-hidden"
								style={{
									aspectRatio: 16 / 9,
									backgroundColor: isClosed
										? withOpacity("#1F2937", opacity.OPACITY_30)
										: withOpacity("#1E3A8A", opacity.OPACITY_30),
								}}
							>
								{/* Table Surface */}
								<View
									className="absolute rounded-lg"
									style={{
										top: 8,
										left: 8,
										right: 8,
										bottom: 8,
										backgroundColor: isClosed ? "#374151" : "#1E40AF",
									}}
								/>
								{/* Pockets */}
								{/* Top Left */}
								<View
									className="absolute w-4 h-4 rounded-full"
									style={{
										top: -6,
										left: -6,
										backgroundColor: "#000000",
									}}
								/>
								{/* Top Right */}
								<View
									className="absolute w-4 h-4 rounded-full"
									style={{
										top: -6,
										right: -6,
										backgroundColor: "#000000",
									}}
								/>
								{/* Bottom Left */}
								<View
									className="absolute w-4 h-4 rounded-full"
									style={{
										bottom: -6,
										left: -6,
										backgroundColor: "#000000",
									}}
								/>
								{/* Bottom Right */}
								<View
									className="absolute w-4 h-4 rounded-full"
									style={{
										bottom: -6,
										right: -6,
										backgroundColor: "#000000",
									}}
								/>

								{/* Content */}
								{isInUse && currentMatch ? (
									<View className="absolute inset-0 flex-col items-center justify-center p-4">
										<View className="w-full space-y-3">
											{/* Player 1 */}
											<View className="flex-row items-center justify-between px-4">
												<View className="flex-row items-center gap-2">
													<Text className="text-lg">🇺🇸</Text>
													<Text className="text-sm font-medium" style={{ color: themeColorForeground }}>
														{currentMatch.player1?.name || "TBD"}
													</Text>
												</View>
												<View
													className="px-2 py-1 rounded"
													style={{ backgroundColor: themeColorBackground }}
												>
													<Text className="text-xs font-medium" style={{ color: themeColorForeground }}>
														{currentMatch.player1Score || 0}
													</Text>
												</View>
											</View>
											{/* Player 2 */}
											<View className="flex-row items-center justify-between px-4">
												<View className="flex-row items-center gap-2">
													<Text className="text-lg">🇺🇸</Text>
													<Text className="text-sm font-medium" style={{ color: themeColorForeground }}>
														{currentMatch.player2?.name || "TBD"}
													</Text>
												</View>
												<View
													className="px-2 py-1 rounded"
													style={{ backgroundColor: themeColorBackground }}
												>
													<Text className="text-xs font-medium" style={{ color: themeColorForeground }}>
														{currentMatch.player2Score || 0}
													</Text>
												</View>
											</View>
										</View>
									</View>
								) : isClosed ? (
									<View className="absolute inset-0 items-center justify-center">
										<Text className="text-white font-medium text-lg">CLOSED</Text>
									</View>
								) : (
									<View className="absolute inset-0 items-center justify-center">
										<Text
											className="font-medium text-lg"
											style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}
										>
											OPEN
										</Text>
									</View>
								)}
							</View>

							{/* Match Info */}
							{isInUse && currentMatch && (
								<View className="space-y-2 mt-3">
									<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Match {currentMatch.round || 1}{" "}
										{currentMatch.bracketType === "winner"
											? `(W${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})`
											: currentMatch.bracketType === "loser"
											? `(L${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})`
											: `(${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})`}
									</Text>
									{/* Progress Bar */}
									<View
										className="w-full rounded-full"
										style={{
											height: 6,
											backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<View
											className="h-full rounded-full"
											style={{
												width: "0%",
												backgroundColor: accentColor,
											}}
										/>
									</View>
									<Text className="text-xs text-right" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										0%
									</Text>
								</View>
							)}
						</View>
					);
				})}
			</ScrollView>

			{/* Add Tables Modal */}
			<AddTablesModal
				visible={showAddTablesModal}
				onClose={() => setShowAddTablesModal(false)}
				onAddTables={handleAddTables}
			/>

			{/* Edit Table Modal */}
			<EditTableModal
				visible={editingTable !== null}
				onClose={() => setEditingTable(null)}
				table={editingTable ? tables.find((t) => t._id === editingTable) || null : null}
				onUpdateTable={handleUpdateTable}
			/>
		</View>
	);
}




