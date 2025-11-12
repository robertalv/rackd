import { Text, View, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface Table {
	label?: string;
	startNumber: number;
	endNumber: number;
	manufacturer: string;
	size: string;
	isLiveStreaming?: boolean;
	liveStreamUrl?: string;
	status?: "OPEN" | "CLOSED" | "IN_USE";
}

interface AddTablesModalProps {
	visible: boolean;
	onClose: () => void;
	onAddTables: (tables: Table[], importVenueId?: Id<"venues">) => void;
}

export function AddTablesModal({ visible, onClose, onAddTables }: AddTablesModalProps) {
	const [activeTab, setActiveTab] = useState<"single" | "multiple" | "import">("single");
	const [importVenueId, setImportVenueId] = useState<Id<"venues"> | undefined>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	// Single table state
	const [singleTable, setSingleTable] = useState<Table>({
		label: "",
		startNumber: 1,
		endNumber: 1,
		manufacturer: "",
		size: "8 Foot",
		isLiveStreaming: false,
		liveStreamUrl: "",
		status: "OPEN",
	});

	// Multiple tables state
	const [multipleTable, setMultipleTable] = useState<Table>({
		startNumber: 1,
		endNumber: 8,
		manufacturer: "",
		size: "8 Foot",
	});

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

	const handleSave = async () => {
		if (activeTab === "import" && importVenueId) {
			setIsSubmitting(true);
			try {
				await onAddTables([], importVenueId);
				handleClose();
			} catch (error) {
				console.error("Failed to import tables:", error);
			} finally {
				setIsSubmitting(false);
			}
		} else if (activeTab === "single") {
			if (!singleTable.label) {
				Alert.alert("Error", "Label is required");
				return;
			}
			setIsSubmitting(true);
			try {
				await onAddTables([singleTable]);
				handleClose();
			} catch (error) {
				console.error("Failed to add table:", error);
			} finally {
				setIsSubmitting(false);
			}
		} else if (activeTab === "multiple") {
			if (!multipleTable.startNumber || !multipleTable.endNumber) {
				Alert.alert("Error", "Start and end numbers are required");
				return;
			}
			setIsSubmitting(true);
			try {
				await onAddTables([multipleTable]);
				handleClose();
			} catch (error) {
				console.error("Failed to add tables:", error);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	const handleClose = () => {
		// Reset state
		setSingleTable({
			label: "",
			startNumber: 1,
			endNumber: 1,
			manufacturer: "",
			size: "8 Foot",
			isLiveStreaming: false,
			liveStreamUrl: "",
			status: "OPEN",
		});
		setMultipleTable({
			startNumber: 1,
			endNumber: 8,
			manufacturer: "",
			size: "8 Foot",
		});
		setImportVenueId(undefined);
		setActiveTab("single");
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
						Add Table(s)
					</Text>
					<View style={{ width: 24 }} />
				</View>

				{/* Tabs */}
				<View className="flex-row border-b" style={{ borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10) }}>
					<Pressable
						onPress={() => setActiveTab("single")}
						className="flex-1 py-3 items-center"
						style={{
							borderBottomWidth: activeTab === "single" ? 2 : 0,
							borderBottomColor: accentColor,
						}}
					>
						<Text
							className="text-sm font-medium"
							style={{
								color: activeTab === "single" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
							}}
						>
							Single
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setActiveTab("multiple")}
						className="flex-1 py-3 items-center"
						style={{
							borderBottomWidth: activeTab === "multiple" ? 2 : 0,
							borderBottomColor: accentColor,
						}}
					>
						<Text
							className="text-sm font-medium"
							style={{
								color: activeTab === "multiple" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
							}}
						>
							Multiple
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setActiveTab("import")}
						className="flex-1 py-3 items-center"
						style={{
							borderBottomWidth: activeTab === "import" ? 2 : 0,
							borderBottomColor: accentColor,
						}}
					>
						<Text
							className="text-sm font-medium"
							style={{
								color: activeTab === "import" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
							}}
						>
							Import
						</Text>
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-4 py-6">
					{/* SINGLE TABLE MODE */}
					{activeTab === "single" && (
						<View className="space-y-4">
							<View>
								<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
									* Label
								</Text>
								<TextInput
									value={singleTable.label || ""}
									onChangeText={(text) => setSingleTable({ ...singleTable, label: text })}
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
												onPress={() => setSingleTable({ ...singleTable, manufacturer })}
												className="px-3 py-2 rounded-lg border"
												style={{
													backgroundColor: singleTable.manufacturer === manufacturer ? accentColor : "transparent",
													borderColor: singleTable.manufacturer === manufacturer ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
												}}
											>
												<Text
													className="text-sm"
													style={{
														color: singleTable.manufacturer === manufacturer ? "#FFFFFF" : themeColorForeground,
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
											onPress={() => setSingleTable({ ...singleTable, size })}
											className="px-4 py-2 rounded-lg border"
											style={{
												backgroundColor: singleTable.size === size ? accentColor : "transparent",
												borderColor: singleTable.size === size ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
											}}
										>
											<Text
												className="text-sm"
												style={{
													color: singleTable.size === size ? "#FFFFFF" : themeColorForeground,
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
										onPress={() => setSingleTable({ ...singleTable, isLiveStreaming: true })}
										className="flex-row items-center gap-2"
									>
										<View
											className="w-5 h-5 rounded-full border-2 items-center justify-center"
											style={{
												borderColor: accentColor,
												backgroundColor: singleTable.isLiveStreaming ? accentColor : "transparent",
											}}
										>
											{singleTable.isLiveStreaming && (
												<View className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FFFFFF" }} />
											)}
										</View>
										<Text style={{ color: themeColorForeground }}>Yes</Text>
									</Pressable>
									<Pressable
										onPress={() => setSingleTable({ ...singleTable, isLiveStreaming: false })}
										className="flex-row items-center gap-2"
									>
										<View
											className="w-5 h-5 rounded-full border-2 items-center justify-center"
											style={{
												borderColor: accentColor,
												backgroundColor: !singleTable.isLiveStreaming ? accentColor : "transparent",
											}}
										>
											{!singleTable.isLiveStreaming && (
												<View className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FFFFFF" }} />
											)}
										</View>
										<Text style={{ color: themeColorForeground }}>No</Text>
									</Pressable>
								</View>
							</View>

							{singleTable.isLiveStreaming && (
								<View>
									<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
										Live Stream URL
									</Text>
									<TextInput
										value={singleTable.liveStreamUrl || ""}
										onChangeText={(text) => setSingleTable({ ...singleTable, liveStreamUrl: text })}
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
											onPress={() => setSingleTable({ ...singleTable, status })}
											className="px-4 py-2 rounded-lg border"
											style={{
												backgroundColor: singleTable.status === status ? accentColor : "transparent",
												borderColor: singleTable.status === status ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
											}}
										>
											<Text
												className="text-sm"
												style={{
													color: singleTable.status === status ? "#FFFFFF" : themeColorForeground,
												}}
											>
												{status}
											</Text>
										</Pressable>
									))}
								</View>
							</View>
						</View>
					)}

					{/* MULTIPLE TABLES MODE */}
					{activeTab === "multiple" && (
						<View className="space-y-4">
							<View className="flex-row gap-4">
								<View className="flex-1">
									<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
										* Start Number
									</Text>
									<TextInput
										value={multipleTable.startNumber.toString()}
										onChangeText={(text) => setMultipleTable({ ...multipleTable, startNumber: parseInt(text) || 1 })}
										placeholder="Enter the first table number"
										keyboardType="numeric"
										className="border rounded-lg px-3 py-2"
										style={{
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
											color: themeColorForeground,
										}}
										placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
									/>
								</View>
								<View className="flex-1">
									<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
										* End Number
									</Text>
									<TextInput
										value={multipleTable.endNumber.toString()}
										onChangeText={(text) => setMultipleTable({ ...multipleTable, endNumber: parseInt(text) || 1 })}
										placeholder="Enter the last table number"
										keyboardType="numeric"
										className="border rounded-lg px-3 py-2"
										style={{
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
											color: themeColorForeground,
										}}
										placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
									/>
								</View>
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
												onPress={() => setMultipleTable({ ...multipleTable, manufacturer })}
												className="px-3 py-2 rounded-lg border"
												style={{
													backgroundColor: multipleTable.manufacturer === manufacturer ? accentColor : "transparent",
													borderColor: multipleTable.manufacturer === manufacturer ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
												}}
											>
												<Text
													className="text-sm"
													style={{
														color: multipleTable.manufacturer === manufacturer ? "#FFFFFF" : themeColorForeground,
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
											onPress={() => setMultipleTable({ ...multipleTable, size })}
											className="px-4 py-2 rounded-lg border"
											style={{
												backgroundColor: multipleTable.size === size ? accentColor : "transparent",
												borderColor: multipleTable.size === size ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
											}}
										>
											<Text
												className="text-sm"
												style={{
													color: multipleTable.size === size ? "#FFFFFF" : themeColorForeground,
												}}
											>
												{size}
											</Text>
										</Pressable>
									))}
								</View>
							</View>

							<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								This will create tables numbered {multipleTable.startNumber} to {multipleTable.endNumber} (
								{Math.max(1, multipleTable.endNumber - multipleTable.startNumber + 1)} tables)
							</Text>
						</View>
					)}

					{/* IMPORT VENUE TABLES MODE */}
					{activeTab === "import" && (
						<View className="space-y-4">
							<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Venue table import coming soon...
							</Text>
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
						onPress={handleSave}
						disabled={
							isSubmitting ||
							(activeTab === "single" && !singleTable.label) ||
							(activeTab === "multiple" && (!multipleTable.startNumber || !multipleTable.endNumber)) ||
							(activeTab === "import" && !importVenueId)
						}
						className="px-6 py-3 rounded-lg"
						style={{
							backgroundColor: accentColor,
							opacity:
								isSubmitting ||
								(activeTab === "single" && !singleTable.label) ||
								(activeTab === "multiple" && (!multipleTable.startNumber || !multipleTable.endNumber)) ||
								(activeTab === "import" && !importVenueId)
									? 0.5
									: 1,
						}}
					>
						{isSubmitting ? (
							<ActivityIndicator color="#FFFFFF" />
						) : (
							<Text className="text-white font-semibold">
								{activeTab === "import"
									? "Import Venue Tables"
									: activeTab === "multiple"
									? "Create Tables"
									: "Create Table"}
							</Text>
						)}
					</Pressable>
				</View>
			</View>
		</Modal>
	);
}

