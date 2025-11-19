import { Text, View, Pressable } from "react-native";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";

type ViewMode = "social" | "activity";

interface ProfileTabsProps {
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
}

export function ProfileTabs({ viewMode, onViewModeChange }: ProfileTabsProps) {
	const themeColorForeground = useThemeColor("foreground") || "#000000";
	const themeColorBackground = useThemeColor("background") || "#FFFFFF";
	const accentColor = useThemeColor("accent") || "#007AFF";

	return (
		<View
			className="flex-row border-b"
			style={{
				backgroundColor: themeColorBackground,
				borderBottomColor: withOpacity(themeColorForeground, opacity.OPACITY_10),
			}}
		>
			<Pressable
				onPress={() => onViewModeChange("social")}
				className="flex-1 py-3 items-center"
				style={{
					borderBottomWidth: viewMode === "social" ? 2 : 0,
					borderBottomColor: accentColor,
				}}
			>
				<Ionicons
					name="people-outline"
					size={20}
					color={viewMode === "social" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60)}
				/>
				<Text
					className="text-xs mt-1"
					style={{
						color: viewMode === "social" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
						fontWeight: viewMode === "social" ? "600" : "400",
					}}
				>
					Social Feed
				</Text>
			</Pressable>
			<Pressable
				onPress={() => onViewModeChange("activity")}
				className="flex-1 py-3 items-center"
				style={{
					borderBottomWidth: viewMode === "activity" ? 2 : 0,
					borderBottomColor: accentColor,
				}}
			>
				<Ionicons
					name="stats-chart-outline"
					size={20}
					color={viewMode === "activity" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60)}
				/>
				<Text
					className="text-xs mt-1"
					style={{
						color: viewMode === "activity" ? accentColor : withOpacity(themeColorForeground, opacity.OPACITY_60),
						fontWeight: viewMode === "activity" ? "600" : "400",
					}}
				>
					Activity & Stats
				</Text>
			</Pressable>
		</View>
	);
}






