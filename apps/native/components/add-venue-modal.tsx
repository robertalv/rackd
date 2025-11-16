import { Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Modal } from "react-native";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface AddVenueModalProps {
	visible: boolean;
	onClose: () => void;
	onVenueAdded?: (venueId: Id<"venues">) => void;
}

export function AddVenueModal({ visible, onClose, onVenueAdded }: AddVenueModalProps) {
	const create = useMutation(api.venues.create);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	// Form state
	const [name, setName] = useState("");
	const [type, setType] = useState<"residence" | "business" | "pool_hall" | "sports_facility" | "bar" | "other">("pool_hall");
	const [access, setAccess] = useState<"public" | "private" | "membership_needed">("public");
	const [address, setAddress] = useState("");
	const [description, setDescription] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [website, setWebsite] = useState("");
	const [operatingHours, setOperatingHours] = useState("");

	const handleSubmit = async () => {
		if (!name.trim()) {
			Alert.alert("Error", "Venue name is required");
			return;
		}

		try {
			setIsSubmitting(true);

			const venueId = await create({
				name: name.trim(),
				type,
				access,
				address: address.trim() || undefined,
				description: description.trim() || undefined,
				phone: phone.trim() || undefined,
				email: email.trim() || undefined,
				website: website.trim() || undefined,
				operatingHours: operatingHours.trim() || undefined,
			});

			// Reset form
			setName("");
			setType("pool_hall");
			setAccess("public");
			setAddress("");
			setDescription("");
			setPhone("");
			setEmail("");
			setWebsite("");
			setOperatingHours("");

			onVenueAdded?.(venueId);
			onClose();
			Alert.alert("Success", "Venue created successfully!");
		} catch (error) {
			console.error("Failed to create venue:", error);
			Alert.alert("Error", "Failed to create venue. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			onClose();
		}
	};

	const venueTypes: { value: typeof type; label: string }[] = [
		{ value: "residence", label: "Residence" },
		{ value: "business", label: "Business" },
		{ value: "pool_hall", label: "Pool Hall" },
		{ value: "sports_facility", label: "Sports Facility" },
		{ value: "bar", label: "Bar" },
		{ value: "other", label: "Other" },
	];

	const accessTypes: { value: typeof access; label: string }[] = [
		{ value: "public", label: "Public" },
		{ value: "private", label: "Private" },
		{ value: "membership_needed", label: "Membership Needed" },
	];

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={handleClose}
		>
			<View className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				{/* Header */}
				<View
					className="flex-row items-center justify-between px-4 py-3 border-b"
					style={{
						borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					}}
				>
					<Pressable onPress={handleClose} disabled={isSubmitting}>
						<Ionicons name="arrow-back" size={24} color={isSubmitting ? withOpacity(themeColorForeground, opacity.OPACITY_40) : themeColorForeground} />
					</Pressable>
					<Text className="text-lg font-semibold flex-1 text-center" style={{ color: themeColorForeground }}>
						Add New Venue
					</Text>
					<View style={{ width: 24 }} />
				</View>

				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 16 }}
					showsVerticalScrollIndicator={false}
				>
					{/* Venue Name */}
					<View className="mb-4">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Venue Name *
						</Text>
						<TextInput
							value={name}
							onChangeText={setName}
							placeholder="e.g. Downtown Pool Hall"
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							className="px-4 py-3 rounded-lg border"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								color: themeColorForeground,
							}}
						/>
					</View>

					{/* Venue Type */}
					<View className="mb-4">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Venue Type *
						</Text>
						<View className="flex-row flex-wrap gap-2">
							{venueTypes.map((vt) => (
								<Pressable
									key={vt.value}
									onPress={() => setType(vt.value)}
									className="px-4 py-2 rounded-lg border"
									style={{
										backgroundColor:
											type === vt.value
												? accentColor
												: withOpacity(themeColorForeground, opacity.OPACITY_10),
										borderColor:
											type === vt.value
												? accentColor
												: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									<Text
										className="text-sm font-medium"
										style={{
											color: type === vt.value ? "#FFFFFF" : themeColorForeground,
										}}
									>
										{vt.label}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					{/* Access Type */}
					<View className="mb-4">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Access *
						</Text>
						<View className="flex-row flex-wrap gap-2">
							{accessTypes.map((at) => (
								<Pressable
									key={at.value}
									onPress={() => setAccess(at.value)}
									className="px-4 py-2 rounded-lg border"
									style={{
										backgroundColor:
											access === at.value
												? accentColor
												: withOpacity(themeColorForeground, opacity.OPACITY_10),
										borderColor:
											access === at.value
												? accentColor
												: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									<Text
										className="text-sm font-medium"
										style={{
											color: access === at.value ? "#FFFFFF" : themeColorForeground,
										}}
									>
										{at.label}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					{/* Address */}
					<View className="mb-4">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Address
						</Text>
						<TextInput
							value={address}
							onChangeText={setAddress}
							placeholder="123 Main St, City, State, ZIP"
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							className="px-4 py-3 rounded-lg border"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								color: themeColorForeground,
							}}
						/>
					</View>

					{/* Description */}
					<View className="mb-4">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Description
						</Text>
						<TextInput
							value={description}
							onChangeText={setDescription}
							placeholder="Describe the venue, amenities, etc."
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							multiline
							numberOfLines={4}
							className="px-4 py-3 rounded-lg border"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								color: themeColorForeground,
								minHeight: 100,
								textAlignVertical: "top",
							}}
						/>
					</View>

					{/* Operating Hours */}
					<View className="mb-4">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Operating Hours
						</Text>
						<TextInput
							value={operatingHours}
							onChangeText={setOperatingHours}
							placeholder="e.g. Mon-Fri 9AM-11PM, Sat-Sun 10AM-12AM"
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							className="px-4 py-3 rounded-lg border"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								color: themeColorForeground,
							}}
						/>
					</View>

					{/* Phone & Email */}
					<View className="flex-row gap-2 mb-4">
						<View className="flex-1">
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								Phone
							</Text>
							<TextInput
								value={phone}
								onChangeText={setPhone}
								placeholder="(555) 123-4567"
								placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
								keyboardType="phone-pad"
								className="px-4 py-3 rounded-lg border"
								style={{
									backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									color: themeColorForeground,
								}}
							/>
						</View>
						<View className="flex-1">
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								Email
							</Text>
							<TextInput
								value={email}
								onChangeText={setEmail}
								placeholder="contact@venue.com"
								placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
								keyboardType="email-address"
								autoCapitalize="none"
								className="px-4 py-3 rounded-lg border"
								style={{
									backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									color: themeColorForeground,
								}}
							/>
						</View>
					</View>

					{/* Website */}
					<View className="mb-4">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Website
						</Text>
						<TextInput
							value={website}
							onChangeText={setWebsite}
							placeholder="https://www.venue.com"
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							keyboardType="url"
							autoCapitalize="none"
							className="px-4 py-3 rounded-lg border"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								color: themeColorForeground,
							}}
						/>
					</View>

					{/* Submit Button */}
					<Pressable
						onPress={handleSubmit}
						disabled={isSubmitting}
						className="px-6 py-4 rounded-lg mb-4"
						style={{
							backgroundColor: isSubmitting ? withOpacity(accentColor, opacity.OPACITY_60) : accentColor,
						}}
					>
						{isSubmitting ? (
							<View className="flex-row items-center justify-center">
								<ActivityIndicator size="small" color="#FFFFFF" />
								<Text className="ml-2 font-semibold" style={{ color: "#FFFFFF" }}>
									Adding...
								</Text>
							</View>
						) : (
							<Text className="text-center font-semibold" style={{ color: "#FFFFFF" }}>
								Add Venue
							</Text>
						)}
					</Pressable>
				</ScrollView>
			</View>
		</Modal>
	);
}




