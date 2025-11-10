import { View, Text, Pressable } from "react-native";
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
			<Text className="text-2xl font-bold" style={{ color: themeColorForeground }}>
				RACKD
			</Text>
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

