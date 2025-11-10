import { View, Image, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useThemeColor } from "heroui-native";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface PostImageProps {
	storageId: Id<"_storage"> | string;
	alt?: string;
	maxSize?: number;
	showBackground?: boolean;
	containerHeight?: number;
	className?: string;
}

export function PostImage({
	storageId,
	alt = "Post image",
	maxSize = 680,
	showBackground = true,
	containerHeight = 200,
}: PostImageProps) {
	const themeColorBackground = useThemeColor("background");
	const themeColorForeground = useThemeColor("foreground");
	const imageUrl = useQuery(api.files.getFileUrl, {
		storageId: storageId as Id<"_storage">,
	});

	if (!imageUrl) {
		return (
			<View
				style={{
					height: containerHeight,
					backgroundColor: themeColorForeground + "10",
					borderRadius: 8,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="small" color={themeColorForeground + "40"} />
			</View>
		);
	}

	if (!showBackground) {
		return (
			<View
				style={{
					height: containerHeight,
					borderRadius: 8,
					overflow: "hidden",
				}}
			>
				<Image
					source={{ uri: imageUrl }}
					style={{
						width: "100%",
						height: "100%",
						borderRadius: 8,
						resizeMode: "cover" as const,
					}}
					accessibilityLabel={alt}
				/>
			</View>
		);
	}

	return (
		<View
			style={{
				height: containerHeight,
				backgroundColor: themeColorBackground,
				borderRadius: 8,
				justifyContent: "center",
				alignItems: "center",
				overflow: "hidden",
			}}
		>
			<Image
				source={{ uri: imageUrl }}
				style={{
					maxWidth: maxSize,
					maxHeight: maxSize,
					width: "100%",
					height: "100%",
					resizeMode: "contain" as const,
				}}
				accessibilityLabel={alt}
			/>
		</View>
	);
}

