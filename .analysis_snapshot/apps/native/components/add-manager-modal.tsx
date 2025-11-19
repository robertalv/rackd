import { Text, View, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";

interface AddManagerModalProps {
	visible: boolean;
	onClose: () => void;
	tournamentId: Id<"tournaments">;
}

export function AddManagerModal({ visible, onClose, tournamentId }: AddManagerModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	// Search for users
	const searchResults = useQuery(
		api.users.search,
		searchQuery.length >= 1 ? { query: searchQuery, limit: 10 } : "skip"
	);

	// Get existing managers to filter them out
	const existingManagers = useQuery(api.tournaments.getManagers, { tournamentId });

	// Get tournament to check organizer
	const tournament = useQuery(api.tournaments.getById, { id: tournamentId });

	const addManager = useMutation(api.tournaments.addManager);

	// Filter out organizer and existing managers
	const filteredResults =
		searchResults?.filter((user) => {
			if (tournament && user._id === tournament.organizerId) return false;
			if (existingManagers?.some((manager) => manager.userId === user._id)) {
				return false;
			}
			return true;
		}) || [];

	const handleAddManager = async () => {
		if (!selectedUserId) return;

		setIsSubmitting(true);
		try {
			await addManager({
				tournamentId,
				userId: selectedUserId,
				role: "manager",
			});
			setSearchQuery("");
			setSelectedUserId(null);
			onClose();
		} catch (error) {
			console.error("Failed to add manager:", error);
			Alert.alert("Error", error instanceof Error ? error.message : "Failed to add manager");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setSearchQuery("");
		setSelectedUserId(null);
		setIsSubmitting(false);
		onClose();
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
			<View className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				{/* Header */}
				<View
					className="flex-row items-center justify-between px-4 py-3 border-b"
					style={{
						borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					}}
				>
					<Pressable onPress={handleClose} disabled={isSubmitting}>
						<Ionicons
							name="arrow-back"
							size={24}
							color={isSubmitting ? withOpacity(themeColorForeground, opacity.OPACITY_40) : themeColorForeground}
						/>
					</Pressable>
					<Text className="text-lg font-semibold flex-1 text-center" style={{ color: themeColorForeground }}>
						Add Manager
					</Text>
					<View style={{ width: 24 }} />
				</View>

				<ScrollView className="flex-1 px-4 py-6">
					<Text className="text-sm mb-4" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
						Search for a user to add as a tournament manager.
					</Text>

					{/* Search Input */}
					<View
						className="mb-4 rounded-lg border px-3 py-2 flex-row items-center"
						style={{
							borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
						}}
					>
						<Ionicons name="search" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
						<TextInput
							placeholder="Search by username..."
							value={searchQuery}
							onChangeText={setSearchQuery}
							className="flex-1 ml-2"
							style={{ color: themeColorForeground }}
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							autoFocus
						/>
					</View>

					{/* Search Results */}
					{searchQuery.length >= 1 && (
						<View>
							{searchResults === undefined ? (
								<View className="items-center justify-center py-8">
									<ActivityIndicator size="small" color={accentColor} />
								</View>
							) : filteredResults.length === 0 ? (
								<View className="py-8">
									<Text className="text-center text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										No users found
									</Text>
								</View>
							) : (
								<View className="space-y-1">
									{filteredResults.map((user) => {
										const initials = (user.displayName || user.name || "U").charAt(0).toUpperCase();
										return (
											<Pressable
												key={user._id}
												onPress={() => setSelectedUserId(user._id as Id<"users">)}
												className="flex-row items-center gap-3 rounded-lg p-3"
												style={{
													backgroundColor:
														selectedUserId === user._id
															? withOpacity(accentColor, opacity.OPACITY_20)
															: withOpacity(themeColorForeground, opacity.OPACITY_5),
												}}
											>
												<View
													className="w-10 h-10 rounded-full items-center justify-center"
													style={{
														backgroundColor: withOpacity(accentColor, opacity.OPACITY_20),
													}}
												>
													<Text className="text-sm font-semibold" style={{ color: accentColor }}>
														{initials}
													</Text>
												</View>
												<View className="flex-1">
													<Text className="font-medium text-sm" style={{ color: themeColorForeground }}>
														{user.displayName || user.name || "Unknown"}
													</Text>
													<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
														@{user.username || "unknown"}
													</Text>
												</View>
												{selectedUserId === user._id && (
													<Ionicons name="checkmark-circle" size={20} color={accentColor} />
												)}
											</Pressable>
										);
									})}
								</View>
							)}
						</View>
					)}
				</ScrollView>

				{/* Footer */}
				<View
					className="flex-row justify-end gap-2 px-4 py-4 border-t"
					style={{
						borderTopColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					}}
				>
					<Pressable
						onPress={handleClose}
						disabled={isSubmitting}
						className="px-6 py-3 rounded-lg border"
						style={{
							borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							opacity: isSubmitting ? 0.5 : 1,
						}}
					>
						<Text style={{ color: themeColorForeground }}>Cancel</Text>
					</Pressable>
					<Pressable
						onPress={handleAddManager}
						disabled={!selectedUserId || isSubmitting}
						className="px-6 py-3 rounded-lg"
						style={{
							backgroundColor: accentColor,
							opacity: !selectedUserId || isSubmitting ? 0.5 : 1,
						}}
					>
						{isSubmitting ? (
							<ActivityIndicator color="#FFFFFF" />
						) : (
							<Text className="text-white font-semibold">Add Manager</Text>
						)}
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}







