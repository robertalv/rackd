import { View, Text, Pressable, Image } from "react-native";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";

interface FeedHeaderProps {
	onSearch?: () => void;
	onCreatePost?: () => void;
}

export function FeedHeader({ onSearch, onCreatePost }: FeedHeaderProps) {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");

	const handleSearch = () => {
		onSearch?.();
	};

	const handleCreatePost = () => {
		onCreatePost?.();
	};

	return (
		<View
			className="flex-row items-center justify-between px-4 py-3 border-b"
			style={{
				backgroundColor: themeColorBackground,
				borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
			}}
		>
			<View className="flex-row items-center gap-1">
				<Image
					source={require("@/assets/images/icon.png")}
					style={{
						width: 40,
						height: 40,
					}}
					resizeMode="contain"
				/>	
				<Text className="text-4xl font-bold tracking-tighter font-mono" style={{ color: themeColorForeground }}>
					rackd
				</Text>
			</View>
			<View className="flex-row items-center">
				<Pressable
					onPress={handleSearch}
					className="p-2 mr-2"
					style={({ pressed }) => ({
						opacity: pressed ? 0.6 : 1,
					})}
				>
					<Ionicons name="search-outline" size={24} color={themeColorForeground} />
				</Pressable>
				<Pressable
					onPress={handleCreatePost}
					className="p-2"
					style={({ pressed }) => ({
						opacity: pressed ? 0.6 : 1,
					})}
				>
					<Ionicons name="add-circle-outline" size={24} color={themeColorForeground} />
				</Pressable>
			</View>
		</View>
	);
}

