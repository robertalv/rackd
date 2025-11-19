import { Text, View, Pressable, Modal, Share, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import QRCode from "react-native-qrcode-svg";
import { useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import { useRef } from "react";
import { View as RNView } from "react-native";
import * as Clipboard from "expo-clipboard";

interface QRCodeShareModalProps {
	visible: boolean;
	onClose: () => void;
	username: string;
	displayName: string;
}

export function QRCodeShareModal({
	visible,
	onClose,
	username,
	displayName,
}: QRCodeShareModalProps) {
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const qrCodeRef = useRef<RNView>(null);
	const [isSaving, setIsSaving] = useState(false);

	const deepLinkUrl = `rackd:///(drawer)/(tabs)/${username}`;
	const profileUrl = `https://rackd.net/${username}`;

	const handleCopyLink = async () => {
		try {
			await Clipboard.setStringAsync(profileUrl);
			Alert.alert("Link copied!", "Profile link copied to clipboard");
		} catch (error) {
			console.error("Error copying link:", error);
			Alert.alert("Error", "Failed to copy link. Please try again.");
		}
	};

	const handleDownloadQR = async () => {
		if (!qrCodeRef.current) return;

		setIsSaving(true);
		try {
			// Request media library permissions
			const { status } = await MediaLibrary.requestPermissionsAsync();
			if (status !== "granted") {
				Alert.alert(
					"Permission Required",
					"Please grant permission to save the QR code to your photos."
				);
				setIsSaving(false);
				return;
			}

			// Capture the QR code view
			const uri = await captureRef(qrCodeRef.current, {
				format: "png",
				quality: 1,
			});

			// Save to media library
			await MediaLibrary.createAssetAsync(uri);
			Alert.alert("Success", "QR code saved to your photos!");
		} catch (error) {
			console.error("Error saving QR code:", error);
			Alert.alert("Error", "Failed to save QR code. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleShareProfile = async () => {
		try {
			const shareContent = Platform.select({
				ios: {
					message: `Check out ${displayName} (@${username}) on Rackd!\n${profileUrl}`,
				},
				android: {
					message: `Check out ${displayName} (@${username}) on Rackd!\n${profileUrl}`,
					url: profileUrl,
				},
				default: {
					message: `Check out ${displayName} (@${username}) on Rackd!\n${profileUrl}`,
				},
			});

			const result = await Share.share(shareContent);
			
			if (result.action === Share.sharedAction) {
				// User shared successfully
				console.log("Profile shared successfully");
			} else if (result.action === Share.dismissedAction) {
				// User dismissed the share sheet - this is normal, don't show error
				console.log("Share dismissed");
			}
		} catch (error: any) {
			console.error("Error sharing profile:", error);
			// Only show error if it's not a user dismissal
			if (error.message && !error.message.includes("User did not share") && !error.message.includes("dismissed")) {
				Alert.alert("Error", "Failed to share profile. Please try again.");
			}
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={true}
			onRequestClose={onClose}
		>
			<Pressable
				style={{
					flex: 1,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					justifyContent: "center",
					alignItems: "center",
				}}
				onPress={onClose}
			>
				<Pressable
					onPress={(e) => e.stopPropagation()}
					style={{
						width: "90%",
						maxWidth: 400,
						backgroundColor: themeColorBackground,
						borderRadius: 16,
						padding: 24,
					}}
				>
						{/* Header */}
						<View className="flex-row items-center justify-between mb-6">
							<Text
								className="text-xl font-bold"
								style={{ color: themeColorForeground }}
							>
								Share Profile
							</Text>
							<Pressable
								onPress={onClose}
								style={({ pressed }) => ({
									opacity: pressed ? 0.6 : 1,
								})}
							>
								<Ionicons
									name="close"
									size={24}
									color={themeColorForeground}
								/>
							</Pressable>
						</View>

						{/* QR Code */}
						<View
							ref={qrCodeRef}
							className="items-center justify-center p-6 rounded-xl mb-6"
							style={{
								backgroundColor: withOpacity(
									themeColorForeground,
									opacity.OPACITY_10
								),
							}}
						>
							<QRCode
								value={deepLinkUrl}
								size={200}
								color={themeColorForeground}
								backgroundColor={themeColorBackground}
							/>
							<Text
								className="text-lg font-semibold mt-4"
								style={{ color: accentColor }}
							>
								@{username}
							</Text>
						</View>

						{/* Action Buttons */}
						<View className="flex-row gap-3">
							<Pressable
								onPress={handleShareProfile}
								className="flex-1 py-4 rounded-xl items-center"
								style={{
									backgroundColor: withOpacity(
										themeColorForeground,
										opacity.OPACITY_10
									),
								}}
							>
								<Ionicons
									name="share-outline"
									size={24}
									color={themeColorForeground}
								/>
								<Text
									className="text-sm font-semibold mt-2"
									style={{ color: themeColorForeground }}
								>
									Share profile
								</Text>
							</Pressable>

							<Pressable
								onPress={handleCopyLink}
								className="flex-1 py-4 rounded-xl items-center"
								style={{
									backgroundColor: withOpacity(
										themeColorForeground,
										opacity.OPACITY_10
									),
								}}
							>
								<Ionicons
									name="link-outline"
									size={24}
									color={themeColorForeground}
								/>
								<Text
									className="text-sm font-semibold mt-2"
									style={{ color: themeColorForeground }}
								>
									Copy link
								</Text>
							</Pressable>

							<Pressable
								onPress={handleDownloadQR}
								disabled={isSaving}
								className="flex-1 py-4 rounded-xl items-center"
								style={{
									backgroundColor: withOpacity(
										themeColorForeground,
										opacity.OPACITY_10
									),
									opacity: isSaving ? 0.6 : 1,
								}}
							>
								<Ionicons
									name={isSaving ? "hourglass-outline" : "download-outline"}
									size={24}
									color={themeColorForeground}
								/>
								<Text
									className="text-sm font-semibold mt-2"
									style={{ color: themeColorForeground }}
								>
									Download
								</Text>
							</Pressable>
						</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

