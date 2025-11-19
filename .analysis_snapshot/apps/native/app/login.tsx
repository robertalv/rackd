import { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	Pressable,
	View,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	Image,
	useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Card, useThemeColor } from "heroui-native";
import { authClient } from "@/lib/auth-client";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as AppleAuthentication from "expo-apple-authentication";

export default function LoginPage() {
	const router = useRouter();
	const colorScheme = useColorScheme();
	const insets = useSafeAreaInsets();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<{
		email?: string;
		password?: string;
		root?: string;
	}>({});

	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const dangerColor = useThemeColor("danger");
	const surfaceColor = useThemeColor("surface");
	const dividerColor = useThemeColor("divider");
	const accentColor = useThemeColor("accent");
	
	// Icon color: black for light mode, white/light for dark mode
	const iconColor = colorScheme === "dark" ? "#FFFFFF" : "#000000";
	const VERSION = "1.0.0";

	// AuthGuard handles redirects, so we don't need to redirect here

	const validateForm = () => {
		const newErrors: typeof errors = {};

		// Email validation
		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Please enter a valid email address";
		}

		// Password validation
		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleLogin = async () => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setErrors({});

		await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError: (error) => {
					const errorMessage =
						error.error?.message ||
						error.error?.code === "INVALID_CREDENTIALS"
							? "Invalid email or password. Please try again."
							: "Sign in failed. Please try again.";
					setErrors({ root: errorMessage });
					setIsLoading(false);
				},
				onSuccess: () => {
					setEmail("");
					setPassword("");
					// Navigate to home on success
					router.replace("/(drawer)");
				},
				onFinished: () => {
					setIsLoading(false);
				},
			},
		);
	};

	const handleSocialLogin = async (provider: "google" | "apple") => {
		setIsLoading(true);
		setErrors({});

		try {
			// For Apple Sign In on native iOS, use ID token flow
			if (provider === "apple" && Platform.OS === "ios") {
				// Check if Apple Authentication is available
				const isAvailable = await AppleAuthentication.isAvailableAsync();
				
				if (!isAvailable) {
					setErrors({
						root: "Apple Sign In is not available on this device.",
					});
					setIsLoading(false);
					return;
				}

				try {
					// Request Apple ID token
					const credential = await AppleAuthentication.signInAsync({
						requestedScopes: [
							AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
							AppleAuthentication.AppleAuthenticationScope.EMAIL,
						],
					});

					if (!credential.identityToken) {
						throw new Error("No identity token received from Apple");
					}

					// Sign in with Better Auth using the ID token
					await authClient.signIn.social(
						{
							provider: "apple",
							idToken: {
								token: credential.identityToken,
								accessToken: credential.authorizationCode || undefined,
							},
						},
						{
							onError: (error) => {
								setErrors({
									root:
										error.error?.message ||
										"Failed to sign in with Apple. Please try again.",
								});
								setIsLoading(false);
							},
							onSuccess: () => {
								// Navigate to home on success
								router.replace("/(drawer)");
							},
							onFinished: () => {
								setIsLoading(false);
							},
						},
					);
				} catch (error: any) {
					// Handle user cancellation
					if (error.code === "ERR_REQUEST_CANCELED") {
						setIsLoading(false);
						return;
					}
					
					setErrors({
						root:
							error?.message ||
							"Failed to sign in with Apple. Please try again.",
					});
					setIsLoading(false);
				}
			} else {
				// For Google or non-iOS platforms, use redirect flow
				await authClient.signIn.social(
					{
						provider,
					},
					{
						onError: (error) => {
							setErrors({
								root:
									error.error?.message ||
									"Failed to redirect to social login. Please try again.",
							});
							setIsLoading(false);
						},
						onSuccess: () => {
							// Social login redirects automatically
						},
						onFinished: () => {
							setIsLoading(false);
						},
					}
				);
			}
		} catch (error: any) {
			setErrors({
				root: error?.message || "An unexpected error occurred. Please try again.",
			});
			setIsLoading(false);
		}
	};

	// AuthGuard handles loading and redirects

	return (
		<View className="flex-1 bg-background">
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1"
			>
				<View className="flex-1">
					{/* Logo at top */}
					<View
						className="items-center"
						style={{ paddingTop: insets.top + 24 }}
					>
						<Image
							source={require("../assets/images/icon.png")}
							style={{
								width: 80,
								height: 80,
							}}
							resizeMode="contain"
						/>
						<Text className="text-4xl font-bold tracking-tighter font-mono text-foreground">
							rackd
						</Text>
					</View>

					{/* Form in middle */}
					<ScrollView
						contentContainerStyle={{
							flexGrow: 1,
							justifyContent: "center",
							padding: 24,
						}}
						keyboardShouldPersistTaps="handled"
					>
						<Card variant="secondary" className="p-6">
						<View className="mb-6">
							<Text className="text-2xl font-bold text-foreground mb-2 text-center">
								Welcome back
							</Text>
							<Text className="text-base text-muted-foreground text-center">
								Sign in to continue your billiards journey
							</Text>
						</View>

						{/* Social Login Buttons */}
						<View className="flex-row gap-3 mb-6">
							<Pressable
								onPress={() => handleSocialLogin("google")}
								disabled={isLoading}
								className="flex-1 bg-surface border border-divider rounded-lg p-4 flex-row items-center justify-center active:opacity-70"
                                style={{ borderColor: accentColor }}
							>
								<Ionicons
									name="logo-google"
									size={16}
									color={foregroundColor}
									style={{ marginRight: 8 }}
								/>
								<Text className="text-foreground font-medium text-base">
									Google
								</Text>
							</Pressable>
							<Pressable
								onPress={() => handleSocialLogin("apple")}
								disabled={isLoading}
								className="flex-1 bg-surface border border-divider rounded-lg p-4 flex-row items-center justify-center active:opacity-70"
                                style={{ borderColor: accentColor }}
							>
								<Ionicons
									name="logo-apple"
									size={16}
									color={foregroundColor}
									style={{ marginRight: 8 }}
								/>
								<Text className="text-foreground font-medium text-base">
									Apple
								</Text>
							</Pressable>
						</View>

						{/* Divider */}
						<View className="flex-row items-center mb-6">
							<View
								className="flex-1 h-px"
								style={{ backgroundColor: accentColor }}
							/>
							<Text className="mx-3 text-xs uppercase text-muted-foreground">
								Or continue with email
							</Text>
							<View
								className="flex-1 h-px"
								style={{ backgroundColor: accentColor }}
							/>
						</View>

						{/* Error Message */}
						{errors.root && (
							<View
								className="mb-4 p-3 rounded-lg"
								style={{ backgroundColor: `${dangerColor}20` }}
							>
								<Text className="text-danger text-sm">{errors.root}</Text>
							</View>
						)}

						{/* Email Input */}
						<View className="mb-4">
							<Text className="text-sm font-medium text-foreground mb-2">
								Email
							</Text>
							<TextInput
								className="py-3 px-4 border"
								style={{
									backgroundColor: surfaceColor,
									color: foregroundColor,
									borderColor: errors.email ? dangerColor : accentColor,
								}}
								placeholder="you@example.com"
								placeholderTextColor={typeof foregroundColor === "string" ? foregroundColor + "80" : foregroundColor}
								value={email}
								onChangeText={(text) => {
									setEmail(text);
									if (errors.email) {
										setErrors({ ...errors, email: undefined });
									}
								}}
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
								editable={!isLoading}
							/>
							{errors.email && (
								<Text className="text-danger text-sm mt-1">
									{errors.email}
								</Text>
							)}
						</View>

						{/* Password Input */}
						<View className="mb-4">
							<View className="flex-row items-center justify-between mb-2">
								<Text className="text-sm font-medium text-foreground">
									Password
								</Text>
								<Pressable
									onPress={() => {
										// TODO: Navigate to forgot password page when route is created
										console.log("Forgot password pressed");
									}}
								>
									<Text className="text-sm text-muted-foreground underline">
										Forgot password?
									</Text>
								</Pressable>
							</View>
							<View className="relative">
								<TextInput
									className="py-3 px-4 pr-12 rounded-lg border"
									style={{
										backgroundColor: surfaceColor,
										color: foregroundColor,
										borderColor: errors.password ? dangerColor : accentColor,
									}}
									placeholder="Enter your password"
									placeholderTextColor={typeof foregroundColor === "string" ? foregroundColor + "80" : foregroundColor}
									value={password}
									onChangeText={(text) => {
										setPassword(text);
										if (errors.password) {
											setErrors({ ...errors, password: undefined });
										}
									}}
									secureTextEntry={!showPassword}
									autoCapitalize="none"
									autoComplete="password"
									editable={!isLoading}
								/>
								<Pressable
									onPress={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-0 bottom-0 justify-center"
									style={{ paddingHorizontal: 4 }}
								>
									<Ionicons
										name={showPassword ? "eye-off-outline" : "eye-outline"}
										size={20}
										color={mutedColor}
									/>
								</Pressable>
							</View>
							{errors.password && (
								<Text className="text-danger text-sm mt-1">
									{errors.password}
								</Text>
							)}
						</View>

						{/* Submit Button */}
						<Pressable
							onPress={handleLogin}
							disabled={isLoading}
							className="bg-yellow-500 rounded-lg p-4 flex-row justify-center items-center active:opacity-70 mb-4"
							style={{
								opacity: isLoading ? 0.7 : 1,
							}}
						>
							{isLoading ? (
								<ActivityIndicator size="small" color={foregroundColor} />
							) : (
								<Text className="text-white font-medium text-base">
									Sign in
								</Text>
							)}
						</Pressable>
					</Card>
				</ScrollView>

				{/* Bottom section: Sign up link and copyright */}
				<View
					className="px-6 pb-6"
					style={{ paddingBottom: insets.bottom + 24 }}
				>
					{/* Sign Up Link */}
					<View className="flex-row justify-center mb-4">
						<Text className="text-sm text-muted-foreground">
							Don&apos;t have an account?{" "}
						</Text>
						<Pressable
							onPress={() => {
								router.replace("/signup");
							}}
						>
							<Text className="text-sm text-foreground font-medium underline">
								Sign up
							</Text>
						</Pressable>
					</View>

					{/* Copyright Footer */}
					<View className="flex-row justify-between items-center">
						<Text className="text-xs text-muted-foreground">
							Version {VERSION}
						</Text>
						<Text className="text-xs text-muted-foreground">
							© {new Date().getFullYear()} Rackd
						</Text>
					</View>
				</View>
				</View>
			</KeyboardAvoidingView>
		</View>
	);
}

