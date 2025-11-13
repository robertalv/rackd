import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, Image, Pressable, ActivityIndicator, Alert } from "react-native";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export interface ExtractedTournamentInfo {
  name?: string;
  dateTimestamp?: number;
  time?: string;
  venue?: string;
  entryFee?: number;
  description?: string;
  gameType?: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool";
  playerType?: "singles" | "doubles" | "scotch_doubles" | "teams";
  maxPlayers?: number;
}

interface TournamentFlyerUploadProps {
  onUpload?: (url: string) => void;
  onRemove?: () => void;
  onError?: (error: Error) => void;
  onExtractInfo?: (info: ExtractedTournamentInfo) => void;
  currentUrl?: string;
  currentStorageId?: Id<"_storage">;
}

export function TournamentFlyerUpload({
  onUpload,
  onRemove,
  onError,
  onExtractInfo,
  currentUrl,
  currentStorageId,
}: TournamentFlyerUploadProps) {
  const themeColorForeground = useThemeColor("foreground") || "#000000";
  const themeColorBackground = useThemeColor("background") || "#FFFFFF";
  const accentColor = useThemeColor("accent") || "#007AFF";

  const [uploadedStorageId, setUploadedStorageId] = useState<Id<"_storage"> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteFileByStorageId = useMutation(api.files.deleteFileByStorageId);
  const processImageUpload = useAction(api.files.processImageUpload);
  const extractInfo = useAction(api.tournaments.extractTournamentInfo);

  const onExtractInfoRef = useRef(onExtractInfo);
  const onUploadRef = useRef(onUpload);

  useEffect(() => {
    onExtractInfoRef.current = onExtractInfo;
  }, [onExtractInfo]);

  useEffect(() => {
    onUploadRef.current = onUpload;
  }, [onUpload]);

  // Get URL for newly uploaded image
  const uploadedImageUrl = useQuery(
    api.files.getFileUrl,
    uploadedStorageId ? { storageId: uploadedStorageId } : "skip"
  );

  // Get URL for current image
  const currentImageUrl = useQuery(
    api.files.getFileUrl,
    currentStorageId ? { storageId: currentStorageId } : "skip"
  );

  const displayUrl = uploadedImageUrl || currentImageUrl || currentUrl;

  // Request permissions
  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photos to upload tournament flyers."
      );
      return false;
    }
    return true;
  }, []);

  const uploadImageToConvex = useCallback(async (uri: string, fileName: string, mimeType: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Generate upload URL
      const uploadUrl = await generateUploadUrl();
      if (!uploadUrl) {
        throw new Error("Failed to generate upload URL");
      }
      setUploadProgress(25);

      // Step 2: Convert image URI to blob (React Native compatible)
      // On React Native, we need to fetch the local file URI to convert it to a blob
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const fileSize = blob.size;
      
      if (!blob || fileSize === 0) {
        throw new Error("Invalid file: empty or unreadable");
      }
      
      setUploadProgress(50);

      // Step 3: Upload to Convex storage
      // Convex expects the file body directly, not FormData
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: blob,
        headers: {
          "Content-Type": mimeType,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload response error:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          errorText,
        });
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText || uploadResponse.statusText}`);
      }

      // Step 4: Parse response to get storageId
      // Read response as text first, then try to parse as JSON
      const responseText = await uploadResponse.text();
      let storageId: Id<"_storage">;
      
      try {
        const responseData = JSON.parse(responseText);
        // Convex returns { storageId: "..." } format
        storageId = (responseData.storageId || responseData) as Id<"_storage">;
      } catch (parseError) {
        // If it's not JSON, maybe it's the storageId directly as a string
        console.warn("Response is not JSON, trying as direct storageId:", responseText);
        storageId = responseText.trim() as Id<"_storage">;
      }
      
      if (!storageId) {
        console.error("Failed to extract storageId from response:", responseText);
        throw new Error("No storageId in upload response");
      }

      setUploadProgress(75);

      // Process image - automatically converts HEIC to web format
      try {
        const processed = await processImageUpload({ storageId });
        // The processed.displayUrl is the converted URL, but we still return storageId
        // The display component will handle showing the converted URL
        setUploadProgress(100);
        return { storageId };
      } catch (error) {
        console.error("Failed to process image (HEIC conversion):", error);
        // Continue with original storageId if processing fails
        setUploadProgress(100);
        return { storageId };
      }
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown upload error";
      console.error("Upload error details:", {
        error,
        errorMessage,
        uri,
        fileName,
        mimeType,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to upload image: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [generateUploadUrl, processImageUpload]);

  const handlePickImage = useCallback(async () => {
    try {
      // Check if ImagePicker is available
      if (!ImagePicker || !ImagePicker.launchImageLibraryAsync) {
        Alert.alert(
          "Not Available",
          "Image picker is not available in this environment. Please rebuild the app with 'expo prebuild' or use a development build."
        );
        return;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: false, // Disable editing to capture full flyer image for AI extraction
        quality: 0.9, // Higher quality for better AI text recognition
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `tournament-flyer-${Date.now()}.jpg`;
        const mimeType = asset.mimeType || "image/jpeg";

        const { storageId } = await uploadImageToConvex(asset.uri, fileName, mimeType);
        setUploadedStorageId(storageId);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to pick image";
      Alert.alert("Error", errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [requestPermissions, uploadImageToConvex, onError]);

  const removeFile = useCallback(async () => {
    const storageIdToDelete = uploadedStorageId || currentStorageId;

    if (!storageIdToDelete) {
      setUploadedStorageId(null);
      onRemove?.();
      return;
    }

    setIsDeleting(true);
    try {
      await deleteFileByStorageId({ storageId: storageIdToDelete });
      setUploadedStorageId(null);
      onRemove?.();
    } catch (error) {
      console.error("Failed to delete file from storage:", error);
      onError?.(error as Error);
      setUploadedStorageId(null);
      onRemove?.();
    } finally {
      setIsDeleting(false);
    }
  }, [uploadedStorageId, currentStorageId, deleteFileByStorageId, onRemove, onError]);

  const handleExtractInfo = useCallback(async () => {
    const storageIdToUse = uploadedStorageId || currentStorageId;
    if (!storageIdToUse) {
      onError?.(new Error("No image uploaded"));
      return;
    }

    setIsExtracting(true);
    try {
      const extractedInfo = await extractInfo({ storageId: storageIdToUse });
      onExtractInfoRef.current?.(extractedInfo);
    } catch (error) {
      console.error("Failed to extract tournament info:", error);
      onError?.(error as Error);
    } finally {
      setIsExtracting(false);
    }
  }, [uploadedStorageId, currentStorageId, extractInfo, onError]);

  // Notify parent when URL becomes available
  useEffect(() => {
    if (uploadedImageUrl && onUploadRef.current) {
      onUploadRef.current(uploadedImageUrl);
    }
  }, [uploadedImageUrl]);

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium mb-2" style={{ color: themeColorForeground }}>
        Tournament Flyer
      </Text>

      {displayUrl ? (
        <View className="relative">
          <View
            className="rounded-lg overflow-hidden border"
            style={{
              borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
              height: 200,
            }}
          >
            <Image
              source={{ uri: displayUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <View className="absolute top-2 right-2 flex-row gap-2">
            <Pressable
              onPress={handleExtractInfo}
              disabled={isUploading || isExtracting || isDeleting}
              className="px-3 py-2 rounded-lg"
              style={{
                backgroundColor: withOpacity(themeColorBackground, opacity.OPACITY_90),
              }}
            >
              {isExtracting ? (
                <ActivityIndicator size="small" color={accentColor} />
              ) : (
                <Ionicons name="sparkles" size={16} color={accentColor} />
              )}
            </Pressable>
            <Pressable
              onPress={removeFile}
              disabled={isUploading || isExtracting || isDeleting}
              className="px-3 py-2 rounded-lg"
              style={{
                backgroundColor: withOpacity(themeColorBackground, opacity.OPACITY_90),
              }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="close" size={16} color="#EF4444" />
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={handlePickImage}
          disabled={isUploading}
          className="px-4 py-6 rounded-lg border border-dashed items-center justify-center"
          style={{
            backgroundColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
            borderColor: withOpacity(themeColorForeground, opacity.OPACITY_20),
          }}
        >
          {isUploading ? (
            <View className="items-center">
              <ActivityIndicator size="small" color={accentColor} />
              <Text className="mt-2 text-sm" style={{ color: themeColorForeground }}>
                Uploading... {uploadProgress}%
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <Ionicons name="image-outline" size={32} color={accentColor} />
              <Text className="mt-2 text-sm font-medium" style={{ color: themeColorForeground }}>
                Tap to upload flyer
              </Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

