import { Text, View, ScrollView, TextInput, ActivityIndicator, Pressable, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

export default function TournamentPayoutsScreen() {
	const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
	const [houseFeePerPlayer, setHouseFeePerPlayer] = useState<string>("0");
	const [payoutPlaces, setPayoutPlaces] = useState<string>("3");
	const [isManualMode, setIsManualMode] = useState<boolean>(false);
	const [editingPayouts, setEditingPayouts] = useState<Array<{ place: number; amount: number; percentage: number }>>([]);
	const [refreshing, setRefreshing] = useState(false);

	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const mutedColor = useThemeColor("muted") || "#F5F5F5";

	const payoutData = useQuery(api.tournaments.getPayoutCalculation, { tournamentId: tournamentId as Id<"tournaments"> });
	const savedPayoutStructure = useQuery(api.tournaments.getPayoutStructure, { tournamentId: tournamentId as Id<"tournaments"> });
	const generatePayouts = useAction(api.tournaments.generateOptimalPayouts);
	const savePayoutStructure = useMutation(api.tournaments.savePayoutStructure);

	const [payouts, setPayouts] = useState<{
		totalCollected: number;
		houseFee: number;
		potAmount: number;
		paidPlayers: number;
		payouts: Array<{ place: number; amount: number; percentage: number }>;
		rationale: string;
	} | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Load saved payout structure on mount
	useEffect(() => {
		if (!savedPayoutStructure) return;

		if (savedPayoutStructure.payoutStructure && !payouts) {
			setPayouts({
				...savedPayoutStructure.payoutStructure,
				rationale: savedPayoutStructure.payoutStructure.rationale || "Saved payout structure",
			});
			setEditingPayouts(savedPayoutStructure.payoutStructure.payouts.map(p => ({ ...p })));
		}
		if (savedPayoutStructure.houseFeePerPlayer !== null && savedPayoutStructure.houseFeePerPlayer !== undefined) {
			setHouseFeePerPlayer(savedPayoutStructure.houseFeePerPlayer.toString());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedPayoutStructure]);

	const onRefresh = async () => {
		setRefreshing(true);
		setTimeout(() => setRefreshing(false), 1000);
	};

	const handleGeneratePayouts = async () => {
		setIsGenerating(true);
		setIsManualMode(false);
		try {
			const result = await generatePayouts({
				tournamentId: tournamentId as Id<"tournaments">,
				houseFeePerPlayer: parseFloat(houseFeePerPlayer) || 0,
				payoutPlaces: parseInt(payoutPlaces) || 3,
			});
			setPayouts(result);
			setEditingPayouts(result.payouts.map(p => ({ ...p })));

			// Auto-save after generation
			await handleSavePayoutStructure(result);
		} catch (error) {
			console.error("Failed to generate payouts:", error);
			Alert.alert("Error", "Failed to generate payouts. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSavePayoutStructure = async (payoutsToSave?: typeof payouts) => {
		const structureToSave = payoutsToSave || payouts;
		if (!structureToSave) return;

		setIsSaving(true);
		try {
			await savePayoutStructure({
				tournamentId: tournamentId as Id<"tournaments">,
				houseFeePerPlayer: parseFloat(houseFeePerPlayer) || 0,
				payoutStructure: structureToSave,
			});
			if (!payoutsToSave) {
				setIsManualMode(false);
			}
		} catch (error: any) {
			console.error("Failed to save payout structure:", error);
			Alert.alert("Error", error?.message || "Failed to save payout structure. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleManualMode = () => {
		if (!payoutData) return;

		setIsManualMode(true);
		if (!payouts) {
			const { totalCollected, paidPlayers } = payoutData;
			const potAmount = totalCollected - (parseFloat(houseFeePerPlayer) * paidPlayers);
			setEditingPayouts([{ place: 1, amount: 0, percentage: 0 }]);
			setPayouts({
				totalCollected,
				houseFee: parseFloat(houseFeePerPlayer) * paidPlayers,
				potAmount,
				paidPlayers,
				payouts: [{ place: 1, amount: 0, percentage: 0 }],
				rationale: "Manual payout structure",
			});
		} else {
			setEditingPayouts(payouts.payouts.map(p => ({ ...p })));
		}
	};

	const handleAddPayoutPlace = () => {
		const newPlace = editingPayouts.length + 1;
		setEditingPayouts([...editingPayouts, { place: newPlace, amount: 0, percentage: 0 }]);
	};

	const handleRemovePayoutPlace = (index: number) => {
		const newPayouts = editingPayouts.filter((_, i) => i !== index);
		const renumbered = newPayouts.map((p, i) => ({ ...p, place: i + 1 }));
		setEditingPayouts(renumbered);
	};

	const handleUpdatePayoutAmount = (index: number, amount: string) => {
		const numAmount = parseFloat(amount) || 0;
		const newPayouts = [...editingPayouts];
		newPayouts[index] = {
			...newPayouts[index],
			amount: numAmount,
			percentage: payouts ? (numAmount / payouts.potAmount) * 100 : 0,
		};
		setEditingPayouts(newPayouts);
	};

	const handleSaveManualPayouts = async () => {
		if (!payouts) return;

		const totalPayouts = editingPayouts.reduce((sum, p) => sum + p.amount, 0);
		const difference = Math.abs(totalPayouts - payouts.potAmount);

		if (difference > 0.01) {
			Alert.alert(
				"Validation Error",
				`Total payouts ($${totalPayouts.toFixed(2)}) must equal pot amount ($${payouts.potAmount.toFixed(2)}). Difference: $${difference.toFixed(2)}`
			);
			return;
		}

		const updatedPayouts = {
			...payouts,
			payouts: editingPayouts.map(p => ({
				...p,
				percentage: (p.amount / payouts.potAmount) * 100,
			})),
			rationale: "Manual payout structure",
		};
		setPayouts(updatedPayouts);

		await handleSavePayoutStructure(updatedPayouts);
	};

	if (!payoutData) {
		return (
			<SafeAreaView className="flex-1" style={{ backgroundColor: themeColorBackground }}>
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color={accentColor} />
					<Text className="mt-4" style={{ color: themeColorForeground }}>
						Loading...
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	const { entryFee, totalPlayers, paidPlayers, unpaidPlayers, totalCollected } = payoutData;
	const houseFeeTotal = parseFloat(houseFeePerPlayer) * paidPlayers;

	return (
		<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
				{/* Payment Summary */}
				<View
					className="p-4 rounded-lg"
					style={{
						backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
						borderWidth: 1,
						borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
					}}
				>
					<Text className="text-lg font-semibold mb-4" style={{ color: themeColorForeground }}>
						Payment Summary
					</Text>
					<View className="flex-row flex-wrap gap-4">
						<View className="flex-1 min-w-[120px]">
							<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Entry Fee
							</Text>
							<Text className="text-xl font-bold" style={{ color: themeColorForeground }}>
								${entryFee.toFixed(2)}
							</Text>
						</View>
						<View className="flex-1 min-w-[120px]">
							<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Total Players
							</Text>
							<Text className="text-xl font-bold" style={{ color: themeColorForeground }}>
								{totalPlayers}
							</Text>
						</View>
						<View className="flex-1 min-w-[120px]">
							<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Paid Players
							</Text>
							<Text className="text-xl font-bold" style={{ color: "#10B981" }}>
								{paidPlayers}
							</Text>
						</View>
						<View className="flex-1 min-w-[120px]">
							<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Unpaid Players
							</Text>
							<Text className="text-xl font-bold" style={{ color: "#F59E0B" }}>
								{unpaidPlayers}
							</Text>
						</View>
					</View>
					<View className="mt-4 pt-4 border-t" style={{ borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20) }}>
						<View className="flex-row justify-between items-center">
							<Text className="text-base font-semibold" style={{ color: themeColorForeground }}>
								Total Collected
							</Text>
							<Text className="text-2xl font-bold" style={{ color: "#10B981" }}>
								${totalCollected.toFixed(2)}
							</Text>
						</View>
					</View>
				</View>

				{/* Payout Configuration */}
				<View
					className="p-4 rounded-lg"
					style={{
						backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
						borderWidth: 1,
						borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
					}}
				>
					<Text className="text-lg font-semibold mb-4" style={{ color: themeColorForeground }}>
						Payout Configuration
					</Text>

					<View className="space-y-4">
						<View>
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								House Fee Per Player/Team
							</Text>
							<View className="flex-row items-center gap-2">
								<Text style={{ color: themeColorForeground }}>$</Text>
								<TextInput
									value={houseFeePerPlayer}
									onChangeText={setHouseFeePerPlayer}
									keyboardType="decimal-pad"
									className="flex-1 px-3 py-2 rounded-lg border"
									style={{
										backgroundColor: themeColorBackground,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
										color: themeColorForeground,
									}}
								/>
								{parseFloat(houseFeePerPlayer) > 0 && paidPlayers > 0 && (
									<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										= ${houseFeeTotal.toFixed(2)} total
									</Text>
								)}
							</View>
						</View>

						<View>
							<Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
								Number of Payout Places
							</Text>
							<TextInput
								value={payoutPlaces}
								onChangeText={setPayoutPlaces}
								keyboardType="number-pad"
								className="px-3 py-2 rounded-lg border"
								style={{
									backgroundColor: themeColorBackground,
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									color: themeColorForeground,
								}}
							/>
							<Text className="text-xs mt-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								Maximum: {paidPlayers} (based on paid players)
							</Text>
						</View>

						<View className="flex-row gap-2 pt-4 border-t" style={{ borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20) }}>
							<Pressable
								onPress={handleGeneratePayouts}
								disabled={isGenerating || totalCollected === 0}
								className="flex-1 px-4 py-3 rounded-lg flex-row items-center justify-center"
								style={{
									backgroundColor: isGenerating || totalCollected === 0 ? withOpacity(accentColor, opacity.OPACITY_10) : accentColor,
								}}
							>
								{isGenerating ? (
									<ActivityIndicator size="small" color="#FFFFFF" />
								) : (
									<>
										<Ionicons name="sparkles" size={18} color="#FFFFFF" />
										<Text className="text-white font-medium ml-2">Generate (AI)</Text>
									</>
								)}
							</Pressable>
							<Pressable
								onPress={handleManualMode}
								disabled={totalCollected === 0}
								className="flex-1 px-4 py-3 rounded-lg flex-row items-center justify-center border"
								style={{
									borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									backgroundColor: totalCollected === 0 ? withOpacity(themeColorForeground, opacity.OPACITY_10) : themeColorBackground,
								}}
							>
								<Ionicons name="create-outline" size={18} color={totalCollected === 0 ? withOpacity(themeColorForeground, opacity.OPACITY_60) : themeColorForeground} />
								<Text className="font-medium ml-2" style={{ color: totalCollected === 0 ? withOpacity(themeColorForeground, opacity.OPACITY_60) : themeColorForeground }}>
									{payouts ? "Update" : "Manual"}
								</Text>
							</Pressable>
						</View>
					</View>
				</View>

				{/* Payout Results */}
				{payouts && (
					<View
						className="p-4 rounded-lg"
						style={{
							backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							borderWidth: 1,
							borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
						}}
					>
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-lg font-semibold" style={{ color: themeColorForeground }}>
								Payout Structure
							</Text>
							{isManualMode && (
								<View className="flex-row gap-2">
									<Pressable
										onPress={handleAddPayoutPlace}
										className="px-3 py-2 rounded-lg border"
										style={{
											borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
											backgroundColor: themeColorBackground,
										}}
									>
										<Ionicons name="add" size={18} color={themeColorForeground} />
									</Pressable>
									<Pressable
										onPress={handleSaveManualPayouts}
										disabled={isSaving}
										className="px-3 py-2 rounded-lg"
										style={{
											backgroundColor: isSaving ? withOpacity(accentColor, opacity.OPACITY_10) : accentColor,
										}}
									>
										{isSaving ? (
											<ActivityIndicator size="small" color="#FFFFFF" />
										) : (
											<Ionicons name="save-outline" size={18} color="#FFFFFF" />
										)}
									</Pressable>
								</View>
							)}
							{!isManualMode && payouts && (
								<Pressable
									onPress={() => handleSavePayoutStructure()}
									disabled={isSaving}
									className="px-3 py-2 rounded-lg border"
									style={{
										borderColor: withOpacity(accentColor, opacity.OPACITY_20),
										backgroundColor: isSaving ? withOpacity(accentColor, opacity.OPACITY_10) : themeColorBackground,
									}}
								>
									{isSaving ? (
										<ActivityIndicator size="small" color={accentColor} />
									) : (
										<Ionicons name="save-outline" size={18} color={accentColor} />
									)}
								</Pressable>
							)}
						</View>

						{!isManualMode && payouts.rationale && (
							<Text className="text-sm mb-4" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
								{payouts.rationale}
							</Text>
						)}

						{/* Summary */}
						<View
							className="p-3 rounded-lg mb-4"
							style={{
								backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							}}
						>
							<View className="flex-row flex-wrap gap-4">
								<View className="flex-1 min-w-[100px]">
									<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Total Collected
									</Text>
									<Text className="text-lg font-bold" style={{ color: themeColorForeground }}>
										${payouts.totalCollected.toFixed(2)}
									</Text>
								</View>
								<View className="flex-1 min-w-[100px]">
									<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										House Fee
									</Text>
									<Text className="text-lg font-bold" style={{ color: "#F59E0B" }}>
										${payouts.houseFee.toFixed(2)}
									</Text>
								</View>
								<View className="flex-1 min-w-[100px]">
									<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Pot Amount
									</Text>
									<Text className="text-lg font-bold" style={{ color: "#10B981" }}>
										${payouts.potAmount.toFixed(2)}
									</Text>
								</View>
								<View className="flex-1 min-w-[100px]">
									<Text className="text-xs mb-1" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
										Total Payouts
									</Text>
									<Text
										className="text-lg font-bold"
										style={{
											color:
												isManualMode &&
												Math.abs(editingPayouts.reduce((sum, p) => sum + p.amount, 0) - payouts.potAmount) > 0.01
													? "#EF4444"
													: themeColorForeground,
										}}
									>
										$
										{(
											isManualMode
												? editingPayouts.reduce((sum, p) => sum + p.amount, 0)
												: payouts.payouts.reduce((sum, p) => sum + p.amount, 0)
										).toFixed(2)}
									</Text>
								</View>
							</View>
						</View>

						{/* Validation Alert */}
						{isManualMode && (() => {
							const totalPayouts = editingPayouts.reduce((sum, p) => sum + p.amount, 0);
							const difference = Math.abs(totalPayouts - payouts.potAmount);
							if (difference > 0.01) {
								return (
									<View
										className="p-3 rounded-lg mb-4"
										style={{
											backgroundColor: withOpacity("#EF4444", opacity.OPACITY_10),
											borderWidth: 1,
											borderColor: withOpacity("#EF4444", opacity.OPACITY_20),
										}}
									>
										<Text className="text-sm font-medium" style={{ color: "#EF4444" }}>
											Total payouts (${totalPayouts.toFixed(2)}) does not match pot amount (${payouts.potAmount.toFixed(2)}). Difference: ${difference.toFixed(2)}
										</Text>
									</View>
								);
							}
							return null;
						})()}

						{/* Payout Table */}
						<View className="space-y-2">
							{(isManualMode ? editingPayouts : payouts.payouts).map((payout, index) => (
								<View
									key={payout.place}
									className="p-3 rounded-lg flex-row items-center justify-between"
									style={{
										backgroundColor: themeColorBackground,
										borderWidth: 1,
										borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
									}}
								>
									<View className="flex-row items-center flex-1">
										{payout.place === 1 && <Text className="text-xl mr-2">🥇</Text>}
										{payout.place === 2 && <Text className="text-xl mr-2">🥈</Text>}
										{payout.place === 3 && <Text className="text-xl mr-2">🥉</Text>}
										<Text className="font-semibold" style={{ color: themeColorForeground }}>
											{payout.place === 1
												? "1st Place"
												: payout.place === 2
												? "2nd Place"
												: payout.place === 3
												? "3rd Place"
												: `${payout.place}th Place`}
										</Text>
									</View>
									{isManualMode ? (
										<View className="flex-row items-center gap-2">
											<Text style={{ color: themeColorForeground }}>$</Text>
											<TextInput
												value={payout.amount.toString()}
												onChangeText={(text) => handleUpdatePayoutAmount(index, text)}
												keyboardType="decimal-pad"
												className="w-24 px-2 py-1 rounded border text-right"
												style={{
													backgroundColor: themeColorBackground,
													borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
													color: themeColorForeground,
												}}
											/>
											{editingPayouts.length > 1 && (
												<Pressable
													onPress={() => handleRemovePayoutPlace(index)}
													className="p-1"
												>
													<Ionicons name="trash-outline" size={18} color="#EF4444" />
												</Pressable>
											)}
										</View>
									) : (
										<View className="items-end">
											<Text className="text-lg font-bold" style={{ color: "#10B981" }}>
												${payout.amount.toFixed(2)}
											</Text>
											<Text className="text-xs" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
												{payout.percentage.toFixed(1)}%
											</Text>
										</View>
									)}
								</View>
							))}
						</View>
					</View>
				)}

				{totalCollected === 0 && (
					<View
						className="p-6 rounded-lg items-center"
						style={{
							backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							borderWidth: 1,
							borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
						}}
					>
						<Ionicons name="cash-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_60)} />
						<Text className="text-base font-medium mt-4" style={{ color: themeColorForeground }}>
							No payments collected yet.
						</Text>
						<Text className="text-sm mt-2 text-center" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
							Mark players as "Paid" in the Players tab to calculate payouts.
						</Text>
					</View>
				)}
		</ScrollView>
	);
}

