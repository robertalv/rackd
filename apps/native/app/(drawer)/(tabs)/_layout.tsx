import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";

export default function TabLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				headerStyle: {
					backgroundColor: themeColorBackground,
				},
				headerTintColor: themeColorForeground,
				headerTitleStyle: {
					color: themeColorForeground,
					fontWeight: "600",
				},
				tabBarStyle: {
					backgroundColor: themeColorBackground,
					borderTopColor: themeColorForeground + "20",
				},
				tabBarActiveTintColor: themeColorForeground,
				tabBarInactiveTintColor: themeColorForeground + "80",
			}}
		>
			<Tabs.Screen
				name="feed"
				options={{
					title: "Feed",
					tabBarIcon: ({ color, size }: { color: string; size: number }) => (
						<Ionicons name="home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="tournaments"
				options={{
					title: "Tournaments",
					tabBarIcon: ({ color, size }: { color: string; size: number }) => (
						<Ionicons name="trophy" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="matches"
				options={{
					title: "Matches",
					tabBarIcon: ({ color, size }: { color: string; size: number }) => (
						<Ionicons name="basketball" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }: { color: string; size: number }) => (
						<Ionicons name="person" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="post/[postId]"
				options={{
					href: null, // Hide from tab bar
				}}
			/>
			<Tabs.Screen
				name="discover"
				options={{
					href: null, // Hide from tab bar
				}}
			/>
		</Tabs>
	);
}
