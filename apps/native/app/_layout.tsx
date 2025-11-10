import "@/global.css";

import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

import { Stack, useRouter, useSegments } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useThemeColor } from "heroui-native";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl, {
	unsavedChangesWarning: false,
});

function AuthGuard({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const segments = useSegments();
	const router = useRouter();
	const accentColor = useThemeColor("accent");
	const [hasNavigated, setHasNavigated] = useState(false);

	useEffect(() => {
		if (isLoading) return;

		const inAuthGroup = segments[0] === "login" || segments[0] === "signup";
		const inDrawerGroup = segments[0] === "(drawer)";
		const inTabsGroup = segments[1] === "(tabs)";

		// Determine the correct route based on auth state
		if (!isAuthenticated && !inAuthGroup) {
			// Redirect to login if not authenticated
			router.replace("/login");
			setHasNavigated(true);
		} else if (isAuthenticated && inAuthGroup) {
			// Redirect to tabs (feed) if authenticated and on auth pages
			router.replace("/(drawer)/(tabs)/feed");
			setHasNavigated(true);
		} else if (isAuthenticated && inDrawerGroup && !inTabsGroup) {
			// If in drawer but not in tabs, redirect to tabs
			router.replace("/(drawer)/(tabs)/feed");
			setHasNavigated(true);
		} else if ((isAuthenticated && (inDrawerGroup || inTabsGroup)) || (!isAuthenticated && inAuthGroup)) {
			// Already on the correct route
			setHasNavigated(true);
		}
	}, [isAuthenticated, isLoading, segments, router]);

	// Show loading screen while checking auth or waiting for initial navigation
	if (isLoading || !hasNavigated) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" color={accentColor} />
			</View>
		);
	}

	return <>{children}</>;
}

function StackLayout() {
	return (
		<Stack screenOptions={{}}>
			<Stack.Screen
				name="login"
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="signup"
				options={{ headerShown: false }}
			/>
			<Stack.Screen name="(drawer)" options={{ headerShown: false }} />
		</Stack>
	);
}

export default function Layout() {
	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<KeyboardProvider>
					<AppThemeProvider>
						<HeroUINativeProvider>
							<AuthGuard>
								<StackLayout />
							</AuthGuard>
						</HeroUINativeProvider>
					</AppThemeProvider>
				</KeyboardProvider>
			</GestureHandlerRootView>
		</ConvexBetterAuthProvider>
	);
}
