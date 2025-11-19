import { Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { TournamentFlyerUpload } from "@/components/tournament-flyer-upload";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DatePickerSheet } from "@/components/date-picker-sheet";
import { TimePickerSheet } from "@/components/time-picker-sheet";
import { VenueSearch } from "@/components/venue-search";

export default function NewTournamentScreen() {
	const router = useRouter();
	const create = useMutation(api.tournaments.create);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	// Form state
	const [name, setName] = useState("");
	const [date, setDate] = useState<Date | null>(null);
	const [time, setTime] = useState("09:00");
	const [gameType, setGameType] = useState<"eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool">("eight_ball");
	const [type, setType] = useState<"single" | "double" | "scotch_double" | "teams" | "round_robin">("single");
	const [playerType, setPlayerType] = useState<"singles" | "doubles" | "scotch_doubles" | "teams">("singles");
	const [maxPlayers, setMaxPlayers] = useState("");
	const [entryFee, setEntryFee] = useState("");
	const [description, setDescription] = useState("");
	const [flyerUrl, setFlyerUrl] = useState<string | undefined>(undefined);
	const [createPost, setCreatePost] = useState(false);
	const [venueId, setVenueId] = useState<Id<"venues"> | undefined>(undefined);
	
	// Turnstile - Commented out, only using on login/signup
	// Note: Turnstile is web-based, so for React Native we verify on backend only
	// const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const turnstileToken = null;

	const handleSubmit = async () => {
		if (!name.trim()) {
			Alert.alert("Error", "Tournament name is required");
			return;
		}

		if (!date) {
			Alert.alert("Error", "Date is required");
			return;
		}

		try {
			setIsSubmitting(true);

			// Combine date and time
			const [hours, minutes] = time.split(':').map(Number);
			const dateTime = new Date(date);
			dateTime.setHours(hours || 0, minutes || 0, 0, 0);
			const combinedDateTime = dateTime.getTime();

			const tournamentId = await create({
				name: name.trim(),
				date: combinedDateTime,
				type,
				playerType,
				gameType,
				bracketOrdering: "random_draw",
				maxPlayers: maxPlayers ? parseInt(maxPlayers) : undefined,
				entryFee: entryFee ? parseFloat(entryFee) : undefined,
				description: description.trim() || undefined,
				flyerUrl: flyerUrl || undefined,
				createPost: createPost || undefined,
				venueId: venueId,
				// Turnstile - Commented out, only using on login/signup
				// turnstileToken: turnstileToken || undefined,
			});

			Alert.alert("Success", "Tournament created successfully!", [
				{
					text: "OK",
					onPress: () => router.back(),
				},
			]);
		} catch (error) {
			console.error("Failed to create tournament:", error);
			Alert.alert("Error", "Failed to create tournament. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<BottomSheetModalProvider>
			<SafeAreaView className="flex-1" style={{ height: "100%", backgroundColor: themeColorBackground }} edges={["top"]}>
			{/* Header */}
			<View
				className="flex-row items-center px-4 py-3 border-b"
				style={{
					backgroundColor: themeColorBackground,
					borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
				}}
			>
                <Pressable
					onPress={() => router.navigate("/tournaments")}
					className="mr-3"
					style={({ pressed }) => ({
						opacity: pressed ? 0.6 : 1,
					})}
				>
					<Ionicons name="arrow-back" size={24} color={themeColorForeground} />
				</Pressable>
				<View className="flex-row items-center gap-1">
					<Text className="text-4xl font-bold tracking-tighter font-mono" style={{ color: themeColorForeground }}>
						new tournament
					</Text>
				</View>
			</View>

			<ScrollView
				style={{ backgroundColor: themeColorBackground }}
				contentContainerStyle={{ padding: 16 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Tournament Name */}
				<View className="mb-4">
					<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
						Tournament Name *
					</Text>
					<TextInput
						value={name}
						onChangeText={setName}
						placeholder="e.g. Summer 9-Ball Open"
						placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
						className="px-4 py-3 rounded-lg border"
						style={{
							backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
							color: themeColorForeground,
						}}
					/>
				</View>

				{/* Date & Time */}
				<View className="mb-4">
					<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
						Date & Time *
					</Text>
					<View className="flex-row gap-2">
						<DatePickerSheet
							value={date}
							onChange={setDate}
							minimumDate={new Date()}
						/>
						<TimePickerSheet
							value={time}
							onChange={setTime}
						/>
					</View>
				</View>

				{/* Venue */}
				<View className="mb-4">
					<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
						Venue
					</Text>
					<VenueSearch
						value={venueId}
						onChange={setVenueId}
						placeholder="Search venues..."
					/>
				</View>

				{/* Game Type */}
				<View className="mb-4">
					<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
						Game Type *
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{(["eight_ball", "nine_ball", "ten_ball", "one_pocket", "bank_pool"] as const).map((gt) => (
							<Pressable
								key={gt}
								onPress={() => setGameType(gt)}
								className="px-4 py-2 rounded-lg border"
								style={{
									backgroundColor:
										gameType === gt
											? accentColor
											: withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderColor:
										gameType === gt
											? accentColor
											: withOpacity(themeColorForeground, opacity.OPACITY_20),
								}}
							>
								<Text
									className="text-sm font-medium"
									style={{
										color: gameType === gt ? "#FFFFFF" : themeColorForeground,
									}}
								>
									{gt.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
								</Text>
							</Pressable>
						))}
					</View>
				</View>

				{/* Tournament Type */}
				<View className="mb-4">
					<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
						Tournament Type *
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{(["single", "double", "round_robin"] as const).map((t) => (
							<Pressable
								key={t}
								onPress={() => setType(t)}
								className="px-4 py-2 rounded-lg border"
								style={{
									backgroundColor:
										type === t
											? accentColor
											: withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderColor:
										type === t
											? accentColor
											: withOpacity(themeColorForeground, opacity.OPACITY_20),
								}}
							>
								<Text
									className="text-sm font-medium"
									style={{
										color: type === t ? "#FFFFFF" : themeColorForeground,
									}}
								>
									{t.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
								</Text>
							</Pressable>
						))}
					</View>
				</View>

				{/* Max Players & Entry Fee */}
				<View className="flex-row gap-2 mb-4">
					<View className="flex-1">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Max Players
						</Text>
						<TextInput
							value={maxPlayers}
							onChangeText={setMaxPlayers}
							placeholder="32"
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							keyboardType="numeric"
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
							Entry Fee ($)
						</Text>
						<TextInput
							value={entryFee}
							onChangeText={setEntryFee}
							placeholder="25"
							placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_40)}
							keyboardType="decimal-pad"
							className="px-4 py-3 rounded-lg border"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
								borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
								color: themeColorForeground,
							}}
						/>
					</View>
				</View>

				{/* Tournament Flyer */}
				<TournamentFlyerUpload
					onUpload={(url) => setFlyerUrl(url)}
					onRemove={() => setFlyerUrl(undefined)}
					onError={(error) => {
						console.error("File upload error:", error);
						Alert.alert("Error", "Failed to upload flyer. Please try again.");
					}}
					onExtractInfo={(info) => {
						// Populate form fields with extracted information
						if (info.name) setName(info.name);
						if (info.dateTimestamp) {
							const extractedDate = new Date(info.dateTimestamp);
							setDate(extractedDate);
						}
						if (info.time) setTime(info.time);
						if (info.entryFee !== undefined) setEntryFee(info.entryFee.toString());
						if (info.description) setDescription(info.description);
						if (info.gameType) setGameType(info.gameType);
						if (info.playerType) setPlayerType(info.playerType);
						if (info.maxPlayers) setMaxPlayers(info.maxPlayers.toString());
					}}
					currentUrl={flyerUrl}
				/>

				{/* Create Post Checkbox */}
				<Pressable
					onPress={() => setCreatePost(!createPost)}
					className="flex-row items-center mb-4"
				>
					<View
						className="w-6 h-6 rounded border-2 items-center justify-center mr-2"
						style={{
							borderColor: createPost ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_20),
							backgroundColor: createPost ? accentColor : "transparent",
						}}
					>
						{createPost && (
							<Ionicons name="checkmark" size={16} color="#FFFFFF" />
						)}
					</View>
					<Text className="text-sm" style={{ color: themeColorForeground }}>
						Create a post about this tournament
					</Text>
				</Pressable>

				{/* Description */}
				<View className="mb-4">
					<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
						Description
					</Text>
					<TextInput
						value={description}
						onChangeText={setDescription}
						placeholder="Tournament details, rules, prizes, etc."
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
								Creating...
							</Text>
						</View>
					) : (
						<Text className="text-center font-semibold" style={{ color: "#FFFFFF" }}>
							Create Tournament
						</Text>
					)}
				</Pressable>
			</ScrollView>
		</SafeAreaView>
		</BottomSheetModalProvider>
	);
}

