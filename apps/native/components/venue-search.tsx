import { Text, View, TextInput, Pressable, FlatList, Modal, ActivityIndicator } from "react-native";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { AddVenueModal } from "./add-venue-modal";

interface VenueSearchProps {
	value?: Id<"venues">;
	onChange: (venueId: Id<"venues"> | undefined) => void;
	placeholder?: string;
}

export function VenueSearch({ value, onChange, placeholder = "Search venues..." }: VenueSearchProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	const venues = useQuery(api.venues.search, { query: searchTerm });
	const selectedVenue = useQuery(api.venues.getById, value ? { id: value } : "skip");

	useEffect(() => {
		if (selectedVenue && !showModal) {
			setSearchTerm(selectedVenue.name);
		}
	}, [selectedVenue, showModal]);

	const handleSelect = (venueId: Id<"venues">, venueName: string) => {
		onChange(venueId);
		setSearchTerm(venueName);
		setShowModal(false);
	};

	const handleClear = () => {
		onChange(undefined);
		setSearchTerm("");
		setShowModal(false);
	};

	const handleVenueAdded = (venueId: Id<"venues">) => {
		onChange(venueId);
		setShowAddModal(false);
		setShowModal(false);
		setSearchTerm("");
	};

	const handleOpenModal = () => {
		setShowModal(true);
		if (!selectedVenue) {
			setSearchTerm("");
		}
	};

	const renderVenueItem = ({ item }: { item: any }) => (
		<Pressable
			onPress={() => handleSelect(item._id, item.name)}
			className="px-4 py-3 border-b"
			style={{
				backgroundColor: themeColorBackground,
				borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
			}}
		>
			<Text className="text-base font-medium mb-1" style={{ color: themeColorForeground }}>
				{item.name}
			</Text>
			<View className="flex-row items-center">
				<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
					{item.type?.replace("_", " ") || ""}
					{item.access && ` • ${item.access.replace("_", " ")}`}
					{item.address && ` • ${item.address}`}
				</Text>
			</View>
		</Pressable>
	);

	return (
		<View>
			<Pressable
				onPress={handleOpenModal}
				className="px-4 py-3 rounded-lg border flex-row items-center justify-between"
				style={{
					backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
				}}
			>
				<View className="flex-1 flex-row items-center">
					<Ionicons name="location-outline" size={18} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} style={{ marginRight: 8 }} />
					<Text
						className="flex-1"
						style={{
							color: selectedVenue ? themeColorForeground : withOpacity(themeColorForeground, opacity.OPACITY_40),
						}}
						numberOfLines={1}
					>
						{selectedVenue ? selectedVenue.name : placeholder}
					</Text>
				</View>
				{selectedVenue && (
					<Pressable
						onPress={(e) => {
							e.stopPropagation();
							handleClear();
						}}
						className="ml-2"
					>
						<Ionicons name="close-circle" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
					</Pressable>
				)}
				<Ionicons name="chevron-forward" size={18} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} style={{ marginLeft: 8 }} />
			</Pressable>

			<Modal
				visible={showModal}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setShowModal(false)}
			>
				<View className="flex-1" style={{ backgroundColor: themeColorBackground }}>
					{/* Header */}
					<View
						className="flex-row items-center justify-between px-4 py-3 border-b"
						style={{
							borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
						}}
					>
						<Pressable
							onPress={() => setShowModal(false)}
							className="mr-3"
						>
							<Ionicons name="arrow-back" size={24} color={themeColorForeground} />
						</Pressable>
						<Text className="text-lg font-semibold flex-1" style={{ color: themeColorForeground }}>
							Select Venue
						</Text>
						<Pressable
							onPress={() => {
								setShowModal(false);
								setShowAddModal(true);
							}}
							className="ml-3"
						>
							<Ionicons name="add-circle-outline" size={24} color={accentColor} />
						</Pressable>
					</View>

					{/* Search Input */}
					<View className="px-4 py-3 border-b" style={{ borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10) }}>
						<View className="flex-row items-center px-4 py-3 rounded-lg border" style={{
							backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
						}}>
							<Ionicons name="search-outline" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} style={{ marginRight: 8 }} />
							<TextInput
								value={searchTerm}
								onChangeText={setSearchTerm}
								placeholder="Search venues..."
								placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
								className="flex-1"
								style={{ color: themeColorForeground }}
								autoFocus
							/>
							{searchTerm.length > 0 && (
								<Pressable onPress={() => setSearchTerm("")}>
									<Ionicons name="close-circle" size={20} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
								</Pressable>
							)}
						</View>
					</View>

					{/* Results List */}
					{venues === undefined ? (
						<View className="flex-1 justify-center items-center">
							<ActivityIndicator size="large" color={accentColor} />
						</View>
					) : venues.length === 0 && searchTerm ? (
						<View className="flex-1 justify-center items-center px-4">
							<Ionicons name="location-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
							<Text className="text-base mt-4 text-center" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								No venues found
							</Text>
							<Text className="text-sm mt-2 text-center mb-4" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Try a different search term
							</Text>
							<Pressable
								onPress={() => {
									setShowModal(false);
									setShowAddModal(true);
								}}
								className="px-6 py-3 rounded-lg"
								style={{ backgroundColor: accentColor }}
							>
								<Text className="text-base font-semibold" style={{ color: "#FFFFFF" }}>
									Add New Venue
								</Text>
							</Pressable>
						</View>
					) : (
						<FlatList
							data={venues}
							renderItem={renderVenueItem}
							keyExtractor={(item) => item._id}
							style={{ flex: 1 }}
							ListEmptyComponent={
								<View className="flex-1 justify-center items-center px-4 py-16">
									<Ionicons name="location-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
									<Text className="text-base mt-4 text-center" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Start typing to search venues
									</Text>
								</View>
							}
						/>
					)}
				</View>
			</Modal>

			<AddVenueModal
				visible={showAddModal}
				onClose={() => setShowAddModal(false)}
				onVenueAdded={handleVenueAdded}
			/>
		</View>
	);
}

