import { Text, View, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { TournamentFlyerUpload } from "@/components/tournament-flyer-upload";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { DatePickerSheet } from "@/components/date-picker-sheet";
import { TimePickerSheet } from "@/components/time-picker-sheet";
import { VenueSearch } from "@/components/venue-search";

type Props = {
	tournamentId: Id<"tournaments">;
};

export function TournamentSettingsView({ tournamentId }: Props) {
	const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
	const update = useMutation(api.tournaments.update);
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
	const [bracketOrdering, setBracketOrdering] = useState<"random_draw" | "seeded_draw">("random_draw");
	const [maxPlayers, setMaxPlayers] = useState("");
	const [entryFee, setEntryFee] = useState("");
	const [description, setDescription] = useState("");
	const [flyerUrl, setFlyerUrl] = useState<string | undefined>(undefined);
	const [venueId, setVenueId] = useState<Id<"venues"> | undefined>(undefined);
	const [requiresApproval, setRequiresApproval] = useState(false);
	const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);
	const [isPublic, setIsPublic] = useState(true);
	const [winnersRaceTo, setWinnersRaceTo] = useState("");
	const [losersRaceTo, setLosersRaceTo] = useState("");

	// Initialize form with tournament data
	useEffect(() => {
		if (tournament) {
			setName(tournament.name);
			setDate(new Date(tournament.date));
			setTime(new Date(tournament.date).toTimeString().slice(0, 5));
			setGameType(tournament.gameType);
			setType(tournament.type);
			setPlayerType(tournament.playerType);
			setBracketOrdering(tournament.bracketOrdering);
			setMaxPlayers(tournament.maxPlayers?.toString() || "");
			setEntryFee(tournament.entryFee?.toString() || "");
			setDescription(tournament.description || "");
			setFlyerUrl(tournament.flyerUrl || undefined);
			setVenueId(tournament.venueId);
			setRequiresApproval(tournament.requiresApproval);
			setAllowSelfRegistration(tournament.allowSelfRegistration);
			setIsPublic(tournament.isPublic);
			setWinnersRaceTo(tournament.winnersRaceTo?.toString() || "");
			setLosersRaceTo(tournament.losersRaceTo?.toString() || "");
		}
	}, [tournament]);

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

			await update({
				tournamentId,
				name: name.trim(),
				date: combinedDateTime,
				type,
				playerType,
				gameType,
				bracketOrdering,
				maxPlayers: maxPlayers ? parseInt(maxPlayers) : undefined,
				entryFee: entryFee ? parseFloat(entryFee) : undefined,
				description: description.trim() || undefined,
				flyerUrl: flyerUrl || undefined,
				venueId: venueId,
				winnersRaceTo: winnersRaceTo ? parseInt(winnersRaceTo) : undefined,
				losersRaceTo: losersRaceTo ? parseInt(losersRaceTo) : undefined,
				requiresApproval,
				allowSelfRegistration,
				isPublic,
			});

			Alert.alert("Success", "Tournament updated successfully!");
		} catch (error) {
			console.error("Failed to update tournament:", error);
			Alert.alert("Error", "Failed to update tournament. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!tournament) {
		return (
			<View className="flex-1 justify-center items-center" style={{ backgroundColor: themeColorBackground }}>
				<ActivityIndicator size="large" color={accentColor} />
				<Text className="mt-4" style={{ color: themeColorForeground }}>
					Loading tournament...
				</Text>
			</View>
		);
	}

	return (
		<BottomSheetModalProvider>
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

				{/* Bracket Ordering */}
				<View className="mb-4">
					<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
						Bracket Ordering *
					</Text>
					<View className="flex-row flex-wrap gap-2">
						{(["random_draw", "seeded_draw"] as const).map((bo) => (
							<Pressable
								key={bo}
								onPress={() => setBracketOrdering(bo)}
								className="px-4 py-2 rounded-lg border"
								style={{
									backgroundColor:
										bracketOrdering === bo
											? accentColor
											: withOpacity(themeColorForeground, opacity.OPACITY_10),
									borderColor:
										bracketOrdering === bo
											? accentColor
											: withOpacity(themeColorForeground, opacity.OPACITY_20),
								}}
							>
								<Text
									className="text-sm font-medium"
									style={{
										color: bracketOrdering === bo ? "#FFFFFF" : themeColorForeground,
									}}
								>
									{bo.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
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

				{/* Race To */}
				<View className="flex-row gap-2 mb-4">
					<View className="flex-1">
						<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
							Winners Race To
						</Text>
						<TextInput
							value={winnersRaceTo}
							onChangeText={setWinnersRaceTo}
							placeholder="7"
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
							Losers Race To
						</Text>
						<TextInput
							value={losersRaceTo}
							onChangeText={setLosersRaceTo}
							placeholder="5"
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

				{/* Settings Switches */}
				<View className="mb-4 space-y-3">
					<View className="flex-row items-center justify-between p-3 rounded-lg" style={{
						backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					}}>
						<Text className="text-sm" style={{ color: themeColorForeground }}>
							Requires Approval
						</Text>
						<Switch
							value={requiresApproval}
							onValueChange={setRequiresApproval}
							trackColor={{ false: withOpacity(themeColorForeground, opacity.OPACITY_20), true: accentColor }}
							thumbColor="#FFFFFF"
						/>
					</View>
					<View className="flex-row items-center justify-between p-3 rounded-lg" style={{
						backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					}}>
						<Text className="text-sm" style={{ color: themeColorForeground }}>
							Allow Self-Registration
						</Text>
						<Switch
							value={allowSelfRegistration}
							onValueChange={setAllowSelfRegistration}
							trackColor={{ false: withOpacity(themeColorForeground, opacity.OPACITY_20), true: accentColor }}
							thumbColor="#FFFFFF"
						/>
					</View>
					<View className="flex-row items-center justify-between p-3 rounded-lg" style={{
						backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					}}>
						<Text className="text-sm" style={{ color: themeColorForeground }}>
							Public Tournament
						</Text>
						<Switch
							value={isPublic}
							onValueChange={setIsPublic}
							trackColor={{ false: withOpacity(themeColorForeground, opacity.OPACITY_20), true: accentColor }}
							thumbColor="#FFFFFF"
						/>
					</View>
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
								Saving...
							</Text>
						</View>
					) : (
						<Text className="text-center font-semibold" style={{ color: "#FFFFFF" }}>
							Save Changes
						</Text>
					)}
				</Pressable>
			</ScrollView>
		</BottomSheetModalProvider>
	);
}

