import { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { PostImage } from "./post-image";
import * as ImagePicker from "expo-image-picker";

interface PostComposerProps {
	onPostCreated?: () => void;
	onCancel?: () => void;
}

export function PostComposer({ onPostCreated, onCancel }: PostComposerProps) {
	const [content, setContent] = useState("");
	const [isPosting, setIsPosting] = useState(false);
	const [uploadedImages, setUploadedImages] = useState<Id<"_storage">[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";
	const mutedColor = useThemeColor("muted") || "#F5F5F5";
	
	const createPost = useMutation(api.posts.create);
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const processImageUpload = useAction(api.files.processImageUpload);
	const currentUser = useQuery(api.users.currentUser);
	const textInputRef = useRef<TextInput>(null);
	
	// Turnstile - Commented out, only using on login/signup
	// Note: Turnstile is web-based, so for React Native we verify on backend only
	// const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const turnstileToken = null;

	// Request permissions for image picker
	const requestPermissions = useCallback(async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Required",
				"We need access to your photos to upload images."
			);
			return false;
		}
		return true;
	}, []);

	// Upload image to Convex storage
	const uploadImageToConvex = useCallback(async (uri: string, fileName: string, mimeType: string) => {
		setIsUploading(true);

		try {
			// Step 1: Generate upload URL
			const uploadUrl = await generateUploadUrl();
			if (!uploadUrl) {
				throw new Error("Failed to generate upload URL");
			}

			// Step 2: Convert image URI to blob
			const response = await fetch(uri);
			if (!response.ok) {
				throw new Error(`Failed to read file: ${response.status} ${response.statusText}`);
			}
			
			const blob = await response.blob();
			const fileSize = blob.size;
			
			if (!blob || fileSize === 0) {
				throw new Error("Invalid file: empty or unreadable");
			}

			// Step 3: Upload to Convex storage
			const uploadResponse = await fetch(uploadUrl, {
				method: "POST",
				body: blob,
				headers: {
					"Content-Type": mimeType,
				},
			});

			if (!uploadResponse.ok) {
				const errorText = await uploadResponse.text();
				throw new Error(`Upload failed: ${uploadResponse.status} ${errorText || uploadResponse.statusText}`);
			}

			// Step 4: Parse response to get storageId
			const responseText = await uploadResponse.text();
			let storageId: Id<"_storage">;
			
			try {
				const responseData = JSON.parse(responseText);
				storageId = (responseData.storageId || responseData) as Id<"_storage">;
			} catch (parseError) {
				storageId = responseText.trim() as Id<"_storage">;
			}
			
			if (!storageId) {
				throw new Error("No storageId in upload response");
			}

			// Process image - automatically converts HEIC to web format
			try {
				const processed = await processImageUpload({ storageId });
				// The processed.displayUrl is the converted URL, but we still return storageId
				// The PostImage component will handle displaying the converted URL
				return { storageId };
			} catch (error) {
				console.error("Failed to process image (HEIC conversion):", error);
				// Continue with original storageId if processing fails
				return { storageId };
			}
		} catch (error) {
			console.error("Upload failed:", error);
			const errorMessage = error instanceof Error ? error.message : "Unknown upload error";
			throw new Error(`Failed to upload image: ${errorMessage}`);
		} finally {
			setIsUploading(false);
		}
	}, [generateUploadUrl, processImageUpload]);

	// Handle image picker
	const handlePickImage = useCallback(async () => {
		try {
			if (!ImagePicker || !ImagePicker.launchImageLibraryAsync) {
				Alert.alert(
					"Not Available",
					"Image picker is not available in this environment."
				);
				return;
			}

			const hasPermission = await requestPermissions();
			if (!hasPermission) return;

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'] as any,
				allowsEditing: false,
				quality: 0.8,
				allowsMultipleSelection: false,
			});

			if (!result.canceled && result.assets[0]) {
				const asset = result.assets[0];
				const fileName = asset.fileName || `post-image-${Date.now()}.jpg`;
				const mimeType = asset.mimeType || "image/jpeg";

				const { storageId } = await uploadImageToConvex(asset.uri, fileName, mimeType);
				setUploadedImages(prev => [...prev, storageId]);
			}
		} catch (error) {
			console.error("Image picker error:", error);
			const errorMessage = error instanceof Error ? error.message : "Failed to pick image";
			Alert.alert("Error", errorMessage);
		}
	}, [requestPermissions, uploadImageToConvex]);

	// Remove image
	const removeImage = useCallback((indexToRemove: number) => {
		setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
	}, []);

	// Handle post submission
	const handleSubmit = useCallback(async () => {
		if (!content.trim() && uploadedImages.length === 0) return;
		
		setIsPosting(true);
		try {
			await createPost({
				content: content.trim(),
				images: uploadedImages.length > 0 ? uploadedImages.map(id => id as string) : undefined,
				type: "post",
				// Turnstile - Commented out, only using on login/signup
				// turnstileToken: turnstileToken || undefined,
			});
			
			setContent("");
			setUploadedImages([]);
			onPostCreated?.();
		} catch (error) {
			console.error("Error creating post:", error);
			Alert.alert("Error", "Failed to create post. Please try again.");
		} finally {
			setIsPosting(false);
		}
	}, [content, uploadedImages, createPost, onPostCreated]);

	const canPost = (content.trim().length > 0 || uploadedImages.length > 0) && !isPosting && !isUploading && content.length <= 500;

	// Show loading state while user is loading
	if (currentUser === undefined) {
		return (
			<View className="flex-1 justify-center items-center" style={{ backgroundColor: themeColorBackground }}>
				<ActivityIndicator size="large" color={accentColor} />
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1"
			style={{ height: "100%", backgroundColor: themeColorBackground }}
		>
			<ScrollView
				className="flex-1"
				contentContainerStyle={{ paddingBottom: 20 }}
				keyboardShouldPersistTaps="handled"
			>
				{/* Header */}
				<View
					className="flex-row items-center justify-between px-4 py-3 border-b"
					style={{
						backgroundColor: themeColorBackground,
						borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
					}}
				>
					<Pressable
						onPress={onCancel}
						style={({ pressed }) => ({
							opacity: pressed ? 0.6 : 1,
						})}
					>
						<Text style={{ color: accentColor, fontSize: 16 }}>Cancel</Text>
					</Pressable>
					<Text className="text-lg font-semibold" style={{ color: themeColorForeground }}>
						Create Post
					</Text>
					<Pressable
						onPress={handleSubmit}
						disabled={!canPost}
						style={({ pressed }) => ({
							opacity: (!canPost || pressed) ? 0.6 : 1,
						})}
					>
						<Text
							style={{
								color: canPost ? "text-foreground" : withOpacity(themeColorForeground, opacity.OPACITY_40),
								fontSize: 16,
								fontWeight: "600",
							}}
						>
							{isPosting ? "Posting..." : "Post"}
						</Text>
					</Pressable>
				</View>

				{/* User Info */}
				<View className="flex-row items-center px-4 py-3">
					<View
						className="w-12 h-12 rounded-full items-center justify-center mr-3"
						style={{ backgroundColor: accentColor + "20" }}
					>
						<Text className="text-base font-bold" style={{ color: accentColor }}>
							{currentUser?.displayName?.charAt(0).toUpperCase() ||
								currentUser?.name?.charAt(0).toUpperCase() ||
								currentUser?.firstName?.charAt(0).toUpperCase() ||
								"U"}
						</Text>
					</View>
					<View className="flex-1">
						<Text className="font-semibold text-base" style={{ color: themeColorForeground }}>
							{currentUser?.displayName || currentUser?.name || "User"}
						</Text>
						<Text className="text-sm" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
							@{currentUser?.username || "user"}
						</Text>
					</View>
				</View>

				{/* Text Input */}
				<View className="px-4 mb-4">
					<TextInput
						ref={textInputRef}
						value={content}
						onChangeText={setContent}
						placeholder="Tell your friends about your thoughts..."
						placeholderTextColor={withOpacity(themeColorForeground, opacity.OPACITY_60)}
						multiline
						maxLength={500}
						textAlignVertical="top"
						className="text-base"
						style={{
							color: themeColorForeground,
							minHeight: 120,
							fontSize: 16,
							lineHeight: 24,
						}}
					/>
					<Text
						className="text-xs mt-2 text-right"
						style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}
					>
						{content.length}/500
					</Text>
				</View>

				{/* Image Preview */}
				{uploadedImages.length > 0 && (
					<View className="px-4 mb-4">
						{uploadedImages.length === 1 ? (
							<View className="relative">
								<PostImage
									storageId={uploadedImages[0]}
									alt="Uploaded image"
									maxSize={680}
									showBackground={true}
									containerHeight={300}
								/>
								<Pressable
									onPress={() => removeImage(0)}
									className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
									style={({ pressed }) => ({
										opacity: pressed ? 0.7 : 1,
									})}
								>
									<Ionicons name="close" size={20} color="#FFFFFF" />
								</Pressable>
							</View>
						) : (
							<View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
								{uploadedImages.map((storageId, index) => (
									<View key={index} style={{ width: "48%", margin: 4 }}>
										<View className="relative">
											<PostImage
												storageId={storageId}
												alt={`Uploaded image ${index + 1}`}
												maxSize={340}
												showBackground={false}
												containerHeight={150}
											/>
											<Pressable
												onPress={() => removeImage(index)}
												className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
												style={({ pressed }) => ({
													opacity: pressed ? 0.7 : 1,
												})}
											>
												<Ionicons name="close" size={16} color="#FFFFFF" />
											</Pressable>
										</View>
									</View>
								))}
							</View>
						)}
					</View>
				)}

				{/* Action Buttons */}
				<View className="px-4">
					<Pressable
						onPress={handlePickImage}
						disabled={isUploading || isPosting || uploadedImages.length >= 4}
						className="flex-row items-center py-4 px-4 rounded-lg mb-2"
						style={({ pressed }) => ({
							backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
							opacity: (isUploading || isPosting || uploadedImages.length >= 4 || pressed) ? 0.6 : 1,
						})}
					>
						<View
							className="w-10 h-10 rounded-full items-center justify-center mr-3"
							style={{ backgroundColor: accentColor + "20" }}
						>
							<Ionicons name="image-outline" size={20} color={accentColor} />
						</View>
						<View className="flex-1">
							<Text className="text-base font-semibold" style={{ color: themeColorForeground }}>
								{isUploading ? "Uploading..." : "Add Photo"}
							</Text>
							{uploadedImages.length >= 4 && (
								<Text className="text-sm mt-0.5" style={{ color: withOpacity(themeColorForeground, opacity.OPACITY_60) }}>
									Maximum 4 photos
								</Text>
							)}
						</View>
						{isUploading && (
							<ActivityIndicator size="small" color={accentColor} />
						)}
					</Pressable>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

