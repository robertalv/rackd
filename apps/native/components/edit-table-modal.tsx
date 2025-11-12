import { Text, View, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface Table {
	_id: Id<"tables">;
	label?: string | null;
	startNumber: number;
	endNumber: number;
	manufacturer: string;
	size: string;
	isLiveStreaming?: boolean | null;
	liveStreamUrl?: string | null;
	status?: "OPEN" | "CLOSED" | "IN_USE" | null;
}

interface EditTableModalProps {
	visible: boolean;
	onClose: () => void;
	table: Table | null;
	onUpdateTable: (
		tableId: Id<"tables">,
		updates: {
			label?: string;
			manufacturer?: string;
			size?: string;
			isLiveStreaming?: boolean;
			liveStreamUrl?: string;
			status?: "OPEN" | "CLOSED" | "IN_USE";
		}
	) => Promise<void>;
}

export function EditTableModal({ visible, onClose, table, onUpdateTable }: EditTableModalProps) {
	const [formData, setFormData] = useState({
		label: "",
		manufacturer: "",
		size: "8 Foot",
		isLiveStreaming: false,
		liveStreamUrl: "",
		status: "OPEN" as "OPEN" | "CLOSED" | "IN_USE",
	});
	const [isSaving, setIsSaving] = useState(false);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	const manufacturersList = [
		"Aileex",
		"Blackball",
		"Brunswick",
		"Diamond",
		"Gabriels",
		"Heiron & Smith",
		"Imperial",
		"Joy",
		"Min",
		"Olhausen",
		"Olio",
		"Pot Black",
		"Predator",
		"Rasson",
		"Shender",
		"Star",
		"Supreme",
		"Valley",
		"Wiraka",
		"Xing Pai",
		"Other",
	];

	const sizes = ["6.5 Foot", "7 Foot", "8 Foot", "9 Foot", "10 Foot", "12 Foot"];

	// Initialize form data when table changes
	useEffect(() => {
		if (table) {
			setFormData({
				label: table.label || "",
				manufacturer: table.manufacturer || "",
				size: table.size || "8 Foot",
				isLiveStreaming: table.isLiveStreaming ?? false,
				liveStreamUrl: table.liveStreamUrl || "",
				status: table.status || "OPEN",
			});
		}
	}, [table]);

	const handleSave = async () => {
		if (!table) return;

		if (!formData.label) {
			Alert.alert("Error", "Label is required");
			return;
		}

		setIsSaving(true);
		try {
			await onUpdateTable(table._id, {
				label: formData.label,
				manufacturer: formData.manufacturer,
				size: formData.size,
				isLiveStreaming: formData.isLiveStreaming,
				liveStreamUrl: formData.liveStreamUrl,
				status: formData.status,
			});
			onClose();
		} catch (error) {
			console.error("Failed to update table:", error);
			Alert.alert("Error", "Failed to update table. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		if (table) {
			// Reset to original values
			setFormData({
				label: table.label || "",
				manufacturer: table.manufacturer || "",
				size: table.size || "8 Foot",
				isLiveStreaming: table.isLiveStreaming ?? false,
				liveStreamUrl: table.liveStreamUrl || "",
				status: table.status || "OPEN",
			});
		}
		setIsSaving(false);
		onClose();
	};

	if (!table) return null;

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
					<Pressable onPress={handleClose} disabled={isSaving}>
						<Ionicons
							name="arrow-back"
							size={24}
							color={isSaving ? withOpacity(themeColorForeground, opacity.OPACITY_40) : themeColorForeground}
						/>
					</Pressable>
					<Text className="text-lg font-semibold flex-1 text-center" style={{ color: themeColorForeground }}>
						Edit Table
					</Text>
					<View style={{ width: 24 }} />
				</View>

				<ScrollView className="flex-1 px-4 py-6">
					<View className="space-y-4">
						<View>
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								* Label
							</Text>
							<TextInput
								value={formData.label}
								onChangeText={(text) => setFormData({ ...formData, label: text })}
								placeholder="How to refer to this table (e.g. Table 1)"
								className="border rounded-lg px-3 py-2"
								style={{
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									color: themeColorForeground,
								}}
								placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							/>
						</View>

						<View>
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								Manufacturer
							</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
								<View className="flex-row flex-wrap gap-2">
									{manufacturersList.map((manufacturer) => (
										<Pressable
											key={manufacturer}
											onPress={() => setFormData({ ...formData, manufacturer })}
											className="px-3 py-2 rounded-lg border"
											style={{
												backgroundColor: formData.manufacturer === manufacturer ? accentColor : "transparent",
												borderColor: formData.manufacturer === manufacturer ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
											}}
										>
											<Text
												className="text-sm"
												style={{
													color: formData.manufacturer === manufacturer ? "#FFFFFF" : themeColorForeground,
												}}
											>
												{manufacturer}
											</Text>
										</Pressable>
									))}
								</View>
							</ScrollView>
						</View>

						<View>
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								Size
							</Text>
							<View className="flex-row flex-wrap gap-2">
								{sizes.map((size) => (
									<Pressable
										key={size}
										onPress={() => setFormData({ ...formData, size })}
										className="px-4 py-2 rounded-lg border"
										style={{
											backgroundColor: formData.size === size ? accentColor : "transparent",
											borderColor: formData.size === size ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<Text
											className="text-sm"
											style={{
												color: formData.size === size ? "#FFFFFF" : themeColorForeground,
											}}
										>
											{size}
										</Text>
									</Pressable>
								))}
							</View>
						</View>

						<View>
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								Live Streaming table
							</Text>
							<View className="flex-row gap-4">
								<Pressable
									onPress={() => setFormData({ ...formData, isLiveStreaming: true })}
									className="flex-row items-center gap-2"
								>
									<View
										className="w-5 h-5 rounded-full border-2 items-center justify-center"
										style={{
											borderColor: accentColor,
											backgroundColor: formData.isLiveStreaming ? accentColor : "transparent",
										}}
									>
										{formData.isLiveStreaming && (
											<View className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FFFFFF" }} />
										)}
									</View>
									<Text style={{ color: themeColorForeground }}>Yes</Text>
								</Pressable>
								<Pressable
									onPress={() => setFormData({ ...formData, isLiveStreaming: false })}
									className="flex-row items-center gap-2"
								>
									<View
										className="w-5 h-5 rounded-full border-2 items-center justify-center"
										style={{
											borderColor: accentColor,
											backgroundColor: !formData.isLiveStreaming ? accentColor : "transparent",
										}}
									>
										{!formData.isLiveStreaming && (
											<View className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FFFFFF" }} />
										)}
									</View>
									<Text style={{ color: themeColorForeground }}>No</Text>
								</Pressable>
							</View>
						</View>

						{formData.isLiveStreaming && (
							<View>
								<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
									Live Stream URL
								</Text>
								<TextInput
									value={formData.liveStreamUrl}
									onChangeText={(text) => setFormData({ ...formData, liveStreamUrl: text })}
									placeholder="https://www.domain.com"
									className="border rounded-lg px-3 py-2"
									style={{
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										color: themeColorForeground,
									}}
									placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
								/>
							</View>
						)}

						<View>
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								Status
							</Text>
							<View className="flex-row gap-2">
								{(["OPEN", "CLOSED", "IN_USE"] as const).map((status) => (
									<Pressable
										key={status}
										onPress={() => setFormData({ ...formData, status })}
										className="px-4 py-2 rounded-lg border"
										style={{
											backgroundColor: formData.status === status ? accentColor : "transparent",
											borderColor: formData.status === status ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
										}}
									>
										<Text
											className="text-sm"
											style={{
												color: formData.status === status ? "#FFFFFF" : themeColorForeground,
											}}
										>
											{status}
										</Text>
									</Pressable>
								))}
							</View>
						</View>
					</View>
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
						disabled={isSaving}
						className="px-6 py-3 rounded-lg border"
						style={{
							borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							opacity: isSaving ? 0.5 : 1,
						}}
					>
						<Text style={{ color: themeColorForeground }}>Cancel</Text>
					</Pressable>
					<Pressable
						onPress={handleSave}
						disabled={isSaving || !formData.label}
						className="px-6 py-3 rounded-lg"
						style={{
							backgroundColor: accentColor,
							opacity: isSaving || !formData.label ? 0.5 : 1,
						}}
					>
						{isSaving ? (
							<ActivityIndicator color="#FFFFFF" />
						) : (
							<Text className="text-white font-semibold">Update Table</Text>
						)}
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

